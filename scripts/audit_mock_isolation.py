"""Flag copied question content between original practice and ETS mock papers."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SECTIONS = ('reading', 'listening', 'writing', 'speaking')


def words(text):
    return re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower().replace('’', "'"))


def audit():
    papers = {}
    for path in sorted((ROOT / 'question_bank' / 'mock').glob('ets-test-*.json')):
        paper = json.loads(path.read_text(encoding='utf-8'))
        texts = []
        for phase in paper['phases']:
            texts.extend(page['text'] for page in phase['pages'])
            texts.extend(item.get('audio_text', '') for item in phase['items'])
        tokens = [words(text) for text in texts]
        papers[paper['id']] = {
            'text': '\n'.join(' ' + ' '.join(row) + ' ' for row in tokens),
            'phrases': {' '.join(row[i:i + 14]) for row in tokens for i in range(len(row) - 13)},
        }
    counts, matches = {}, []
    for section in SECTIONS:
        folder = ROOT / 'question_bank'
        questions = json.loads((folder / section / 'questions.json').read_text(encoding='utf-8'))['questions']
        keys = json.loads((folder / 'answers' / f'{section}.json').read_text(encoding='utf-8'))
        counts[section] = len(questions)
        for question in questions:
            fields = {field: question[field] for field in ('passage', 'audio_text') if question.get(field)}
            if section == 'writing':
                fields['prompt'] = question['prompt'].splitlines()[0] if question['task_type'] == 'build_sentence' else question['prompt']
                if question['task_type'] == 'build_sentence':
                    for index, answer in enumerate(keys[question['id']]['accepted']):
                        fields[f'reference_{index}'] = answer
            for field, text in fields.items():
                text = re.sub(r'\{(R\d+)\}', lambda m: keys[m[1]]['reference'], text)
                tokens = words(text)
                if len(tokens) < 6:
                    continue
                size = min(14, len(tokens))
                phrases = [' '.join(tokens[i:i + size]) for i in range(len(tokens) - size + 1)]
                for paper_id, corpus in papers.items():
                    match = next((phrase for phrase in phrases if
                                  (phrase in corpus['phrases'] if size == 14 else ' ' + phrase + ' ' in corpus['text'])), None)
                    if match:
                        matches.append({'question_id': question['id'], 'field': field, 'paper': paper_id, 'phrase': match})
    return {'practice_counts': counts, 'paper_count': len(papers), 'matches': matches}


if __name__ == '__main__':
    print(json.dumps(audit(), ensure_ascii=False, indent=2))
