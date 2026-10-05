import json

import pytest
from fastapi.testclient import TestClient

from backend.app import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def isolated_sessions(tmp_path, monkeypatch, local_mock_bank):
    from backend import mock_exam

    monkeypatch.setattr(mock_exam, 'SESSION_DIR', tmp_path)


def start():
    response = client.post('/api/v1/mock/sessions', json={'paper_id': 'ets-test-1'})
    assert response.status_code == 200
    session = response.json()
    return client.post(
        f"/api/v1/mock/sessions/{session['id']}", json={'phase_index': 0, 'action': 'begin'}
    ).json()


def finish_phase(url):
    session = client.get(url).json()
    phase_index = session['phase_index']
    if session['phase']['section'] in ('listening', 'speaking'):
        while session['phase_index'] == phase_index:
            payload = {'phase_index': phase_index, 'item_index': session['item_index']}
            assert client.post(url, json={**payload, 'action': 'respond'}).status_code == 200
            response = client.post(url, json={**payload, 'action': 'next'})
            assert response.status_code == 200, response.text
            session = response.json()
    else:
        response = client.post(url, json={'phase_index': phase_index, 'action': 'advance'})
        assert response.status_code == 200, response.text
        session = response.json()
    if session['status'] == 'active':
        assert session['phase_state'] == 'directions'
        session = client.post(
            url, json={'phase_index': session['phase_index'], 'action': 'begin'}
        ).json()
    return session


def test_resource_categories_are_separate():
    resources = client.get('/api/v1/resources').json()
    assert len(resources['practice']) == 4
    assert len(resources['mock']) == 5
    assert len(resources['test']) == 5
    assert {p['id'] for p in resources['test']}.isdisjoint(p['id'] for p in resources['mock'])
    assert resources['real_exam']['enabled'] is False
    assert resources['real_exam']['section_order'] == [
        'reading',
        'listening',
        'writing',
        'speaking',
    ]
    assert sum(p['question_count'] for p in resources['practice']) == 5745
    assert all(p['question_count'] == 97 for p in resources['mock'])


def test_resume_preserves_deadline_and_answers_and_hides_keys():
    session = start()
    question_id = session['phase']['items'][0]['id']
    url = f"/api/v1/mock/sessions/{session['id']}"
    saved = client.post(
        url, json={'phase_index': 0, 'action': 'save', 'answers': {question_id: 'ey'}}
    ).json()
    resumed = client.get(url).json()
    assert resumed['deadline'] == session['deadline']
    assert saved['answers'][question_id] == resumed['answers'][question_id] == 'ey'
    assert 'answer_key' not in json.dumps(resumed)
    assert 'explanation' not in json.dumps(resumed)
    assert '读懂：' not in json.dumps(resumed, ensure_ascii=False)
    assert client.get(url + '/result').status_code == 409
    assert client.post(url, json={'phase_index': 1, 'action': 'advance'}).status_code == 409
    assert (
        client.post(
            url, json={'phase_index': 0, 'action': 'save', 'answers': {'R01': 'ey'}}
        ).status_code
        == 422
    )


def test_entire_flow_and_answer_release(local_mock_bank):
    session = start()
    url = f"/api/v1/mock/sessions/{session['id']}"
    titles = []
    for _ in range(9):
        titles.append(session['phase']['title'])
        session = finish_phase(url)
    assert session['status'] == 'completed'
    assert titles[0] == 'Reading · Module 1'
    assert titles[-1] == 'Take an Interview'
    result = client.get(url + '/result').json()
    assert result['objective_total'] == 84
    assert result['objective_correct'] == 0
    assert result['pending_review'] == 13
    assert len(result['review']) == 97
    if (local_mock_bank / 'sources/mock_explanations/ets-test-1.json').is_file():
        assert all(item['explanation'].startswith('读懂：') for item in result['review'])
        assert '不是 ETS 官方解析' in result['notice']
    else:
        assert all(item['explanation'] is None for item in result['review'])
        assert '未安装本地学习解析' in result['notice']
    assert 'official_score' not in result
    assert client.post(url, json={'phase_index': 8, 'action': 'save'}).status_code == 409


def test_expired_phase_cannot_be_extended(monkeypatch):
    from backend import mock_exam

    session = start()
    monkeypatch.setattr(mock_exam.time, 'time', lambda: session['deadline'] + 6)
    resumed = client.get(f"/api/v1/mock/sessions/{session['id']}").json()
    assert resumed['phase_index'] == 1
    assert resumed['deadline'] is None
    assert resumed['phase_state'] == 'directions'


