"""Complete groups, accepted completions and API boundaries for the October expansion."""

import json
import re
from collections import Counter, defaultdict
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend.exam_service import score_one
from backend.question_store import QuestionStore
from scripts.question_bank_review import content_fingerprint, source_file

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'question_bank/sources/expansion_2026_10_05'
ADDITIONS = {
    'complete_words': ('reading', 1591, 1800, 91, 180, 10, 2700),
    'listen_repeat': ('speaking', 166, 210, 16, 30, 7, 315),
    'take_interview': ('speaking', 376, 120, 16, 30, 4, 180),
}
TOKEN = re.compile(r"\{R\d+\}|[A-Za-z]+(?:[-'][A-Za-z]+)*")


def records(task):
    return json.loads((SOURCE / f'{task}.json').read_text(encoding='utf8'))['items']


@pytest.mark.parametrize('task', ADDITIONS)
def test_expansion_adds_complete_consecutive_groups_from_reviewed_sources(task):
    section, first, count, first_group, group_count, size, total = ADDITIONS[task]
    rows = records(task)
    assert [row['question']['id'] for row in rows] == [
        f'{section[0].upper()}{i}' for i in range(first, first + count)
    ]
    prefix = 'cloze' if task == 'complete_words' else task
    assert Counter(row['question']['group_id'] for row in rows) == {
        f'{prefix}_{i}': size for i in range(first_group, first_group + group_count)
    }
    store = QuestionStore()
    current = {q['id']: q for q in store.questions_for(section, 'bank', task)}
    assert len(current) == total
    notes = json.loads(
        (ROOT / 'question_bank/sources/review_notes.json').read_text(encoding='utf8')
    )
    for row in rows:
        q, answer, review = (row[key] for key in ('question', 'answer', 'review'))
        assert current[q['id']] == dict(q, difficulty=review['difficulty'], skills=review['skills'])
        assert store.answer(q['id']) == answer
        assert notes[q['id']] == dict(review, content_sha256=content_fingerprint(q, answer))
        assert source_file(q) == f'expansion_2026_10_05/{task}.json'


def test_new_cloze_layout_and_every_accepted_spelling_match_fixed_letters():
    groups = defaultdict(list)
    for row in records('complete_words'):
        q, key = row['question'], row['answer']
        groups[q['group_id']].append(row)
        word = key['reference']
        assert q['prefix'] == word[: len(word) // 2]
        assert q['missing_length'] == q['max_answer_length'] == len(word) - len(q['prefix'])
        assert len(key['accepted']) % 2 == 0
        for full, ending in zip(key['accepted'][::2], key['accepted'][1::2]):
            assert full == q['prefix'] + ending
            assert len(ending) == q['missing_length']
            assert score_one(q, key, full)[3] is True
            assert score_one(q, key, ending)[3] is True
        assert score_one(q, key, word + 'x')[3] is False
    for group in groups.values():
        passages = {row['question']['passage'] for row in group}
        assert len(passages) == 1
        passage = passages.pop()
        first, rest = passage.split('. ', 1)
        assert '{' not in first
        assert re.findall(r'\{(R\d+)\}', passage) == [row['question']['id'] for row in group]
        assert [i for i, token in enumerate(TOKEN.findall(rest)) if token.startswith('{')] == list(
            range(1, 20, 2)
        )
        for row in group:
            passage = passage.replace('{' + row['question']['id'] + '}', row['answer']['reference'])
        assert 70 <= len(TOKEN.findall(passage)) <= 100


@pytest.mark.parametrize(
    'task,seconds', [('listen_repeat', [8, 8, 10, 10, 12, 12, 12]), ('take_interview', [45] * 4)]
)
def test_new_speaking_groups_keep_coherent_labels_and_response_windows(task, seconds):
    groups = defaultdict(list)
    for row in records(task):
        groups[row['question']['group_id']].append(row)
    for group in groups.values():
        assert len({row['question']['passage_title'] for row in group}) == 1
        assert [row['question']['max_seconds'] for row in group] == seconds
        if task == 'listen_repeat':
            assert all(row['question']['audio_text'] == row['answer']['reference'] for row in group)


@pytest.mark.parametrize('task', ADDITIONS)
def test_latest_complete_group_submits_and_reveals_only_its_own_answers(task):
    section, _, _, _, _, size, _ = ADDITIONS[task]
    selected = records(task)[-size:]
    ids = [row['question']['id'] for row in selected]
    responses = [
        {'question_id': row['question']['id'], 'answer': row['answer']['reference']}
        for row in selected
    ]
    with TestClient(app) as client:
        public = client.get(
            '/api/v1/exam', params={'section': section, 'mode': 'bank', 'task_type': task}
        )
        assert public.status_code == 200
        by_id = {q['id']: q for q in public.json()['questions']}
        for qid in ids:
            assert (
                not {'reference', 'accepted', 'explanation', 'review', 'answer_evidence'}
                & by_id[qid].keys()
            )
        assert (
            client.get(f'/question_bank/sources/expansion_2026_10_05/{task}.json').status_code
            == 404
        )
        response = client.post(
            '/api/v1/exam/submit',
            json={
                'section': section,
                'mode': 'practice',
                'task_type': task,
                'count': 1,
                'question_ids': ids,
                'responses': responses,
            },
        )
        assert response.status_code == 200, response.text
        feedback = response.json()['feedback']
        assert [item['question_id'] for item in feedback] == ids
        for item, row in zip(feedback, selected):
            assert item['explanation'] == row['answer']['explanation']
            assert item['reference_answer']
            if task == 'take_interview':
                assert item['manual_review'] is True and item['correct'] is None
                assert item['earned'] == item['possible'] == 0
            else:
                assert item['correct'] is True
