"""Import the five ETS paper forms without mixing them into practice.

Download the linked PDFs to artifacts/ets-reference/test-{1..5}.pdf first.
Run with the development PyMuPDF dependency; runtime only reads JSON and PNGs.
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import pymupdf

try:
    from .mock_question_screens import enrich_paper
except ImportError:
    from mock_question_screens import enrich_paper

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'question_bank' / 'mock'
SOURCE = ROOT / 'artifacts' / 'ets-reference'


def clean(page):
    lines = []
    for line in page.get_text(sort=True).splitlines():
        line = line.strip().replace('\u00a0', ' ')
        if 'TOEFL iBT' in line or re.fullmatch(r'\d+', line):
            continue
        if re.fullmatch(r'(Reading|Listening|Writing|Speaking) Section(?:, Module [12])?', line):
            continue
        lines.append(line)
    return '\n'.join(lines).strip()


def answer_key(page):
    table = page.find_tables().tables[0]
    split = table.rows[0].cells[0][2]
    words = page.get_text('words')
    numbers = sorted(
        [
            w
            for w in words
            if w[2] < split
            and w[0] >= table.bbox[0]
            and table.bbox[1] < w[1] < table.bbox[3]
            and w[4].isdigit()
        ],
        key=lambda w: w[1],
    )
    answers = {}
    for i, word in enumerate(numbers):
        bottom = numbers[i + 1][1] - 1 if i + 1 < len(numbers) else table.bbox[3]
        clip = pymupdf.Rect(split, word[1] - 1, table.bbox[2], bottom)
        answers[int(word[4])] = ' '.join(page.get_text(clip=clip, sort=True).split())
    assert list(answers) == list(range(1, len(answers) + 1)), answers
    assert all(answers.values()), answers
    return answers


def listening_items(text, keys, prefix):
    text = re.sub(r'\n(?=\d+\.\s)', '\n\n', text)
    # Blank paragraphs delimit the final option, including questions without printed numbers.
    option_pattern = re.compile(
        r'\(A\)\s*(.*?)\(B\)\s*(.*?)\(C\)\s*(.*?)\(D\)\s*([^\n]*(?:\n(?!\s*\n)[^\n]+)*)(?=\n\s*\n|$)',
        re.S,
    )
    items, cursor, audio, group = [], 0, '', 0
    for match in option_pattern.finditer(text):
        lead = text[cursor : match.start()].strip()
        paragraphs = re.split(r'\n\s*\n', lead)
        prompt = re.sub(r'^\d+\.\s*', '', paragraphs[-1]).strip()
        if re.match(r'(Man|Woman):', prompt):
            audio = re.sub(r'^(Man|Woman):\s*', '', prompt)
            prompt = 'Choose the best response.'
            group += 1
        elif re.search(r'Listen to (?:a|an) ', lead):
            before_prompt = '\n\n'.join(paragraphs[:-1])
            audio = re.split(r'Listen to (?:a|an) [^\n]+', before_prompt, maxsplit=1)[1].strip()
            group += 1
        assert audio and prompt, (prefix, lead)
        number = len(items) + 1
        items.append(
            {
                'id': f'{prefix}-{number}',
                'number': number,
                'kind': 'choice',
                'prompt': ' '.join(prompt.split()),
                'options': [' '.join(v.split()) for v in match.groups()],
                'audio_text': ' '.join(audio.split()),
                'audio_group': f'{prefix}-audio-{group}',
            }
        )
        cursor = match.end()
    assert len(items) == len(keys), (prefix, len(items), len(keys), text[cursor:])
    assert all(len(q['options']) == 4 and all(q['options']) for q in items)
    return items


def import_paper(number):
    path = SOURCE / f'test-{number}.pdf'
    doc = pymupdf.open(path)
    paper_id = f'ets-test-{number}'
    pages, keys, section, module = {}, {}, None, None
    for index, page in enumerate(doc):
        text = page.get_text()
        heading = re.search(
            r'(Reading|Listening|Writing|Speaking) Section(?:, Module ([12]))?', text
        )
        if heading:
            section = heading[1].lower()
            if heading[2]:
                module = int(heading[2])
        if 'Answer Key' in text:
            keys[(section, module if section in ('reading', 'listening') else 0)] = answer_key(page)
        elif section:
            pages.setdefault(
                (section, module if section in ('reading', 'listening') else 0), []
            ).append(index)
    phases, private = [], {}
    asset_dir = OUTPUT / 'pages' / paper_id
    asset_dir.mkdir(parents=True, exist_ok=True)

    def image(index):
        name = f'page-{index + 1}.png'
        doc[index].get_pixmap(matrix=pymupdf.Matrix(1.45, 1.45)).save(asset_dir / name)
        return {
            'url': f'/mock-pages/{paper_id}/{name}',
            'page': index + 1,
            'text': clean(doc[index]),
        }

    for section in ('reading', 'listening'):
        for module in (1, 2):
            prefix = f'{paper_id}-{section}-{module}'
            answer = keys[(section, module)]
            selected = [
                i
                for i in pages[(section, module)]
                if 'In an actual test, the clock' not in doc[i].get_text()
            ]
            phase = {
                'id': prefix,
                'section': section,
                'module': module,
                'title': f'{section.title()} · Module {module}',
                'seconds': 900 if section == 'reading' else 870,
                'pages': [],
                'items': [],
            }
            if section == 'reading':
                phase['pages'] = [image(i) for i in selected]
                phase['items'] = [
                    {
                        'id': f'{prefix}-{n}',
                        'number': n,
                        'kind': 'choice' if value in 'ABCD' and len(value) == 1 else 'letters',
                    }
                    for n, value in answer.items()
                ]
            else:
                phase['items'] = listening_items(
                    '\n\n'.join(clean(doc[i]) for i in selected), answer, prefix
                )
            private.update({f'{prefix}-{n}': value for n, value in answer.items()})
            phases.append(phase)

    writing_pages = pages[('writing', 0)]
    sentence, email, discussion = [], [], []
    bucket = sentence
    for i in writing_pages:
        text = doc[i].get_text()
        if 'Type of Task' in text:
            continue
        if 'Write an Email' in text:
            bucket = email
        elif 'Write for an Academic Discussion' in text:
            bucket = discussion
        bucket.append(i)
    for task, chosen, seconds in [
        ('sentence', sentence, 360),
        ('email', email, 420),
        ('discussion', discussion, 600),
    ]:
        assert chosen, (number, task)
        prefix = f'{paper_id}-writing-{task}'
        items = [
            {'id': f'{prefix}-{n}', 'number': n, 'kind': task}
            for n in (range(1, 11) if task == 'sentence' else [1])
        ]
        phases.append(
            {
                'id': prefix,
                'section': 'writing',
                'title': {
                    'sentence': 'Build a Sentence',
                    'email': 'Write an Email',
                    'discussion': 'Academic Discussion',
                }[task],
                'seconds': seconds,
                'pages': [image(i) for i in chosen],
                'items': items,
            }
        )
        if task == 'sentence':
            private.update({f'{prefix}-{n}': value for n, value in keys[('writing', 0)].items()})

    for task, role in [('repeat', 'Trainer'), ('interview', 'Interviewer')]:
        text = '\n'.join(
            clean(doc[i]) for i in pages[('speaking', 0)] if f'{role}:' in doc[i].get_text()
        )
        utterances = re.split(rf'{role}:\s*', text)[1:]
        assert len(utterances) == (7 if task == 'repeat' else 4), (number, task, len(utterances))
        items = []
        for n, utterance in enumerate(utterances, 1):
            utterance = ' '.join(utterance.split())
            items.append(
                {
                    'id': f'{paper_id}-speaking-{task}-{n}',
                    'number': n,
                    'kind': 'recording',
                    'audio_text': utterance,
                    'audio_group': f'speaking-{task}-{n}',
                    'response_seconds': (
                        [8, 8, 10, 10, 12, 12, 12][n - 1] if task == 'repeat' else 45
                    ),
                }
            )
        phases.append(
            {
                'id': f'{paper_id}-speaking-{task}',
                'section': 'speaking',
                'title': 'Listen and Repeat' if task == 'repeat' else 'Take an Interview',
                'seconds': 180 if task == 'repeat' else 300,
                'items': items,
                'pages': [],
            }
        )
    paper = {
        'id': paper_id,
        'title': f'ETS Practice Test {number}',
        'number': number,
        'source_url': f'https://www.ets.org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-{number}.pdf',
        'source_sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'phases': phases,
    }
    enrich_paper(paper, doc)
    (OUTPUT / f'{paper_id}.json').write_text(
        json.dumps(paper, ensure_ascii=False, indent=2), encoding='utf-8'
    )
    answers_dir = ROOT / 'question_bank' / 'answers' / 'mock'
    answers_dir.mkdir(parents=True, exist_ok=True)
    (answers_dir / f'{paper_id}.json').write_text(
        json.dumps(private, ensure_ascii=False, indent=2), encoding='utf-8'
    )
    print(paper_id, [(p['title'], len(p['items'])) for p in phases])
    return paper


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--structured-only', action='store_true')
    args = parser.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for number in range(1, 6):
        if args.structured_only:
            target = OUTPUT / f'ets-test-{number}.json'
            paper = json.loads(target.read_text(encoding='utf-8'))
            with pymupdf.open(SOURCE / f'test-{number}.pdf') as document:
                enrich_paper(paper, document)
            target.write_text(json.dumps(paper, ensure_ascii=False, indent=2), encoding='utf-8')
            print(target.name, 'structured question screens updated')
        else:
            import_paper(number)
