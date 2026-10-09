"""Reviewed October sentence additions use the existing private scoring contract."""

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend.exam_service import score_one
from backend.question_store import QuestionStore
from scripts.question_bank_review import content_fingerprint, source_file

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'question_bank/sources/expansion_2026_10_07/build_sentence.json'


def test_new_sentences_are_loaded_from_their_reviewed_sources():
    source = json.loads(SOURCE.read_text(encoding='utf8'))
    notes = json.loads(
        (ROOT / 'question_bank/sources/review_notes.json').read_text(encoding='utf8')
    )
    assert source['section'] == 'writing' and source['task_type'] == 'build_sentence'
    assert [r['question']['id'] for r in source['items']] == [f'W{i}' for i in range(451, 751)]
    store = QuestionStore()
    for row in source['items']:
        q, answer, review = (row[key] for key in ('question', 'answer', 'review'))
        assert store.question(q['id']) == dict(
            q, difficulty=review['difficulty'], skills=review['skills']
        )
        assert store.answer(q['id']) == answer
        assert notes[q['id']] == dict(review, content_sha256=content_fingerprint(q, answer))
        assert source_file(q) == 'expansion_2026_10_07/build_sentence.json'


@pytest.mark.parametrize(
    'qid,valid,invalid',
    [
        (
            'W501',
            'Do you know what time the last shuttle leaves on Fridays?',
            'Do you know what time does the last shuttle leaves on Fridays?',
        ),
        (
            'W545',
            'Could you clarify which books are optional and which are essential?',
            'Could you clarify which books optional are and which essential are?',
        ),
        (
            'W568',
            'The number of students who registered has exceeded our expectations.',
            'The number of students who registered have exceeded our expectations.',
        ),
        (
            'W586',
            'We could check the figures again if we had more time.',
            'We had check the figures again if we could more time.',
        ),
        (
            'W664',
            'Try writing the key steps down instead of every word.',
            'Try down writing the key steps instead of every word.',
        ),
        (
            'W716',
            "Only with the photographer's permission may some of the images be used.",
            "Only with the photographer's permission some of the images may used be.",
        ),
        (
            'W750',
            'Do you know whether the opening time listed on the old map still is correct?',
            'Do you know whether is the opening time listed on the old map still correct?',
        ),
        (
            'W464',
            'On the floor above, there is another one.',
            'On the floor above, there another one is.',
        ),
        (
            'W478',
            'It gives me enough time after class to get there.',
            'It gives enough time me after class to get there.',
        ),
        (
            'W507',
            'Have they told you from which counter you should collect it?',
            'Have they told you from which counter should you collect it?',
        ),
        (
            'W527',
            'Can you show her in which building her class is?',
            'Can you show her in which building is her class?',
        ),
        (
            'W533',
            'He needed to know which days I was free on.',
            'He needed to know which days was I free on.',
        ),
        (
            'W555',
            'The form they need is the one with the blue heading.',
            'The form they is need the one with the blue heading.',
        ),
        (
            'W597',
            'When most students tried to submit their work, the system was unavailable.',
            'When most students tried their work to submit, the system was unavailable.',
        ),
        (
            'W614',
            'How long can students book one at a time for?',
            'How long students can book one at a time for?',
        ),
        ('W617', 'About what would they like to ask me?', 'About what they would like to ask me?'),
        (
            'W685',
            'I need to understand for which changes the reviewer is asking.',
            'I need to understand for which changes is asking the reviewer.',
        ),
        (
            'W732',
            'I am trying to establish whether the person who actually wrote it signed it.',
            'I am trying to establish whether the person who actually wrote it it signed.',
        ),
        (
            'W734',
            'She wanted to check whether the records matched the values we reported.',
            'She wanted to check whether the records we matched the values reported.',
        ),
    ],
)
def test_reviewed_orders_accept_common_variants_but_reject_targeted_errors(qid, valid, invalid):
    store = QuestionStore()
    q, key = store.question(qid), store.answer(qid)
    assert score_one(q, key, valid)[3]
    assert not score_one(q, key, invalid)[3]


def test_new_sentence_answers_remain_private_until_their_own_submission():
    store = QuestionStore()
    ids = [f'W{i}' for i in range(541, 551)]
    with TestClient(app) as client:
        response = client.get(
            '/api/v1/exam',
            params={
                'section': 'writing',
                'task_type': 'build_sentence',
                'mode': 'bank',
            },
        )
        assert response.status_code == 200
        public = response.json()['questions']
        assert len(public) == 450
        assert {q['id'] for q in public if int(q['id'][1:]) > 450} == {
            f'W{i}' for i in range(451, 751)
        }
        for q in public:
            assert (
                not {'accepted', 'reference', 'explanation', 'review', 'answer_evidence'} & q.keys()
            )
        response = client.post(
            '/api/v1/exam/submit',
            json={
                'section': 'writing',
                'task_type': 'build_sentence',
                'mode': 'practice',
                'count': 10,
                'question_ids': ids,
                'responses': [
                    {'question_id': qid, 'answer': store.answer(qid)['accepted'][-1]} for qid in ids
                ],
            },
        )
        assert response.status_code == 200, response.text
        feedback = response.json()['feedback']
        assert [f['question_id'] for f in feedback] == ids
        assert all(f['correct'] for f in feedback)
        for item in feedback:
            assert item['explanation'] == store.answer(item['question_id'])['explanation']
