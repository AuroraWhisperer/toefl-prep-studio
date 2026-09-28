"""Extract computer-readable controls from the original PDF, never answer keys."""

import re


BLANK = re.compile(r'\(\s*(\d+)\s+blank\s+lines?\s*\)|_(?:\s*_)*')
SENTENCE_BLANK = re.compile(r'\(\s*(\d+)\s+blank\s+lines?\s*\)|_{2,}')


def compact(text):
    return ' '.join(text.split())


def paragraphs(text):
    return '\n\n'.join(compact(p) for p in re.split(r'\n\s*\n', text.strip()) if p.strip())


def source_text(page):
    # Geometric sorting interleaves PDF accessibility spans and corrupts blanks.
    return '\n'.join(
        line.strip().replace('\u00a0', ' ')
        for line in page.get_text(sort=False).splitlines()
        if 'TOEFL iBT' not in line
        and not re.fullmatch(r'\s*\d+\s*', line)
        and not re.fullmatch(r'\s*(Reading|Writing) Section(?:, Module [12])?\s*', line)
    ).strip()


def reading(phase, page_texts):
    items = {q['number']: q for q in phase['items']}
    text = page_texts[0]
    headings = list(re.finditer(r'(?m)^Read (?:a|an|the) [^\n]+', text))
    assert headings, phase['id']
    cloze = re.split(r'\(Questions\s+1\s*[-–]\s*10\)', text[: headings[0].start()], maxsplit=1)[
        1
    ].strip()
    matches = list(BLANK.finditer(cloze))
    assert len(matches) == 10, (phase['id'], 'cloze', len(matches))
    parts, cursor = [], 0
    for number, match in enumerate(matches, 1):
        part = compact(cloze[cursor : match.start()])
        if cursor and part and not part.startswith((',', '.', ';', ':')):
            part = ' ' + part
        parts.append(part)
        items[number]['blank_length'] = int(match[1]) if match[1] else match[0].count('_')
        cursor = match.end()
    tail = compact(cloze[cursor:])
    parts.append((' ' if tail and tail[0].isalnum() else '') + tail)
    phase['cloze_parts'] = parts
    found, material, label = [], '', ''
    for page_number, text in enumerate(page_texts):
        if page_number == 0:
            text = text[headings[0].start() :]
        blocks = re.split(r'(?m)(?=^Read (?:a|an|the) [^\n]+)', text)
        for block in blocks:
            questions = list(re.finditer(r'(?m)^\s*(1[1-9]|20)\.\s*', block))
            if not questions:
                continue
            prefix = block[: questions[0].start()].strip()
            if prefix:
                lines = prefix.splitlines()
                is_heading = lines[0].startswith('Read ')
                label = lines[0] if is_heading else 'Read an Academic Passage'
                material = paragraphs('\n'.join(lines[1:]) if is_heading else prefix)
            assert material, (phase['id'], 'missing material')
            for j, question in enumerate(questions):
                number = int(question[1])
                body = block[
                    question.end() : questions[j + 1].start()
                    if j + 1 < len(questions)
                    else len(block)
                ]
                pieces = re.split(r'\([ABCD]\)\s*', body)
                assert len(pieces) == 5 and number in items, (phase['id'], number, pieces)
                items[number].update(
                    prompt=compact(pieces[0]),
                    options=[compact(v) for v in pieces[1:]],
                    material=material,
                    material_heading=label,
                )
                found.append(number)
    assert found == list(range(11, 21)), (phase['id'], found)


def sentences(phase, text):
    questions = list(re.finditer(r'(?m)^\s*(\d{1,2})\.\s+', text))
    assert [int(q[1]) for q in questions] == list(range(1, 11)), phase['id']
    for i, question in enumerate(questions):
        block = text[
            question.end() : questions[i + 1].start() if i + 1 < len(questions) else len(text)
        ]
        lines = block.splitlines()
        frame_start = next(j for j, line in enumerate(lines) if SENTENCE_BLANK.search(line))
        bank_start = next(j for j, line in enumerate(lines) if '/' in line)
        prompt = compact(' '.join(lines[:frame_start]))
        frame = compact(' '.join(lines[frame_start:bank_start]))
        tokens = [compact(t) for t in ' '.join(lines[bank_start:]).split('/')]
        parts, cursor = [], 0
        for match in SENTENCE_BLANK.finditer(frame):
            parts.append(frame[cursor : match.start()])
            count = int(match[1]) if match[1] else 1
            parts.extend([' '] * (count - 1))
            cursor = match.end()
        parts.append(frame[cursor:])
        # Test 3 prints seven slots, but its official key uses six word groups
        # and leaves the distractor 'plan' unused. Preserve the words, not that
        # extra paper underline, in the computer-based controls.
        if phase['id'] == 'ets-test-3-writing-sentence' and i == 0:
            assert len(parts) == 8 and tokens == [
                'you',
                'which',
                'planning',
                'countries',
                'in Europe',
                'are',
                'plan',
            ]
            parts.pop(1)
        assert prompt and 1 < len(parts) <= len(tokens) + 1 and all(tokens), (phase['id'], i + 1)
        phase['items'][i].update(prompt=prompt, template_parts=parts, word_tokens=tokens)


def enrich_paper(paper, document):
    for phase in paper['phases']:
        page_texts = [source_text(document[p['page'] - 1]) for p in phase['pages']]
        text = '\n\n'.join(page_texts)
        if phase['section'] == 'reading':
            reading(phase, page_texts)
        elif phase['items'][0]['kind'] == 'sentence':
            sentences(phase, text)
        elif phase['section'] == 'writing':
            phase['items'][0]['prompt'] = paragraphs(text)
    paper['presentation_version'] = 2
    return paper
