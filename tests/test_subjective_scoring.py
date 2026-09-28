import pytest

from backend.exam_service import score_one
from backend.question_store import store


@pytest.mark.parametrize('section', ['writing', 'speaking'])
@pytest.mark.parametrize('phrase', ['online seminars flexible ', 'ONLINE, seminars! Flexible? '])
def test_repeated_keywords_do_not_earn_high_subjective_scores(section, phrase):
    key = store.answer('W21')
    response = (phrase * 34).strip() + '. This is a sentence.'
    earned, possible, feedback, correct = score_one({'section': section}, key, response)
    assert earned <= 1
    assert possible == 5
    assert not correct
    assert 'repeated' in feedback.lower()


def test_reference_responses_are_not_flagged_as_repetition():
    for question in store.all_questions():
        if question['section'] != 'writing':
            continue
        key = store.answer(question['id'])
        if key['type'] != 'subjective':
            continue
        earned, _, feedback, _ = score_one(question, key, key['reference'])
        assert earned >= 3.5, question['id']
        assert 'repeated' not in feedback.lower(), question['id']
        assert 'addresses the situation' not in feedback


def test_natural_reuse_of_topic_words_is_not_keyword_stuffing():
    key = store.answer('S08')
    response = ('I study in the library because it is quiet. My favorite place is the upstairs '
                'reading room. I study there after class because I can spread out my notes, '
                'and a librarian can help when I cannot find a source.')
    earned, _, feedback, correct = score_one({'section': 'speaking'}, key, response)
    assert earned >= 3.5 and correct
    assert 'repeated' not in feedback.lower()
    assert 'clear idea' not in feedback


def test_empty_response_still_scores_zero():
    assert score_one({'section': 'writing'}, store.answer('W21'), '')[:2] == (0, 5)


def test_short_interview_keyword_loop_is_also_rejected():
    earned, _, feedback, correct = score_one(
        {'section': 'speaking'}, store.answer('S08'), 'study place because ' * 6)
    assert earned <= 1 and not correct
    assert 'repeated' in feedback.lower()
