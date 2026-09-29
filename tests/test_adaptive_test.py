import json
import random
from collections import Counter
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend import adaptive_test as tests, history
from backend.app import app
from backend.question_store import material_groups, store

client = TestClient(app)


def start(level=5):
    response = client.post('/api/v1/tests/sessions', json={'level': level})
    assert response.status_code == 200, response.text
    return response.json()


def event(session, action, **values):
    response = client.post(
        f"/api/v1/tests/sessions/{session['id']}",
        json={'phase_index': session['phase_index'], 'action': action, **values},
    )
    assert response.status_code == 200, response.text
    return response.json()


def answers(session, correct=True):
    result = []
    for question in session['phase']['questions']:
        key = store.answer(question['id'])
        value = (
            key.get('correct_index', key.get('accepted', [key.get('reference', '')])[0])
            if correct
            else None
        )
        result.append({'question_id': question['id'], 'answer': value, 'duration_seconds': 1})
    return result


@pytest.mark.parametrize('level', range(1, 11))
def test_presets_and_private_boundaries(level):
    session = start(level)
    assert session['profile']['bounds'][0] <= level <= session['profile']['bounds'][1]
    assert len(session['phase']['questions']) == 20
    public = json.dumps(session)
    for forbidden in (
        'correct_index',
        'accepted',
        'explanation',
        'answer_evidence',
        'keys',
        'routes',
    ):
        assert f'"{forbidden}"' not in public
    assert 'phases' not in session
    assert len(client.get('/api/v1/resources').json()['test']) == 5


@pytest.mark.parametrize('correct,expected', [(0, 4), (49, 4), (50, 5), (79, 5), (80, 6), (100, 6)])
def test_routing_thresholds(correct, expected):
    assert tests.route_level(5, correct, 100, [4, 6]) == expected


@pytest.mark.parametrize(
    'level,reading,listening', [(2, 3, 1), (4, 5, 3), (5, 6, 4), (7, 8, 6), (10, 10, 8)]
)
def test_complete_test_has_whole_materials_unique_ids_and_independent_routes(
    level, reading, listening
):
    session = start(level)
    questions = []
    for index in range(9):
        assert session['phase_index'] == index
        phase = session['phase']
        if index == 1:
            assert phase['level'] == reading
        if index == 2:
            assert phase['level'] == level
        if index == 3:
            assert phase['level'] == listening
        questions.extend(phase['questions'])
        session = event(session, 'begin')
        previous = session
        session = event(session, 'submit', responses=answers(session, correct=index != 2))
        retried = event(previous, 'submit', responses=answers(previous, correct=index != 2))
        assert retried['phase_index'] == session['phase_index']
    assert session['status'] == 'completed'
    assert len(questions) == len({q['id'] for q in questions}) == 120
    assert Counter(q['section'] for q in questions) == {
        'reading': 50,
        'listening': 47,
        'writing': 12,
        'speaking': 11,
    }
    bank = material_groups(store.all_questions())
    for group_id, group in material_groups(questions).items():
        assert {q['id'] for q in group} == {q['id'] for q in bank[group_id]}
    for section in ('reading', 'listening', 'writing', 'speaking'):
        assert len({q['difficulty'] for q in questions if q['section'] == section}) > 1
    assert session['result']['total_questions'] == 120
    assert sum(s['possible'] for s in session['result']['sections'].values()) == 107
    assert 'band6' not in json.dumps(session['result'])
    assert client.get('/api/v1/history?category=test').json()['total'] == 1
    record = client.get(f"/api/v1/history/test/{session['id']}").json()
    assert record['questions'] == questions
    assert record['result']['adaptive']['starting_level'] == level


def test_harder_profiles_shift_mix_over_many_forms():
    means = []
    for level in (2, 10):
        labels = []
        for seed in range(50):
            used = set()
            for index in range(7):
                labels.extend(
                    q['difficulty']
                    for q in tests.select_phase(
                        index, level, used, random.Random(seed * 10 + index)
                    )['questions']
                )
        means.append(sum({'easy': 1, 'medium': 5, 'hard': 9}[x] for x in labels) / len(labels))
    assert means[1] > means[0] + 1


