import os
import re

import pytest
from fastapi.testclient import TestClient

from backend.app import FrontendFiles, app


@pytest.mark.parametrize(
    'path',
    [
        '/',
        '/guide',
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
    assert response.headers['cache-control'] == 'no-store'
    assert response.content == client.get('/').content


def test_frontend_assets_need_no_version_numbers_or_browser_cache():
    client = TestClient(app)
    assets = re.findall(r'(?:href|src)="(/frontend/[^"]+)"', client.get('/').text)
    assert assets
    for path in assets + ['/frontend/index.html', '/frontend/fonts/cormorant-garamond-toefl.ttf']:
        assert '?' not in path
        response = client.get(path)
        assert response.status_code == 200
        assert response.headers['cache-control'] == 'no-store'


@pytest.mark.parametrize('extension', ['css', 'js'])
def test_frontend_updates_at_the_same_url_despite_old_cache_validators(tmp_path, extension):
    asset = tmp_path / f'example.{extension}'
    asset.write_text('/* old */', encoding='utf-8')
    client = TestClient(FrontendFiles(directory=tmp_path))
    original = client.get(f'/example.{extension}')
    stat = asset.stat()

    # Same-size edits within a timestamp tick must not reuse the previous body.
    asset.write_text('/* new */', encoding='utf-8')
    os.utime(asset, ns=(stat.st_atime_ns, stat.st_mtime_ns))
    for headers in (
        {},
        {'If-None-Match': original.headers['etag']},
        {'If-Modified-Since': original.headers['last-modified']},
    ):
        response = client.get(f'/example.{extension}', headers=headers)
        assert response.status_code == 200
        assert response.headers['cache-control'] == 'no-store'
        assert response.text == '/* new */'


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
