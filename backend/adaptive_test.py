"""Local mixed-difficulty tests; not ETS-calibrated scoring or routing."""

from __future__ import annotations

import copy
import os
import random
import time
from collections import Counter
from pathlib import Path
from typing import Literal
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, model_validator

try:
    from . import history
    from .archive_io import StoredObject, invalid_archive, read_archive, write_archive
    from .exam_service import reference_answer, score_one
    from .models import ExamSubmissionItem
    from .question_store import SECTIONS, material_groups, store
except ImportError:  # Direct backend/app.py launch.
    import history
    from archive_io import StoredObject, invalid_archive, read_archive, write_archive
    from exam_service import reference_answer, score_one
    from models import ExamSubmissionItem
    from question_store import SECTIONS, material_groups, store

ROOT = Path(__file__).resolve().parents[1]
SESSION_DIR = Path(os.environ.get('TOEFL_DATA_DIR', ROOT / 'artifacts')) / 'test-sessions'
router = APIRouter(prefix='/api/v1/tests')
# Use the archive lock so completion, recording uploads and history clearing serialize.
LOCK = history.LOCK
PROFILES = [
    {
        'id': 'foundation',
        'title': '基础卷',
        'label': '简单',
        'level': 2,
        'starts': [1, 2, 3],
        'bounds': [1, 3],
    },
    {
        'id': 'standard-a',
        'title': '标准卷 A',
        'label': '中等',
        'level': 4,
        'starts': [4],
        'bounds': [3, 5],
    },
    {
        'id': 'standard-b',
        'title': '标准卷 B',
        'label': '中等',
        'level': 5,
        'starts': [5, 6],
        'bounds': [4, 6],
    },
    {
        'id': 'advanced',
        'title': '进阶卷',
        'label': '中等偏难',
        'level': 7,
        'starts': [7, 8],
        'bounds': [6, 8],
    },
    {
        'id': 'challenge',
        'title': '挑战卷',
        'label': '最难',
        'level': 10,
        'starts': [9, 10],
        'bounds': [8, 10],
    },
]
# Each tuple selects a number of whole materials, optionally of a specific size.
PHASES = [
    (
        'reading',
        '阅读 · 模块 1',
        720,
        [
            ('complete_words', 1, 10),
            ('read_daily_life', 1, 2),
            ('read_daily_life', 1, 3),
            ('read_academic_passage', 1, 5),
        ],
    ),
    (
        'reading',
        '阅读 · 模块 2',
        1080,
        [
            ('complete_words', 2, 10),
            ('read_daily_life', 1, 2),
            ('read_daily_life', 1, 3),
            ('read_academic_passage', 1, 5),
        ],
    ),
    (
        'listening',
        '听力 · 模块 1',
        840,
        [
            ('listen_choose_response', 9, 1),
            ('listen_conversation', 2, 2),
            ('listen_announcement', 1, 2),
            ('listen_academic_talk', 2, 4),
        ],
    ),
    (
        'listening',
        '听力 · 模块 2',
        900,
        [
            ('listen_choose_response', 8, 1),
            ('listen_conversation', 3, 2),
            ('listen_announcement', 3, 2),
            ('listen_academic_talk', 1, 4),
        ],
    ),
    ('writing', '写作 · 句子构建', 360, [('build_sentence', 10, 1)]),
    ('writing', '写作 · 邮件', 420, [('write_email', 1, 1)]),
    ('writing', '写作 · 学术讨论', 600, [('academic_discussion', 1, 1)]),
    ('speaking', '口语 · 听后复述', 180, [('listen_repeat', 1, 7)]),
    ('speaking', '口语 · 访谈', 300, [('take_interview', 1, 4)]),
]
MIXES = [
    (0.85, 0.14, 0.01),
    (0.75, 0.23, 0.02),
    (0.65, 0.30, 0.05),
    (0.50, 0.40, 0.10),
    (0.35, 0.50, 0.15),
    (0.25, 0.50, 0.25),
    (0.20, 0.45, 0.35),
    (0.15, 0.35, 0.50),
    (0.10, 0.30, 0.60),
    (0.10, 0.20, 0.70),
]
LIMITATIONS = (
    '原创题库随机组卷，不是五套全新题；重考及不同方案可能遇到相同材料。'
    '1–10 档、路由阈值和模块限时为本地训练设置，非 ETS 标定。'
    '阅读、听力在第一模块后独立调整；写作、口语不自适应。'
    '保留重播、脚本及转写等练习辅助，不等同正式考试；不换算官方成绩。'
)


