import pytest
from fastapi.testclient import TestClient

from backend.app import app


@pytest.mark.parametrize(
    'path',
    [
        '/',
        '/practice/reading',
        '/practice/writing/run/example',
        '/exam/listening/example',
        '/history',
        '/history/practice/example',
        '/history/test/example',
        '/history/mock/example',
        '/tests',
        '/tests/example',
        '/mocks',
        '/mocks/ets-test-1',
        '/mocks/sessions/example',
    ],
)
def test_application_paths_serve_the_same_entry(path):
    client = TestClient(app)
    response = client.get(path)
    assert response.status_code == 200
    assert response.headers['content-type'].startswith('text/html')
    assert response.content == client.get('/').content


@pytest.mark.parametrize(
    'path',
    [
        '/api/v1/not-a-route',
        '/frontend/missing.js',
        '/question_bank/answers/reading.json',
        '/artifacts/practice-history/example.json',
        '/not-a-page',
    ],
)
def test_page_routes_do_not_mask_missing_apis_or_expose_private_files(path):
    assert TestClient(app).get(path).status_code == 404
