import copy
import json
import re
from collections import Counter
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend.exam_service import score_one
from backend.question_store import QuestionStore
from scripts import build_question_bank as builder
from scripts.question_bank_review import apply_review, content_fingerprint

ROOT = Path(__file__).resolve().parents[1]
STORE = QuestionStore(ROOT)
NOTES = json.loads((ROOT / 'question_bank/sources/review_notes.json').read_text(encoding='utf8'))
TIMES = [
    ('reading', 'complete_words', 120, 'recommended'),
    ('reading', 'read_daily_life', None, 'recommended'),
    ('reading', 'read_academic_passage', 300, 'recommended'),
    ('listening', 'listen_choose_response', 160, 'local_estimate'),
    ('listening', 'listen_conversation', 200, 'local_estimate'),
    ('listening', 'listen_announcement', 90, 'local_estimate'),
    ('listening', 'listen_academic_talk', 180, 'local_estimate'),
    ('writing', 'build_sentence', 360, 'recommended'),
    ('writing', 'write_email', 420, 'official'),
    ('writing', 'academic_discussion', 600, 'official'),
    ('speaking', 'listen_repeat', 180, 'local_estimate'),
    ('speaking', 'take_interview', 300, 'mixed'),
]


@pytest.mark.parametrize('section,task,seconds,basis', TIMES)
def test_unit_and_round_time_for_every_supported_count(section, task, seconds, basis):
    config = STORE.manifest()['sections'][section]['practice_tasks'][task]
    assert config['seconds_per_set'] == seconds
    timing = config['timing']
    assert timing['basis'] == basis
    if seconds is not None:
        assert timing['range_seconds'][0] <= seconds <= timing['range_seconds'][1]
    assert timing['sources'] and all(s['url'].startswith('https://') for s in timing['sources'])
    with TestClient(app) as client:
        for count in config['count_options']:
            for timer in config['timer_modes']:
                response = client.get(
                    '/api/v1/exam',
                    params=dict(
                        section=section,
                        task_type=task,
                        mode='practice',
                        count=count,
                        timer_mode=timer,
                    ),
                )
                assert response.status_code == 200, response.text
                data = response.json()
                groups = Counter(q.get('group_id', q['id']) for q in data['questions'])
                expected_time = (
                    sum(120 if size == 2 else 180 for size in groups.values())
                    if task == 'read_daily_life'
                    else seconds * count // config['units_per_set']
                )
                assert data['estimated_time_seconds'] == data['time_limit_seconds'] == expected_time
                assert len(groups) == count
                assert data['total'] == sum(groups.values())


def test_every_item_has_current_review_and_private_vocabulary_evidence():
    questions = STORE.all_questions()
    assert set(NOTES) == {q['id'] for q in questions}
    assert {q['id'] for q in questions} == {
        f'{prefix}{i:02d}'
        for prefix, total in [('R', 1590), ('L', 1410), ('W', 450), ('S', 165)]
        for i in range(1, total + 1)
    }
    groups = {}
    for q in questions:
        groups.setdefault(q.get('group_id', q['id']), []).append(q)
    for q in questions:
        note = NOTES[q['id']]
        assert note['content_sha256'] == content_fingerprint(q, STORE.answer(q['id']))
        assert q['difficulty'] == note['difficulty'] in {'easy', 'medium', 'hard'}
        assert q['skills'] == note['skills'] and note['rationale'] and note['vocabulary']
        assert not {'rationale', 'vocabulary', 'answer_evidence', 'content_sha256'} & q.keys()
        material = ' '.join(
            json.dumps([peer, STORE.answer(peer['id'])], ensure_ascii=False)
            for peer in groups[q.get('group_id', q['id'])]
        )
        normalize = lambda text: re.sub(r'[^a-z0-9 ]', '', text.lower())
        assert all(normalize(term) in normalize(material) for term in note['vocabulary']), q['id']
    for info in STORE.manifest()['sections'].values():
        for task, config in info['practice_tasks'].items():
            actual = Counter(q['difficulty'] for q in questions if q['task_type'] == task)
            assert {level: actual[level] for level in ('easy', 'medium', 'hard')} == config[
                'difficulty_counts'
            ]
            assert set(actual) <= {'easy', 'medium', 'hard'}
            assert actual['medium'] + actual['hard'] > 0


