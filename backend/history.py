"""Local submission archive; active and abandoned mock sessions are not history."""

from __future__ import annotations

import hashlib
import json
import logging
import os
import shutil
import threading
import time
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Literal
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel

try:
    from . import mock_exam
    from .archive_index import ArchiveIndex
    from .archive_io import (
        MaterialArchive,
        PracticeArchive,
        RepeatReset,
        read_archive,
        write_archive,
    )
    from .exam_service import reference_answer, score_submission
    from .question_store import material_groups, store
except ImportError:
    import mock_exam
    from archive_index import ArchiveIndex
    from archive_io import (
        MaterialArchive,
        PracticeArchive,
        RepeatReset,
        read_archive,
        write_archive,
    )
    from exam_service import reference_answer, score_submission
    from question_store import material_groups, store

ROOT = Path(__file__).resolve().parents[1]
HISTORY_DIR = Path(os.environ.get('TOEFL_DATA_DIR', ROOT / 'artifacts')) / 'practice-history'
LOCK = threading.RLock()
_SUMMARY_INDEX = ArchiveIndex()
_MATERIAL_INDEX = ArchiveIndex()
router = APIRouter(prefix='/api/v1/history')
logger = logging.getLogger(__name__)
Category = Literal['practice', 'mock', 'test']
SECTION_NAMES = {
    'reading': '阅读',
    'listening': '听力',
    'speaking': '口语',
    'writing': '写作',
    'all': '四科综合',
}
TASK_NAMES = {
    'complete_words': '补全文词',
    'read_daily_life': '日常阅读',
    'read_academic_passage': '学术阅读',
    'listen_choose_response': '听力应答',
    'listen_conversation': '对话理解',
    'listen_announcement': '公告理解',
    'listen_academic_talk': '学术讲座',
    'listen_repeat': '听后复述',
    'take_interview': '模拟访谈',
    'build_sentence': '句子构建',
    'write_email': '邮件写作',
    'academic_discussion': '学术讨论',
}


def write_record(record):
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    path = HISTORY_DIR / f"{record['id']}.json"
    write_archive(path, record)
    _SUMMARY_INDEX.invalidate(path)
    _MATERIAL_INDEX.invalidate(path)


def read_record(record_id: UUID):
    path = HISTORY_DIR / f'{record_id}.json'
    if not path.is_file():
        raise HTTPException(404, '这条答题记录不存在')
    return read_archive(path, PracticeArchive)


def save_submission(payload):
    """Return an existing result, or score and archive this submission once."""
    record_id = payload.submission_id or uuid4()
    body = payload.model_dump(mode='json', exclude={'submission_id'})
    fingerprint = hashlib.sha256(json.dumps(body, sort_keys=True).encode()).hexdigest()
    with LOCK:
        if (HISTORY_DIR / f'{record_id}.json').is_file():
            existing = read_record(record_id)
            if existing['fingerprint'] != fingerprint:
                raise HTTPException(409, '该次提交已归档，请开始新一轮练习')
            return existing['result']
        result = score_submission(
            store,
            [item.model_dump() for item in payload.responses],
            section=payload.section,
            mode=payload.mode,
            task_type=payload.task_type,
            count=payload.count,
            question_ids=payload.question_ids,
        )
        write_record(
            {
                'id': str(record_id),
                'fingerprint': fingerprint,
                'category': 'test'
                if payload.section == 'all' and payload.mode == 'exam'
                else 'practice',
                'completed_at': time.time(),
                'section': payload.section,
                'mode': payload.mode,
                'task_type': payload.task_type,
                'questions': [store.question(item['question_id']) for item in result['feedback']],
                'result': result,
                'recordings': {},
            }
        )
        return result


def submitted_material_counts() -> Counter[str]:
    """Count each material once per archived submission, including existing records."""
    counts: Counter[str] = Counter()
    with LOCK:
        reset_path = HISTORY_DIR / '.repeat-reset'
        ignored = set(read_archive(reset_path, RepeatReset)) if reset_path.is_file() else set()
        materials = _MATERIAL_INDEX.read(
            HISTORY_DIR,
            lambda path: tuple(material_groups(read_archive(path, MaterialArchive)['questions'])),
            ignored_ids=ignored,
        )
        for groups in materials.values():
            counts.update(groups)
    return counts


class ResetRequest(BaseModel):
    scope: Literal['probability', 'all']
    confirm: Literal[True]


