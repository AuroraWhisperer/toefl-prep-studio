import hashlib
import json

import pymupdf
import pytest

from scripts import import_mock_tests as importer


@pytest.fixture
def structured_import(tmp_path, monkeypatch):
    source = tmp_path / 'sources'
    output = tmp_path / 'question_bank' / 'mock'
    source.mkdir()
    output.mkdir(parents=True)
    pdf = source / 'test-1.pdf'
    with pymupdf.open() as document:
        document.new_page().insert_text((40, 40), 'Write a short email.')
        pdf.write_bytes(document.tobytes())
    paper = {
        'id': 'ets-test-1',
        'source_sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(),
        'phases': [
            {
                'section': 'writing',
                'pages': [{'page': 1, 'url': '/mock-pages/ets-test-1/page-1.png'}],
                'items': [{'id': 'email-1', 'kind': 'email', 'prompt': 'Old presentation'}],
            }
        ],
    }
    target = output / 'ets-test-1.json'
    target.write_text(json.dumps(paper), encoding='utf-8')
    preserved = {
        output / 'pages/ets-test-1/page-1.png': b'existing image',
        output.parent / 'answers/mock/ets-test-1.json': b'{}',
    }
    for path, content in preserved.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
    monkeypatch.setattr(importer, 'ROOT', tmp_path)
    monkeypatch.setattr(importer, 'SOURCE', source)
    monkeypatch.setattr(importer, 'OUTPUT', output)
    return pdf, target, preserved


def test_structure_rebuild_rejects_a_replaced_source_pdf(structured_import):
    pdf, target, preserved = structured_import
    before = target.read_bytes()
    with pymupdf.open() as document:
        document.new_page().insert_text((40, 40), 'A different question from another paper.')
        pdf.write_bytes(document.tobytes())

    with pytest.raises(ValueError, match='source PDF differs'):
        importer.rebuild_question_screens(1)

    assert target.read_bytes() == before
    assert {path: path.read_bytes() for path in preserved} == preserved


def test_structure_rebuild_with_matching_source_preserves_other_materials(structured_import):
    _, target, preserved = structured_import
    expected = json.loads(target.read_text(encoding='utf-8'))
    expected['phases'][0]['items'][0]['prompt'] = 'Write a short email.'
    expected['presentation_version'] = 2

    importer.rebuild_question_screens(1)

    assert json.loads(target.read_text(encoding='utf-8')) == expected
    assert {path: path.read_bytes() for path in preserved} == preserved


@pytest.fixture
def full_import(tmp_path, monkeypatch, local_mock_bank):
    source = local_mock_bank.parent / 'artifacts' / 'ets-reference'
    if not (source / 'test-1.pdf').is_file():
        pytest.skip('Local source PDF is required for the full importer regression.')
    paper = json.loads((local_mock_bank / 'mock/ets-test-1.json').read_text(encoding='utf-8'))
    answers = json.loads(
        (local_mock_bank / 'answers/mock/ets-test-1.json').read_text(encoding='utf-8')
    )
    output = tmp_path / 'question_bank' / 'mock'
    preserved = {
        output / 'ets-test-1.json': b'{"previous": "paper"}',
        output.parent / 'answers/mock/ets-test-1.json': b'{"previous": "answers"}',
    }
    for phase in paper['phases']:
        for page in phase['pages']:
            preserved[output / 'pages/ets-test-1' / f'page-{page["page"]}.png'] = b'previous image'
    for path, content in preserved.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
    monkeypatch.setattr(importer, 'ROOT', tmp_path)
    monkeypatch.setattr(importer, 'SOURCE', source)
    monkeypatch.setattr(importer, 'OUTPUT', output)
    return preserved, paper, answers


@pytest.mark.parametrize('failure', ['extraction', 'rendering'])
def test_full_import_preparation_failure_preserves_existing_files(
    full_import, monkeypatch, failure
):
    preserved, _, _ = full_import
    if failure == 'extraction':

        def fail_extraction(paper, document):
            raise ValueError('Unsupported source layout')

        monkeypatch.setattr(importer, 'enrich_paper', fail_extraction)
    else:
        render = pymupdf.Page.get_pixmap
        rendered = 0

        def fail_second_image(page, **kwargs):
            nonlocal rendered
            if kwargs.get('matrix') == pymupdf.Matrix(1.45, 1.45):
                rendered += 1
                if rendered == 2:
                    raise ValueError('Could not render source page')
            return render(page, **kwargs)

        monkeypatch.setattr(pymupdf.Page, 'get_pixmap', fail_second_image)

    with pytest.raises(ValueError, match='Unsupported source layout|Could not render source page'):
        importer.import_paper(1)

    assert {path: path.read_bytes() for path in preserved} == preserved


def test_full_import_reproduces_paper_and_answers_with_readable_images(full_import):
    preserved, paper, answers = full_import

    assert importer.import_paper(1) == paper

    assert json.loads((importer.OUTPUT / 'ets-test-1.json').read_text(encoding='utf-8')) == paper
    answer_file = importer.ROOT / 'question_bank/answers/mock/ets-test-1.json'
    assert json.loads(answer_file.read_text(encoding='utf-8')) == answers
    for path in preserved:
        if path.suffix == '.png':
            image = pymupdf.Pixmap(path)
            assert image.width > 0 and image.height > 0