@pytest.mark.parametrize('phase_index', [0, 2])
@pytest.mark.parametrize('offset,accepted', [(-0.01, True), (0.01, True), (4.99, True), (5, False)])
def test_final_answers_arrive_before_settlement(monkeypatch, phase_index, offset, accepted):
    from backend import mock_exam

    session = start()
    url = f"/api/v1/mock/sessions/{session['id']}"
    for _ in range(phase_index):
        session = finish_phase(url)
    base = {'phase_index': phase_index, 'item_index': 0}
    if phase_index == 2:
        session = client.post(url, json={**base, 'action': 'respond'}).json()
    qid = session['phase']['items'][0]['id']
    assert (
        client.post(url, json={**base, 'action': 'save', 'answers': {qid: 'A'}}).status_code == 200
    )
    deadline = session['response_deadline'] if phase_index == 2 else session['deadline']
    monkeypatch.setattr(mock_exam.time, 'time', lambda: deadline + offset)
    if 0 <= offset < 5:
        assert client.get(url).json()['phase_index'] == phase_index
        assert (
            client.post(url, json={**base, 'action': 'save', 'answers': {qid: 'C'}}).status_code
            == 409
        )
    result = client.post(
        url,
        json={**base, 'action': 'next' if phase_index == 2 else 'advance', 'answers': {qid: 'B'}},
    )
    assert result.status_code == (200 if accepted else 409)
    stored = mock_exam.read_session(session['id'])
    assert stored['answers'][qid] == ('B' if accepted else 'A')
    assert (stored['phase_index'], stored['item_index']) == ((2, 1) if phase_index == 2 else (1, 0))


def test_audio_uploads_are_confined_to_current_speaking_item():
    session = start()
    url = f"/api/v1/mock/sessions/{session['id']}/recordings/not-a-question"
    assert (
        client.put(url, content=b'bad', headers={'Content-Type': 'audio/webm'}).status_code == 422
    )


def test_question_deadline_survives_resume_and_previous_items_lock(monkeypatch):
    from backend import mock_exam

    session = start()
    url = f"/api/v1/mock/sessions/{session['id']}"
    for _ in range(2):
        session = finish_phase(url)
    first_id = session['phase']['items'][0]['id']
    payload = {'phase_index': 2, 'item_index': 0, 'action': 'respond'}
    session = client.post(url, json=payload).json()
    deadline = session['response_deadline']
    assert deadline is not None
    monkeypatch.setattr(mock_exam.time, 'time', lambda: deadline - 5)
    assert client.post(url, json=payload).json()['response_deadline'] == deadline
    assert client.get(url).json()['response_deadline'] == deadline
    session = client.post(
        url, json={**payload, 'action': 'next', 'answers': {first_id: 'A'}}
    ).json()
    assert session['item_index'] == 1
    assert session['response_deadline'] is None
    assert len(session['phase']['items']) == 1
    assert client.post(url, json={**payload, 'action': 'save'}).status_code == 409
    assert (
        client.post(url, json={**payload, 'item_index': 1, 'action': 'respond'}).status_code == 200
    )
    assert (
        client.post(
            url, json={**payload, 'item_index': 1, 'action': 'save', 'answers': {first_id: 'B'}}
        ).status_code
        == 422
    )


def test_directions_do_not_start_or_reset_answer_timer(monkeypatch):
    from backend import mock_exam

    session = client.post('/api/v1/mock/sessions', json={'paper_id': 'ets-test-1'}).json()
    url = f"/api/v1/mock/sessions/{session['id']}"
    assert session['phase_state'] == 'directions'
    assert session['deadline'] is None
    later = session['started_at'] + 3600
    monkeypatch.setattr(mock_exam.time, 'time', lambda: later)
    assert client.get(url).json()['phase_index'] == 0
    assert client.post(url, json={'phase_index': 0, 'action': 'save'}).status_code == 409
    begun = client.post(url, json={'phase_index': 0, 'action': 'begin'}).json()
    assert begun['deadline'] == later + 900
    assert client.post(url, json={'phase_index': 0, 'action': 'begin'}).status_code == 409
    assert client.get(url).json()['deadline'] == begun['deadline']


def test_listening_has_no_estimated_module_cutoff_and_cannot_skip_audio():
    session = start()
    url = f"/api/v1/mock/sessions/{session['id']}"
    for _ in range(2):
        session = finish_phase(url)
    assert session['deadline'] is None
    base = {'phase_index': 2, 'item_index': 0}
    assert client.post(url, json={**base, 'action': 'next'}).status_code == 409
    assert client.post(url, json={**base, 'action': 'advance'}).status_code == 422
    assert client.post(url, json={**base, 'action': 'navigate', 'item_index': 1}).status_code == 409
    heard = client.post(url, json={**base, 'action': 'respond'}).json()
    assert heard['phase']['items'][0]['audio_group'] in heard['heard_groups']