def test_saved_drafts_timer_and_expiry_do_not_reset(monkeypatch):
    monkeypatch.setattr(tests.time, 'time', lambda: 1000.0)
    session = event(start(), 'begin')
    deadline = session['deadline']
    session = event(session, 'save', responses=answers(session))
    session = event(session, 'begin')
    assert session['deadline'] == deadline
    resumed = client.get(f"/api/v1/tests/sessions/{session['id']}").json()
    assert resumed['responses'] == session['responses']
    monkeypatch.setattr(tests.time, 'time', lambda: deadline + 6)
    expired = client.get(f"/api/v1/tests/sessions/{session['id']}").json()
    assert expired['phase_index'] == 1
    assert expired['deadline'] is None
    assert expired['phase']['level'] == 6


@pytest.mark.parametrize('offset,accepted', [(-0.01, True), (0.01, True), (4.99, True), (5, False)])
def test_final_snapshot_has_a_bounded_delivery_window(monkeypatch, offset, accepted):
    session = event(start(), 'begin')
    url = f"/api/v1/tests/sessions/{session['id']}"
    final = answers(session)
    event(session, 'save', responses=answers(session, correct=False))
    monkeypatch.setattr(tests.time, 'time', lambda: session['deadline'] + offset)
    if 0 <= offset < 5:
        assert client.get(url).json()['phase_index'] == 0
        assert (
            client.post(
                url, json={'phase_index': 0, 'action': 'save', 'responses': final}
            ).status_code
            == 409
        )
    result = client.post(url, json={'phase_index': 0, 'action': 'submit', 'responses': final})
    assert result.status_code == (200 if accepted else 409)
    stored = tests.read_session(session['id'])
    assert stored['routes'][0]['correct'] == (20 if accepted else 0)
    if accepted:
        assert event(session, 'submit', responses=final)['phase_index'] == 1
        final[0]['answer'] = 'changed after submission'
        assert (
            client.post(
                url, json={'phase_index': 0, 'action': 'submit', 'responses': final}
            ).status_code
            == 409
        )


def test_validation_and_corrupt_archive():
    for value in (0, 11, True, '5', 5.5):
        assert client.post('/api/v1/tests/sessions', json={'level': value}).status_code == 422
    session = start()
    url = f"/api/v1/tests/sessions/{session['id']}"
    assert client.post(url, json={'phase_index': 0, 'action': 'submit'}).status_code == 409
    session = event(session, 'begin')
    assert client.post(url, json={'phase_index': 1, 'action': 'submit'}).status_code == 409
    assert (
        client.post(
            url,
            json={
                'phase_index': 0,
                'action': 'save',
                'responses': [{'question_id': 'W01', 'answer': 'oops'}],
            },
        ).status_code
        == 422
    )
    file = tests.SESSION_DIR / f"{session['id']}.json"
    original = '{broken'
    file.write_text(original)
    assert client.get(url).status_code == 409
    assert file.read_text() == original


def test_recordings_survive_resume_and_completed_history():
    session = start()
    while session['phase_index'] < 7:
        session = event(event(session, 'begin'), 'submit')
    qid = session['phase']['questions'][0]['id']
    url = f"/api/v1/tests/sessions/{session['id']}/recordings/{qid}"
    assert (
        client.put(url, content=b'audio', headers={'content-type': 'audio/webm'}).status_code == 200
    )
    assert client.get(url).content == b'audio'
    assert qid in client.get(f"/api/v1/tests/sessions/{session['id']}").json()['recordings']
    while session['status'] == 'active':
        session = event(event(session, 'begin'), 'submit')
    assert client.get(f"/api/v1/history/test/{session['id']}/recordings/{qid}").content == b'audio'
    assert (
        client.put(url, content=b'retry', headers={'content-type': 'audio/webm'}).status_code == 200
    )
    assert client.get(url).content == b'audio'
    assert not list(history.HISTORY_DIR.glob('*.tmp'))


def test_history_clear_removes_completed_session_copies_but_preserves_active_tests():
    active = start(2)
    completed = start(10)
    while completed['status'] == 'active':
        completed = event(event(completed, 'begin'), 'submit')
    result = client.post('/api/v1/history/reset', json={'scope': 'all', 'confirm': True})
    assert result.status_code == 200
    assert result.json()['deleted'] == 1
    assert not (tests.SESSION_DIR / f"{completed['id']}.json").exists()
    assert client.get(f"/api/v1/tests/sessions/{completed['id']}").status_code == 404
    assert client.get(f"/api/v1/tests/sessions/{active['id']}").status_code == 200


