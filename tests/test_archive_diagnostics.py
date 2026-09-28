"""Archive failures stay visible and never silently alter sampling or user files."""
import json
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from backend import history, mock_exam
from backend.app import app


client = TestClient(app, raise_server_exceptions=False)
PRACTICE = {'section': 'reading', 'mode': 'practice', 'task_type': 'complete_words', 'count': 1}


@pytest.fixture
def archived_practice():
    record_id = str(uuid4())
    response = client.post('/api/v1/exam/submit', json={'section': 'reading', 'submission_id': record_id})
    assert response.status_code == 200
    path = history.HISTORY_DIR / f'{record_id}.json'
    return path, path.read_bytes()


def assert_diagnostic(response, path, status=409):
    assert response.status_code == status, response.text
    message = response.json()['detail']
    assert path.name in message
    assert path.parent.name in message
    assert '原文件未修改' in message


@pytest.mark.parametrize('content', [b'{', b'\xff', b'[]', b'null', b'{}'])
def test_bad_practice_archive_blocks_reads_and_weighted_draws_without_mutation(archived_practice, content):
    healthy, original = archived_practice
    broken = history.HISTORY_DIR / f'{uuid4()}.json'
    broken.write_bytes(content)
    recordings = broken.with_suffix('')
    recordings.mkdir()
    recording = recordings / 'R01'
    recording.write_bytes(b'preserve recording')
    for url, params in [('/api/v1/history', {}),
                        (f'/api/v1/history/practice/{broken.stem}', {}),
                        ('/api/v1/exam', PRACTICE)]:
        assert_diagnostic(client.get(url, params=params), broken)
    assert broken.read_bytes() == content
    assert healthy.read_bytes() == original
    assert recording.read_bytes() == b'preserve recording'
    # Disabling decay is an explicit choice, not an implicit corruption fallback.
    assert client.get('/api/v1/exam', params={**PRACTICE, 'repeat_decay': 0}).status_code == 200
    assert client.get('/api/v1/exam', params={'section': 'reading', 'mode': 'exam'}).status_code == 200


@pytest.mark.parametrize('field,value', [('completed_at', 'invalid'), ('completed_at', float('nan')),
                                        ('result', {}), ('recordings', []), ('section', 'unknown')])
def test_incomplete_practice_record_has_identifiable_list_and_detail_errors(archived_practice, field, value):
    path, original = archived_practice
    record = json.loads(original)
    record[field] = value
    path.write_text(json.dumps(record), encoding='utf-8')
    broken = path.read_bytes()
    assert_diagnostic(client.get('/api/v1/history'), path)
    assert_diagnostic(client.get(f'/api/v1/history/practice/{path.stem}'), path)
    assert path.read_bytes() == broken


@pytest.mark.parametrize('questions', [None, [], [None], [{}], [{'id': 'R01', 'group_id': []}]])
def test_incomplete_material_data_cannot_become_zero_counts(archived_practice, questions):
    path, original = archived_practice
    record = json.loads(original)
    record['questions'] = questions
    path.write_text(json.dumps(record), encoding='utf-8')
    assert_diagnostic(client.get('/api/v1/exam', params=PRACTICE), path)


@pytest.mark.parametrize('content', [b'{', b'\xff', b'{}', b'"not a list"', b'[null]'])
def test_bad_reset_marker_blocks_counting_without_rewriting_it(archived_practice, content):
    marker = history.HISTORY_DIR / '.repeat-reset'
    marker.write_bytes(content)
    assert_diagnostic(client.get('/api/v1/exam', params=PRACTICE), marker)
    assert marker.read_bytes() == content


@pytest.mark.parametrize('content', [b'{', b'\xff', b'[]', b'null', b'{}'])
def test_bad_mock_record_blocks_review_and_clear_before_any_deletion(archived_practice, content):
    healthy, original = archived_practice
    session = client.post('/api/v1/mock/sessions', json={'paper_id': 'ets-test-1'}).json()
    path = mock_exam.SESSION_DIR / f"{session['id']}.json"
    path.write_bytes(content)
    for url in ['/api/v1/history?category=mock', f'/api/v1/history/mock/{path.stem}',
                f'/api/v1/mock/sessions/{path.stem}/result', f'/api/v1/mock/sessions/{path.stem}']:
        assert_diagnostic(client.get(url), path)
    assert_diagnostic(client.post('/api/v1/history/reset', json={'scope': 'all', 'confirm': True}), path)
    assert path.read_bytes() == content
    assert healthy.read_bytes() == original


@pytest.mark.parametrize('field,value', [('answers', []), ('recordings', []), ('completed_at', None),
                                        ('completed_at', 'invalid'), ('paper_id', '../private'),
                                        ('phase_index', 'nine')])
def test_incomplete_completed_mock_is_not_silently_hidden(field, value):
    session = client.post('/api/v1/mock/sessions', json={'paper_id': 'ets-test-1'}).json()
    path = mock_exam.SESSION_DIR / f"{session['id']}.json"
    record = json.loads(path.read_text(encoding='utf-8'))
    record.update(status='completed', phase_index=9, completed_at=100)
    record[field] = value
    path.write_text(json.dumps(record), encoding='utf-8')
    assert_diagnostic(client.get('/api/v1/history?category=mock'), path)
    assert_diagnostic(client.get(f'/api/v1/mock/sessions/{path.stem}/result'), path)


def test_read_permission_failure_is_not_mislabeled_as_corruption(archived_practice, monkeypatch):
    path, original = archived_practice
    read_text = type(path).read_text

    def denied(target, *args, **kwargs):
        if target == path:
            raise PermissionError('test denied')
        return read_text(target, *args, **kwargs)

    monkeypatch.setattr(type(path), 'read_text', denied)
    response = client.get('/api/v1/history')
    assert_diagnostic(response, path, 503)
    assert '无法读取' in response.json()['detail']
    assert path.read_bytes() == original


def test_recovery_retries_original_data_and_logs_no_answer_contents(archived_practice, caplog):
    path, original = archived_practice
    path.write_text('{"private_answer": "secret-never-log', encoding='utf-8')
    assert_diagnostic(client.get('/api/v1/history'), path)
    assert path.name in caplog.text
    assert 'secret-never-log' not in caplog.text
    path.write_bytes(original)
    assert client.get('/api/v1/history').json()['total'] == 1
    assert client.get('/api/v1/exam', params=PRACTICE).status_code == 200
    assert history.submitted_material_counts()
