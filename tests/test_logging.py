import logging

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend.logging_config import StaticAccessFilter


@pytest.mark.parametrize(
    'method,path,status,visible',
    [
        ('GET', '/frontend/app.js', 200, False),
        ('GET', '/frontend/styles.css?v=2', 304, False),
        ('HEAD', '/audio/prompt.mp3', 200, False),
        ('GET', '/frontend/missing.js', 404, True),
        ('GET', '/audio/prompt.mp3', 500, True),
        ('POST', '/frontend/app.js', 405, True),
        ('GET', '/api/v1/meta', 200, True),
        ('POST', '/api/v1/exam/submit', 422, True),
    ],
)
def test_access_logs_keep_api_requests_and_asset_failures(method, path, status, visible):
    record = logging.LogRecord(
        'uvicorn.access',
        logging.INFO,
        '',
        0,
        '%s - "%s %s HTTP/%s" %d',
        ('127.0.0.1:1234', method, path, '1.1', status),
        None,
    )
    assert StaticAccessFilter().filter(record) is visible


def test_submission_log_distinguishes_answered_and_total_without_answer_text(caplog):
    with TestClient(app) as client:
        selection = {
            'section': 'reading',
            'mode': 'practice',
            'task_type': 'complete_words',
            'count': 1,
        }
        question_ids = client.get('/api/v1/exam', params=selection).json()['question_ids']
        responses = [{'question_id': question_id, 'answer': None} for question_id in question_ids]
        responses[0]['answer'] = 'private practice answer'
        with caplog.at_level(logging.INFO, logger='toefl_trainer'):
            response = client.post(
                '/api/v1/exam/submit',
                json={
                    **selection,
                    'question_ids': question_ids,
                    'responses': responses,
                },
            )

    assert response.status_code == 200
    message = next(
        record.getMessage() for record in caplog.records if record.name == 'toefl_trainer'
    )
    for field in [
        'section=reading',
        'mode=practice',
        'task=complete_words',
        'received=10',
        'answered=1',
        'total=10',
        'elapsed_ms=',
    ]:
        assert field in message
    assert 'private practice answer' not in message
