"""Source-only checks for the September cloze expansion, before bank sealing."""

import json
import re
from collections import Counter, defaultdict
from datetime import date
from difflib import SequenceMatcher
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'question_bank/sources/expansion_2026_09/complete_words.json'
TOKEN = re.compile(r"\{R\d+\}|[A-Za-z]+(?:[-'][A-Za-z]+)*")


@pytest.fixture(scope='module')
def source():
    return json.loads(SOURCE.read_text(encoding='utf-8'))


@pytest.fixture(scope='module')
def groups(source):
    result = defaultdict(list)
    for item in source['items']:
        result[item['question']['group_id']].append(item)
    return result


def restore(items):
    passage = items[0]['question']['passage']
    for item in items:
        passage = passage.replace('{' + item['question']['id'] + '}', item['answer']['reference'])
    return passage


def test_expansion_has_exact_ids_and_complete_groups(source, groups):
    assert set(source) == {'section', 'task_type', 'items'}
    assert source['section'] == 'reading'
    assert source['task_type'] == 'complete_words'
    assert [item['question']['id'] for item in source['items']] == [
        f'R{i}' for i in range(266, 566)
    ]
    assert list(groups) == [f'cloze_{i}' for i in range(16, 46)]
    for number, items in enumerate(groups.values(), 16):
        start = 266 + (number - 16) * 10
        assert [item['question']['id'] for item in items] == [
            f'R{i}' for i in range(start, start + 10)
        ]


def test_expansion_preserves_the_public_private_boundary(source):
    public_fields = {
        'id',
        'section',
        'task_type',
        'prompt',
        'response_type',
        'group_id',
        'passage_title',
        'passage',
        'prefix',
        'missing_length',
        'max_answer_length',
    }
    for item in source['items']:
        assert set(item) == {'question', 'answer', 'review'}
        question = item['question']
        assert set(question) == public_fields, question['id']
        assert question['section'] == 'reading'
        assert question['task_type'] == 'complete_words'
        assert question['response_type'] == 'short_text'
        assert question['prompt'] == 'Fill in the missing letters in the paragraph.'
        assert set(item['answer']) == {'type', 'accepted', 'reference', 'explanation'}


def test_expansion_cloze_alternates_after_an_intact_opening(groups):
    for group_id, items in groups.items():
        passages = {item['question']['passage'] for item in items}
        assert len(passages) == 1, group_id
        assert len({item['question']['passage_title'] for item in items}) == 1
        passage = passages.pop()
        first, rest = passage.split('. ', 1)
        assert '{' not in first and '}' not in first, group_id
        assert re.findall(r'\{(R\d+)\}', passage) == [item['question']['id'] for item in items], (
            group_id
        )
        tokens = TOKEN.findall(rest)
        assert [i for i, token in enumerate(tokens) if token.startswith('{')] == [
            1,
            3,
            5,
            7,
            9,
            11,
            13,
            15,
            17,
            19,
        ], group_id
        restored = restore(items)
        assert '{' not in restored and '}' not in restored, group_id
        assert 70 <= len(passage.split()) <= 100, group_id
        assert 70 <= len(TOKEN.findall(restored)) <= 100, group_id