def profile_for(level):
    return copy.deepcopy(next(profile for profile in PROFILES if level in profile['starts']))


@router.get('/catalog')
def catalog():
    return {
        'papers': copy.deepcopy(PROFILES),
        'levels': list(range(1, 11)),
        'question_count': 120,
        'section_counts': {'reading': 50, 'listening': 47, 'writing': 12, 'speaking': 11},
        'minutes': 90,
        'limitations': LIMITATIONS,
    }


def route_level(level, correct, total, bounds):
    change = 2 if correct / total >= 0.8 else -2 if correct / total < 0.5 else 0
    return max(bounds[0], min(bounds[1], level + change))


def select_phase(index, level, used, rng=None):
    rng = rng or random.SystemRandom()
    section, title, seconds, blueprint = PHASES[index]
    chosen = []
    for task_index, (task, count, size) in enumerate(blueprint):
        selected_groups = []
        groups = [
            group
            for group in material_groups(store.questions_for(section, 'bank', task)).values()
            if len(group) == size and not any(q['id'] in used for q in group)
        ]
        if len(groups) < count:
            raise HTTPException(409, f'题库不足，无法完整组卷：{task}')
        for position in range(count):
            pool = groups
            # Foundation anchors preserve variety even in the challenge profile.
            if (
                position == 0
                and task in ('read_daily_life', 'listen_choose_response', 'build_sentence')
                and size <= 2
            ):
                pool = [g for g in groups if all(q['difficulty'] == 'easy' for q in g)] or groups
            if task_index == len(blueprint) - 1 and position == count - 1:
                earlier = chosen + [q for group in selected_groups for q in group]
                # A phase with several materials must retain some non-easy content.
                if earlier and all(q['difficulty'] == 'easy' for q in earlier):
                    pool = [g for g in groups if any(q['difficulty'] != 'easy' for q in g)] or pool
            counts = Counter(q['difficulty'] for group in pool for q in group)
            mixture = dict(zip(('easy', 'medium', 'hard'), MIXES[level - 1]))
            weights = [
                sum(mixture[q['difficulty']] / counts[q['difficulty']] for q in group) / len(group)
                for group in pool
            ]
            group = rng.choices(pool, weights=weights, k=1)[0]
            groups.remove(group)
            selected_groups.append(group)
            used.update(q['id'] for q in group)
        rng.shuffle(selected_groups)
        chosen.extend(q for group in selected_groups for q in group)
    return {
        'section': section,
        'title': title,
        'seconds': seconds,
        'level': level,
        'questions': chosen,
    }


class SessionArchive(StoredObject):
    id: str
    level: int = Field(ge=1, le=10)
    profile: dict
    status: Literal['active', 'completed']
    phase_index: int = Field(ge=0, le=9)
    phases: list[dict] = Field(min_length=1, max_length=9)
    keys: dict[str, dict]
    responses: dict[str, dict]
    word_orders: dict[str, list[int | None]]
    item_index: int = Field(ge=0)
    routes: list[dict]
    started_at: float
    deadline: float | None
    recordings: dict[str, str]

    @model_validator(mode='after')
    def consistent_phase(self):
        if (self.status == 'active') != (self.phase_index < 9):
            raise ValueError('Invalid session status')
        if len(self.phases) != min(self.phase_index + 1, 9):
            raise ValueError('Incomplete phase snapshots')
        ids = [q['id'] for p in self.phases for q in p.get('questions', [])]
        if not ids or len(ids) != len(set(ids)) or set(ids) != set(self.keys):
            raise ValueError('Incomplete question snapshots')
        if any(
            not p.get('title') or not p.get('seconds') or p.get('section') not in SECTIONS
            for p in self.phases
        ):
            raise ValueError('Invalid phase')
        return self


class StartRequest(BaseModel):
    level: int = Field(ge=1, le=10, strict=True)


