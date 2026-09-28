import copy
import json
from datetime import datetime, timezone
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend import history, mock_exam

client = TestClient(app)


def submit(section='reading', **extra):
    payload = {'section': section, 'submission_id': str(uuid4()), **extra}
    response = client.post('/api/v1/exam/submit', json=payload)
    assert response.status_code == 200, response.text
    return payload, response.json()


@pytest.mark.parametrize('section', ['reading', 'listening', 'writing', 'speaking'])
def test_submitted_sections_are_persistent_practice_history(section):
    payload, result = submit(section)
    listing = client.get('/api/v1/history').json()
    assert listing['total'] == 1
    row = listing['items'][0]
    assert row['id'] == payload['submission_id']
    assert row['category'] == 'practice'
    detail = client.get(f"/api/v1/history/practice/{row['id']}").json()
    assert detail['result'] == result
    assert [q['id'] for q in detail['questions']] == [f['question_id'] for f in result['feedback']]
    assert json.loads((history.HISTORY_DIR / f"{row['id']}.json").read_text(encoding='utf-8'))['result'] == result
    assert client.get('/api/v1/history?category=test').json()['total'] == 0
    assert client.get('/api/v1/history?category=mock').json()['total'] == 0


def test_randomized_task_history_keeps_the_selected_questions_and_answers():
    params = {'section': 'reading', 'mode': 'practice', 'task_type': 'read_daily_life', 'count': 2}
    exam = client.get('/api/v1/exam', params=params).json()
    responses = [{'question_id': q['id'], 'answer': 0, 'duration_seconds': 12} for q in exam['questions']]
    payload, result = submit(**params, question_ids=exam['question_ids'], responses=responses)
    record = client.get(f"/api/v1/history/practice/{payload['submission_id']}").json()
    assert record['questions'] == exam['questions']
    assert record['result'] == result
    assert all(item['answer'] == 0 and item['duration_seconds'] == 12 for item in record['result']['feedback'])


def test_updated_learning_notes_do_not_rewrite_archived_answers_or_scores(monkeypatch):
    payload, result = submit('listening', responses=[{'question_id': 'L01', 'answer': 0}])
    path = history.HISTORY_DIR / f"{payload['submission_id']}.json"
    original = path.read_bytes()
    answers = copy.deepcopy(history.store._load_answers())
    latest = '读懂：revised 是修改后的。\n解析：请求的是新版时间表。\n下次：先找请求的动作和对象。'
    answers['L01']['explanation'] = latest
    monkeypatch.setattr(history.store, '_answers', answers)
    record = client.get(f"/api/v1/history/practice/{payload['submission_id']}").json()
    assert record['learning_explanations']['L01'] == latest
    assert record['result'] == result
    assert path.read_bytes() == original


@pytest.mark.parametrize('change', ['question', 'answer'])
def test_history_keeps_original_explanation_if_question_or_key_changed(monkeypatch, change):
    payload, result = submit('listening')
    if change == 'question':
        questions = copy.deepcopy(history.store._load_questions())
        questions['L01']['audio_text'] = 'A different question.'
        monkeypatch.setattr(history.store, '_questions', questions)
    else:
        answers = copy.deepcopy(history.store._load_answers())
        answers['L01']['correct_index'] = (answers['L01']['correct_index'] + 1) % 4
        monkeypatch.setattr(history.store, '_answers', answers)
    record = client.get(f"/api/v1/history/practice/{payload['submission_id']}").json()
    assert 'L01' not in record['learning_explanations']
    assert record['result'] == result


def test_retry_is_idempotent_but_new_attempts_remain_separate():
    payload, result = submit()
    first = client.get('/api/v1/history').json()['items'][0]
    assert client.post('/api/v1/exam/submit', json=payload).json() == result
    assert client.get('/api/v1/history').json()['items'] == [first]
    assert client.post('/api/v1/exam/submit', json={**payload, 'section': 'listening'}).status_code == 409
    submit()
    assert client.get('/api/v1/history').json()['total'] == 2


def test_invalid_submission_is_not_archived_and_categories_do_not_leak():
    assert client.post('/api/v1/exam/submit', json={'section': 'reading', 'responses': [{'question_id': 'W01', 'answer': 'no'}]}).status_code == 422
    assert client.get('/api/v1/history').json()['total'] == 0
    payload, _ = submit('all')
    assert client.get('/api/v1/history?category=test').json()['total'] == 1
    assert client.get('/api/v1/history').json()['total'] == 0
    assert client.get(f"/api/v1/history/practice/{payload['submission_id']}").status_code == 404
    assert client.get(f"/api/v1/history/test/{payload['submission_id']}").status_code == 200


