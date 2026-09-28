from collections import Counter
import re
import sys
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend.question_store import store


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


COUNTS = {'reading': 50, 'listening': 47, 'writing': 12, 'speaking': 11}
TARGETS = {
    'reading': {'complete_words': 30, 'read_daily_life': 10, 'read_academic_passage': 10},
    'listening': {
        'listen_choose_response': 17,
        'listen_conversation': 10,
        'listen_announcement': 8,
        'listen_academic_talk': 12,
    },
    'writing': {'build_sentence': 10, 'write_email': 1, 'academic_discussion': 1},
    'speaking': {'listen_repeat': 7, 'take_interview': 4},
}


@pytest.mark.parametrize('section', COUNTS)
def test_exam_counts_and_distribution(client, section):
    response = client.get('/api/v1/exam', params={'section': section})
    assert response.status_code == 200
    data = response.json()
    assert data['total'] == COUNTS[section]
    assert Counter(q['task_type'] for q in data['questions']) == TARGETS[section]
    task_order = list(TARGETS[section])
    positions = [task_order.index(q['task_type']) for q in data['questions']]
    assert positions == sorted(positions)
    private_fields = {'answer', 'accepted', 'reference', 'correct_index', 'sample', 'keywords'}
    assert all(not private_fields.intersection(q) for q in data['questions'])


def test_meta_and_bank_counts(client):
    store.validate_integrity()
    data = client.get('/api/v1/meta').json()
    assert data['total_questions'] == 2115
    assert data['exam_total_questions'] == 120
    assert {s: m['question_count'] for s, m in data['sections'].items()} == {
        'reading': 795,
        'listening': 705,
        'writing': 450,
        'speaking': 165,
    }
    assert len(client.get('/api/v1/exam?mode=bank').json()['questions']) == 2115


@pytest.mark.parametrize('task_type', TARGETS['writing'])
def test_writing_bank_filter_and_submission(client, task_type):
    params = {'section': 'writing', 'mode': 'bank', 'task_type': task_type}
    data = client.get('/api/v1/exam', params=params).json()
    assert data['total'] == 150
    assert {q['task_type'] for q in data['questions']} == {task_type}
    response = client.post('/api/v1/exam/submit', json={**params, 'responses': []})
    assert response.status_code == 200
    assert response.json()['sections']['writing']['total'] == 150


