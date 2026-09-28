"""Fixed ETS paper simulations, deliberately separate from original practice."""

from __future__ import annotations

import copy
import json
import os
import re
import threading
import time
from functools import lru_cache
from pathlib import Path
from typing import Literal
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

try:
    from .archive_index import ArchiveIndex
    from .archive_io import MockSessionArchive, invalid_archive, read_archive, write_archive
    from .question_store import store
except ImportError:
    from archive_index import ArchiveIndex
    from archive_io import MockSessionArchive, invalid_archive, read_archive, write_archive
    from question_store import store

ROOT = Path(__file__).resolve().parents[1]
SESSION_DIR = Path(os.environ.get('TOEFL_DATA_DIR', ROOT / 'artifacts')) / 'mock-sessions'
SECTION_ORDER = ['reading', 'listening', 'writing', 'speaking']
FINALIZE_GRACE_SECONDS = 5
LOCK = threading.RLock()
_ARCHIVE_INDEX = ArchiveIndex()
router = APIRouter(prefix='/api/v1')

LIMITATIONS = (
    '这是基于 ETS 2026 官方练习卷的机考练习，不是官方考试或官方自适应系统。每套包含阅读 40、听力 34、写作 12、口语 11 题。'
    '顺序为阅读→听力→写作→口语，无计划休息。阅读和听力各两模块，提交后不可返回；听力和口语只能向前。'
    '说明页不计入作答时间。阅读每模块 15 分钟、造句 6 分钟和听力每题 20 秒仍为固定卷模拟设置，不能视为官方逐题逐模块限时；'
    '邮件 7 分钟、讨论 10 分钟、访谈每题 45 秒依据 ETS 公开规则。复述官方范围为每题 8–12 秒，本卷的逐句分配为模拟设置。'
    '听力和口语仅逐题计时，不再用估算的科目或模块总时长强制截断音频与作答。'
    '听力使用试卷脚本合成语音，不是官方原声；口语需麦克风。只报告客观题参考正确数，写作与口语待人工复核，不换算官方分数。'
)


def paper_available(paper_id: str) -> bool:
    bank = ROOT / 'question_bank'
    return (bank / 'mock' / f'{paper_id}.json').is_file() and (
        bank / 'answers' / 'mock' / f'{paper_id}.json'
    ).is_file()


@lru_cache(maxsize=5)
def load_paper(paper_id: str) -> dict:
    if paper_id not in {f'ets-test-{i}' for i in range(1, 6)}:
        raise HTTPException(404, '模考试卷不存在')
    if not paper_available(paper_id):
        raise HTTPException(404, '此模考试卷尚未在本地导入，或题目与答案文件不完整。')
    return json.loads(
        (ROOT / 'question_bank' / 'mock' / f'{paper_id}.json').read_text(encoding='utf-8')
    )


def outline(paper: dict) -> dict:
    return {
        **{key: paper[key] for key in ('id', 'title', 'number', 'source_url')},
        'question_count': sum(len(p['items']) for p in paper['phases']),
        'section_counts': {
            s: sum(len(p['items']) for p in paper['phases'] if p['section'] == s)
            for s in SECTION_ORDER
        },
        'minutes': 90,
        'section_order': SECTION_ORDER,
    }


@router.get('/resources')
def resources():
    try:
        from .adaptive_test import catalog
    except ImportError:
        from adaptive_test import catalog
    manifest = store.manifest()
    return {
        'practice': [{'id': section, **meta} for section, meta in manifest['sections'].items()],
        'mock': [
            outline(load_paper(f'ets-test-{i}'))
            for i in range(1, 6)
            if paper_available(f'ets-test-{i}')
        ],
        'test': catalog()['papers'],
        'real_exam': {
            'enabled': False,
            'section_order': SECTION_ORDER,
            'papers': [],
            'stages': ['device_check', 'reading', 'listening', 'writing', 'speaking', 'submission'],
        },
        'limitations': LIMITATIONS,
        'flow_source': 'https://www.ets.org/toefl/test-takers/ibt/about/content.html',
        'checked_on': '2026-09-26',
    }


class StartRequest(BaseModel):
    paper_id: str = Field(pattern=r'^ets-test-[1-5]$')


class EventRequest(BaseModel):
    phase_index: int = Field(ge=0, le=8)
    action: Literal['save', 'respond', 'next', 'advance', 'abandon', 'begin', 'navigate'] = 'save'
    item_index: int | None = Field(default=None, ge=0, le=40)
    answers: dict[str, str] = Field(default_factory=dict, max_length=40)
    word_orders: dict[str, list[int | None]] = Field(default_factory=dict, max_length=10)


def persist(session):
    SESSION_DIR.mkdir(parents=True, exist_ok=True)
    path = SESSION_DIR / f"{session['id']}.json"
    write_archive(path, session)
    _ARCHIVE_INDEX.invalidate(path)


