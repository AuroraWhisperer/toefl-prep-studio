import json
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from backend import history, mock_exam
from backend.app import app
from backend.question_store import material_groups, store


client = TestClient(app)


def submit(section='speaking'):
    payload = {'section': section, 'submission_id': str(uuid4())}
    assert client.post('/api/v1/exam/submit', json=payload).status_code == 200
    return payload, history.read_record(payload['submission_id'])


def save_recording(record):
    question_id = next(q['id'] for q in record['questions'] if q['section'] == 'speaking')
    url = f"/api/v1/history/{record['category']}/{record['id']}/recordings/{question_id}"
    assert (
        client.put(
            url, content=b'preserved recording', headers={'Content-Type': 'audio/webm'}
        ).status_code
        == 200
    )
    return url


def test_probability_reset_preserves_archives_and_counts_only_new_submissions(monkeypatch):
    payload, record = submit()
    audio_url = save_recording(record)
    group_ids = material_groups(record['questions']).keys()
    assert history.submitted_material_counts() == dict.fromkeys(group_ids, 1)
    files_before = {p.name: p.read_bytes() for p in history.HISTORY_DIR.glob('*.json')}
    response = client.post('/api/v1/history/reset', json={'scope': 'probability', 'confirm': True})
    assert response.json() == {'scope': 'probability', 'deleted': 0}
    assert history.submitted_material_counts() == {}
    assert {p.name: p.read_bytes() for p in history.HISTORY_DIR.glob('*.json')} == files_before
    assert client.get(audio_url).content == b'preserved recording'
    assert client.get('/api/v1/history').json()['total'] == 1
    assert client.get(f"/api/v1/history/practice/{record['id']}").status_code == 200
    assert json.loads((history.HISTORY_DIR / '.repeat-reset').read_text()) == [record['id']]
    assert client.post('/api/v1/exam/submit', json=payload).status_code == 200
    assert history.submitted_material_counts() == {}

    original = store.practice_questions
    counts = []

    def capture(*args, **kwargs):
        counts.append(kwargs['submission_counts'])
        return original(*args, **kwargs)

    monkeypatch.setattr(store, 'practice_questions', capture)
    assert (
        client.get(
            '/api/v1/exam',
            params={
                'section': 'reading',
                'mode': 'practice',
                'task_type': 'complete_words',
                'count': 1,
            },
        ).status_code
        == 200
    )
    assert counts == [{}]
    submit()
    assert history.submitted_material_counts() == dict.fromkeys(group_ids, 1)
    assert (
        client.post(
            '/api/v1/history/reset', json={'scope': 'probability', 'confirm': True}
        ).status_code
        == 200
    )
    assert history.submitted_material_counts() == {}
    assert client.get('/api/v1/history').json()['total'] == 2


def test_reset_uses_ids_instead_of_archive_dates():
    for completed_at in [None, 0, 99999999999]:
        record = {'id': str(uuid4()), 'questions': [{'id': 'legacy-material'}]}
        if completed_at is not None:
            record['completed_at'] = completed_at
        history.write_record(record)
    assert history.submitted_material_counts() == {'legacy-material': 3}
    assert (
        client.post(
            '/api/v1/history/reset', json={'scope': 'probability', 'confirm': True}
        ).status_code
        == 200
    )
    assert history.submitted_material_counts() == {}
    history.write_record({'id': str(uuid4()), 'questions': [{'id': 'legacy-material'}]})
    assert history.submitted_material_counts() == {'legacy-material': 1}


