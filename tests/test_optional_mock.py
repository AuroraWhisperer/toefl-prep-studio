"""A public checkout works without copyrighted, locally imported mock resources."""

import json
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from backend import mock_exam
from backend.app import app


@pytest.fixture
def local_bank(tmp_path, monkeypatch):
    monkeypatch.setattr(mock_exam, 'ROOT', tmp_path)
    mock_exam.load_paper.cache_clear()
    yield tmp_path / 'question_bank'
    mock_exam.load_paper.cache_clear()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value), encoding='utf-8')


def import_test_paper(bank):
    # Synthetic fixture, not ETS content.
    paper = {
        'id': 'ets-test-1',
        'number': 1,
        'title': 'Synthetic import fixture',
        'source_url': 'https://example.com/test-fixture',
        'phases': [
            {
                'id': 'fixture-reading',
                'title': 'Reading fixture',
                'section': 'reading',
                'seconds': 60,
                'pages': [],
                'items': [{'id': 'fixture-1', 'number': 1, 'kind': 'choice'}],
            }
        ],
    }
    write_json(bank / 'mock' / 'ets-test-1.json', paper)
    write_json(bank / 'answers' / 'mock' / 'ets-test-1.json', {'fixture-1': 'A'})
    return paper


def completed_session():
    return {
        'id': str(uuid4()),
        'paper_id': 'ets-test-1',
        'status': 'completed',
        'answers': {'fixture-1': 'A'},
        'recordings': {},
    }


def test_missing_bank_keeps_original_resources_available(local_bank):
    client = TestClient(app)
    response = client.get('/api/v1/resources')
    assert response.status_code == 200
    resources = response.json()
    assert resources['mock'] == []
    assert len(resources['practice']) == 4
    assert len(resources['test']) == 5
    response = client.post('/api/v1/mock/sessions', json={'paper_id': 'ets-test-1'})
    assert response.status_code == 404
    assert '本地导入' in response.json()['detail']
    assert not mock_exam.SESSION_DIR.exists()


@pytest.mark.parametrize('missing', ['mock/ets-test-1.json', 'answers/mock/ets-test-1.json'])
def test_incomplete_import_is_not_advertised_or_started(local_bank, missing):
    import_test_paper(local_bank)
    (local_bank / missing).unlink()
    client = TestClient(app)
    assert client.get('/api/v1/resources').json()['mock'] == []
    assert client.post('/api/v1/mock/sessions', json={'paper_id': 'ets-test-1'}).status_code == 404
    assert not mock_exam.SESSION_DIR.exists()


def test_imported_paper_runs_without_optional_review_supplements(local_bank):
    import_test_paper(local_bank)
    client = TestClient(app)
    assert [paper['id'] for paper in client.get('/api/v1/resources').json()['mock']] == [
        'ets-test-1'
    ]
    created = client.post('/api/v1/mock/sessions', json={'paper_id': 'ets-test-1'})
    assert created.status_code == 200
    assert 'reference' not in json.dumps(created.json())
    result = mock_exam.build_completed_result(completed_session())
    assert result['objective_correct'] == result['objective_total'] == 1
    assert result['review'][0]['explanation'] is None
    assert result['review'][0]['accepted_alternatives'] == []
    assert '未安装本地学习解析' in result['notice']
    assert '未安装造句补充答案' in result['notice']


def test_existing_review_supplements_are_preserved(local_bank):
    import_test_paper(local_bank)
    write_json(
        local_bank / 'answers/mock/sentence-variants.json', {'fixture-1': {'answers': ['B']}}
    )
    write_json(
        local_bank / 'sources/mock_explanations/ets-test-1.json',
        {
            'explanations': {'fixture-1': 'Locally reviewed fixture note.'},
        },
    )
    session = completed_session()
    session['answers']['fixture-1'] = 'B'
    result = mock_exam.build_completed_result(session)
    assert result['objective_correct'] == 1
    assert result['review'][0]['explanation'] == 'Locally reviewed fixture note.'
    assert '未安装' not in result['notice']


def test_corrupt_existing_supplement_is_not_treated_as_absent(local_bank):
    import_test_paper(local_bank)
    path = local_bank / 'answers/mock/sentence-variants.json'
    path.write_text('{', encoding='utf-8')
    with pytest.raises(json.JSONDecodeError):
        mock_exam.build_completed_result(completed_session())