def advance(session, base_time):
    session['phase_index'] += 1
    session['item_index'] = 0
    session['response_deadline'] = None
    session['deadline'] = None
    session['phase_state'] = 'directions'
    phases = load_paper(session['paper_id'])['phases']
    if session['phase_index'] == len(phases):
        session['status'] = 'completed'
        session['completed_at'] = base_time


def begin_phase(session):
    phase = load_paper(session['paper_id'])['phases'][session['phase_index']]
    session['phase_state'] = 'active'
    session['deadline'] = (
        time.time() + phase['seconds'] if phase['section'] in ('reading', 'writing') else None
    )


def read_session(session_id):
    """Read a stored session without advancing timers or persisting changes."""
    path = SESSION_DIR / f'{session_id}.json'
    if not path.is_file():
        raise HTTPException(404, '本次模考记录不存在，请重新选择试卷')
    session = read_archive(path, MockSessionArchive)
    if session['status'] == 'active':
        phase = load_paper(session['paper_id'])['phases'][session['phase_index']]
        if session['item_index'] >= len(phase['items']):
            raise invalid_archive(path)
    return session


def archived_sessions():
    """Return completed stored snapshots without advancing active session timers."""
    with LOCK:
        sessions = _ARCHIVE_INDEX.read(SESSION_DIR, lambda path: read_session(path.stem))
        return [dict(session) for session in sessions.values() if session['status'] == 'completed']


def get_session(session_id):
    session = read_session(session_id)
    expired = False
    while (
        session['status'] == 'active'
        and session.get('deadline') is not None
        and time.time() >= session['deadline']
    ):
        phase = load_paper(session['paper_id'])['phases'][session['phase_index']]
        if (
            phase['section'] != 'speaking'
            and time.time() < session['deadline'] + FINALIZE_GRACE_SECONDS
        ):
            break
        if phase['section'] == 'speaking':
            # Allow the browser to upload the clip stopped at the hard phase deadline.
            session['expired_recording'] = {
                'id': phase['items'][session['item_index']]['id'],
                'upload_until': session['deadline'] + 10,
            }
        advance(session, session['deadline'])
        expired = True
    if (
        session['status'] == 'active'
        and session.get('response_deadline') is not None
        and time.time() >= session['response_deadline']
    ):
        phase = load_paper(session['paper_id'])['phases'][session['phase_index']]
        if (
            phase['section'] != 'speaking'
            and time.time() < session['response_deadline'] + FINALIZE_GRACE_SECONDS
        ):
            return session
        if phase['section'] == 'speaking':
            session['expired_recording'] = {
                'id': phase['items'][session['item_index']]['id'],
                'upload_until': session['response_deadline'] + 10,
            }
        if session['item_index'] + 1 == len(phase['items']):
            advance(session, session['response_deadline'])
        else:
            session['item_index'] += 1
            session['response_deadline'] = None
        expired = True
    if expired:
        persist(session)
    return session


def public_session(session):
    result = copy.deepcopy(session)
    result.setdefault('phase_state', 'active')
    result.setdefault('word_orders', {})
    result.setdefault('heard_groups', [])
    result.pop('expired_recording', None)
    paper = load_paper(session['paper_id'])
    result['paper'] = outline(paper)
    result['server_time'] = time.time()
    result['phase'] = (
        copy.deepcopy(paper['phases'][session['phase_index']])
        if session['status'] == 'active'
        else None
    )
    if result['phase'] and result['phase']['section'] in ('listening', 'speaking'):
        result['phase']['item_count'] = len(result['phase']['items'])
        result['phase']['items'] = [result['phase']['items'][session['item_index']]]
    return result


@router.post('/mock/sessions')
def start_session(payload: StartRequest):
    load_paper(payload.paper_id)
    now = time.time()
    session = {
        'id': str(uuid4()),
        'paper_id': payload.paper_id,
        'status': 'active',
        'phase_index': 0,
        'item_index': 0,
        'started_at': now,
        'phase_state': 'directions',
        'deadline': None,
        'response_deadline': None,
        'answers': {},
        'word_orders': {},
        'heard_groups': [],
        'recordings': {},
    }
    with LOCK:
        persist(session)
    return public_session(session)


@router.get('/mock/sessions/{session_id}')
def resume_session(session_id: UUID):
    with LOCK:
        return public_session(get_session(session_id))