def test_clear_all_removes_completed_records_and_audio_but_preserves_unfinished_sessions(
    local_mock_bank,
):
    _, practice = submit()
    _, comprehensive = submit('all')
    audio_urls = [save_recording(record) for record in [practice, comprehensive]]
    sessions = {}
    for status in ['active', 'abandoned', 'completed']:
        session = client.post('/api/v1/mock/sessions', json={'paper_id': 'ets-test-1'}).json()
        record = mock_exam.get_session(session['id'])
        record.update(
            status=status, completed_at=100, phase_index=9 if status == 'completed' else 0
        )
        mock_exam.persist(record)
        directory = mock_exam.SESSION_DIR / record['id']
        directory.mkdir()
        (directory / 'recording').write_bytes(b'mock recording')
        sessions[status] = record
    sentinel = history.HISTORY_DIR / 'keep.txt'
    sentinel.write_text('unrelated file')
    assert (
        client.post(
            '/api/v1/history/reset', json={'scope': 'probability', 'confirm': True}
        ).status_code
        == 200
    )
    response = client.post('/api/v1/history/reset', json={'scope': 'all', 'confirm': True})
    assert response.json() == {'scope': 'all', 'deleted': 3}
    assert history.submitted_material_counts() == {}
    for category in ['practice', 'mock', 'test']:
        assert client.get('/api/v1/history', params={'category': category}).json()['total'] == 0
    for record in [practice, comprehensive]:
        assert client.get(f"/api/v1/history/{record['category']}/{record['id']}").status_code == 404
        assert not (history.HISTORY_DIR / record['id']).exists()
    for url in audio_urls:
        assert client.get(url).status_code == 404
    assert not (mock_exam.SESSION_DIR / sessions['completed']['id']).exists()
    assert not (mock_exam.SESSION_DIR / f"{sessions['completed']['id']}.json").exists()
    for status in ['active', 'abandoned']:
        record = sessions[status]
        assert mock_exam.get_session(record['id']) == record
        assert (
            mock_exam.SESSION_DIR / record['id'] / 'recording'
        ).read_bytes() == b'mock recording'
    assert sentinel.read_text() == 'unrelated file'
    assert not (history.HISTORY_DIR / '.repeat-reset').exists()
    assert (
        client.post('/api/v1/history/reset', json={'scope': 'all', 'confirm': True}).json()[
            'deleted'
        ]
        == 0
    )
    _, new_record = submit()
    assert history.submitted_material_counts() == dict.fromkeys(
        material_groups(new_record['questions']), 1
    )


@pytest.mark.parametrize(
    'body',
    [
        {},
        {'scope': 'all'},
        {'scope': 'all', 'confirm': False},
        {'scope': 'unknown', 'confirm': True},
    ],
)
def test_invalid_reset_requests_do_not_change_history(body):
    _, record = submit()
    assert client.post('/api/v1/history/reset', json=body).status_code == 422
    assert history.read_record(record['id']) == record
    assert history.submitted_material_counts()


@pytest.mark.parametrize('scope', ['probability', 'all'])
def test_cross_origin_reset_is_rejected(scope):
    _, record = submit()
    response = client.post(
        '/api/v1/history/reset',
        json={'scope': scope, 'confirm': True},
        headers={'Origin': 'https://untrusted.example'},
    )
    assert response.status_code == 403
    assert history.read_record(record['id']) == record
    assert history.submitted_material_counts()


def test_invalid_archive_filename_prevents_any_deletion():
    _, record = submit()
    (history.HISTORY_DIR / 'not-an-id.json').write_text(json.dumps(record))
    assert (
        client.post('/api/v1/history/reset', json={'scope': 'all', 'confirm': True}).status_code
        == 409
    )
    assert history.read_record(record['id']) == record


def test_failed_recording_deletion_keeps_record_for_retry(monkeypatch):
    _, record = submit()
    audio_url = save_recording(record)
    with monkeypatch.context() as patch:

        def fail(_):
            raise OSError('recording is busy')

        patch.setattr(history.shutil, 'rmtree', fail)
        response = client.post('/api/v1/history/reset', json={'scope': 'all', 'confirm': True})
        assert response.status_code == 500
        assert '未能完成清空' in response.json()['detail']
        assert client.get(audio_url).content == b'preserved recording'
        assert client.get('/api/v1/history').json()['total'] == 1
    assert (
        client.post('/api/v1/history/reset', json={'scope': 'all', 'confirm': True}).status_code
        == 200
    )
    assert client.get('/api/v1/history').json()['total'] == 0