class EventRequest(BaseModel):
    phase_index: int = Field(ge=0, le=8)
    action: Literal['begin', 'save', 'submit']
    responses: list[ExamSubmissionItem] = Field(default_factory=list, max_length=30)
    word_orders: dict[str, list[int | None]] = Field(default_factory=dict, max_length=10)
    item_index: int = Field(default=0, ge=0, le=29)


def persist(session):
    SESSION_DIR.mkdir(parents=True, exist_ok=True)
    path = SESSION_DIR / f"{session['id']}.json"
    write_archive(path, session)


def read_session(session_id):
    path = SESSION_DIR / f'{session_id}.json'
    if not path.is_file():
        raise HTTPException(404, '测验记录不存在，请重新选择难度')
    try:
        return read_archive(path, SessionArchive)
    except (KeyError, TypeError):
        raise invalid_archive(path) from None


def recover_completion(session):
    record_path = history.HISTORY_DIR / f"{session['id']}.json"
    if (
        session['status'] != 'active'
        or session['phase_index'] != len(PHASES) - 1
        or not record_path.is_file()
    ):
        return
    record = history.read_record(UUID(session['id']))
    ids = {q['id'] for q in session['phases'][-1]['questions']}
    # Older archives have only display feedback; new archives retain exact nullable
    # response fields so a lost completion response can be retried byte-for-byte.
    final_responses = record.get('test_final_responses')
    if final_responses is None:
        final_responses = {
            row['question_id']: {
                key: row[key] for key in ('question_id', 'answer', 'duration_seconds')
            }
            for row in record['result']['feedback']
            if row['question_id'] in ids
        }
    for qid in ids:
        session['responses'].pop(qid, None)
    session['responses'].update(final_responses)
    session.update(status='completed', phase_index=len(PHASES), deadline=None, item_index=0)
    persist(session)


def append_phase(session, level):
    used = {q['id'] for phase in session['phases'] for q in phase['questions']}
    phase = select_phase(session['phase_index'], level, used)
    session['phases'].append(phase)
    session['keys'].update({q['id']: store.answer(q['id']) for q in phase['questions']})


def build_result(session):
    sections = {s: {'earned': 0.0, 'possible': 0.0, 'total': 0, 'answered': 0} for s in SECTIONS}
    feedback = []
    for phase in session['phases']:
        for q in phase['questions']:
            key = session['keys'][q['id']]
            response = session['responses'].get(q['id'], {})
            answer = response.get('answer')
            answered = answer not in (None, '') or q['id'] in session['recordings']
            manual = q['section'] == 'speaking' or q['task_type'] in (
                'write_email',
                'academic_discussion',
            )
            if manual:
                earned, possible, correct = 0.0, 0.0, None
                message = '待人工复核。下方为参考表达与学习解析，不计入客观题正确率。'
            else:
                earned, possible, message, correct = score_one(q, key, answer)
            totals = sections[q['section']]
            totals['earned'] += earned
            totals['possible'] += possible
            totals['total'] += 1
            totals['answered'] += int(answered)
            feedback.append(
                {
                    'question_id': q['id'],
                    'section': q['section'],
                    'task_type': q['task_type'],
                    'answer': answer,
                    'answered': answered,
                    'earned': earned,
                    'possible': possible,
                    'correct': correct,
                    'manual_review': manual,
                    'feedback': message,
                    'reference_answer': reference_answer(q, key),
                    'explanation': key.get('explanation', ''),
                    'correct_index': key.get('correct_index'),
                    'duration_seconds': response.get('duration_seconds') or 0,
                    'missing_letters': key['reference'][len(q['prefix']) :]
                    if q['task_type'] == 'complete_words'
                    else None,
                }
            )
    for totals in sections.values():
        totals['percentage'] = (
            round(totals['earned'] / totals['possible'] * 100, 1) if totals['possible'] else None
        )
    return {
        'sections': sections,
        'feedback': feedback,
        'total_questions': len(feedback),
        'answered_questions': sum(q['answered'] for q in feedback),
        'note': '仅统计客观题参考正确数；邮件、讨论及口语待人工复核，不换算官方成绩。',
        'adaptive': {
            'profile': session['profile'],
            'starting_level': session['level'],
            'routes': session['routes'],
            'phase_levels': [p['level'] for p in session['phases']],
        },
    }


