"""Regression contract for the September original-practice expansion."""

import json
import re
from collections import Counter
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from backend.app import app
from backend.models import ExamSubmitRequest
from backend.question_store import QuestionStore
from scripts.question_bank_review import content_fingerprint, source_file


ROOT = Path(__file__).resolve().parents[1]
BASE_COUNTS = {
    'reading': {'complete_words': 150, 'read_daily_life': 65, 'read_academic_passage': 50},
    'listening': {
        'listen_choose_response': 85,
        'listen_conversation': 50,
        'listen_announcement': 40,
        'listen_academic_talk': 60,
    },
    'writing': {'build_sentence': 50, 'write_email': 50, 'academic_discussion': 50},
    'speaking': {'listen_repeat': 35, 'take_interview': 20},
}
BASE_TOTALS = {section: sum(tasks.values()) for section, tasks in BASE_COUNTS.items()}
SOURCES = ROOT / 'question_bank/sources/expansion_2026_09'


def test_each_practice_task_has_its_current_expansion_factor():
    store = QuestionStore()
    assert store.manifest()['total_questions'] == 6045
    for section, tasks in BASE_COUNTS.items():
        questions = store.questions_for(section, 'bank')
        factor = 9 if section == 'speaking' else 6 if section in {'reading', 'listening'} else 3
        expected = {
            task: count
            * (18 if task == 'complete_words' else 9 if task == 'build_sentence' else factor)
            for task, count in tasks.items()
        }
        assert Counter(q['task_type'] for q in questions) == expected
        ids = sorted((q['id'] for q in questions), key=lambda qid: int(qid[1:]))
        assert ids == [f'{section[0].upper()}{i:02d}' for i in range(1, sum(expected.values()) + 1)]


def test_expansion_sources_keys_and_sealed_reviews_match_generated_items():
    store = QuestionStore()
    generated = {q['id']: q for q in store.all_questions()}
    notes = json.loads(
        (ROOT / 'question_bank/sources/review_notes.json').read_text(encoding='utf8')
    )
    seen = set()
    for section, tasks in BASE_COUNTS.items():
        for task, before in tasks.items():
            source = json.loads((SOURCES / f'{task}.json').read_text(encoding='utf8'))
            assert source['section'] == section and source['task_type'] == task
            assert len(source['items']) == before * 2
            for record in source['items']:
                question, answer, review = record['question'], record['answer'], record['review']
                qid = question['id']
                assert qid not in seen
                seen.add(qid)
                assert int(qid[1:]) > BASE_TOTALS[section]
                assert question['section'] == section and question['task_type'] == task
                assert {
                    k: v for k, v in generated[qid].items() if k not in {'difficulty', 'skills'}
                } == question
                assert store.answer(qid) == answer
                assert notes[qid] == {
                    **review,
                    'content_sha256': content_fingerprint(question, answer),
                }
                assert source_file(question) == f'expansion_2026_09/{task}.json'
                assert (
                    not {
                        'answer',
                        'review',
                        'reference',
                        'accepted',
                        'correct_index',
                        'explanation',
                    }
                    & question.keys()
                )
                if task == 'read_daily_life':
                    assert question['document_type'] in {
                        'agenda',
                        'flyer',
                        'email',
                        'messages',
                        'menu',
                        'notice',
                    }
    assert len(seen) == 1410


def test_expansion_materials_and_explanations_are_not_exact_duplicates():
    store = QuestionStore()
    materials = set()
    explanations = set()
    groups = set()
    for question in store.all_questions():
        section = question['section']
        is_new = int(question['id'][1:]) > BASE_TOTALS[section]
        explanation = store.answer(question['id'])['explanation']
        if is_new:
            assert explanation not in explanations, question['id']
        explanations.add(explanation)
        identity = (section, question.get('group_id', question['id']))
        if identity in groups:
            continue
        groups.add(identity)
        text = question.get('passage', question.get('audio_text', question['prompt']))
        if question['task_type'] == 'complete_words':
            text = re.sub(r'\{(R\d+)\}', lambda match: store.answer(match[1])['reference'], text)
        normalized = re.sub(r'\s+', ' ', text).strip().casefold()
        material = (question['task_type'], normalized)
        if is_new:
            assert material not in materials, question['id']
        materials.add(material)


def test_new_choice_keys_have_no_short_repeating_position_pattern():
    store = QuestionStore()
    for section in ('reading', 'listening'):
        for task in BASE_COUNTS[section]:
            positions = []
            for question in store.questions_for(section, 'bank', task):
                if (
                    int(question['id'][1:]) <= BASE_TOTALS[section]
                    or question['response_type'] != 'choice'
                ):
                    continue
                if question['options'] == [f'Position [{letter}]' for letter in 'ABCD']:
                    continue
                key = store.answer(question['id'])
                positions.append(key['correct_index'])
                assert not re.search(
                    r'(?:选项|选|排除)\s*[A-D](?:\b|[、，。：；])', key['explanation']
                )
            if not positions:
                continue
            # Detect authored A/B/C/D cycles, not a prescribed ETS distribution.
            assert set(positions) == {0, 1, 2, 3}, task
            for period in range(1, 9):
                matches = sum(left == right for left, right in zip(positions, positions[period:]))
                assert matches / (len(positions) - period) < 0.65, (task, period)


def test_full_bank_submission_limit_supports_the_expanded_bank_and_remains_bounded():
    ids = [q['id'] for q in QuestionStore().all_questions()]
    request = ExamSubmitRequest(
        mode='bank', question_ids=ids, responses=[{'question_id': qid} for qid in ids]
    )
    assert len(request.responses) == len(request.question_ids) == 6045
    with pytest.raises(ValidationError):
        ExamSubmitRequest(mode='bank', responses=[{'question_id': 'R01'}] * 6046)
    with pytest.raises(ValidationError):
        ExamSubmitRequest(mode='bank', question_ids=['R01'] * 6046)


@pytest.mark.parametrize(
    'section,task', [(section, task) for section, tasks in BASE_COUNTS.items() for task in tasks]
)
def test_new_materials_submit_and_reveal_their_own_teaching_notes(section, task):
    store = QuestionStore()
    config = store.manifest()['sections'][section]['practice_tasks'][task]
    count = config['count_options'][0]
    groups = {}
    for question in store.questions_for(section, 'bank', task):
        if int(question['id'][1:]) > BASE_TOTALS[section]:
            groups.setdefault(question.get('group_id', question['id']), []).append(question)
    ordered = sorted(
        groups.values(), key=lambda group: all(q['difficulty'] == 'easy' for q in group)
    )
    selected = [q for group in ordered[:count] for q in group]
    ids = [q['id'] for q in selected]
    responses = []
    for question in selected:
        key = store.answer(question['id'])
        answer = (
            key['correct_index']
            if key['type'] == 'choice'
            else (key.get('accepted') or [key['reference']])[0]
        )
        responses.append({'question_id': question['id'], 'answer': answer})
    with TestClient(app) as client:
        public = client.get(
            '/api/v1/exam', params={'section': section, 'mode': 'bank', 'task_type': task}
        )
        assert public.status_code == 200
        public_items = {q['id']: q for q in public.json()['questions']}
        assert all(
            not {'explanation', 'reference', 'accepted', 'correct_index', 'review'}
            & public_items[qid].keys()
            for qid in ids
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
        feedback = result.json()['feedback']
        assert [item['question_id'] for item in feedback] == ids
        for item in feedback:
            key = store.answer(item['question_id'])
            assert item['explanation'] == key['explanation']
            assert item['reference_answer']
            if key['type'] in {'choice', 'text', 'sentence'}:
                assert item['correct'] is True