def test_sentence_tiles_validate_unique_tokens_and_persist_navigation():
    session = start()
    url = f"/api/v1/mock/sessions/{session['id']}"
    for _ in range(4):
        session = finish_phase(url)
    item = session['phase']['items'][0]
    empty = [None] * (len(item['template_parts']) - 1)
    order = [0, 0] + empty[2:]
    base = {'phase_index': 4, 'action': 'save'}
    assert client.post(url, json={**base, 'word_orders': {item['id']: order}}).status_code == 422
    order[1] = None
    saved = client.post(url, json={**base, 'word_orders': {item['id']: order}}).json()
    assert saved['word_orders'][item['id']] == order
    assert item['word_tokens'][0] in saved['answers'][item['id']]
    assert (
        client.post(url, json={**base, 'answers': {item['id']: 'invented sentence'}}).status_code
        == 422
    )
    moved = client.post(url, json={**base, 'action': 'navigate', 'item_index': 1}).json()
    assert moved['item_index'] == 1
    assert moved['word_orders'][item['id']] == order


def test_all_structured_reading_and_sentence_items_match_original_keys(local_mock_supplements):
    import re
    from backend.mock_exam import ROOT, load_paper

    variants = json.loads(
        (ROOT / 'question_bank' / 'answers' / 'mock' / 'sentence-variants.json').read_text(
            encoding='utf-8'
        )
    )

    def plain(value):
        return re.sub(r'[^a-z0-9]', '', value.lower())

    def can_build(item, answer, slot=0, used=(), prefix=''):
        prefix += plain(item['template_parts'][slot])
        if slot == len(item['template_parts']) - 1:
            return prefix == answer
        return any(
            can_build(item, answer, slot + 1, (*used, i), prefix + plain(token))
            for i, token in enumerate(item['word_tokens'])
            if i not in used and answer.startswith(prefix + plain(token))
        )

    for number in range(1, 6):
        paper = load_paper(f'ets-test-{number}')
        keys = json.loads(
            (ROOT / 'question_bank' / 'answers' / 'mock' / f'ets-test-{number}.json').read_text(
                encoding='utf-8'
            )
        )
        for phase in paper['phases'][:2]:
            assert len(phase['cloze_parts']) == 11
            for item in phase['items'][:10]:
                assert item['blank_length'] == len(keys[item['id']]), item['id']
            for item in phase['items'][10:]:
                assert len(item['options']) == 4 and item['prompt'] and len(item['material']) > 50
        for item in paper['phases'][4]['items']:
            acceptable = [keys[item['id']], *variants.get(item['id'], {}).get('answers', [])]
            assert any(can_build(item, plain(answer)) for answer in acceptable), item['id']


@pytest.mark.parametrize('lateness', [0, 30])
def test_late_listening_answer_is_rejected(monkeypatch, lateness):
    from backend import mock_exam

    session = start()
    url = f"/api/v1/mock/sessions/{session['id']}"
    for _ in range(2):
        session = finish_phase(url)
    question_id = session['phase']['items'][0]['id']
    payload = {'phase_index': 2, 'item_index': 0, 'action': 'respond'}
    session = client.post(url, json=payload).json()
    monkeypatch.setattr(mock_exam.time, 'time', lambda: session['response_deadline'] + lateness)
    late = client.post(url, json={**payload, 'action': 'save', 'answers': {question_id: 'A'}})
    assert late.status_code == 409
    resumed = client.get(url).json()
    assert question_id not in resumed['answers']
    assert resumed['item_index'] == (0 if lateness < 5 else 1)


def test_legacy_active_session_keeps_deadline_and_saved_answers():
    from backend import mock_exam

    session = start()
    question_id = session['phase']['items'][0]['id']
    url = f"/api/v1/mock/sessions/{session['id']}"
    path = mock_exam.SESSION_DIR / f"{session['id']}.json"
    stored = json.loads(path.read_text(encoding='utf-8'))
    for field in ('phase_state', 'word_orders', 'heard_groups'):
        stored.pop(field)
    stored['answers'][question_id] = 'ey'
    path.write_text(json.dumps(stored), encoding='utf-8')
    resumed = client.get(url).json()
    assert resumed['phase_state'] == 'active'
    assert resumed['deadline'] == session['deadline']
    assert resumed['answers'][question_id] == 'ey'
    assert resumed['word_orders'] == {}
    assert resumed['heard_groups'] == []
    assert client.post(url, json={'phase_index': 0, 'action': 'begin'}).status_code == 409
    assert (
        client.post(
            url, json={'phase_index': 0, 'action': 'save', 'answers': {question_id: 'ey'}}
        ).status_code
        == 200
    )