@router.post('/reset')
def reset_history(payload: ResetRequest, request: Request):
    origin = request.headers.get('origin')
    if origin and origin != str(request.base_url).rstrip('/'):
        raise HTTPException(403, '请从本机练习页面执行此操作')
    with LOCK, mock_exam.LOCK:
        reset_path = HISTORY_DIR / '.repeat-reset'
        paths = list(HISTORY_DIR.glob('*.json'))
        try:
            if payload.scope == 'probability':
                # Snapshot IDs, not dates: old retries and clock changes must not restore weight.
                HISTORY_DIR.mkdir(parents=True, exist_ok=True)
                write_archive(reset_path, sorted(path.stem for path in paths))
                logger.info(
                    'Practice repeat probability reset; preserved %d submissions', len(paths)
                )
                return {'scope': payload.scope, 'deleted': 0}
            paths += [
                path
                for path in mock_exam.SESSION_DIR.glob('*.json')
                if mock_exam.read_session(path.stem)['status'] == 'completed'
            ]
            try:
                from . import adaptive_test
            except ImportError:
                import adaptive_test
            test_sessions = []
            for path in adaptive_test.SESSION_DIR.glob('*.json'):
                session = adaptive_test.read_session(path.stem)
                adaptive_test.recover_completion(session)
                if session['status'] == 'completed':
                    test_sessions.append(path)
            paths += test_sessions
            # Validate every resolved target before any deletion; never remove a data root.
            for path in paths:
                directory = path.with_suffix('')
                if (
                    path.resolve().parent != path.parent.resolve()
                    or directory.resolve().parent != path.parent.resolve()
                ):
                    raise HTTPException(409, '记录路径无效，未执行清空')
                try:
                    UUID(path.stem)
                except ValueError:
                    raise HTTPException(409, '记录文件名无效，未执行清空') from None
            for path in paths:
                directory = path.with_suffix('')
                if directory.is_dir():
                    shutil.rmtree(directory)
                path.unlink()
            reset_path.unlink(missing_ok=True)
            deleted = len(paths) - len(test_sessions)
            logger.info(
                'Cleared %d completed archive records and reset repeat probability', deleted
            )
            return {'scope': payload.scope, 'deleted': deleted}
        except OSError:
            logger.exception('Archive reset failed scope=%s', payload.scope)
            message = (
                '未能重置抽题概率，请重试。'
                if payload.scope == 'probability'
                else '未能完成清空，部分记录可能已删除，请重试。'
            )
            raise HTTPException(500, message) from None


def summary(record, category):
    if category == 'mock':
        result = mock_exam.build_completed_result(record)
        return {
            'id': record['id'],
            'category': 'mock',
            'completed_at': record['completed_at'],
            'title': result['paper']['title'],
            'subtitle': '完整四科 · 写作与口语待复核',
            'total': len(result['review']),
            'answered': sum(
                bool(item['answer'].strip() or item['recording_url']) for item in result['review']
            ),
            'earned': result['objective_correct'],
            'possible': result['objective_total'],
            'score_label': '客观题参考正确数',
        }
    result = record['result']
    section = SECTION_NAMES[record['section']]
    task = TASK_NAMES.get(record['task_type'])
    mode = (
        '专项练习'
        if record['mode'] == 'practice'
        else '题库练习'
        if record['mode'] == 'bank'
        else '综合测验'
        if category == 'test'
        else '整科练习'
    )
    manual_count = sum(bool(item.get('manual_review')) for item in result['feedback'])
    possible = sum(item['possible'] for item in result['sections'].values())
    return {
        'id': record['id'],
        'category': category,
        'completed_at': record['completed_at'],
        'title': result['adaptive']['profile']['title']
        if 'adaptive' in result
        else f'{section} · {task}'
        if task
        else f'{section} · {mode}',
        'subtitle': f"起始 {result['adaptive']['starting_level']} / 10 · 分级综合测验"
        if 'adaptive' in result
        else mode
        if task
        else '已提交',
        'total': result['total_questions'],
        'answered': result['answered_questions'],
        'earned': round(sum(item['earned'] for item in result['sections'].values()), 1),
        'possible': possible,
        'manual_review_count': manual_count,
        'score_label': '客观题参考正确数 · 非官方成绩'
        if 'adaptive' in result
        else '开放题未计入分数'
        if manual_count and not possible
        else f'自动核对部分 · {manual_count} 题待人工复核'
        if manual_count
        else '练习原始分 · 非官方成绩',
    }