@router.post('/mock/sessions/{session_id}')
def session_event(session_id: UUID, payload: EventRequest):
    with LOCK:
        session = get_session(session_id)
        if session['status'] != 'active' or session['phase_index'] != payload.phase_index:
            raise HTTPException(409, '该阶段已结束，请同步当前考试进度')
        if payload.action == 'abandon':
            session['status'] = 'abandoned'
            persist(session)
            return public_session(session)
        if session.get('phase_state', 'active') == 'directions':
            if payload.action != 'begin' or payload.answers or payload.word_orders:
                raise HTTPException(409, '请先阅读说明并开始本阶段')
            begin_phase(session)
            persist(session)
            return public_session(session)
        if payload.action == 'begin':
            raise HTTPException(409, '本阶段已经开始，不能重新计时')
        phase = load_paper(session['paper_id'])['phases'][session['phase_index']]
        forward_only = phase['section'] in ('listening', 'speaking')
        deadlines = [
            session[key]
            for key in ('deadline', 'response_deadline')
            if session.get(key) is not None
        ]
        deadline = min(deadlines) if deadlines else None
        if (
            deadline is not None
            and time.time() >= deadline
            and payload.action != ('next' if forward_only else 'advance')
        ):
            raise HTTPException(409, '作答时间已到，仅接收截止时的最终提交')
        if forward_only and payload.item_index != session['item_index']:
            raise HTTPException(409, '此题已锁定，不能回到之前的题目')
        if forward_only and payload.action in ('advance', 'navigate'):
            raise HTTPException(422, '听力与口语必须逐题向前完成')
        if (
            forward_only
            and payload.action in ('save', 'next')
            and session.get('response_deadline') is None
        ):
            raise HTTPException(409, '音频播放完成后才能作答或进入下一题')
        allowed = {q['id'] for q in phase['items']}
        if forward_only:
            allowed = {phase['items'][session['item_index']]['id']}
        if not (set(payload.answers) | set(payload.word_orders)) <= allowed or any(
            len(v) > 10000 for v in payload.answers.values()
        ):
            raise HTTPException(422, '回答不属于当前可作答题目，或回答过长')
        items = {q['id']: q for q in phase['items']}
        sentence_answers = {}
        for question_id, order in payload.word_orders.items():
            item = items[question_id]
            tokens, parts = item.get('word_tokens', []), item.get('template_parts', [])
            chosen = [i for i in order if i is not None]
            if (
                item['kind'] != 'sentence'
                or len(order) != len(parts) - 1
                or len(set(chosen)) != len(chosen)
                or any(i < 0 or i >= len(tokens) for i in chosen)
            ):
                raise HTTPException(422, '词块顺序无效或重复使用了同一词块')
            sentence_answers[question_id] = (
                ''.join(
                    part + (tokens[order[i]] if order[i] is not None else ' ___ ')
                    for i, part in enumerate(parts[:-1])
                )
                + parts[-1]
                if chosen
                else ''
            )
            sentence_answers[question_id] = re.sub(
                r'\s+([,.?!;:])', r'\1', sentence_answers[question_id]
            ).strip()
        for question_id, value in payload.answers.items():
            item = items[question_id]
            if item['kind'] == 'sentence' and item.get('word_tokens'):
                raise HTTPException(422, '造句题请提交词块顺序')
            if item['kind'] == 'choice' and value not in ('', 'A', 'B', 'C', 'D'):
                raise HTTPException(422, '请选择有效选项')
        if (
            forward_only
            and payload.action == 'respond'
            and (payload.answers or payload.word_orders)
        ):
            raise HTTPException(422, '播放结束事件不能包含答案')
        session['answers'].update(payload.answers)
        session['answers'].update(sentence_answers)
        session.setdefault('word_orders', {}).update(payload.word_orders)
        if payload.action == 'respond':
            if not forward_only:
                raise HTTPException(422, '仅听说题使用逐题作答计时')
            if session.get('response_deadline') is None:
                seconds = phase['items'][session['item_index']].get('response_seconds', 20)
                deadline = time.time() + seconds
                session['response_deadline'] = (
                    min(session['deadline'], deadline) if session.get('deadline') else deadline
                )
                group = phase['items'][session['item_index']]['audio_group']
                if group not in session.setdefault('heard_groups', []):
                    session['heard_groups'].append(group)
        elif payload.action == 'navigate':
            if payload.item_index is None or payload.item_index >= len(phase['items']):
                raise HTTPException(422, '题目位置超出当前模块')
            session['item_index'] = payload.item_index
        elif payload.action == 'advance':
            advance(session, min(time.time(), deadline) if deadline is not None else time.time())
        elif payload.action == 'next':
            if not forward_only:
                raise HTTPException(422, '当前阶段请使用模块内题目导航')
            if session['item_index'] + 1 == len(phase['items']):
                advance(
                    session, min(time.time(), deadline) if deadline is not None else time.time()
                )
            else:
                session['item_index'] += 1
                session['response_deadline'] = None
        persist(session)
        return public_session(session)


