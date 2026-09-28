"""History consumes mock business functions, not HTTP handlers or timer mutations."""

from collections import Counter
import os
from pathlib import Path
import subprocess
import sys

import pytest
from fastapi.testclient import TestClient

from backend import mock_exam
from backend.app import app


client = TestClient(app)


def completed_session():
    response = client.post('/api/v1/mock/sessions', json={'paper_id': 'ets-test-1'})
    session = mock_exam.read_session(response.json()['id'])
    session.update(status='completed', phase_index=9, completed_at=100)
    mock_exam.persist(session)
    return session


def test_history_review_does_not_call_the_mock_route_handler(monkeypatch, local_mock_bank):
    session = completed_session()
    expected = client.get(f"/api/v1/mock/sessions/{session['id']}/result").json()

    def route_must_not_be_called(*args, **kwargs):
        raise AssertionError('History must call the shared business API')

    monkeypatch.setattr(mock_exam, 'result', route_must_not_be_called)
    assert client.get('/api/v1/history?category=mock').json()['total'] == 1
    actual = client.get(f"/api/v1/history/mock/{session['id']}").json()
    assert actual['result'] == expected


def test_mock_list_reads_each_snapshot_once_without_advancing_active_sessions(
    monkeypatch, local_mock_bank
):
    completed = [completed_session(), completed_session()]
    active = client.post('/api/v1/mock/sessions', json={'paper_id': 'ets-test-1'}).json()
    session = mock_exam.read_session(active['id'])
    session.update(phase_state='active', deadline=1)
    mock_exam.persist(session)
    path = mock_exam.SESSION_DIR / f"{session['id']}.json"
    before = path.read_bytes()
    read_session = mock_exam.read_session
    reads = Counter()

    def counted(session_id):
        reads[str(session_id)] += 1
        return read_session(session_id)

    monkeypatch.setattr(mock_exam, 'read_session', counted)
    listing = client.get('/api/v1/history?category=mock')
    assert listing.status_code == 200
    assert listing.json()['total'] == 2
    assert reads == {item['id']: 1 for item in [*completed, session]}
    assert path.read_bytes() == before


@pytest.mark.parametrize('mode', ['script', 'package'])
def test_both_startup_styles_assemble_the_same_local_app_without_binding_user_port(tmp_path, mode):
    root = Path(__file__).resolve().parents[1]
    code = '''
import runpy, sys
from pathlib import Path
from unittest.mock import patch
from fastapi.testclient import TestClient

def check(app, **options):
    assert options['host'] == '127.0.0.1'
    assert options['port'] == 38761
    client = TestClient(app)
    assert client.get('/').status_code == 200
    assert client.get('/api/v1/health').status_code == 200
    assert client.get('/api/v1/history').json()['total'] == 0

with patch('uvicorn.run', side_effect=check) as run:
    if sys.argv[1] == 'script':
        sys.path.insert(0, str(Path('backend').resolve()))
        runpy.run_path('backend/app.py', run_name='__main__')
    else:
        runpy.run_module('backend.app', run_name='__main__')
    assert run.call_count == 1
'''
    response = subprocess.run(
        [sys.executable, '-c', code, mode],
        cwd=root,
        env={**os.environ, 'TOEFL_DATA_DIR': str(tmp_path)},
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert response.returncode == 0, response.stderr