def test_source_word_variant_is_accepted_only_after_completion(local_mock_supplements):
    session = start()
    url = f"/api/v1/mock/sessions/{session['id']}"
    for _ in range(4):
        session = finish_phase(url)
    question_id = 'ets-test-1-writing-sentence-10'
    response = client.post(
        url,
        json={
            'phase_index': 4,
            'action': 'save',
            'word_orders': {question_id: [1, 2, 3, 0, 4, 6, 5]},
        },
    )
    assert response.status_code == 200
    assert 'accepted_alternatives' not in response.text
    assert 'answer_key' not in response.text
    assert client.get(url + '/result').status_code == 409
    for _ in range(4, 9):
        finish_phase(url)
    result = client.get(url + '/result').json()
    item = next(q for q in result['review'] if q['id'] == question_id)
    assert item['correct'] is True
    assert 'some reliable sources' in item['accepted_alternatives'][0]
    assert 'some reliable resources' in item['reference']


def test_recording_persists_and_is_only_released_after_completion():
    session = start()
    url = f"/api/v1/mock/sessions/{session['id']}"
    for index in range(7):
        session = finish_phase(url)
    question_id = session['phase']['items'][0]['id']
    audio_url = f'{url}/recordings/{question_id}'
    audio = b'local-browser-recording-fixture'
    assert (
        client.post(url, json={'phase_index': 7, 'item_index': 0, 'action': 'respond'}).status_code
        == 200
    )
    assert (
        client.put(audio_url, content=audio, headers={'Content-Type': 'audio/webm'}).status_code
        == 200
    )
    assert client.get(url).json()['recordings'][question_id] == 'audio/webm'
    assert client.get(audio_url).status_code == 404
    for _ in range(7, 9):
        finish_phase(url)
    assert client.get(audio_url).content == audio


def test_original_practice_does_not_copy_mock_content():
    from scripts.audit_mock_isolation import audit

    report = audit()
    assert sum(report['practice_counts'].values()) == 5745
    assert report['paper_count'] == 5
    assert report['matches'] == []


def test_response_deadline_allows_final_clip_upload_without_extending_exam(monkeypatch):
    from backend import mock_exam

    session = start()
    url = f"/api/v1/mock/sessions/{session['id']}"
    for index in range(8):
        session = finish_phase(url)
    assert session['deadline'] is None
    for index in range(3):
        assert (
            client.post(
                url, json={'phase_index': 8, 'item_index': index, 'action': 'respond'}
            ).status_code
            == 200
        )
        session = client.post(
            url, json={'phase_index': 8, 'item_index': index, 'action': 'next'}
        ).json()
    session = client.post(url, json={'phase_index': 8, 'item_index': 3, 'action': 'respond'}).json()
    question_id = session['phase']['items'][0]['id']
    deadline = session['response_deadline']
    monkeypatch.setattr(mock_exam.time, 'time', lambda: deadline + 1)
    audio_url = f'{url}/recordings/{question_id}'
    assert (
        client.put(
            audio_url, content=b'final-clip', headers={'Content-Type': 'audio/webm'}
        ).status_code
        == 200
    )
    ended = client.get(url).json()
    assert ended['status'] == 'completed'
    assert ended['completed_at'] == deadline
    assert client.get(audio_url).content == b'final-clip'
    assert (
        client.put(
            audio_url, content=b'replacement-clip', headers={'Content-Type': 'audio/ogg'}
        ).status_code
        == 200
    )
    assert client.get(audio_url).content == b'final-clip'
    assert client.get(url).json()['recordings'][question_id] == 'audio/webm'
    monkeypatch.setattr(mock_exam.time, 'time', lambda: deadline + 11)
    assert (
        client.put(
            audio_url, content=b'late-clip', headers={'Content-Type': 'audio/webm'}
        ).status_code
        == 422
    )


def test_all_five_papers_have_complete_private_keys_and_assets():
    from backend.mock_exam import load_paper, ROOT

    for number in range(1, 6):
        paper = load_paper(f'ets-test-{number}')
        keys = json.loads(
            (ROOT / 'question_bank' / 'answers' / 'mock' / f'ets-test-{number}.json').read_text(
                encoding='utf-8'
            )
        )
        ids = [q['id'] for phase in paper['phases'] for q in phase['items']]
        assert len(ids) == len(set(ids)) == 97
        assert len(keys) == 84
        for phase in paper['phases']:
            for page in phase['pages']:
                assert (
                    ROOT
                    / 'question_bank'
                    / 'mock'
                    / 'pages'
                    / page['url'].removeprefix('/mock-pages/')
                ).is_file()
            for item in phase['items']:
                if phase['section'] == 'listening':
                    assert len(item['options']) == 4
                    assert item['audio_text'] and item['prompt']
                    assert all('(A)' not in option for option in item['options'])