def test_invalid_response_does_not_partially_save_and_directions_do_not_accept_answers():
    session = start()
    url = f"/api/v1/tests/sessions/{session['id']}"
    assert (
        client.post(
            url, json={'phase_index': 0, 'action': 'begin', 'responses': answers(session)}
        ).status_code
        == 422
    )
    session = event(session, 'begin')
    valid = answers(session)
    bad = valid + [{'question_id': 'W01', 'answer': 'not in module'}]
    assert (
        client.post(url, json={'phase_index': 0, 'action': 'save', 'responses': bad}).status_code
        == 422
    )
    assert client.get(url).json()['responses'] == []
    assert (
        client.post(
            url, json={'phase_index': 0, 'action': 'save', 'responses': [valid[0], valid[0]]}
        ).status_code
        == 422
    )


def test_sessions_keep_question_and_key_snapshots_after_bank_changes(monkeypatch):
    session = event(start(), 'begin')
    original = answers(session)
    qid = original[0]['question_id']
    current = store._load_answers()
    monkeypatch.setitem(current, qid, {**current[qid], 'accepted': ['not the old answer']})
    next_phase = event(session, 'submit', responses=original)
    assert next_phase['phase']['level'] == 6
    saved = tests.read_session(session['id'])
    assert saved['routes'][0]['correct'] == 20


def test_session_save_retries_a_brief_windows_file_lock(monkeypatch):
    session = start()
    replace = Path.replace
    calls = []

    def locked_once(path, target):
        calls.append(target)
        if len(calls) == 1:
            raise PermissionError('temporary scanner lock')
        return replace(path, target)

    monkeypatch.setattr(Path, 'replace', locked_once)
    session = event(session, 'begin')
    assert len(calls) == 2
    assert (
        client.get(f"/api/v1/tests/sessions/{session['id']}").json()['deadline']
        == session['deadline']
    )


@pytest.mark.parametrize('recovery', ['identical', 'changed', 'get', 'legacy_get'])
@pytest.mark.parametrize('duration', [None, 1])
def test_final_archive_recovers_failed_session_write_before_retry(monkeypatch, recovery, duration):
    session = start()
    for _ in range(8):
        session = event(event(session, 'begin'), 'submit')
    session = event(session, 'begin')
    qid = session['phase']['questions'][0]['id']
    url = f"/api/v1/tests/sessions/{session['id']}"
    body = {
        'phase_index': 8,
        'action': 'submit',
        'responses': [
            {'question_id': qid, 'answer': 'The accepted answer.', 'duration_seconds': duration},
        ],
    }
    original_write = tests.write_archive

    def fail_completed(path, value):
        if value.get('status') == 'completed':
            raise PermissionError('Final session cannot be committed')
        return original_write(path, value)

    with monkeypatch.context() as fault:
        fault.setattr(tests, 'write_archive', fail_completed)
        failed = TestClient(app, raise_server_exceptions=False).post(url, json=body)
    assert failed.status_code == 500
    disk = json.loads((tests.SESSION_DIR / f"{session['id']}.json").read_text('utf-8'))
    assert disk['status'] == 'active'
    archived = history.read_record(session['id'])
    if recovery == 'legacy_get':
        del archived['test_final_responses']
        history.write_record(archived)
    if recovery == 'changed':
        body['responses'][0]['answer'] = 'A different answer.'
    if recovery in ('identical', 'changed'):
        retry = client.post(url, json=body)
        assert retry.status_code == (409 if recovery == 'changed' else 200)
    resumed = client.get(url).json()
    assert resumed['status'] == 'completed'
    assert (
        next(row for row in resumed['result']['feedback'] if row['question_id'] == qid)['answer']
        == 'The accepted answer.'
    )
    assert tests.read_session(session['id'])['responses'][qid]['answer'] == 'The accepted answer.'
    assert history.read_record(session['id']) == archived
    assert len(list(history.HISTORY_DIR.glob('*.json'))) == 1
