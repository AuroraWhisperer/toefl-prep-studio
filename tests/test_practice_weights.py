from collections import Counter
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from backend import history
from backend.app import app
from backend.question_store import material_groups, store


client = TestClient(app)
PARAMS = {'section': 'reading', 'mode': 'practice', 'task_type': 'complete_words', 'count': 1}
CASES = [
    (section, task, count)
    for section, info in store.manifest()['sections'].items()
    for task, config in info['practice_tasks'].items()
    for count in config['count_options']
]


def test_material_counts_use_existing_archives_once_per_submission():
    assert history.submitted_material_counts() == {}
    for category, mode in [
        ('practice', 'practice'),
        ('practice', 'exam'),
        ('practice', 'bank'),
        ('test', 'exam'),
    ]:
        history.write_record(
            {
                'id': str(uuid4()),
                'category': category,
                'mode': mode,
                'questions': [
                    {'id': 'R01', 'group_id': 'passage'},
                    {'id': 'R02', 'group_id': 'passage'},
                    {'id': 'W01'},
                    {'id': 'W01'},
                ],
            }
        )
    assert history.submitted_material_counts() == {'passage': 4, 'W01': 4}


def test_only_successful_submissions_count_and_retries_do_not_add_weight():
    exam = client.get('/api/v1/exam', params=PARAMS).json()
    assert history.submitted_material_counts() == {}
    group_id = exam['questions'][0]['group_id']
    payload = {
        **PARAMS,
        'submission_id': str(uuid4()),
        'question_ids': exam['question_ids'],
        'responses': [],
    }
    assert (
        client.post(
            '/api/v1/exam/submit', json={**payload, 'question_ids': exam['question_ids'][:-1]}
        ).status_code
        == 422
    )
    assert history.submitted_material_counts() == {}
    for _ in range(2):
        assert client.post('/api/v1/exam/submit', json=payload).status_code == 200
    assert history.submitted_material_counts() == {group_id: 1}
    assert (
        client.post(
            '/api/v1/exam/submit', json={**payload, 'submission_id': str(uuid4())}
        ).status_code
        == 200
    )
    assert history.submitted_material_counts() == {group_id: 2}


@pytest.mark.parametrize('decay', [0, 1, 2, 3])
def test_exact_weights_apply_to_anchors_and_remaining_materials(monkeypatch, decay):
    questions = [
        {'id': f'{name}{index}', 'group_id': name, 'difficulty': difficulty}
        for name, difficulty, size in [
            ('a', 'medium', 2),
            ('b', 'easy', 3),
            ('c', 'hard', 2),
            ('d', 'easy', 2),
        ]
        for index in range(size)
    ]
    counts = {'b': 1, 'c': 3, 'd': 7}
    expected = {'a': 1, 'b': 1 / 2**decay, 'c': 1 / 4**decay, 'd': 1 / 8**decay}
    monkeypatch.setattr(store, 'practice_config', lambda *args: {'units_per_set': 2})
    monkeypatch.setattr(store, 'questions_for', lambda *args: questions)
    draws = []

    def choose(population, weights, k):
        assert k == 1
        assert dict(zip(population, weights)) == {key: expected[key] for key in population}
        draws.append(list(population))
        return [population[0]]

    monkeypatch.setattr('backend.question_store.random.choices', choose)
    result = store.practice_questions(
        'reading', 'test', 4, submission_counts=counts, repeat_decay=decay
    )
    assert draws == [['a', 'c'], ['b', 'c', 'd'], ['c'], ['d']]
    assert Counter(q['id'] for q in result) == Counter(q['id'] for q in questions)
    assert len(material_groups(result)) == 4


@pytest.mark.parametrize('section,task,count', CASES)
def test_weighted_draws_preserve_real_bank_constraints(monkeypatch, section, task, count):
    groups = material_groups(store.questions_for(section, 'bank', task))
    counts = {key: index * 3 for index, key in enumerate(groups)}
    questions = store.practice_questions(
        section, task, count, submission_counts=counts, repeat_decay=2
    )
    ids = [q['id'] for q in questions]
    assert len(ids) == len(set(ids))
    assert len(material_groups(questions)) == count

    def no_resampling(*args, **kwargs):
        pytest.fail('Submission validation must not resample questions')

    monkeypatch.setattr('backend.question_store.random.choices', no_resampling)
    assert (
        store.practice_questions(
            section, task, count, ids, submission_counts=counts, repeat_decay=2
        )
        == questions
    )


@pytest.mark.parametrize('decay', [None, 2])
def test_api_passes_archive_counts_and_decay_to_sampler(monkeypatch, decay):
    selected = client.get('/api/v1/exam', params=PARAMS).json()
    group_id = selected['questions'][0]['group_id']
    assert (
        client.post(
            '/api/v1/exam/submit', json={**PARAMS, 'question_ids': selected['question_ids']}
        ).status_code
        == 200
    )
    original = store.practice_questions
    calls = []

    def capture(*args, **kwargs):
        calls.append(kwargs)
        return original(*args, **kwargs)

    monkeypatch.setattr(store, 'practice_questions', capture)
    response = client.get(
        '/api/v1/exam', params={**PARAMS, **({'repeat_decay': decay} if decay is not None else {})}
    )
    assert response.status_code == 200
    assert calls == [
        {'submission_counts': {group_id: 1}, 'repeat_decay': 1 if decay is None else decay}
    ]


@pytest.mark.parametrize('decay', [-1, 3.1, 'nan', 'inf', '-inf', 'invalid'])
def test_api_rejects_invalid_decay(decay):
    assert client.get('/api/v1/exam', params={**PARAMS, 'repeat_decay': decay}).status_code == 422


@pytest.mark.parametrize(
    'params',
    [
        {**PARAMS, 'repeat_decay': 0},
        {'section': 'reading', 'mode': 'exam'},
        {'section': 'reading', 'mode': 'bank'},
    ],
)
def test_disabled_decay_and_nonpractice_modes_do_not_read_history(monkeypatch, params):
    def no_history():
        pytest.fail('Uniform practice and fixed forms do not need history counts')

    monkeypatch.setattr('backend.app.submitted_material_counts', no_history)
    response = client.get('/api/v1/exam', params=params)
    assert response.status_code == 200
    if params['mode'] != 'practice':
        assert response.json()['questions'] == store.questions_for('reading', params['mode'])
