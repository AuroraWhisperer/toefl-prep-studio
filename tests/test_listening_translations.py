import copy
import json
import re
from uuid import uuid4

from fastapi.testclient import TestClient

from backend import adaptive_test, history
from backend.app import app
from backend.question_store import store

client = TestClient(app)


def test_translations_cover_every_response_prompt():
    questions = store.questions_for('listening', 'bank', 'listen_choose_response')
    entries = store._read(store.question_root / 'sources' / 'listening_translations.json')
    translations = store.audio_translations(questions)
    assert len(translations) == len(questions) == 510
    assert entries.keys() == translations.keys()
    for question in questions:
        entry = entries[question['id']]
        assert entry['source'] == question['audio_text']
        assert re.search(r'[\u3400-\u9fff]', entry['translation'])
        assert not re.search(r'[\u200b\ufffd]|L\d+', entry['translation'])
    assert translations['L367'] == '我认为这个样本不能代表全班。'


def test_translations_are_private_and_legacy_review_is_read_only():
    params = {
        'section': 'listening',
        'mode': 'practice',
        'task_type': 'listen_choose_response',
        'count': 8,
    }
    exam = client.get('/api/v1/exam', params=params).json()
    assert 'translation' not in json.dumps(exam)
    record_id = str(uuid4())
    response = client.post(
        '/api/v1/exam/submit',
        json={
            **params,
            'question_ids': exam['question_ids'],
            'submission_id': record_id,
        },
    )
    assert response.status_code == 200
    translations = response.json()['audio_translations']
    assert set(translations) == set(exam['question_ids'])

    record = history.read_record(record_id)
    record['result'].pop('audio_translations')
    history.write_record(record)
    path = history.HISTORY_DIR / f'{record_id}.json'
    before = path.read_bytes()
    detail = client.get(f'/api/v1/history/practice/{record_id}').json()
    assert detail['audio_translations'] == translations
    assert detail['result'] == record['result']
    assert path.read_bytes() == before

    changed = copy.deepcopy(record)
    changed['questions'][0]['audio_text'] += ' A different recording.'
    history.write_record(changed)
    before = path.read_bytes()
    detail = client.get(f'/api/v1/history/practice/{record_id}').json()
    assert detail['audio_translations'] == {
        key: value for key, value in translations.items() if key != exam['question_ids'][0]
    }
    assert path.read_bytes() == before


def test_completed_adaptive_result_includes_audio_translations():
    questions = store.questions_for('listening', 'bank', 'listen_choose_response')[:8]
    session = {
        'phases': [{'questions': questions, 'level': 5}],
        'keys': {q['id']: store.answer(q['id']) for q in questions},
        'responses': {},
        'recordings': {},
        'profile': {},
        'level': 5,
        'routes': [],
    }
    result = adaptive_test.build_result(session)
    assert set(result['audio_translations']) == {q['id'] for q in questions}
    started = client.post('/api/v1/tests/sessions', json={'level': 5}).json()
    assert '"audio_translations"' not in json.dumps(started)
    assert '"translation"' not in json.dumps(started)