def advance(session):
    previous = session['phases'][-1]
    session['phase_index'] += 1
    session['deadline'] = None
    session['item_index'] = 0
    if session['phase_index'] == len(PHASES):
        record_path = history.HISTORY_DIR / f"{session['id']}.json"
        if not record_path.exists():
            history.write_record(
                {
                    'id': session['id'],
                    'fingerprint': session['id'],
                    'category': 'test',
                    'completed_at': time.time(),
                    'section': 'all',
                    'mode': 'exam',
                    'task_type': None,
                    'questions': [q for p in session['phases'] for q in p['questions']],
                    'result': build_result(session),
                    'recordings': session['recordings'],
                    'test_final_responses': {
                        q['id']: session['responses'][q['id']]
                        for q in previous['questions']
                        if q['id'] in session['responses']
                    },
                }
            )
        session['status'] = 'completed'
    else:
        level = session['level']
        if session['phase_index'] in (1, 3):
            correct = sum(
                score_one(
                    q, session['keys'][q['id']], session['responses'].get(q['id'], {}).get('answer')
                )[3]
                for q in previous['questions']
            )
            total = len(previous['questions'])
            level = route_level(level, correct, total, session['profile']['bounds'])
            session['routes'].append(
                {
                    'section': previous['section'],
                    'correct': correct,
                    'total': total,
                    'from_level': session['level'],
                    'to_level': level,
                }
            )
        append_phase(session, level)
    persist(session)


def public_session(session):
    result = {
        key: copy.deepcopy(session[key])
        for key in ('id', 'level', 'profile', 'status', 'phase_index', 'deadline', 'item_index')
    }
    result['server_time'] = time.time()
    result['phase_count'] = len(PHASES)
    result['recordings'] = {
        q: f"/api/v1/tests/sessions/{session['id']}/recordings/{q}" for q in session['recordings']
    }
    if session['status'] == 'completed':
        record = history.read_record(UUID(session['id']))
        result.update({'questions': record['questions'], 'result': record['result'], 'phase': None})
    else:
        phase = session['phases'][-1]
        ids = {q['id'] for q in phase['questions']}
        result.update(
            {
                'phase': copy.deepcopy(phase),
                'responses': [v for k, v in session['responses'].items() if k in ids],
                'word_orders': {k: v for k, v in session['word_orders'].items() if k in ids},
            }
        )
    return result


FINALIZE_GRACE_SECONDS = 5


def expire(session):
    if (
        session['status'] == 'active'
        and session['deadline'] is not None
        and time.time() >= session['deadline'] + FINALIZE_GRACE_SECONDS
    ):
        advance(session)


@router.post('/sessions')
def start(payload: StartRequest):
    with LOCK:
        session = {
            'id': str(uuid4()),
            'profile': profile_for(payload.level),
            'level': payload.level,
            'status': 'active',
            'phase_index': 0,
            'phases': [],
            'keys': {},
            'responses': {},
            'word_orders': {},
            'item_index': 0,
            'routes': [],
            'started_at': time.time(),
            'deadline': None,
            'recordings': {},
        }
        append_phase(session, payload.level)
        persist(session)
        return public_session(session)


@router.get('/sessions/{session_id}')
def resume(session_id: UUID):
    with LOCK:
        session = read_session(session_id)
        recover_completion(session)
        expire(session)
        return public_session(session)


