import pytest

from backend.exam_service import score_one, score_submission
from backend.question_store import store


@pytest.mark.parametrize('section', ['writing', 'speaking'])
@pytest.mark.parametrize('phrase', ['online seminars flexible ', 'ONLINE, seminars! Flexible? '])
def test_repeated_keywords_get_a_warning_without_a_grade(section, phrase):
    key = store.answer('W21')
    response = (phrase * 34).strip() + '. This is a sentence.'
    earned, possible, feedback, correct = score_one({'section': section}, key, response)
    assert (earned, possible, correct) == (0, 0, None)
    assert '重复' in feedback
    assert '人工复核' in feedback


def test_reference_responses_are_not_flagged_as_repetition():
    for question in store.all_questions():
        if question['section'] != 'writing':
            continue
        key = store.answer(question['id'])
        if key['type'] != 'subjective':
            continue
        earned, possible, feedback, correct = score_one(question, key, key['reference'])
        assert (earned, possible, correct) == (0, 0, None), question['id']
        assert '重复词组' not in feedback, question['id']
        assert 'addresses the situation' not in feedback


def test_natural_reuse_of_topic_words_is_not_keyword_stuffing():
    key = store.answer('S08')
    response = (
        'I study in the library because it is quiet. My favorite place is the upstairs '
        'reading room. I study there after class because I can spread out my notes, '
        'and a librarian can help when I cannot find a source.'
    )
    earned, possible, feedback, correct = score_one({'section': 'speaking'}, key, response)
    assert (earned, possible, correct) == (0, 0, None)
    assert '重复词组' not in feedback
    assert '不评估发音' in feedback
    assert 'clear idea' not in feedback


def test_empty_response_is_unanswered_without_a_numeric_grade():
    earned, possible, feedback, correct = score_one({'section': 'writing'}, store.answer('W21'), '')
    assert (earned, possible, correct) == (0, 0, None)
    assert '没有提交文字' in feedback


def test_short_interview_keyword_loop_is_also_rejected():
    earned, _, feedback, correct = score_one(
        {'section': 'speaking'}, store.answer('S08'), 'study place because ' * 6
    )
    assert earned == 0 and correct is None
    assert '重复词组' in feedback


def test_opposite_position_and_sample_are_both_pending_review():
    question = store.question('W450')
    key = store.answer('W450')
    response = (
        'I would give priority to short visits abroad. A visit lets students work beside '
        'local classmates and notice details that a video meeting may miss. For example, '
        'a small group could investigate affordable meals with students at the partner '
        'school, compare prices in nearby shops, and interview the people who prepare '
        'lunch. I agree with Student B that access matters, so places should be offered '
        'according to financial need rather than who can pay first. Returning students '
        'could run workshops and share their findings with every class. Teachers should '
        'prepare the visitors by explaining the project and helping them formulate '
        'questions. This approach costs more per participant, but a carefully planned '
        'visit can provide experiences that students can bring back and use in later lessons.'
    )
    for answer in (response, key['reference']):
        earned, possible, message, correct = score_one(question, key, answer)
        assert (earned, possible, correct) == (0, 0, None)
        assert '人工复核' in message
        assert '关键词' not in message
    changed_keywords = {**key, 'keywords': ['unrelated keyword']}
    assert score_one(question, changed_keywords, response) == score_one(question, key, response)


@pytest.mark.parametrize('task', ['write_email', 'academic_discussion', 'take_interview'])
def test_manual_only_submission_preserves_completion_without_scores(task):
    section = 'speaking' if task == 'take_interview' else 'writing'
    questions = store.questions_for(section, 'bank', task)
    question = questions[0]
    result = score_submission(
        store,
        [{'question_id': question['id'], 'answer': 'A different supported response.'}],
        section=section,
        mode='bank',
        task_type=task,
    )
    totals = result['sections'][section]
    assert (totals['answered'], totals['total']) == (1, len(questions))
    assert (totals['earned'], totals['possible']) == (0, 0)
    assert totals['percentage'] is totals['legacy_score'] is totals['band6'] is None
    assert result['overall_band6'] is result['legacy_total'] is None
    assert all(item['manual_review'] and item['correct'] is None for item in result['feedback'])
    assert all('计 0 分' not in item['feedback'] for item in result['feedback'])


def test_mixed_writing_counts_only_sentence_points_and_has_no_projected_grade():
    result = score_submission(
        store,
        [{'question_id': 'W01', 'answer': store.answer('W01')['accepted'][0]}],
        section='writing',
    )
    totals = result['sections']['writing']
    assert (totals['earned'], totals['possible'], totals['total']) == (1, 10, 12)
    assert totals['percentage'] == 10
    assert totals['legacy_score'] is totals['band6'] is None
    assert result['overall_band6'] is None
    assert sum(item['manual_review'] for item in result['feedback']) == 2