@pytest.mark.parametrize('mode,count', [('exam', 120), ('bank', 2115)])
def test_full_submission_above_old_100_item_limit(client, mode, count):
    questions = client.get('/api/v1/exam', params={'mode': mode}).json()['questions']
    response = client.post(
        '/api/v1/exam/submit',
        json={
            'section': 'all',
            'mode': mode,
            'responses': [{'question_id': q['id'], 'answer': None} for q in questions],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data['feedback']) == data['total_questions'] == count
    assert data['answered_questions'] == 0
    assert all(section['percentage'] == 0 for section in data['sections'].values())


def test_missing_questions_count_as_zero_and_keys_only_return_after_submit(client):
    answer = store.answer('R01')['accepted'][1]
    response = client.post(
        '/api/v1/exam/submit',
        json={
            'section': 'reading',
            'responses': [{'question_id': 'R01', 'answer': answer}],
        },
    )
    assert response.status_code == 200
    data = response.json()
    score = data['sections']['reading']
    assert (score['answered'], score['total'], score['percentage']) == (1, 50, 2.0)
    assert data['sections']['writing']['total'] == 0
    assert data['feedback'][0]['reference_answer'] == store.answer('R01')['reference']
    assert data['feedback'][1]['earned'] == 0
    assert not data['feedback'][1]['answered']


def test_correct_answers_score_all_reading_and_listening_items(client):
    for section in ('reading', 'listening'):
        responses = []
        for question in store.questions_for(section):
            key = store.answer(question['id'])
            answer = key['correct_index'] if key['type'] == 'choice' else key['accepted'][-1]
            responses.append({'question_id': question['id'], 'answer': answer})
        result = client.post(
            '/api/v1/exam/submit', json={'section': section, 'responses': responses}
        )
        assert result.status_code == 200
        assert result.json()['sections'][section]['percentage'] == 100


@pytest.mark.parametrize(
    'payload',
    [
        {'section': 'reading', 'responses': [{'question_id': 'R01'}, {'question_id': 'R01'}]},
        {'section': 'reading', 'responses': [{'question_id': 'R99'}]},
        {'section': 'reading', 'responses': [{'question_id': 'W01'}]},
        {'section': 'writing', 'responses': [{'question_id': 'W12'}]},
        {'section': 'reading', 'responses': [{'question_id': 'R31', 'answer': 1.5}]},
        {'section': 'reading', 'responses': [{'question_id': 'R31', 'answer': True}]},
        {'section': 'reading', 'responses': [{'question_id': 'R31', 'answer': '1'}]},
        {'section': 'reading', 'responses': [{'question_id': 'R31', 'answer': 4}]},
        {'section': 'reading', 'responses': [{'question_id': 'R01', 'answer': 1}]},
        {'section': 'reading', 'responses': [{'question_id': 'R01', 'answer': ['x']}]},
        {'section': 'writing', 'responses': [{'question_id': 'W11', 'answer': 'x' * 5001}]},
        {'section': 'writing', 'task_type': 'write_email', 'responses': []},
    ],
)
def test_invalid_submissions(client, payload):
    assert client.post('/api/v1/exam/submit', json=payload).status_code == 422


@pytest.mark.parametrize(
    'params',
    [
        {'section': 'unknown'},
        {'mode': 'unknown'},
        {'section': 'writing', 'task_type': 'write_email'},
        {'mode': 'bank', 'task_type': 'write_email'},
        {'section': 'reading', 'mode': 'bank', 'task_type': 'write_email'},
    ],
)
def test_invalid_selections(client, params):
    assert client.get('/api/v1/exam', params=params).status_code == 422


@pytest.mark.parametrize(
    'path',
    ['/question_bank/answers/reading.json', '/answers/reading.json', '/backend/question_store.py'],
)
def test_private_paths_not_served(client, path):
    assert client.get(path).status_code == 404


def test_grouped_material_and_word_banks():
    reading = store.questions_for('reading')
    groups = {}
    for q in reading:
        groups.setdefault(q['group_id'], []).append(q)
    assert sorted(len(items) for items in groups.values()) == [2, 2, 3, 3, 5, 5, 10, 10, 10]
    for group, items in groups.items():
        assert len({q['passage'] for q in items}) == 1
        if group.startswith('cloze'):
            ids = re.findall(r'\{(R\d+)\}', items[0]['passage'])
            assert ids == [q['id'] for q in items]
            for q in items:
                key = store.answer(q['id'])
                assert q['prefix'] + key['accepted'][1] == key['reference']
        elif group.startswith('read_academic'):
            assert 170 <= len(items[0]['passage'].split()) <= 230
    talks = [
        q for q in store.questions_for('listening') if q['task_type'] == 'listen_academic_talk'
    ]
    assert sorted(Counter(q['group_id'] for q in talks).values()) == [4, 4, 4]
    assert all(100 <= len(q['audio_text'].split()) <= 250 for q in talks)
    for question in store.questions_for('writing')[:10]:
        expected = store.answer(question['id'])['accepted'][0].lower().rstrip('.').replace(',', '')
        assert ' '.join(question['word_bank']).lower() != expected
        available = re.findall(
            r"[a-z]+(?:'[a-z]+)?",
            ' '.join(question['word_bank'] + question['template_parts']).lower(),
        )
        assert not Counter(expected.split()) - Counter(available)
        assert len(question['word_bank']) - (len(question['template_parts']) - 1) in (0, 1)


def test_tts_handles_long_material_and_network_failure(client, monkeypatch):
    class OfflineVoice:
        def __init__(self, *args):
            pass

        async def stream(self):
            raise OSError('network unavailable')
            yield  # Make this an async generator like edge-tts.

    monkeypatch.setitem(sys.modules, 'edge_tts', SimpleNamespace(Communicate=OfflineVoice))
    text = next(
        q['audio_text']
        for q in store.questions_for('listening')
        if q['task_type'] == 'listen_academic_talk'
    )
    assert len(text) > 400
    result = client.post('/api/v1/tts', json={'text': text})
    assert result.status_code == 200
    assert result.json()['fallback'] is True
    assert client.post('/api/v1/tts', json={'text': '   '}).status_code == 422
    assert client.post('/api/v1/tts', json={'text': 'x' * 5001}).status_code == 422


def test_writing_samples_stay_private_until_submission(client):
    params = {'section': 'writing', 'mode': 'bank', 'task_type': 'write_email'}
    questions = client.get('/api/v1/exam', params=params).json()['questions']
    assert all('reference' not in q for q in questions)
    for task_type in ('write_email', 'academic_discussion'):
        response = client.post(
            '/api/v1/exam/submit', json={**params, 'task_type': task_type, 'responses': []}
        )
        assert response.status_code == 200
        samples = [item['reference_answer'] for item in response.json()['feedback']]
        assert len(set(samples)) == 150
        assert all(len(sample.split()) >= 100 for sample in samples)


def test_page_and_assets(client):
    for path in ('/', '/frontend/app.js', '/frontend/styles.css', '/api/v1/health'):
        assert client.get(path).status_code == 200
