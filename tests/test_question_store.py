"""Query optimizations must preserve ordering, whole materials and mutable copies."""

from collections import Counter

import pytest

from backend import question_store
from backend.question_store import QuestionStore, SECTIONS, material_groups


@pytest.mark.parametrize('section', ('all', *SECTIONS))
def test_bank_queries_preserve_sorted_content(section):
    store = QuestionStore()
    expected = [q for q in store.all_questions() if section == 'all' or q['section'] == section]
    # Loading order must not become the public ordering contract.
    store._questions = dict(reversed(list(store._questions.items())))
    assert store.questions_for(section, 'bank') == expected
    if section != 'all':
        for task in store.manifest()['sections'][section]['task_types']:
            assert store.questions_for(section, 'bank', task) == [
                q for q in expected if q['task_type'] == task
            ]


@pytest.mark.parametrize('section', SECTIONS)
def test_fixed_forms_preserve_complete_materials_and_counts(section):
    store = QuestionStore()
    questions = store.questions_for(section)
    assert (
        Counter(q['task_type'] for q in questions) == store.manifest()['exam_task_targets'][section]
    )
    bank_groups = material_groups(store.questions_for(section, 'bank'))
    for group_id, group in material_groups(questions).items():
        assert group == bank_groups[group_id]
    if section == 'reading':
        daily = [q for q in questions if q['task_type'] == 'read_daily_life']
        assert [len(group) for group in material_groups(daily).values()] == [2, 3, 2, 3]


@pytest.mark.parametrize('mode', ['exam', 'bank'])
def test_returned_questions_do_not_mutate_cache_or_other_results(mode):
    store = QuestionStore()
    first = store.questions_for('reading', mode)
    second = store.questions_for('reading', mode)
    question = next(q for q in first if 'options' in q)
    original = store.question(question['id'])
    question['options'].clear()
    question['skills'].append('local edit')
    question['passage'] = 'local edit'
    first.clear()
    assert store.question(original['id']) == original
    assert store.questions_for('reading', mode) == second


def test_filtered_query_copies_only_returned_questions(monkeypatch):
    store = QuestionStore()
    store.all_questions()
    deepcopy = question_store.copy.deepcopy
    copied_ids = []

    def track(value, *args, **kwargs):
        if isinstance(value, dict) and 'id' in value and 'section' in value:
            copied_ids.append(value['id'])
        return deepcopy(value, *args, **kwargs)

    monkeypatch.setattr(question_store.copy, 'deepcopy', track)
    result = store.questions_for('reading', 'bank', 'complete_words')
    assert Counter(copied_ids) == Counter(q['id'] for q in result)
