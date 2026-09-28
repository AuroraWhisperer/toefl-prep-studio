"""In-memory projections must remain subordinate to the JSON archive."""
import os
from pathlib import Path
from uuid import uuid4

from fastapi.testclient import TestClient

from backend import archive_index, history, mock_exam
from backend.app import app


client = TestClient(app, raise_server_exceptions=False)
PRACTICE = {'section': 'reading', 'mode': 'practice', 'task_type': 'complete_words', 'count': 1}


def submit():
    record_id = str(uuid4())
    assert client.post('/api/v1/exam/submit', json={'section': 'reading', 'submission_id': record_id}).status_code == 200
    return history.HISTORY_DIR / f'{record_id}.json'


def test_warm_list_and_weighted_draw_recheck_files_without_reparsing(monkeypatch):
    path = submit()
    assert client.get('/api/v1/history').status_code == 200
    before = history.submitted_material_counts()
    assert client.get('/api/v1/exam', params=PRACTICE).status_code == 200
    read_text = Path.read_text
    reads = []

    def counted(target, *args, **kwargs):
        if target.parent == history.HISTORY_DIR:
            reads.append(target)
        return read_text(target, *args, **kwargs)

    monkeypatch.setattr(Path, 'read_text', counted)
    assert client.get('/api/v1/history').json()['total'] == 1
    assert history.submitted_material_counts() == before
    assert reads == []
    path.write_text('{', encoding='utf-8')
    assert client.get('/api/v1/history').status_code == 409
    assert client.get('/api/v1/exam', params=PRACTICE).status_code == 409


def test_added_deleted_and_restored_archives_rebuild_counts_and_summaries():
    first = submit()
    original = first.read_bytes()
    counts = history.submitted_material_counts()
    assert client.get('/api/v1/history').json()['total'] == 1
    second = submit()
    assert history.submitted_material_counts() == {key: value * 2 for key, value in counts.items()}
    assert client.get('/api/v1/history').json()['total'] == 2
    second.unlink()
    first.write_text('{', encoding='utf-8')
    assert client.get('/api/v1/history').status_code == 409
    first.write_bytes(original)
    assert client.get('/api/v1/history').json()['total'] == 1
    assert history.submitted_material_counts() == counts


def test_atomic_replacement_with_preserved_size_and_mtime_is_not_stale():
    path = submit()
    original = path.read_bytes()
    assert client.get('/api/v1/history').status_code == 200
    old = path.stat()
    changed = original.replace(b'"section": "reading"', b'"section": "unknown"', 1)
    assert len(changed) == len(original) and changed != original
    temporary = path.with_suffix('.replacement')
    temporary.write_bytes(changed)
    os.utime(temporary, ns=(old.st_atime_ns, old.st_mtime_ns))
    temporary.replace(path)
    assert client.get('/api/v1/history').status_code == 409


def test_mock_warm_list_detects_new_completion_without_reparsing_unchanged_sessions(monkeypatch):
    session = client.post('/api/v1/mock/sessions', json={'paper_id': 'ets-test-1'}).json()
    assert client.get('/api/v1/history?category=mock').json()['total'] == 0
    stored = mock_exam.read_session(session['id'])
    stored.update(status='completed', phase_index=9, completed_at=100)
    mock_exam.persist(stored)
    assert client.get('/api/v1/history?category=mock').json()['total'] == 1
    read_session = mock_exam.read_session
    reads = []

    def counted(record_id):
        reads.append(record_id)
        return read_session(record_id)

    monkeypatch.setattr(mock_exam, 'read_session', counted)
    assert client.get('/api/v1/history?category=mock').json()['total'] == 1
    assert reads == []
    path = mock_exam.SESSION_DIR / f"{session['id']}.json"
    path.write_text('{', encoding='utf-8')
    assert client.get('/api/v1/history?category=mock').status_code == 409


def test_data_root_change_does_not_reuse_another_roots_counts(tmp_path, monkeypatch):
    submit()
    assert history.submitted_material_counts()
    assert client.get('/api/v1/history').json()['total'] == 1
    monkeypatch.setattr(history, 'HISTORY_DIR', tmp_path / 'another-root')
    assert history.submitted_material_counts() == {}
    assert client.get('/api/v1/history').json()['total'] == 0


def test_failed_submit_does_not_change_counts_and_retry_counts_once(monkeypatch):
    submit()
    before = history.submitted_material_counts()
    assert client.get('/api/v1/history').json()['total'] == 1
    payload = {'section': 'reading', 'submission_id': str(uuid4())}
    replace = Path.replace

    def denied(path, target):
        if path.parent == history.HISTORY_DIR:
            raise PermissionError('synthetic write failure')
        return replace(path, target)

    with monkeypatch.context() as patch:
        patch.setattr(Path, 'replace', denied)
        assert client.post('/api/v1/exam/submit', json=payload).status_code == 500
    assert history.submitted_material_counts() == before
    assert client.get('/api/v1/history').json()['total'] == 1
    for _ in range(2):
        assert client.post('/api/v1/exam/submit', json=payload).status_code == 200
        assert history.submitted_material_counts() == {key: value * 2 for key, value in before.items()}
        assert client.get('/api/v1/history').json()['total'] == 2


def test_unreadable_directory_does_not_turn_a_warm_index_into_empty_history(monkeypatch):
    submit()
    assert history.submitted_material_counts()
    assert client.get('/api/v1/history').json()['total'] == 1
    scandir = archive_index.os.scandir

    def denied(directory):
        if Path(directory) == history.HISTORY_DIR.resolve():
            raise PermissionError('synthetic directory failure')
        return scandir(directory)

    monkeypatch.setattr(archive_index.os, 'scandir', denied)
    assert client.get('/api/v1/history').status_code == 503
    assert client.get('/api/v1/exam', params=PRACTICE).status_code == 503