def accepts_recording(session, question_id):
    expired = session.get('expired_recording', {})
    if expired.get('id') == question_id and time.time() <= expired['upload_until']:
        return session['status'] != 'abandoned'
    if session['status'] != 'active':
        return False
    phase = load_paper(session['paper_id'])['phases'][session['phase_index']]
    return (
        phase['section'] == 'speaking'
        and session.get('phase_state', 'active') == 'active'
        and session.get('response_deadline') is not None
        and phase['items'][session['item_index']]['id'] == question_id
    )


@router.put('/mock/sessions/{session_id}/recordings/{question_id}')
async def upload_recording(session_id: UUID, question_id: str, request: Request):
    content_type = request.headers.get('content-type', '').split(';')[0]
    if content_type not in ('audio/webm', 'audio/ogg', 'audio/mp4'):
        raise HTTPException(415, '仅支持浏览器音频录音')
    with LOCK:
        session = get_session(session_id)
        if not accepts_recording(session, question_id):
            raise HTTPException(422, '录音不属于当前口语题目')
    data = bytearray()
    async for chunk in request.stream():
        data.extend(chunk)
        if len(data) > 5 * 1024 * 1024:
            raise HTTPException(413, '录音不能超过 5 MB')
    if not data:
        raise HTTPException(422, '没有收到录音，请检查麦克风')
    with LOCK:
        session = get_session(session_id)
        if not accepts_recording(session, question_id):
            raise HTTPException(409, '此口语题目已结束')
        directory = SESSION_DIR / str(session_id)
        directory.mkdir(exist_ok=True)
        if question_id not in session['recordings']:
            (directory / question_id).write_bytes(data)
            session['recordings'][question_id] = content_type
        persist(session)
    return {'saved': True}


def normalized(value):
    return re.sub(r'[^\w\s]', '', value.lower().replace('’', chr(39))).split()


def completed_result(session_id: UUID):
    """Read a completed review for either the mock route or history detail."""
    with LOCK:
        session = get_session(session_id)
    return build_completed_result(session)


def build_completed_result(session):
    """Build a review from a validated snapshot without rereading or mutating it."""
    if session['status'] != 'completed':
        raise HTTPException(409, '完成整套模考后才能查看答案')
    session_id = session['id']
    paper = load_paper(session['paper_id'])
    keys = json.loads(
        (ROOT / 'question_bank' / 'answers' / 'mock' / f"{session['paper_id']}.json").read_text(
            encoding='utf-8'
        )
    )
    variants_path = ROOT / 'question_bank' / 'answers' / 'mock' / 'sentence-variants.json'
    variants = (
        json.loads(variants_path.read_text(encoding='utf-8')) if variants_path.is_file() else {}
    )
    notes_path = (
        ROOT / 'question_bank' / 'sources' / 'mock_explanations' / f"{session['paper_id']}.json"
    )
    notes = json.loads(notes_path.read_text(encoding='utf-8')) if notes_path.is_file() else None
    review = []
    for phase in paper['phases']:
        for item in phase['items']:
            key = keys.get(item['id'])
            answer = session['answers'].get(item['id'], '')
            alternatives = variants.get(item['id'], {}).get('answers', [])
            review.append(
                {
                    **item,
                    'phase_title': phase['title'],
                    'section': phase['section'],
                    'answer': answer,
                    'reference': key,
                    'accepted_alternatives': alternatives,
                    'pages': phase['pages'],
                    'explanation': notes['explanations'][item['id']] if notes is not None else None,
                    'correct': any(
                        normalized(answer) == normalized(value) for value in [key, *alternatives]
                    )
                    if key
                    else None,
                    'recording_url': f"/api/v1/mock/sessions/{session_id}/recordings/{item['id']}"
                    if item['id'] in session['recordings']
                    else None,
                }
            )
    notice = '客观题按官方参考答案匹配；造句其他合理表达可人工复核。写作与口语未评分；此结果不是官方托福成绩。'
    notice += (
        '学习解析为本地编写，不是 ETS 官方解析。'
        if notes is not None
        else '未安装本地学习解析，请结合原卷核对。'
    )
    if not variants_path.is_file():
        notice += (
            '未安装造句补充答案，仅按原卷参考键匹配；原卷部分参考键与题面词块存在差异，请人工复核。'
        )
    return {
        'paper': outline(paper),
        'objective_correct': sum(r['correct'] is True for r in review),
        'objective_total': len(keys),
        'pending_review': len(review) - len(keys),
        'review': review,
        'notice': notice,
    }


@router.get('/mock/sessions/{session_id}/result')
def result(session_id: UUID):
    return completed_result(session_id)


@router.get('/mock/sessions/{session_id}/recordings/{question_id}')
def recording(session_id: UUID, question_id: str):
    with LOCK:
        session = get_session(session_id)
    if session['status'] != 'completed' or question_id not in session['recordings']:
        raise HTTPException(404, '录音不可用')
    return FileResponse(
        SESSION_DIR / str(session_id) / question_id, media_type=session['recordings'][question_id]
    )
