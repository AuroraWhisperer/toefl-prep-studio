from collections import Counter
import re

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend.question_store import store


CONFIG = {
    'reading': {
        'complete_words': ([1, 2], 10),
        'read_daily_life': ([2, 4], (2, 3)),
        'read_academic_passage': ([1, 2], 5),
    },
    'listening': {
        'listen_choose_response': ([8, 16], 1),
        'listen_conversation': ([2, 4], 2),
        'listen_announcement': ([1, 2], 2),
        'listen_academic_talk': ([1, 2], 4),
    },
    'writing': {
        'build_sentence': ([10, 20], 1),
        'write_email': ([1, 2, 3], 1),
        'academic_discussion': ([1, 2, 3], 1),
    },
    'speaking': {'listen_repeat': ([1, 2, 3], 7), 'take_interview': ([1, 2, 3], 4)},
}
CASES = [
    (section, task, count, size)
    for section, tasks in CONFIG.items()
    for task, (counts, size) in tasks.items()
    for count in counts
]


@pytest.fixture
def client():
    with TestClient(app) as value:
        yield value


@pytest.mark.parametrize('section,task,count,size', CASES)
def test_whole_material_selection_and_exact_scoring(client, section, task, count, size):
    params = {
        'section': section,
        'mode': 'practice',
        'task_type': task,
        'count': count,
        'timer_mode': 'countdown',
    }
    response = client.get('/api/v1/exam', params=params)
    assert response.status_code == 200, response.text
    data = response.json()
    questions = data['questions']
    sizes = size if isinstance(size, tuple) else (size,)
    assert count * min(sizes) <= len(questions) <= count * max(sizes)
    assert len({q['id'] for q in questions}) == len(questions)
    assert {q['task_type'] for q in questions} == {task}
    groups = Counter(q.get('group_id', q['id']) for q in questions)
    assert len(groups) == count and set(groups.values()) <= set(sizes)
    assert data['time_limit_seconds'] > 0
    assert all('correct_index' not in q and 'reference' not in q for q in questions)
    answers = []
    for q in questions:
        key = store.answer(q['id'])
        answer = (
            key.get('correct_index')
            if key['type'] == 'choice'
            else (key.get('accepted') or [key.get('reference', '')])[-1]
        )
        answers.append({'question_id': q['id'], 'answer': answer, 'duration_seconds': 3})
    payload = {k: v for k, v in params.items() if k != 'timer_mode'}
    payload.update(question_ids=[q['id'] for q in questions], responses=answers[:1])
    result = client.post('/api/v1/exam/submit', json=payload)
    assert result.status_code == 200, result.text
    scored = result.json()
    assert scored['total_questions'] == len(questions)
    assert [f['question_id'] for f in scored['feedback']] == payload['question_ids']
    assert scored['feedback'][0]['duration_seconds'] == 3
    assert sum(f['answered'] for f in scored['feedback']) <= 1
    assert all(f['earned'] == 0 for f in scored['feedback'][1:])
    # A retry must score exactly the same selection, regardless of intervening draws.
    client.get('/api/v1/exam', params=params)
    assert client.post('/api/v1/exam/submit', json=payload).json() == scored


def test_random_practice_reaches_beyond_first_form(client):
    params = {'section': 'reading', 'mode': 'practice', 'task_type': 'complete_words', 'count': 2}
    seen = {
        tuple(q['id'] for q in client.get('/api/v1/exam', params=params).json()['questions'])
        for _ in range(8)
    }
    assert len(seen) > 1
    assert any(int(question_id[1:]) > 50 for ids in seen for question_id in ids)


@pytest.mark.parametrize(
    'params',
    [
        {'section': 'reading', 'task_type': 'complete_words', 'count': 3},
        {'section': 'reading', 'task_type': 'write_email', 'count': 1},
        {'section': 'all', 'task_type': 'complete_words', 'count': 1},
        {'section': 'speaking', 'task_type': 'listen_repeat', 'count': 1, 'timer_mode': 'countup'},
        {'section': 'reading', 'task_type': 'complete_words', 'count': 0},
        {'section': 'reading', 'count': 1},
        {'section': 'reading', 'task_type': 'complete_words'},
    ],
)
def test_invalid_practice_settings(client, params):
    assert client.get('/api/v1/exam', params={'mode': 'practice', **params}).status_code == 422