@pytest.mark.parametrize('category', ['practice', 'mock', 'test'])
def test_newest_first_pagination_and_local_date_boundaries(category):
    # September 25 23:59, September 26 00:00 and 23:59, September 27 00:00 in UTC+8.
    dates = ['2026-09-25T15:59:00+00:00', '2026-09-25T16:00:00+00:00', '2026-09-26T15:59:00+00:00', '2026-09-26T16:00:00+00:00']
    ids = []
    for date in dates:
        completed_at = datetime.fromisoformat(date).timestamp()
        if category == 'mock':
            session = client.post('/api/v1/mock/sessions', json={'paper_id': 'ets-test-1'}).json()
            record = mock_exam.get_session(session['id'])
            record.update(status='completed', completed_at=completed_at, phase_index=9)
            mock_exam.persist(record)
        else:
            payload, _ = submit('all' if category == 'test' else 'reading')
            record = history.read_record(payload['submission_id'])
            record['completed_at'] = completed_at
            history.write_record(record)
        ids.append(record['id'])
    params = {'category': category, 'page_size': 2}
    first = client.get('/api/v1/history', params=params).json()
    second = client.get('/api/v1/history', params={**params, 'page': 2}).json()
    assert [r['id'] for r in first['items']] == ids[3:1:-1]
    assert [r['id'] for r in second['items']] == ids[1::-1]
    assert first['total'] == 4 and first['pages'] == 2
    filtered = client.get('/api/v1/history', params={**params, 'start_at': dates[1], 'end_at': dates[3]}).json()
    assert [r['id'] for r in filtered['items']] == ids[2:0:-1]
    assert client.get('/api/v1/history', params={**params, 'page': 99}).json()['page'] == 2
    assert client.get('/api/v1/history', params={**params, 'start_at': dates[3]}).json()['total'] == 1
    assert client.get('/api/v1/history', params={**params, 'end_at': dates[1]}).json()['total'] == 1


def test_active_and_abandoned_mock_sessions_are_not_history():
    for status in ['active', 'abandoned', 'completed']:
        session = client.post('/api/v1/mock/sessions', json={'paper_id': 'ets-test-1'}).json()
        record = mock_exam.get_session(session['id'])
        record.update(status=status, completed_at=datetime.now(timezone.utc).timestamp())
        mock_exam.persist(record)
    result = client.get('/api/v1/history?category=mock').json()
    assert result['total'] == 1
    assert result['items'][0]['id'] == record['id']
    assert client.get(f"/api/v1/history/mock/{record['id']}").json()['result']['objective_total'] == 84


@pytest.mark.parametrize('params', [
    {'category': 'unknown'}, {'page': 0}, {'page_size': 51},
    {'start_at': 'invalid'}, {'start_at': '2026-09-26T00:00:00'},
    {'start_at': '2026-09-27T00:00:00Z', 'end_at': '2026-09-26T00:00:00Z'},
])
def test_invalid_filters_are_rejected(params):
    assert client.get('/api/v1/history', params=params).status_code == 422


def test_recordings_survive_reload_and_are_limited_to_submitted_speaking_items():
    payload, _ = submit('speaking')
    record_id = payload['submission_id']
    detail = client.get(f'/api/v1/history/practice/{record_id}').json()
    question_id = detail['questions'][0]['id']
    url = f'/api/v1/history/practice/{record_id}/recordings/{question_id}'
    assert client.put(url, content=b'audio', headers={'Content-Type': 'text/html'}).status_code == 415
    assert client.put(url, content=b'', headers={'Content-Type': 'audio/webm'}).status_code == 422
    assert client.put(url, content=b'a' * (5 * 1024 * 1024 + 1), headers={'Content-Type': 'audio/webm'}).status_code == 413
    assert client.put(url, content=b'archived clip', headers={'Content-Type': 'audio/webm;codecs=opus'}).status_code == 200
    assert client.get(url).content == b'archived clip'
    assert client.get(f'/api/v1/history/practice/{record_id}').json()['recordings'][question_id] == url
    assert client.put(url.replace(question_id, 'R01'), content=b'audio', headers={'Content-Type': 'audio/webm'}).status_code == 422
    assert client.get(f'/api/v1/history/test/{record_id}/recordings/{question_id}').status_code == 404
    assert client.get(f'/api/v1/history/practice/{uuid4()}').status_code == 404
    assert client.get('/api/v1/history/practice/not-a-uuid').status_code == 422
