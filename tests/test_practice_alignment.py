from collections import Counter

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend.question_store import store


BLOCKS = [
    ('reading', 'complete_words', 1, [10]),
    ('reading', 'read_daily_life', 2, None),
    ('reading', 'read_academic_passage', 1, [5]),
    ('listening', 'listen_choose_response', 8, [1] * 8),
    ('listening', 'listen_conversation', 2, [2, 2]),
    ('listening', 'listen_announcement', 1, [2]),
    ('listening', 'listen_academic_talk', 1, [4]),
    ('writing', 'build_sentence', 10, [1] * 10),
    ('writing', 'write_email', 1, [1]),
    ('writing', 'academic_discussion', 1, [1]),
    ('speaking', 'listen_repeat', 1, [7]),
    ('speaking', 'take_interview', 1, [4]),
]


def material_groups(questions):
    groups = {}
    for question in questions:
        groups.setdefault(question.get('group_id', question['id']), []).append(question)
    return list(groups.values())


@pytest.mark.parametrize('section,task,count,pattern', BLOCKS)
def test_official_blocks_never_draw_only_easy_items(monkeypatch, section, task, count, pattern):
    by_key = {
        group[0].get('group_id', group[0]['id']): group
        for group in material_groups(store.questions_for(section, 'bank', task))
    }

    def easy_first(population, weights, k):
        return sorted(
            population, key=lambda key: any(q['difficulty'] != 'easy' for q in by_key[key])
        )[:k]

    monkeypatch.setattr('backend.question_store.random.choices', easy_first)
    with TestClient(app) as client:
        response = client.get(
            '/api/v1/exam',
            params=dict(section=section, mode='practice', task_type=task, count=count),
        )
        assert response.status_code == 200, response.text
        questions = response.json()['questions']
        groups = material_groups(questions)
        if pattern is None:
            assert len(groups) == count and {len(g) for g in groups} <= {2, 3}
        else:
            assert [len(group) for group in groups] == pattern
        assert any(q['difficulty'] in {'medium', 'hard'} for q in questions)


@pytest.mark.parametrize(
    'sizes',
    [
        [2, 2],
        [2, 3],
        [3, 3],
        [2, 2, 2, 2],
        [2, 2, 2, 3],
        [2, 3, 2, 3],
        [2, 3, 3, 3],
        [3, 3, 3, 3],
    ],
)
def test_daily_life_random_combinations_use_actual_count_and_time(monkeypatch, sizes):
    available = material_groups(store.questions_for('reading', 'bank', 'read_daily_life'))
    planned = []
    for size in sizes:
        group = next(
            g for g in available if len(g) == size and any(q['difficulty'] != 'easy' for q in g)
        )
        planned.append(group[0]['group_id'])
        available.remove(group)

    def planned_draw(population, weights, k):
        return [key for key in planned if key in population][:k]

    monkeypatch.setattr('backend.question_store.random.choices', planned_draw)
    monkeypatch.setattr('backend.question_store.random.shuffle', lambda items: None)
    with TestClient(app) as client:
        params = dict(
            section='reading', mode='practice', task_type='read_daily_life', count=len(sizes)
        )
        data = client.get('/api/v1/exam', params=params).json()
        assert [len(group) for group in material_groups(data['questions'])] == sizes
        assert data['total'] == sum(sizes)
        assert data['estimated_time_seconds'] == sum(120 if size == 2 else 180 for size in sizes)
        result = client.post(
            '/api/v1/exam/submit',
            json={**params, 'question_ids': data['question_ids'], 'responses': []},
        )
        assert result.status_code == 200, result.text
        assert result.json()['total_questions'] == data['total']
        assert (
            client.post(
                '/api/v1/exam/submit', json={**params, 'question_ids': data['question_ids'][:-1]}
            ).status_code
            == 422
        )


def test_all_easy_daily_texts_and_email_are_rejected():
    short = [
        g
        for g in material_groups(store.questions_for('reading', 'bank', 'read_daily_life'))
        if all(q['difficulty'] == 'easy' for q in g)
    ]
    easy_email = next(
        q
        for q in store.questions_for('writing', 'bank', 'write_email')
        if q['difficulty'] == 'easy'
    )
    with TestClient(app) as client:
        for section, task, count, ids in [
            ('reading', 'read_daily_life', 2, [q['id'] for g in short[:2] for q in g]),
            ('writing', 'write_email', 1, [easy_email['id']]),
        ]:
            result = client.post(
                '/api/v1/exam/submit',
                json=dict(
                    section=section, mode='practice', task_type=task, count=count, question_ids=ids
                ),
            )
            assert result.status_code == 422


def test_all_hard_complete_material_is_allowed(monkeypatch):
    hard = material_groups(store.questions_for('reading', 'bank', 'complete_words'))[0]
    # Exercise the selection contract with a complete material labelled hard.
    questions = {
        **store._load_questions(),
        **{q['id']: {**q, 'difficulty': 'hard'} for q in hard},
    }
    monkeypatch.setattr(store, '_load_questions', lambda: questions)
    with TestClient(app) as client:
        result = client.post(
            '/api/v1/exam/submit',
            json=dict(
                section='reading',
                mode='practice',
                task_type='complete_words',
                count=1,
                question_ids=[q['id'] for q in hard],
            ),
        )
        assert result.status_code == 200, result.text
        assert result.json()['total_questions'] == 10


def test_fixed_reading_form_has_two_complete_daily_life_pairs():
    daily = [q for q in store.questions_for('reading') if q['task_type'] == 'read_daily_life']
    assert [len(g) for g in material_groups(daily)] == [2, 3, 2, 3]
    assert len(store.questions_for('reading')) == 50
    bank_sizes = Counter(
        len(g) for g in material_groups(store.questions_for('reading', 'bank', 'read_daily_life'))
    )
    assert bank_sizes == {2: 150, 3: 30}


def test_repeated_blocks_remain_complete_and_not_all_easy():
    for section, task, count, pattern in BLOCKS:
        config = store.manifest()['sections'][section]['practice_tasks'][task]
        questions = store.practice_questions(section, task, config['count_options'][-1])
        groups = material_groups(questions)
        for start in range(0, len(groups), count):
            block = groups[start : start + count]
            if pattern is None:
                assert len(block) == count and {len(g) for g in block} <= {2, 3}
            else:
                assert [len(g) for g in block] == pattern
            assert any(q['difficulty'] != 'easy' for g in block for q in g)
        assert len({q['id'] for q in questions}) == len(questions)
