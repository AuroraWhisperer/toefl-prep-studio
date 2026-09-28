"""Shared JSON writes preserve the last committed file and archive idempotency."""

import json
from pathlib import Path
from unittest.mock import Mock
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from backend import adaptive_test, archive_index, history, mock_exam
from backend.app import app


client = TestClient(app, raise_server_exceptions=False)


@pytest.fixture(params=['practice', 'mock', 'test'])
def writer(request):
    if request.param == 'practice':
        return history.write_record, history.HISTORY_DIR
    module = mock_exam if request.param == 'mock' else adaptive_test
    return module.persist, module.SESSION_DIR


def test_writes_retry_brief_lock_and_commit_once(writer, monkeypatch):
    write, directory = writer
    record = {'id': str(uuid4()), 'note': '读懂：材料'}
    target = directory / f"{record['id']}.json"
    replace = Path.replace
    attempts = []

    def locked(path, destination):
        assert not target.exists()
        attempts.append(destination)
        if len(attempts) < 4:
            raise PermissionError('scanner lock')
        return replace(path, destination)

    monkeypatch.setattr(Path, 'replace', locked)
    write(record)
    assert attempts == [target] * 4
    assert json.loads(target.read_text(encoding='utf-8')) == record
    assert '读懂' in target.read_text(encoding='utf-8')
    assert list(directory.iterdir()) == [target]


@pytest.mark.parametrize('failure', ['locked', 'disk', 'partial', 'serialize'])
def test_failed_write_preserves_previous_file_and_indexes(writer, failure, monkeypatch):
    write, directory = writer
    record = {'id': str(uuid4()), 'note': 'saved'}
    write(record)
    target = directory / f"{record['id']}.json"
    original = target.read_bytes()
    invalidate = Mock()
    monkeypatch.setattr(archive_index.ArchiveIndex, 'invalidate', invalidate)
    replace = Mock(
        side_effect=PermissionError('locked') if failure == 'locked' else OSError('disk')
    )
    monkeypatch.setattr(Path, 'replace', replace)
    if failure == 'partial':
        write_text = Path.write_text

        def partial(path, *args, **kwargs):
            write_text(path, '{', encoding='utf-8')
            raise OSError('disk full')

        monkeypatch.setattr(Path, 'write_text', partial)
    record['note'] = object() if failure == 'serialize' else 'changed'
    with pytest.raises(TypeError if failure == 'serialize' else OSError):
        write(record)
    assert target.read_bytes() == original
    assert replace.call_count == {'locked': 4, 'disk': 1, 'partial': 0, 'serialize': 0}[failure]
    invalidate.assert_not_called()
    assert list(directory.iterdir()) == [target]


def test_submission_lock_recovery_and_client_retry_archive_only_once(monkeypatch):
    payload = {'section': 'reading', 'submission_id': str(uuid4())}
    replace = Path.replace
    attempts = []

    def locked_once(path, target):
        attempts.append(target)
        if len(attempts) == 1:
            raise PermissionError('scanner lock')
        return replace(path, target)

    monkeypatch.setattr(Path, 'replace', locked_once)
    assert client.post('/api/v1/exam/submit', json=payload).status_code == 200
    counts = history.submitted_material_counts()
    assert counts and set(counts.values()) == {1}
    assert client.post('/api/v1/exam/submit', json=payload).status_code == 200
    assert len(attempts) == 2
    assert client.get('/api/v1/history').json()['total'] == 1
    assert history.submitted_material_counts() == counts


@pytest.mark.parametrize('recover', [True, False])
def test_probability_reset_uses_same_atomic_retry_contract(recover, monkeypatch):
    assert client.post('/api/v1/exam/submit', json={'section': 'reading'}).status_code == 200
    reset = history.HISTORY_DIR / '.repeat-reset'
    reset.write_text('[]', encoding='utf-8')
    counts = history.submitted_material_counts()
    replace = Path.replace
    attempts = []

    def locked(path, target):
        assert target == reset
        attempts.append(target)
        if not recover or len(attempts) == 1:
            raise PermissionError('scanner lock')
        return replace(path, target)

    monkeypatch.setattr(Path, 'replace', locked)
    response = client.post('/api/v1/history/reset', json={'scope': 'probability', 'confirm': True})
    assert response.status_code == (200 if recover else 500)
    assert len(attempts) == (2 if recover else 4)
    assert history.submitted_material_counts() == ({} if recover else counts)
    if not recover:
        assert reset.read_text(encoding='utf-8') == '[]'
    assert not reset.with_suffix('.tmp').exists()
