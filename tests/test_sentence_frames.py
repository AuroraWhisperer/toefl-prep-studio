"""Sentence frames model public blanks, not the private solution order."""
from collections import Counter
from backend.question_store import QuestionStore
from backend.exam_service import normalize_text, score_one


def can_assemble(question, sentence):
    target = normalize_text(sentence).split()
    parts = question['template_parts']
    bank = question['word_bank']

    def visit(slot, offset, used):
        fixed = normalize_text(parts[slot]).split()
        if target[offset:offset + len(fixed)] != fixed:
            return False
        offset += len(fixed)
        if slot == len(parts) - 1:
            return offset == len(target)
        for i, token in enumerate(bank):
            words = normalize_text(token).split()
            if i not in used and target[offset:offset + len(words)] == words:
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
