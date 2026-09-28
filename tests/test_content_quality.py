import json
import re
from pathlib import Path

from backend.question_store import store
from scripts import build_question_bank as builder
from scripts.question_bank_review import content_fingerprint

ROOT = Path(__file__).resolve().parents[1]


def test_generated_bank_matches_authoritative_sources():
    for section in ('reading', 'listening', 'writing', 'speaking'):
        questions, answers = getattr(builder, f'build_{section}')()
        generated = json.loads(
            (ROOT / f'question_bank/{section}/questions.json').read_text(encoding='utf-8')
        )['questions']
        generated_keys = json.loads(
            (ROOT / f'question_bank/answers/{section}.json').read_text(encoding='utf-8')
        )
        assert [q['id'] for q in generated] == [q['id'] for q in questions]
        assert answers == generated_keys
        for question, saved in zip(questions, generated):
            assert content_fingerprint(question, answers[question['id']]) == content_fingerprint(
                saved, generated_keys[saved['id']]
            )


def test_insertion_tasks_have_unique_markers_and_private_position_keys():
    items = [
        q
        for q in store.all_questions()
        if q['prompt'].startswith('Where would the following sentence best fit')
    ]
    assert len(items) >= 4  # Local coverage regression, not an ETS frequency requirement.
    for question in items:
        assert re.findall(r'\[([A-D])\]', question['passage']) == list('ABCD')
        assert question['options'] == [f'Position [{letter}]' for letter in 'ABCD']
        assert question['prompt'].split('\n\n', 1)[1] not in question['passage']
        key = store.answer(question['id'])
        label = question['options'][key['correct_index']][-2]
        position = re.search(r'(?:Position\s+|位置\s*)([A-D])', key['explanation'].splitlines()[1])
        assert position and position[1] == label
        assert not {'correct_index', 'explanation', 'answer_evidence'} & question.keys()


def test_response_pool_has_no_dominant_extreme_length_cue():
    items = [q for q in store.all_questions() if q['task_type'] == 'listen_choose_response']
    longest = shortest = 0
    for question in items:
        lengths = [
            len(re.findall(r"[A-Za-z]+(?:['’-][A-Za-z]+)*", option))
            for option in question['options']
        ]
        correct = lengths[store.answer(question['id'])['correct_index']]
        longest += correct == max(lengths) and lengths.count(correct) == 1
        shortest += correct == min(lengths) and lengths.count(correct) == 1
    # Local pool guard against the previous 40/85 longest-answer cue, not a psychometric claim.
    assert max(longest, shortest) <= len(items) / 3


def test_listening_explanations_mix_chinese_reasoning_with_english_evidence():
    for question in store.all_questions():
        if question['section'] != 'listening':
            continue
        explanation = store.answer(question['id'])['explanation']
        assert re.search(r'[\u3400-\u9fff]', explanation), question['id']
        assert re.search(r'[A-Za-z]{2,}', explanation), question['id']
        # Option positions can change during bank generation; explain their content.
        assert not re.search(r'(?:选项|选|排除)\s*[A-D](?:\b|[、，。：；])', explanation), question[
            'id'
        ]
        source = ' '.join(
            [question['audio_text'], question['prompt'], *question['options']]
        ).casefold()
        for quote in re.findall(r'“([^”]+)”', explanation):
            if re.search(r'[A-Za-z]', quote) and not re.search(r'[\u3400-\u9fff]', quote):
                assert quote.casefold() in source, (question['id'], quote)


def test_all_practice_explanations_teach_meaning_reasoning_and_method():
    for question in store.all_questions():
        explanation = store.answer(question['id'])['explanation']
        lines = explanation.splitlines()
        assert len(lines) == 3, question['id']
        for line, label in zip(lines, ('读懂：', '解析：', '下次：')):
            assert line.startswith(label) and len(line) > len(label), question['id']
            assert re.search(r'[\u3400-\u9fff]', line[len(label) :]), question['id']
        assert re.search(r'[A-Za-z]{2,}', explanation), question['id']
        assert not {'explanation', 'reference', 'accepted', 'correct_index'} & question.keys()


def test_reading_explanations_quote_the_material_not_invented_evidence():
    questions = [q for q in store.all_questions() if q['section'] == 'reading']
    groups = {}
    for question in questions:
        groups.setdefault(question['group_id'], []).append(question)
    for question in questions:
        passage = question['passage']
        for peer in groups[question['group_id']]:
            if peer['task_type'] == 'complete_words':
                passage = passage.replace(
                    '{' + peer['id'] + '}', store.answer(peer['id'])['reference']
                )
        source = ' '.join([passage, question['prompt'], *question.get('options', [])]).casefold()
        for quote in re.findall(r'“([^”]+)”', store.answer(question['id'])['explanation']):
            if re.search(r'[A-Za-z]', quote) and not re.search(r'[\u3400-\u9fff]', quote):
                assert quote.casefold() in source, (question['id'], quote)


def test_every_discussion_uses_the_supported_role_boundaries():
    for question in store.all_questions():
        if question['task_type'] != 'academic_discussion':
            continue
        # Public content contract for the split professor/student writing surface.
        assert re.fullmatch(
            r'Professor:[^\n]+\nStudent A:[^\n]+\nStudent B:[^\n]+\n\n[^\n]+', question['prompt']
        ), question['id']
