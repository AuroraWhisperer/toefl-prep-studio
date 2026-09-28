"""Coverage and review gates for the private, locally authored teaching notes."""

import json
import re
from pathlib import Path
from uuid import uuid4

import pytest

from backend.mock_exam import build_completed_result
from scripts.question_bank_review import mock_explanation_fingerprint

ROOT = Path(__file__).resolve().parents[1]


def read_json(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))


@pytest.mark.parametrize('number', range(1, 6))
def test_mock_teaching_notes_cover_the_reviewed_paper(number, local_mock_supplements):
    paper_id = f'ets-test-{number}'
    paper = read_json(f'question_bank/mock/{paper_id}.json')
    answers = read_json(f'question_bank/answers/mock/{paper_id}.json')
    variants = read_json('question_bank/answers/mock/sentence-variants.json')
    notes = read_json(f'question_bank/sources/mock_explanations/{paper_id}.json')
    items = [item for phase in paper['phases'] for item in phase['items']]
    explanations = notes['explanations']
    assert len(items) == len(explanations) == 97
    assert set(explanations) == {item['id'] for item in items}
    assert notes['source_sha256'] == paper['source_sha256']
    assert re.fullmatch(r'\d{4}-\d{2}-\d{2}', notes['reviewed_on'])
    assert notes['content_sha256'] == mock_explanation_fingerprint(
        paper, answers, variants, explanations
    )
    for item in items:
        assert not {'explanation', 'reference', 'correct_index', 'accepted'} & item.keys()
        explanation = explanations[item['id']]
        lines = explanation.splitlines()
        assert len(lines) == 3, item['id']
        for line, label in zip(lines, ('读懂：', '解析：', '下次：')):
            assert line.startswith(label), item['id']
            assert re.search(r'[\u3400-\u9fff]', line[len(label) :]), item['id']
        assert re.search(r'[A-Za-z]{2,}', explanation), item['id']

    for phase in paper['phases']:
        if phase['section'] not in ('reading', 'listening'):
            continue
        source = json.dumps(phase, ensure_ascii=False)
        letters = [item for item in phase['items'] if item['kind'] == 'letters']
        for index, part in enumerate(phase.get('cloze_parts', [])):
            source += part + (answers[letters[index]['id']] if index < len(letters) else '')
        normalize = lambda text: re.sub(r'\s+', ' ', text.replace('’', "'").casefold())
        source = normalize(source)
        for item in phase['items']:
            for quote in re.findall(r'“([^”]+)”', explanations[item['id']]):
                if re.search(r'[A-Za-z]', quote) and not re.search(r'[\u3400-\u9fff]', quote):
                    assert normalize(quote) in source, (item['id'], quote)

    result = build_completed_result(
        {
            'id': str(uuid4()),
            'paper_id': paper_id,
            'status': 'completed',
            'answers': {},
            'recordings': {},
        }
    )
    assert len(result['review']) == 97
    assert result['objective_total'] == len(answers)
    assert result['objective_correct'] == 0
    for item in result['review']:
        assert item['explanation'] == explanations[item['id']]
        assert item['reference'] == answers.get(item['id'])


def test_mock_review_fingerprint_detects_changed_notes_and_accepted_answers():
    paper = {'phases': [{'items': [{'id': 'sentence-1'}]}]}
    answers = {'sentence-1': 'Original answer.'}
    variants = {'sentence-1': {'answers': ['Another valid answer.']}}
    notes = {'sentence-1': 'Original explanation.'}
    expected = mock_explanation_fingerprint(paper, answers, variants, notes)
    assert expected != mock_explanation_fingerprint(
        paper, answers, variants, {'sentence-1': 'Changed explanation.'}
    )
    assert expected != mock_explanation_fingerprint(paper, answers, {}, notes)
    assert expected == mock_explanation_fingerprint(
        paper, answers, {**variants, 'other-paper': {}}, notes
    )