def test_changed_question_or_answer_requires_new_review():
    question = STORE.questions_for('reading')[0]
    key = STORE.answer(question['id'])
    changed = copy.deepcopy(question)
    changed['passage'] += ' New text.'
    with pytest.raises(ValueError, match='Content changed since review'):
        apply_review([changed], {question['id']: key}, NOTES)
    changed_key = {**key, 'accepted': ['unreviewed']}
    with pytest.raises(ValueError, match='Content changed since review'):
        apply_review([question], {question['id']: changed_key}, NOTES)


def test_cloze_has_complete_first_sentence_then_ten_alternate_half_words():
    groups = {}
    for q in STORE.questions_for('reading', 'bank', 'complete_words'):
        groups.setdefault(q['group_id'], []).append(q)
    assert len(groups) == 90
    for qs in groups.values():
        passage = qs[0]['passage']
        first, rest = passage.split('. ', 1)
        assert '{' not in first
        tokens = re.findall(r"\{R\d+\}|[A-Za-z]+(?:[-'][A-Za-z]+)*", rest)
        assert [i for i, t in enumerate(tokens) if t.startswith('{')] == list(range(1, 20, 2))
        assert 70 <= len(passage.split()) <= 100
        for q in qs:
            word = STORE.answer(q['id'])['reference']
            assert q['prefix'] == word[: len(word) // 2]
            assert q['prefix'] and len(q['prefix']) + q['missing_length'] == len(word)


@pytest.mark.parametrize(
    'question_id,accepted',
    [
        ('R914', ('cool', 'ol', 'cold', 'ld')),
        ('R1037', ('recognizable', 'izable', 'recognisable', 'isable')),
        ('R1092', ('minimize', 'mize', 'minimise', 'mise')),
        ('R1113', ('recognizable', 'izable', 'recognisable', 'isable')),
        ('R1191', ('recognizable', 'izable', 'recognisable', 'isable')),
    ],
)
def test_reviewed_cloze_variants_score_as_words_or_missing_endings(question_id, accepted):
    question = STORE.question(question_id)
    key = STORE.answer(question_id)
    for response in accepted:
        assert score_one(question, key, response)[3], (question_id, response)
    assert not score_one(question, key, question['prefix'])[3]
    assert not score_one(question, key, accepted[0] + 's')[3]


def test_revised_planting_sequence_scores_the_current_completion_only():
    question = STORE.question('R489')
    key = STORE.answer('R489')
    for response in ('then', 'en'):
        assert score_one(question, key, response)[3]
    for response in ('while', 'ile'):
        assert not score_one(question, key, response)[3]


def test_sentence_variants_preserve_words_and_score_without_changing_meaning():
    tokenize = lambda text: Counter(re.findall(r"[a-z]+(?:[-'][a-z]+)*", text.lower()))
    for q in STORE.questions_for('writing', 'bank', 'build_sentence'):
        assert q['instruction'] == 'Make an appropriate sentence.'
        key = STORE.answer(q['id'])
        for accepted in key['accepted']:
            assert not tokenize(accepted) - tokenize(
                ' '.join(q['word_bank'] + q['template_parts'])
            ), (q['id'], accepted)
            assert score_one(q, key, accepted)[3]
    q = next(q for q in STORE.questions_for('writing') if q['id'] == 'W03')
    assert score_one(q, STORE.answer('W03'), 'The class walked slowly because the trail was wet.')[
        3
    ]
    assert not score_one(
        q, STORE.answer('W03'), 'The trail walked slowly because the class was wet.'
    )[3]


def test_writing_time_and_word_advice_are_not_conflated():
    for q in STORE.questions_for('writing', 'bank'):
        if q['task_type'] == 'write_email':
            assert q['max_seconds'] == 420 and q['word_limit'] == {'recommended_min': 100}
        elif q['task_type'] == 'academic_discussion':
            assert q['max_seconds'] == 600 and q['word_limit'] == {'min': 100}


def test_private_authoring_and_catalogue_paths_are_not_served():
    with TestClient(app) as client:
        for path in [
            '/question_bank/sources/review_notes.json',
            '/docs/question-bank/catalogue.csv',
            '/question_bank/answers/reading.json',
            '/question_bank/sources/cloze_explanations.json',
            '/question_bank/sources/productive_explanations.json',
            '/question_bank/sources/mock_explanations/ets-test-1.json',
        ]:
            assert client.get(path).status_code == 404


def test_generator_reproduces_bank_after_source_move(tmp_path, monkeypatch):
    output = tmp_path / 'question_bank'
    (output / 'sources').mkdir(parents=True)
    (output / 'sources/review_notes.json').write_text(json.dumps(NOTES), encoding='utf8')
    for name in ('cloze_explanations.json', 'productive_explanations.json'):
        (output / 'sources' / name).write_bytes(
            (ROOT / 'question_bank/sources' / name).read_bytes()
        )
    for directory in ('expansion_2026_09', 'expansion_2026_09_30'):
        expansion = output / 'sources' / directory
        expansion.mkdir()
        for source in (ROOT / 'question_bank/sources' / directory).glob('*.json'):
            (expansion / source.name).write_bytes(source.read_bytes())
    monkeypatch.setattr(builder, 'ROOT', tmp_path)
    monkeypatch.setattr(builder, 'QUESTION_ROOT', output)
    builder.main()
    for source in (ROOT / 'question_bank').glob('*/questions.json'):
        assert json.loads(source.read_text(encoding='utf8')) == json.loads(
            (output / source.relative_to(ROOT / 'question_bank')).read_text(encoding='utf8')
        )
    for source in (ROOT / 'question_bank/answers').glob('*.json'):
        assert json.loads(source.read_text(encoding='utf8')) == json.loads(
            (output / 'answers' / source.name).read_text(encoding='utf8')
        )
    assert json.loads((output / 'manifest.json').read_text(encoding='utf8')) == STORE.manifest()
    assert (tmp_path / 'docs/question-bank/catalogue.csv').read_bytes() == (
        ROOT / 'docs/question-bank/catalogue.csv'
    ).read_bytes()


@pytest.mark.parametrize(
    'failure',
    [
        'changed_listening',
        'extra_review',
        'changed_explanation',
        'changed_expansion',
        'changed_expansion_review',
    ],
)
def test_generator_validation_failure_preserves_existing_bank(tmp_path, monkeypatch, failure):
    output = tmp_path / 'question_bank'
    notes = copy.deepcopy(NOTES)
    if failure == 'changed_listening':
        notes['L01']['content_sha256'] = 'unreviewed-content'
    elif failure == 'extra_review':
        notes['R9999'] = copy.deepcopy(notes['R01'])
    (output / 'sources').mkdir(parents=True)
    (output / 'sources/review_notes.json').write_text(json.dumps(notes), encoding='utf8')
    for name in ('cloze_explanations.json', 'productive_explanations.json'):
        (output / 'sources' / name).write_bytes(
            (ROOT / 'question_bank/sources' / name).read_bytes()
        )
    for directory in ('expansion_2026_09', 'expansion_2026_09_30'):
        expansion = output / 'sources' / directory
        expansion.mkdir()
        for source in (ROOT / 'question_bank/sources' / directory).glob('*.json'):
            (expansion / source.name).write_bytes(source.read_bytes())
    if failure == 'changed_explanation':
        explanations_path = output / 'sources/cloze_explanations.json'
        explanations = json.loads(explanations_path.read_text(encoding='utf8'))
        explanations['R01'] = 'This explanation has not been reviewed.'
        explanations_path.write_text(json.dumps(explanations), encoding='utf8')
    if failure in {'changed_expansion', 'changed_expansion_review'}:
        source_path = output / 'sources/expansion_2026_09/listen_choose_response.json'
        source = json.loads(source_path.read_text(encoding='utf8'))
        field = 'answer' if failure == 'changed_expansion' else 'review'
        name = 'explanation' if failure == 'changed_expansion' else 'rationale'
        source['items'][0][field][name] = 'An unreviewed change.'
        source_path.write_text(json.dumps(source), encoding='utf8')
    existing = {}
    for source in (ROOT / 'question_bank').glob('**/*.json'):
        if 'sources' in source.parts:
            continue
        target = output / source.relative_to(ROOT / 'question_bank')
        target.parent.mkdir(parents=True, exist_ok=True)
        existing[target] = source.read_bytes() + b'\n'
        target.write_bytes(existing[target])
    monkeypatch.setattr(builder, 'ROOT', tmp_path)
    monkeypatch.setattr(builder, 'QUESTION_ROOT', output)

    with pytest.raises(
        ValueError,
        match='Content changed since review|Review notes must cover exactly|Expansion review differs',
    ):
        builder.main()

    assert {path: path.read_bytes() for path in existing} == existing