def test_incomplete_duplicate_or_foreign_selection_is_rejected(client):
    params = {'section': 'reading', 'mode': 'practice', 'task_type': 'complete_words', 'count': 1}
    questions = client.get('/api/v1/exam', params=params).json()['questions']
    ids = [q['id'] for q in questions]
    for invalid in [
        None,
        [],
        ids[:-1],
        ids[:-1] + [ids[0]],
        ids[:-1] + ['L01'],
        ids[:-1] + ['R9999'],
    ]:
        payload = {**params, 'question_ids': invalid, 'responses': []}
        assert client.post('/api/v1/exam/submit', json=payload).status_code == 422
    foreign = next(
        q
        for q in store.questions_for('reading', 'bank')
        if q['task_type'] == 'complete_words' and q['group_id'] != questions[0]['group_id']
    )
    assert (
        client.post(
            '/api/v1/exam/submit', json={**params, 'question_ids': ids[:-1] + [foreign['id']]}
        ).status_code
        == 422
    )
    assert (
        client.post(
            '/api/v1/exam/submit',
            json={**params, 'question_ids': ids, 'responses': [{'question_id': 'W01'}]},
        ).status_code
        == 422
    )


def test_expanded_bank_quality_and_metadata():
    baseline = {
        'reading': [30, 10, 10],
        'listening': [17, 10, 8, 12],
        'writing': [10, 10, 10],
        'speaking': [7, 4],
    }
    for section, tasks in CONFIG.items():
        questions = store.questions_for(section, 'bank')
        for task, before in zip(tasks, baseline[section]):
            items = [q for q in questions if q['task_type'] == task]
            factor = 6 if section in {'reading', 'listening'} else 3
            if task in {'complete_words', 'build_sentence'} or section == 'speaking':
                factor *= 3
            assert len(items) == (before * 5 + (15 if task == 'read_daily_life' else 0)) * factor
            info = store.manifest()['sections'][section]['practice_tasks'][task]
            assert info['count_options'] == tasks[task][0]
            groups = {}
            for q in items:
                groups.setdefault(q.get('group_id', q['id']), []).append(q)
                key = store.answer(q['id'])
                if key['type'] == 'choice':
                    assert len(q['options']) == len(set(q['options'])) == 4
                    assert 0 <= key['correct_index'] < 4 and key['explanation']
                if task == 'build_sentence':
                    words = lambda text: re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower())
                    available = words(' '.join(q['word_bank'] + q['template_parts']))
                    assert not Counter(words(key['accepted'][0])) - Counter(available)
                    assert len(q['word_bank']) - (len(q['template_parts']) - 1) in (0, 1)
            sizes = tasks[task][1] if isinstance(tasks[task][1], tuple) else (tasks[task][1],)
            assert all(len(group) in sizes for group in groups.values())
            assert len(
                {
                    group[0].get('passage')
                    or group[0].get('audio_text')
                    or ' '.join(group[0].get('word_bank', []))
                    or group[0]['prompt']
                    for group in groups.values()
                }
            ) == len(groups)
            if task == 'complete_words':
                for group in groups.values():
                    assert re.findall(r'\{(R\d+)\}', group[0]['passage']) == [
                        q['id'] for q in group
                    ]
                    assert 70 <= len(group[0]['passage'].split()) <= 100
                    for q in group:
                        key = store.answer(q['id'])
                        assert q['prefix'], f"{q['id']} must retain the start of the word"
                        assert q['prefix'] + key['accepted'][1] == key['reference']
                        assert len(key['accepted'][1]) == q['missing_length']
            if task == 'read_academic_passage':
                assert all(170 <= len(q['passage'].split()) <= 230 for q in items)
            if task == 'listen_academic_talk':
                assert all(100 <= len(q['audio_text'].split()) <= 250 for q in items)


def test_all_expanded_objective_keys_grade_correctly(client):
    for section in ('reading', 'listening', 'writing'):
        questions = store.questions_for(section, 'bank')
        responses = []
        for q in questions:
            key = store.answer(q['id'])
            if key['type'] in {'choice', 'text', 'sentence'}:
                responses.append(
                    {
                        'question_id': q['id'],
                        'answer': key['correct_index']
                        if key['type'] == 'choice'
                        else key['accepted'][-1],
                    }
                )
        data = client.post(
            '/api/v1/exam/submit', json={'section': section, 'mode': 'bank', 'responses': responses}
        )
        assert data.status_code == 200, data.text
        by_id = {f['question_id']: f for f in data.json()['feedback']}
        assert all(by_id[r['question_id']]['correct'] for r in responses)
