"""Regression cases for imported notice boundaries and the compatibility scorer."""

import copy
import json
from pathlib import Path

import pymupdf
import pytest
from fastapi.testclient import TestClient

from backend.app import app
from scripts.mock_question_screens import enrich_paper


def test_notice_heading_after_options_in_pdf_stream_stays_with_material():
    def choices(numbers):
        return '\n'.join(
            f'{n}. Question {n}?\n(A) First\n(B) Second\n(C) Third\n(D) Last' for n in numbers
        )

    paper = {
        'phases': [
            {
                'id': 'synthetic-reading',
                'section': 'reading',
                'pages': [{'page': n} for n in (1, 2, 3)],
                'items': [{'number': n} for n in range(1, 21)],
            }
        ]
    }
    with pymupdf.open() as document:
        first = document.new_page()
        first.insert_text(
            (40, 40),
            '(Questions 1-10)\n'
            + ' '.join(['word___'] * 10)
            + '\nRead a note.\nA short note.\n'
            + choices(range(11, 13)),
        )
        notice = document.new_page()
        notice.insert_text((40, 40), 'Read a notice.')
        notice.insert_text((40, 100), 'Notice body.\n' + choices(range(13, 16)))
        # Drawn last, but visually above the material and all three questions.
        notice.insert_text((40, 70), 'COMMUNITY NOTICE')
        academic = document.new_page()
        academic.insert_text(
            (40, 40), 'Read an Academic Passage\nAcademic body.\n' + choices(range(16, 21))
        )
        enrich_paper(paper, document)
    phase = paper['phases'][0]
    assert len(phase['cloze_parts']) == 11
    for item in phase['items'][12:15]:
        assert item['material'] == 'COMMUNITY NOTICE\n\nNotice body.'
        assert item['options'] == ['First', 'Second', 'Third', 'Last']


@pytest.mark.parametrize('number', range(1, 6))
def test_reading_notice_reimport_preserves_other_questions(number, local_mock_bank):
    root = Path(__file__).resolve().parents[1]
    source = root / 'artifacts' / 'ets-reference' / f'test-{number}.pdf'
    if not source.is_file():
        pytest.skip('Local source PDF is required for the importer regression.')
    paper = json.loads((local_mock_bank / 'mock' / f'ets-test-{number}.json').read_text('utf-8'))
    with pymupdf.open(source) as document:
        actual = enrich_paper(copy.deepcopy(paper), document)
    for before, after in zip(paper['phases'], actual['phases']):
        assert before.get('cloze_parts') == after.get('cloze_parts')
        for old, new in zip(before['items'], after['items']):
            if before['section'] != 'reading' or old['number'] not in (13, 14, 15):
                assert old == new
    # Installed data must be regenerated from the corrected importer too.
    assert actual == paper


@pytest.mark.parametrize(
    'number,module,heading,last_option',
    [
        (3, 1, 'Welcome to the Library Quiet Zone!', 'They should be kept at a low volume.'),
        (3, 2, 'Riverdale Parks Department seeks dedicated volunteers', 'May 9th'),
        (4, 1, 'LIBRARY COMPUTER RESERVATION SYSTEM', 'They are moved to a Basic station instead.'),
        (
            4,
            2,
            'Effective Communication in the Modern Workplace',
            'To ensure everyone receives a workbook',
        ),
        (5, 1, 'Location: Town Square', 'It requires tickets.'),
        (5, 2, 'BRUCKVILLE (May 16)', 'Gift wrapping and special ordering'),
    ],
)
def test_installed_notice_material_and_last_option(
    number, module, heading, last_option, local_mock_bank
):
    paper = json.loads((local_mock_bank / 'mock' / f'ets-test-{number}.json').read_text('utf-8'))
    phase = paper['phases'][module - 1]
    for item in phase['items'][12:15]:
        assert heading in item['material']
        assert all(heading not in option for option in item['options'])
    assert phase['items'][14]['options'][3] == last_option


@pytest.mark.parametrize(
    'original,answer,missing',
    [
        ('We know that we can.', 'We know that can.', ['we']),
        ('We we we', 'we', ['we', 'we']),
        ('We know that we can.', 'We know that we can.', []),
    ],
)
def test_legacy_score_counts_repeated_missing_words(original, answer, missing):
    response = TestClient(app).post('/score', json={'original': original, 'answer': answer})
    assert response.status_code == 200
    assert response.json()['missing_words'] == missing
    assert (response.json()['accuracy'] == 100) == (original == answer)
