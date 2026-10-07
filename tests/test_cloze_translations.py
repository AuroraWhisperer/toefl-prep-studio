import copy
import json
import re
from uuid import uuid4

from fastapi.testclient import TestClient

from backend import adaptive_test, history
from backend.app import app
from backend.question_store import material_groups, store

client = TestClient(app)


def test_translations_cover_every_intact_cloze_passage():
    entries = store._read(store.question_root / 'sources' / 'cloze_translations.json')
    groups = material_groups(store.questions_for('reading', 'bank', 'complete_words'))
    assert len(entries) == len(groups) == 270
    assert entries.keys() == groups.keys()
    for group_id, questions in groups.items():
        source = re.sub(
            r'\{(R\d+)\}',
            lambda match: store.answer(match[1])['reference'],
            questions[0]['passage'],
        )
        assert entries[group_id]['source'] == source
        assert len(re.findall(r'[\u3400-\u9fff]', entries[group_id]['translation'])) > 80
        assert not re.search(r'\{R\d+\}|[\u200b\ufffd]', entries[group_id]['translation'])


def test_translations_are_private_until_submission_and_support_legacy_history():
    params = {'section': 'reading', 'mode': 'practice', 'task_type': 'complete_words', 'count': 1}
    exam = client.get('/api/v1/exam', params=params).json()
    assert 'translation' not in json.dumps(exam)
    record_id = str(uuid4())
    result = client.post(
        '/api/v1/exam/submit',
        json={**params, 'question_ids': exam['question_ids'], 'submission_id': record_id},
    ).json()
    group_id = exam['questions'][0]['group_id']
    translations = result['passage_translations']
    assert list(translations) == [group_id]
    # Old archives have no translations; the read overlay must leave their bytes untouched.
    record = history.read_record(record_id)
    record['result'].pop('passage_translations')
    history.write_record(record)
    path = history.HISTORY_DIR / f'{record_id}.json'
    before = path.read_bytes()
    detail = client.get(f'/api/v1/history/practice/{record_id}').json()
    assert detail['passage_translations'] == translations
    assert detail['result'] == record['result']
    assert path.read_bytes() == before

    for change in ('passage', 'reference_answer'):
        changed = copy.deepcopy(record)
        if change == 'passage':
            for question in changed['questions']:
                question['passage'] += ' A different version.'
        else:
            changed['result']['feedback'][0]['reference_answer'] = 'changed'
        history.write_record(changed)
        before = path.read_bytes()
        detail = client.get(f'/api/v1/history/practice/{record_id}').json()
        assert detail['passage_translations'] == {}
        assert path.read_bytes() == before


def test_completed_adaptive_result_includes_matching_translations():
    questions = next(
        iter(material_groups(store.questions_for('reading', 'bank', 'complete_words')).values())
    )
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
    assert list(result['passage_translations']) == [questions[0]['group_id']]
    started = client.post('/api/v1/tests/sessions', json={'level': 5}).json()
    assert 'translation' not in json.dumps(started)
