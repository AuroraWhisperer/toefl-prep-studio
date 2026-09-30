"""Sentence frames model public blanks, not the private solution order."""

from collections import Counter
import pytest
from backend.question_store import QuestionStore
from backend.exam_service import normalize_text, score_one


def can_assemble(question, sentence):
    target = normalize_text(sentence).split()
    parts = question['template_parts']
    bank = question['word_bank']

    def visit(slot, offset, used):
        fixed = normalize_text(parts[slot]).split()
        if target[offset : offset + len(fixed)] != fixed:
            return False
        offset += len(fixed)
        if slot == len(parts) - 1:
            return offset == len(target)
        for i, token in enumerate(bank):
            words = normalize_text(token).split()
            if i not in used and target[offset : offset + len(words)] == words:
                if visit(slot + 1, offset + len(words), used | {i}):
                    return True
        return False

    return visit(0, 0, set())


def test_all_reviewed_sentence_frames_are_solvable():
    store = QuestionStore()
    questions = store.questions_for('writing', 'bank', 'build_sentence')
    assert len(questions) == 150
    for q in questions:
        assert q['instruction'] == 'Make an appropriate sentence.'
        assert 'Arrange every word' not in q['prompt']
        assert len(q['word_bank']) - (len(q['template_parts']) - 1) in (0, 1)
        assert not {'accepted', 'correct_order', 'solution', 'distractor'} & q.keys()
        key = store.answer(q['id'])
        for accepted in key['accepted']:
            assert can_assemble(q, accepted), (q['id'], accepted)
            assert score_one(q, key, accepted)[3]
        assert not score_one(q, key, '')[3]
        assert not score_one(q, key, ' '.join(key['accepted'][0].split()[:-1]))[3]
        assert not score_one(q, key, key['accepted'][0] + ' extra')[3]


def test_sentence_bank_covers_official_frame_variants():
    questions = QuestionStore().questions_for('writing', 'bank', 'build_sentence')
    assert any(not normalize_text(' '.join(q['template_parts'])) for q in questions)
    assert any(normalize_text(q['template_parts'][0]) for q in questions)
    assert any(any(normalize_text(p) for p in q['template_parts'][1:-1]) for q in questions)
    assert any(normalize_text(q['template_parts'][-1]) for q in questions)
    assert any(len(q['word_bank']) == len(q['template_parts']) for q in questions)
    assert any(len(q['word_bank']) == len(q['template_parts']) - 1 for q in questions)
    assert any(' ' in word for q in questions for word in q['word_bank'])
    assert any(max(Counter(q['word_bank']).values()) > 1 for q in questions)


@pytest.mark.parametrize(
    'question_id,answer',
    [
        ('W33', 'The experiment failed but the results raised an interesting question.'),
        ('W33', 'The results raised an interesting question but the experiment failed.'),
        ('W37', 'On Monday, were the tutor and the students both available?'),
        ('W43', 'When you reached the station, had the last train already left?'),
        ('W47', 'The equipment is too heavy for one person safely to carry.'),
        ('W47', 'For one person, the equipment is too heavy to carry safely.'),
        ('W47', 'For one person, the equipment is too heavy to safely carry.'),
        ('W59', 'Is the road through town shorter than the footpath?'),
        ('W59', 'Is the footpath through town shorter than the road?'),
        ('W59', 'Is the road shorter than the footpath through town?'),
        ('W60', 'Before all the samples have arrived, can we begin the analysis?'),
        ('W61', 'She suggested that before choosing a venue we discuss the budget.'),
        ('W64', 'If the report included a diagram, it would be clearer.'),
        ('W64', 'It would be clearer if the report included a diagram.'),
        ('W68', 'At the meeting, which of the ideas discussed came from first-year students?'),
        ('W68', 'Which of the ideas discussed came from first-year students at the meeting?'),
        (
            'W70',
            'We again tested the uncertain measurement rather than repeat the whole experiment.',
        ),
    ],
)
def test_reviewed_contextual_variants_are_accepted(question_id, answer):
    store = QuestionStore()
    question = store.question(question_id)
    assert can_assemble(question, answer)
    assert score_one(question, store.answer(question_id), answer)[:2] == (1, 1)


@pytest.mark.parametrize(
    'question_id,answer',
    [
        ('W33', 'Although the experiment failed but the results raised an interesting question.'),
        ('W43', 'When you reached the station did the last train already left?'),
        ('W59', 'Does the footpath shorter than the road through town?'),
        ('W61', 'She suggested that we to discuss the budget before choosing a venue.'),
        ('W64', 'If the report would be clearer it included a diagram.'),
    ],
)
def test_adding_variants_does_not_accept_broken_clause_structure(question_id, answer):
    store = QuestionStore()
    assert not score_one(store.question(question_id), store.answer(question_id), answer)[3]