@router.post('/sessions/{session_id}')
def event(session_id: UUID, payload: EventRequest):
    with LOCK:
        session = read_session(session_id)
        recover_completion(session)
        expire(session)
        # Network retries never grade twice or advance another module.
        if payload.phase_index < session['phase_index']:
            ids = {q['id'] for q in session['phases'][payload.phase_index]['questions']}
            if (
                payload.action == 'submit'
                and all(
                    r.question_id in ids
                    and session['responses'].get(r.question_id) == r.model_dump()
                    for r in payload.responses
                )
                and all(
                    qid in ids and session['word_orders'].get(qid) == order
                    for qid, order in payload.word_orders.items()
                )
            ):
                return public_session(session)
            raise HTTPException(409, '该阶段已锁定，本次修改未保存；请恢复测验查看已保存进度')
        if session['status'] != 'active' or payload.phase_index != session['phase_index']:
            raise HTTPException(409, '阶段已改变，请恢复测验进度')
        phase = session['phases'][-1]
        if (
            session['deadline'] is not None
            and time.time() >= session['deadline']
            and payload.action != 'submit'
        ):
            raise HTTPException(409, '作答时间已到，仅接收截止时的最终提交')
        if payload.action == 'begin':
            if payload.responses or payload.word_orders:
                raise HTTPException(422, '开始阶段不能提交答案')
            if session['deadline'] is None:
                session['deadline'] = time.time() + phase['seconds']
                persist(session)
            return public_session(session)
        if session['deadline'] is None:
            raise HTTPException(409, '请先开始本阶段')
        questions = {q['id']: q for q in phase['questions']}
        responses = [r.model_dump() for r in payload.responses]
        if len({r['question_id'] for r in responses}) != len(
            responses
        ) or payload.item_index >= len(questions):
            raise HTTPException(422, '题目位置无效或回答重复')
        for response in responses:
            q = questions.get(response['question_id'])
            if q is None:
                raise HTTPException(422, '只能提交当前模块题目')
            answer = response['answer']
            if answer not in (None, ''):
                valid = (
                    isinstance(answer, int)
                    and not isinstance(answer, bool)
                    and 0 <= answer < len(q['options'])
                    if q['response_type'] == 'choice'
                    else isinstance(answer, str)
                )
                if not valid:
                    raise HTTPException(422, '答案格式无效')
        for qid, order in payload.word_orders.items():
            q = questions.get(qid, {})
            tokens = q.get('word_bank', [])
            chosen = [n for n in order if n is not None]
            if (
                q.get('task_type') != 'build_sentence'
                or len(order) != len(q['template_parts']) - 1
                or len(set(chosen)) != len(chosen)
                or any(n < 0 or n >= len(tokens) for n in chosen)
            ):
                raise HTTPException(422, '词块顺序无效')
        session['responses'].update({r['question_id']: r for r in responses})
        session['word_orders'].update(payload.word_orders)
        session['item_index'] = payload.item_index
        if payload.action == 'submit':
            advance(session)
        else:
            persist(session)
        return public_session(session)


@router.put('/sessions/{session_id}/recordings/{question_id}')
async def upload_recording(session_id: UUID, question_id: str, request: Request):
    content_type = request.headers.get('content-type', '').split(';')[0]
    if content_type not in ('audio/webm', 'audio/ogg', 'audio/mp4'):
        raise HTTPException(415, '仅支持浏览器音频录音')
    with LOCK:
        session = read_session(session_id)
        recover_completion(session)
        allowed = {
            q['id'] for p in session['phases'] for q in p['questions'] if q['section'] == 'speaking'
        }
        if question_id not in allowed:
            raise HTTPException(422, '录音不属于这次测验的口语题')
    data = bytearray()
    async for chunk in request.stream():
        data.extend(chunk)
        if len(data) > 5 * 1024 * 1024:
            raise HTTPException(413, '录音不能超过 5 MB')
    if not data:
        raise HTTPException(422, '没有收到录音')
    with LOCK:
        session = read_session(session_id)
        recover_completion(session)
        record = history.read_record(session_id) if session['status'] == 'completed' else None
        if record and question_id in record['recordings']:
            return {'saved': True}
        directory = history.HISTORY_DIR / str(session_id)
        directory.mkdir(parents=True, exist_ok=True)
        path = directory / question_id
        temporary = path.with_suffix('.tmp')
        temporary.write_bytes(data)
        temporary.replace(path)
        session['recordings'][question_id] = content_type
        persist(session)
        if record:
            record['recordings'][question_id] = content_type
            history.write_record(record)
    return {'saved': True}


@router.get('/sessions/{session_id}/recordings/{question_id}')
def recording(session_id: UUID, question_id: str):
    with LOCK:
        session = read_session(session_id)
        if question_id not in session['recordings']:
            raise HTTPException(404, '录音不存在')
        return FileResponse(
            history.HISTORY_DIR / str(session_id) / question_id,
            media_type=session['recordings'][question_id],
        )