def stored_summary(path):
    record = read_record(path.stem)
    return summary(record, record['category'])


@router.get('')
def list_history(
    category: Category = 'practice',
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    start_at: datetime | None = None,
    end_at: datetime | None = None,
):
    # The browser converts local date boundaries to zoned instants; end is exclusive.
    if any(value is not None and value.tzinfo is None for value in (start_at, end_at)):
        raise HTTPException(422, '日期筛选必须包含时区')
    if start_at and end_at and start_at >= end_at:
        raise HTTPException(422, '起始日期必须早于结束日期')
    if category == 'mock':
        snapshots = mock_exam.archived_sessions()
    else:
        with LOCK:
            snapshots = list(_SUMMARY_INDEX.read(HISTORY_DIR, stored_summary).values())
    records = []
    for record in snapshots:
        if category != 'mock' and record['category'] != category:
            continue
        completed = record['completed_at']
        if start_at and completed < start_at.timestamp():
            continue
        if end_at and completed >= end_at.timestamp():
            continue
        records.append(record)
    records.sort(key=lambda item: (item['completed_at'], item['id']), reverse=True)
    total = len(records)
    pages = max(1, (total + page_size - 1) // page_size)
    page = min(page, pages)
    selected = records[(page - 1) * page_size : page * page_size]
    return {
        'items': [
            summary(record, category) if category == 'mock' else dict(record) for record in selected
        ],
        'total': total,
        'page': page,
        'pages': pages,
        'page_size': page_size,
    }


@router.get('/{category}/{record_id}')
def detail(category: Category, record_id: UUID):
    if category == 'mock':
        return {'id': str(record_id), 'result': mock_exam.completed_result(record_id)}
    with LOCK:
        record = read_record(record_id)
    if record['category'] != category:
        raise HTTPException(404, '该分类中没有这条记录')
    feedback = {item['question_id']: item for item in record['result']['feedback']}
    learning_explanations = {}
    for question in record['questions']:
        current = store.question(question['id'])
        key = store.answer(question['id'])
        if (
            current == question
            and key
            and reference_answer(current, key) == feedback[question['id']]['reference_answer']
        ):
            learning_explanations[question['id']] = key['explanation']
    return {
        **{
            key: record[key]
            for key in (
                'id',
                'category',
                'completed_at',
                'section',
                'mode',
                'task_type',
                'questions',
                'result',
            )
        },
        'learning_explanations': learning_explanations,
        'passage_translations': store.passage_translations(
            record['questions'], record['result']['feedback']
        ),
        'audio_translations': store.audio_translations(record['questions']),
        'recordings': {
            question_id: f'/api/v1/history/{category}/{record_id}/recordings/{question_id}'
            for question_id in record['recordings']
        },
    }


@router.put('/{category}/{record_id}/recordings/{question_id}')
async def upload_recording(
    category: Literal['practice', 'test'], record_id: UUID, question_id: str, request: Request
):
    content_type = request.headers.get('content-type', '').split(';')[0]
    if content_type not in ('audio/webm', 'audio/ogg', 'audio/mp4'):
        raise HTTPException(415, '仅支持浏览器音频录音')
    with LOCK:
        record = read_record(record_id)
        if record['category'] != category or not any(
            q['id'] == question_id and q['section'] == 'speaking' for q in record['questions']
        ):
            raise HTTPException(422, '录音不属于这次提交的口语题目')
    data = bytearray()
    async for chunk in request.stream():
        data.extend(chunk)
        if len(data) > 5 * 1024 * 1024:
            raise HTTPException(413, '录音不能超过 5 MB')
    if not data:
        raise HTTPException(422, '没有收到录音')
    with LOCK:
        record = read_record(record_id)
        directory = HISTORY_DIR / str(record_id)
        directory.mkdir(exist_ok=True)
        if question_id not in record['recordings']:
            path = directory / question_id
            temporary = path.with_suffix('.tmp')
            temporary.write_bytes(data)
            temporary.replace(path)
            record['recordings'][question_id] = content_type
            write_record(record)
    return {'saved': True}


@router.get('/{category}/{record_id}/recordings/{question_id}')
def recording(category: Literal['practice', 'test'], record_id: UUID, question_id: str):
    with LOCK:
        record = read_record(record_id)
    if record['category'] != category or question_id not in record['recordings']:
        raise HTTPException(404, '录音不存在')
    return FileResponse(
        HISTORY_DIR / str(record_id) / question_id, media_type=record['recordings'][question_id]
    )