def test_expansion_answer_spellings_and_exact_half_word_lengths(source):
    for item in source['items']:
        question, answer = item['question'], item['answer']
        word = answer['reference']
        assert answer['type'] == 'text'
        assert re.fullmatch(r'[A-Za-z]{2,}', word), question['id']
        prefix = word[: len(word) // 2]
        suffix = word[len(prefix) :]
        assert question['prefix'] == prefix, question['id']
        assert answer['accepted'] == [word, suffix], question['id']
        assert question['missing_length'] == len(suffix), question['id']
        assert question['max_answer_length'] == len(suffix), question['id']
        assert f'已给 {prefix}，只填 {suffix}。' in answer['explanation']


def test_expansion_explanations_have_three_substantive_grounded_lines(groups):
    labels = ('读懂：', '解析：', '下次：')
    for items in groups.values():
        passage = restore(items)
        for item in items:
            qid = item['question']['id']
            explanation = item['answer']['explanation']
            lines = explanation.splitlines()
            assert len(lines) == 3, qid
            for line, label in zip(lines, labels):
                assert line.startswith(label), qid
                assert re.search(r'[\u3400-\u9fff]', line[len(label) :]), qid
            assert len(re.findall(r'[\u3400-\u9fff]', lines[1])) >= 15, qid
            assert len(re.findall(r'[\u3400-\u9fff]', lines[2])) >= 15, qid
            quotes = re.findall(r'“([^”]+)”', explanation)
            assert quotes, qid
            for quote in quotes:
                if re.search(r'[A-Za-z]', quote) and not re.search(r'[\u3400-\u9fff]', quote):
                    assert quote in passage, (qid, quote)
            assert item['answer']['reference'] in TOKEN.findall(quotes[0]), qid
            assert not any(
                term in explanation
                for term in ('TODO', 'TBD', '官方解析', '专家认证', '仔细阅读即可')
            ), qid


def test_expansion_review_metadata_is_attested_and_unsealed(groups):
    fields = {
        'difficulty',
        'skills',
        'vocabulary',
        'rationale',
        'answer_evidence',
        'reviewed_on',
    }
    for items in groups.values():
        passage = restore(items)
        attested = {word.casefold() for word in TOKEN.findall(passage)}
        for item in items:
            qid = item['question']['id']
            review = item['review']
            assert set(review) == fields, qid
            assert review['difficulty'] in {'easy', 'medium', 'hard'}, qid
            assert date.fromisoformat(review['reviewed_on']) >= date(2026, 9, 27), qid
            assert review['skills'] and all(review['skills']), qid
            assert review['vocabulary'], qid
            for word in review['vocabulary']:
                assert re.fullmatch(r'[A-Za-z]+', word), (qid, word)
                assert word.casefold() in attested, (qid, word)
            assert len(review['rationale']) >= 15, qid
            assert review['answer_evidence'] in passage, qid
            assert item['answer']['reference'] in TOKEN.findall(review['answer_evidence']), qid


def test_expansion_materials_and_teaching_are_not_duplicated(source, groups):
    paragraphs = [restore(items) for items in groups.values()]
    assert len(set(paragraphs)) == 30
    assert len({items[0]['question']['passage_title'] for items in groups.values()}) == 30
    for label_index in range(3):
        lines = [
            item['answer']['explanation'].splitlines()[label_index] for item in source['items']
        ]
        assert len(lines) == len(set(lines)), label_index
    difficulties = Counter(item['review']['difficulty'] for item in source['items'])
    assert set(difficulties) <= {'easy', 'medium', 'hard'}
    assert difficulties['medium'] + difficulties['hard'] > 0
    assert len({item['answer']['reference'] for item in source['items']}) >= 180


def test_expansion_passages_are_not_cloned_from_existing_cloze(groups):
    bank = json.loads((ROOT / 'question_bank/reading/questions.json').read_text(encoding='utf-8'))
    answers = json.loads((ROOT / 'question_bank/answers/reading.json').read_text(encoding='utf-8'))
    old_groups = defaultdict(list)
    new_ids = {item['question']['id'] for items in groups.values() for item in items}
    for question in bank['questions']:
        if question['task_type'] == 'complete_words' and question['id'] not in new_ids:
            old_groups[question['group_id']].append(
                {'question': question, 'answer': answers[question['id']]}
            )
    old_passages = {restore(items) for items in old_groups.values()}
    new_passages = [restore(items) for items in groups.values()]
    assert not old_passages & set(new_passages)
    new_tokens = [re.findall(r'[a-z]+', passage.casefold()) for passage in new_passages]
    old_tokens = [re.findall(r'[a-z]+', passage.casefold()) for passage in old_passages]
    # Catch obvious prose reuse even when a few names or details change.
    for index, tokens in enumerate(new_tokens):
        for comparison in new_tokens[index + 1 :] + old_tokens:
            assert SequenceMatcher(None, tokens, comparison, autojunk=False).ratio() < 0.6
