"""Contracts for the September 30 reading/listening content expansion."""

import json
from collections import Counter
from datetime import date
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from backend.app import app
from backend.models import ExamSubmissionItem
from backend.question_store import QuestionStore
from scripts.question_bank_review import content_fingerprint, source_file

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'question_bank/sources/expansion_2026_09_30'
ADDITIONS = {
    'complete_words': ('reading', 796, 450, 45),
    'read_daily_life': ('reading', 1246, 195, 90),
    'read_academic_passage': ('reading', 1441, 150, 30),
    'listen_choose_response': ('listening', 706, 255, 255),
    'listen_conversation': ('listening', 961, 150, 75),
    'listen_announcement': ('listening', 1111, 120, 60),
    'listen_academic_talk': ('listening', 1231, 180, 45),
}


@pytest.mark.parametrize('task', ADDITIONS)
def test_new_sources_double_each_task_with_complete_materials_and_reviewed_difficulties(task):
    section, first, count, group_count = ADDITIONS[task]
    source = json.loads((SOURCE / f'{task}.json').read_text(encoding='utf8'))
    records = source['items']
    notes = json.loads(
        (ROOT / 'question_bank/sources/review_notes.json').read_text(encoding='utf8')
    )
    assert source['section'] == section and source['task_type'] == task
    assert [r['question']['id'] for r in records] == [
        f'{section[0].upper()}{i}' for i in range(first, first + count)
    ]
    store = QuestionStore()
    generated = {q['id']: q for q in store.questions_for(section, 'bank', task)}
    assert len(generated) == count * (6 if task == 'complete_words' else 2)
    groups = Counter()
    levels = Counter()
    for record in records:
        question, answer, review = (record[k] for k in ('question', 'answer', 'review'))
        qid = question['id']
        groups[question.get('group_id', qid)] += 1
        levels[review['difficulty']] += 1
        assert question['section'] == section and question['task_type'] == task
        assert date.fromisoformat(review['reviewed_on']) >= date(2026, 9, 30)
        assert review == {
            key: value for key, value in notes[qid].items() if key != 'content_sha256'
        }
        assert content_fingerprint(generated[qid], store.answer(qid)) == content_fingerprint(
            question, answer
        )
        assert source_file(question) == f'expansion_2026_09_30/{task}.json'
    assert len(groups) == group_count
    config = store.manifest()['sections'][section]['practice_tasks'][task]
    assert set(groups.values()) <= set(config['group_sizes'])
    # Labels follow the reviewed task demands; a quota would reward inflated labels.
    assert set(levels) <= {'easy', 'medium', 'hard'}
    assert levels['medium'] + levels['hard'] > 0


def test_four_digit_question_ids_are_supported_but_still_bounded():
    for qid in ('R999', 'R1000', 'R1590', 'L1410'):
        assert ExamSubmissionItem(question_id=qid).question_id == qid
    for qid in ('R10000', 'R1', 'X1000', 'R1000-extra'):
        with pytest.raises(ValidationError):
            ExamSubmissionItem(question_id=qid)


@pytest.mark.parametrize('task', ADDITIONS)
def test_new_materials_can_be_submitted_and_only_then_reveal_answers(task):
    section, first, _, _ = ADDITIONS[task]
    store = QuestionStore()
    config = store.manifest()['sections'][section]['practice_tasks'][task]
    groups = {}
    for question in store.questions_for(section, 'bank', task):
        if int(question['id'][1:]) >= first:
            groups.setdefault(question.get('group_id', question['id']), []).append(question)
    ordered = sorted(
        groups.values(), key=lambda group: all(q['difficulty'] == 'easy' for q in group)
    )
    count = config['count_options'][0]
    selected = [q for group in ordered[:count] for q in group]
    ids = [q['id'] for q in selected]
    assert len(ids) >= count
    responses = []
    for question in selected:
        key = store.answer(question['id'])
        answer = key['correct_index'] if key['type'] == 'choice' else key['accepted'][-1]
        responses.append({'question_id': question['id'], 'answer': answer})
    with TestClient(app) as client:
        public = client.get(
            '/api/v1/exam', params={'section': section, 'mode': 'bank', 'task_type': task}
        )
        assert public.status_code == 200
        new_public = [q for q in public.json()['questions'] if q['id'] in ids]
        assert len(new_public) == len(ids)
        for question in new_public:
            assert (
                not {'explanation', 'reference', 'accepted', 'correct_index', 'review'}
                & question.keys()
            )
        result = client.post(
            '/api/v1/exam/submit',
            json={
                'section': section,
                'mode': 'practice',
                'task_type': task,
                'count': count,
                'question_ids': ids,
                'responses': responses,
            },
        )
        assert result.status_code == 200, result.text
        assert [item['question_id'] for item in result.json()['feedback']] == ids
        for item in result.json()['feedback']:
            assert item['correct'] is True
            assert item['explanation'] == store.answer(item['question_id'])['explanation']
