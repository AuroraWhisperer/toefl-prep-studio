"""Build the public question bank and private answer keys.

The prompts are original practice material written for this project.  The
public files intentionally contain no answer field; the answer files are only
loaded by the FastAPI service.
"""

from __future__ import annotations

import json
import random
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
QUESTION_ROOT = ROOT / "question_bank"
# Also support the documented direct-script entry point.
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from question_bank.sources import (
    base_productive,
    daily_life_long,
    expanded_reading,
    expanded_listening,
    expanded_productive,
)
from question_bank.sources.writing_samples import WRITING_SAMPLES
from question_bank.sources.sentence_answers import CONTEXTS, ALTERNATIVES, FRAMES
from question_bank.sources.timing import SOURCES, TASK_TIMING, task_timing
from question_bank.sources.practice_structure import DIFFICULTY_POLICY, TASK_STRUCTURE
from scripts.question_bank_review import apply_review, write_catalogue
from question_bank.sources.receptive_items import (
    CLOZE_PASSAGES,
    DAILY_PASSAGES,
    ACADEMIC_PASSAGES,
    RESPONSE_ITEMS,
    CONVERSATIONS,
    ANNOUNCEMENTS,
    TALKS,
)


EXPANSION_TASKS = {
    'reading': ('complete_words', 'read_daily_life', 'read_academic_passage'),
    'listening': (
        'listen_choose_response',
        'listen_conversation',
        'listen_announcement',
        'listen_academic_talk',
    ),
    'writing': ('build_sentence', 'write_email', 'academic_discussion'),
    'speaking': ('listen_repeat', 'take_interview'),
}


def expansion_records(section: str) -> list[dict]:
    records = []
    for task in EXPANSION_TASKS[section]:
        path = QUESTION_ROOT / 'sources' / 'expansion_2026_09' / f'{task}.json'
        source = json.loads(path.read_text(encoding='utf-8'))
        if source['section'] != section or source['task_type'] != task:
            raise ValueError(f'Expansion source has the wrong section or task: {path.name}')
        for record in source['items']:
            question = record['question']
            if question['section'] != section or question['task_type'] != task:
                raise ValueError(f'Expansion item has the wrong section or task: {question["id"]}')
            records.append(record)
    return sorted(records, key=lambda record: int(record['question']['id'][1:]))


def append_expansion(questions: list[dict], answers: dict, section: str) -> None:
    for record in expansion_records(section):
        question = record['question']
        expected_id = f'{section[0].upper()}{len(questions) + 1:02d}'
        if question['id'] != expected_id or question['id'] in answers:
            raise ValueError(f'Expansion must append consecutive new IDs: expected {expected_id}')
        add(questions, answers, question, record['answer'])


def make_question(
    question_id: str,
    section: str,
    task_type: str,
    prompt: str,
    response_type: str,
    **extra: object,
) -> dict:
    item = {
        "id": question_id,
        "section": section,
        "task_type": task_type,
        "prompt": prompt,
        "response_type": response_type,
    }
    item.update(extra)
    return item


def add(
    questions: list[dict],
    answers: dict[str, dict],
    question: dict,
    answer: dict,
) -> None:
    questions.append(question)
    answers[question["id"]] = answer


def add_choice_groups(questions, answers, section, task_type, groups, start=1, shuffle=False):
    for group_index, (title, material, items) in enumerate(groups, start):
        for prompt, options, correct_index, explanation in items:
            question_id = f"{section[0].upper()}{len(questions) + 1:02d}"
            # Position labels refer to marked locations, so keep them aligned with the option letters.
            position_options = options == [f"Position [{letter}]" for letter in "ABCD"]
            if shuffle and not position_options:
                correct = options[correct_index]
                options = options.copy()
                random.Random(question_id).shuffle(options)
                correct_index = options.index(correct)
            field = "passage" if section == "reading" else "audio_text"
            add(
                questions,
                answers,
                make_question(
                    question_id,
                    section,
                    task_type,
                    prompt,
                    "choice",
                    group_id=f"{task_type}_{group_index}",
                    passage_title=title,
                    options=options,
                    **{field: material},
                ),
                {"type": "choice", "correct_index": correct_index, "explanation": explanation},
            )


def add_cloze_groups(questions, answers, groups, start=1):
    explanations = json.loads(
        (QUESTION_ROOT / 'sources' / 'cloze_explanations.json').read_text(encoding='utf-8')
    )
    for group_index, (title, text) in enumerate(groups, start):
        blanks = []

        def mask(match):
            word = match.group(1)
            question_id = f"R{len(questions) + len(blanks) + 1:02d}"
            prefix = word[: len(word) // 2]
            blanks.append((question_id, word, prefix))
            return "{" + question_id + "}"

        passage = re.sub(r"\{\{([A-Za-z]+)\}\}", mask, text)
        if len(blanks) != 10:
            raise ValueError(f"Expected 10 blanks in {title}, got {len(blanks)}")
        for question_id, word, prefix in blanks:
            suffix = word[len(prefix) :]
            add(
                questions,
                answers,
                make_question(
                    question_id,
                    "reading",
                    "complete_words",
                    "Fill in the missing letters in the paragraph.",
                    "short_text",
                    group_id=f"cloze_{group_index}",
                    passage_title=title,
                    passage=passage,
                    prefix=prefix,
                    missing_length=len(suffix),
                    max_answer_length=len(suffix),
                ),
                {
                    "type": "text",
                    "accepted": [word, suffix],
                    "reference": word,
                    "explanation": explanations[question_id],
                },
            )


def apply_productive_explanations(questions, answers):
    explanations = json.loads(
        (QUESTION_ROOT / 'sources' / 'productive_explanations.json').read_text(encoding='utf-8')
    )
    for question in questions:
        key = answers[question['id']]
        if question['task_type'] == 'take_interview':
            # Keep the existing reference points separate from the new teaching notes.
            key['reference'] = key['explanation']
        key['explanation'] = explanations[question['id']]


def build_reading() -> tuple[list[dict], dict[str, dict]]:
    questions, answers = [], {}
    add_cloze_groups(questions, answers, CLOZE_PASSAGES)
    add_choice_groups(questions, answers, "reading", "read_daily_life", DAILY_PASSAGES)
    add_choice_groups(questions, answers, "reading", "read_academic_passage", ACADEMIC_PASSAGES)
    add_cloze_groups(questions, answers, expanded_reading.CLOZE_PASSAGES, start=4)
    add_choice_groups(
        questions,
        answers,
        "reading",
        "read_daily_life",
        expanded_reading.DAILY_PASSAGES,
        start=6,
        shuffle=True,
    )
    add_choice_groups(
        questions,
        answers,
        "reading",
        "read_academic_passage",
        expanded_reading.ACADEMIC_PASSAGES,
        start=3,
        shuffle=True,
    )
    add_choice_groups(
        questions,
        answers,
        "reading",
        "read_daily_life",
        daily_life_long.DAILY_PASSAGES,
        start=26,
        shuffle=True,
    )
    for question in questions:
        if question["task_type"] == "read_daily_life":
            title = question["passage_title"].lower()
            question["document_type"] = next(
                (
                    kind
                    for word, kind in [
                        ("agenda", "agenda"),
                        ("flyer", "flyer"),
                        ("email", "email"),
                        ("messages", "messages"),
                        ("schedule", "agenda"),
                        ("menu", "menu"),
                    ]
                    if word in title
                ),
                "notice",
            )
    append_expansion(questions, answers, 'reading')
    return questions, answers


def build_listening() -> tuple[list[dict], dict[str, dict]]:
    questions, answers = [], {}
    for index, (audio_text, options, correct_index, explanation) in enumerate(RESPONSE_ITEMS, 1):
        add(
            questions,
            answers,
            make_question(
                f"L{index:02d}",
                "listening",
                "listen_choose_response",
                "Choose the best response to the speaker.",
                "choice",
                audio_text=audio_text,
                options=options,
            ),
            {"type": "choice", "correct_index": correct_index, "explanation": explanation},
        )
    add_choice_groups(questions, answers, "listening", "listen_conversation", CONVERSATIONS)
    add_choice_groups(questions, answers, "listening", "listen_announcement", ANNOUNCEMENTS)
    add_choice_groups(questions, answers, "listening", "listen_academic_talk", TALKS)
    for audio_text, options, correct_index, explanation in expanded_listening.RESPONSE_ITEMS:
        question_id = f"L{len(questions) + 1:02d}"
        correct = options[correct_index]
        options = options.copy()
        random.Random(question_id).shuffle(options)
        add(
            questions,
            answers,
            make_question(
                question_id,
                "listening",
                "listen_choose_response",
                "Choose the best response to the speaker.",
                "choice",
                audio_text=audio_text,
                options=options,
            ),
            {"type": "choice", "correct_index": options.index(correct), "explanation": explanation},
        )
    add_choice_groups(
        questions,
        answers,
        "listening",
        "listen_conversation",
        expanded_listening.CONVERSATIONS,
        start=6,
        shuffle=True,
    )
    add_choice_groups(
        questions,
        answers,
        "listening",
        "listen_announcement",
        expanded_listening.ANNOUNCEMENTS,
        start=5,
        shuffle=True,
    )
    add_choice_groups(
        questions,
        answers,
        "listening",
        "listen_academic_talk",
        expanded_listening.TALKS,
        start=4,
        shuffle=True,
    )
    append_expansion(questions, answers, 'listening')
    return questions, answers


def build_speaking() -> tuple[list[dict], dict[str, dict]]:
    questions: list[dict] = []
    answers: dict[str, dict] = {}

    repeats = base_productive.REPEATS
    for index, sentence in enumerate(repeats[:7], start=1):
        question_id = f"S{index:02d}"
        add(
            questions,
            answers,
            make_question(
                question_id,
                "speaking",
                "listen_repeat",
                "Listen to the sentence, then repeat it once as accurately and clearly as possible.",
                "recording_text",
                audio_text=sentence,
                max_seconds=8 if index <= 2 else 10 if index <= 4 else 12,
            ),
            {
                "type": "repeat",
                "reference": sentence,
                "keywords": sentence.lower().replace(".", "").split(),
                "explanation": "A strong response preserves the wording and remains intelligible.",
            },
        )

    interviews = base_productive.INTERVIEWS
    for question_id, prompt, keywords, explanation in interviews[:4]:
        add(
            questions,
            answers,
            make_question(
                question_id,
                "speaking",
                "take_interview",
                prompt,
                "recording_text",
                audio_text=f"Interviewer: {prompt}",
                max_seconds=45,
            ),
            {
                "type": "subjective",
                "keywords": keywords,
                "min_words": 20,
                "max_score": 5,
                "explanation": explanation,
            },
        )
    for question in questions:
        question["group_id"] = f"{question['task_type']}_1"
        question["passage_title"] = (
            "The learning center" if question["task_type"] == "listen_repeat" else "Study habits"
        )
    for group_index, (title, sentences) in enumerate(expanded_productive.REPEAT_SETS, 2):
        for position, sentence in enumerate(sentences):
            question_id = f"S{len(questions) + 1:02d}"
            add(
                questions,
                answers,
                make_question(
                    question_id,
                    "speaking",
                    "listen_repeat",
                    "Listen to the sentence, then repeat it as accurately and clearly as possible.",
                    "recording_text",
                    audio_text=sentence,
                    group_id=f"listen_repeat_{group_index}",
                    passage_title=title,
                    max_seconds=8 if position < 2 else 10 if position < 4 else 12,
                ),
                {
                    "type": "repeat",
                    "reference": sentence,
                    "explanation": "Preserve the words and their order. Replay the prompt and compare any omitted phrases.",
                },
            )
    for group_index, (title, items) in enumerate(expanded_productive.INTERVIEW_SETS, 2):
        for prompt, keywords, explanation in items:
            question_id = f"S{len(questions) + 1:02d}"
            add(
                questions,
                answers,
                make_question(
                    question_id,
                    "speaking",
                    "take_interview",
                    prompt,
                    "recording_text",
                    audio_text=f"Interviewer: {prompt}",
                    group_id=f"take_interview_{group_index}",
                    passage_title=title,
                    max_seconds=45,
                ),
                {
                    "type": "subjective",
                    "keywords": keywords,
                    "min_words": 20,
                    "max_score": 5,
                    "explanation": explanation,
                },
            )
    apply_productive_explanations(questions, answers)
    append_expansion(questions, answers, 'speaking')
    return questions, answers


def build_writing() -> tuple[list[dict], dict[str, dict]]:
    questions: list[dict] = []
    answers: dict[str, dict] = {}

    sentence_items = base_productive.SENTENCE_ITEMS
    for question_id, word_bank, prompt, expected in sentence_items:
        word_bank = word_bank.copy()
        random.Random(question_id).shuffle(word_bank)
        add(
            questions,
            answers,
            make_question(
                question_id, "writing", "build_sentence", prompt, "sentence", word_bank=word_bank
            ),
            {
                "type": "sentence",
                "accepted": [expected],
                "explanation": "Check word order, capitalization, and punctuation.",
            },
        )

    emails = base_productive.EMAILS
    for question_id, prompt, keywords, explanation in emails:
        add(
            questions,
            answers,
            make_question(
                question_id,
                "writing",
                "write_email",
                prompt,
                "essay",
                word_limit={"min": 100},
                max_seconds=420,
            ),
            {
                "type": "subjective",
                "keywords": keywords,
                "min_words": 100,
                "max_score": 5,
                "reference": WRITING_SAMPLES[question_id],
                "explanation": explanation,
            },
        )

    discussions = base_productive.DISCUSSIONS
    for question_id, prompt, keywords, explanation in discussions:
        add(
            questions,
            answers,
            make_question(
                question_id,
                "writing",
                "academic_discussion",
                prompt,
                "essay",
                word_limit={"min": 100},
                max_seconds=600,
            ),
            {
                "type": "subjective",
                "keywords": keywords,
                "min_words": 100,
                "max_score": 5,
                "reference": WRITING_SAMPLES[question_id],
                "explanation": explanation,
            },
        )
    for sentence, explanation in expanded_productive.SENTENCES:
        question_id = f"W{len(questions) + 1:02d}"
        word_bank = re.findall(r"[A-Za-z]+(?:[-'][A-Za-z]+)*", sentence)
        random.Random(question_id).shuffle(word_bank)
        add(
            questions,
            answers,
            make_question(
                question_id,
                "writing",
                "build_sentence",
                "Arrange the words to make a complete sentence or question.",
                "sentence",
                word_bank=word_bank,
            ),
            {"type": "sentence", "accepted": [sentence], "explanation": explanation},
        )
    for prompt, keywords, reference in expanded_productive.EMAILS:
        question_id = f"W{len(questions) + 1:02d}"
        add(
            questions,
            answers,
            make_question(
                question_id,
                "writing",
                "write_email",
                prompt,
                "essay",
                word_limit={"min": 100},
                max_seconds=420,
            ),
            {
                "type": "subjective",
                "keywords": keywords,
                "min_words": 100,
                "reference": reference,
                "explanation": "Address every request in the situation, give specific details, and use a greeting and closing appropriate to the recipient. The sample illustrates one possible response.",
            },
        )
    for topic, view_a, view_b, keywords, reference in expanded_productive.DISCUSSIONS:
        question_id = f"W{len(questions) + 1:02d}"
        prompt = f"Professor: {topic}\nStudent A: {view_a}\nStudent B: {view_b}\n\nWrite a post stating and supporting your view. Contribute an idea to the discussion."
        add(
            questions,
            answers,
            make_question(
                question_id,
                "writing",
                "academic_discussion",
                prompt,
                "essay",
                word_limit={"min": 100},
                max_seconds=600,
            ),
            {
                "type": "subjective",
                "keywords": keywords,
                "min_words": 100,
                "reference": reference,
                "explanation": "State your position, engage with a point in the discussion, and develop a reason with a concrete example. Other well-supported positions are valid.",
            },
        )
    for question in questions:
        if question['task_type'] == 'build_sentence':
            frame, extra = FRAMES[question['id']]
            groups = re.findall(r'\{([^{}]+)\}', frame)
            question['template_parts'] = re.split(r'\{[^{}]+\}', frame)
            question['word_bank'] = groups + ([extra] if extra else [])
            random.Random(question['id']).shuffle(question['word_bank'])
            question['instruction'] = 'Make an appropriate sentence.'
            question['prompt'] = CONTEXTS[question['id']]
            answers[question['id']]['accepted'].extend(ALTERNATIVES.get(question['id'], []))
        elif question['task_type'] == 'write_email':
            question['word_limit'] = {'recommended_min': 100}
    apply_productive_explanations(questions, answers)
    append_expansion(questions, answers, 'writing')
    return questions, answers


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    review_notes = json.loads(
        (QUESTION_ROOT / 'sources' / 'review_notes.json').read_text(encoding='utf-8')
    )
    for section in EXPANSION_TASKS:
        for record in expansion_records(section):
            question_id = record['question']['id']
            sealed = review_notes.get(question_id, {})
            if record['review'] != {
                key: value for key, value in sealed.items() if key != 'content_sha256'
            }:
                raise ValueError(f'Expansion review differs from the sealed review: {question_id}')
    builders = {
        "reading": build_reading,
        "listening": build_listening,
        "speaking": build_speaking,
        "writing": build_writing,
    }
    expected_bank_counts = {"reading": 795, "listening": 705, "speaking": 165, "writing": 450}
    exam_task_targets = {
        "reading": {"complete_words": 30, "read_daily_life": 10, "read_academic_passage": 10},
        "listening": {
            "listen_choose_response": 17,
            "listen_conversation": 10,
            "listen_announcement": 8,
            "listen_academic_talk": 12,
        },
        "writing": {"build_sentence": 10, "write_email": 1, "academic_discussion": 1},
        "speaking": {"listen_repeat": 7, "take_interview": 4},
    }
    counts: dict[str, int] = {}
    bank_items = {}
    bank_answers = {}
    for section, builder in builders.items():
        questions, answers = builder()
        apply_review(questions, answers, review_notes)
        if len(questions) != expected_bank_counts[section]:
            raise ValueError(
                f"{section} must contain {expected_bank_counts[section]} questions, got {len(questions)}"
            )
        ids = {item["id"] for item in questions}
        if ids != set(answers):
            raise ValueError(f"{section} question/answer IDs do not match")
        actual_targets = {
            task_type: sum(1 for item in questions if item["task_type"] == task_type)
            for task_type in exam_task_targets[section]
        }
        if any(
            actual_targets[task_type] < target
            for task_type, target in exam_task_targets[section].items()
        ):
            raise ValueError(
                f"{section} does not have enough items for its exam targets: {actual_targets}"
            )
        counts[section] = len(questions)
        bank_items[section] = questions
        bank_answers[section] = answers

    manifest = {
        "version": "2026-09-tripled-original-practice",
        "verified_on": "2026-09-27",
        "title": "TOEFL iBT 2026 Practice Bank",
        "source": "Original practice items aligned with ETS task descriptions; not official ETS questions.",
        "total_questions": sum(counts.values()),
        "distribution_note": "Fixed practice form within ETS published task ranges; not an adaptive exam.",
        "difficulty_note": "简单、适中、困难是本项目按材料与任务要求作出的内容分级，未经 ETS 难度标定。",
        "difficulty_policy": DIFFICULTY_POLICY,
        "sources": [
            "https://www.ets.org/toefl/test-takers/ibt/about/content.html",
            "https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-test-specifications-2026.pdf",
        ],
        "exam_total_questions": sum(
            sum(targets.values()) for targets in exam_task_targets.values()
        ),
        "exam_task_targets": exam_task_targets,
        "sections": {
            "reading": {
                "label": "Reading",
                "time_minutes": 30,
                "task_types": ["complete_words", "read_daily_life", "read_academic_passage"],
                "question_count": counts["reading"],
                "exam_question_count": sum(exam_task_targets["reading"].values()),
                "exam_task_targets": exam_task_targets["reading"],
            },
            "listening": {
                "label": "Listening",
                "time_minutes": 29,
                "task_types": [
                    "listen_choose_response",
                    "listen_conversation",
                    "listen_announcement",
                    "listen_academic_talk",
                ],
                "question_count": counts["listening"],
                "exam_question_count": sum(exam_task_targets["listening"].values()),
                "exam_task_targets": exam_task_targets["listening"],
            },
            "writing": {
                "label": "Writing",
                "time_minutes": 23,
                "task_types": ["build_sentence", "write_email", "academic_discussion"],
                "question_count": counts["writing"],
                "exam_question_count": sum(exam_task_targets["writing"].values()),
                "exam_task_targets": exam_task_targets["writing"],
            },
            "speaking": {
                "label": "Speaking",
                "time_minutes": 8,
                "task_types": ["listen_repeat", "take_interview"],
                "question_count": counts["speaking"],
                "exam_question_count": sum(exam_task_targets["speaking"].values()),
                "exam_task_targets": exam_task_targets["speaking"],
            },
        },
    }
    for section, info in manifest["sections"].items():
        info["practice_tasks"] = {}
        for task_type in info["task_types"]:
            structure = TASK_STRUCTURE[task_type]
            sizes = structure['group_sizes']
            units = structure['units_per_set']
            uniform = len(sizes) == 1
            group_seconds = TASK_TIMING[task_type].get('group_seconds') or {
                sizes[0]: TASK_TIMING[task_type]['seconds'] // units
            }
            items = [q for q in bank_items[section] if q["task_type"] == task_type]
            info["practice_tasks"][task_type] = {
                **{key: value for key, value in structure.items() if key != 'source_ids'},
                "items_per_set": sizes[0] * units if uniform else None,
                "items_per_set_range": [min(sizes) * units, max(sizes) * units],
                "seconds_per_set": TASK_TIMING[task_type]['seconds'],
                "time_range_seconds": [
                    min(group_seconds.values()) * units,
                    max(group_seconds.values()) * units,
                ],
                "group_seconds": group_seconds,
                "items_per_unit": sizes[0] if uniform else None,
                "seconds_per_unit": TASK_TIMING[task_type]['seconds'] // units if uniform else None,
                "structure_sources": [SOURCES[key] for key in structure['source_ids']],
                "timing": task_timing(task_type),
                "timer_modes": ["countdown"] if section == "speaking" else ["countup", "countdown"],
                "bank_questions": len(items),
                "bank_units": len({q.get("group_id", q["id"]) for q in items}),
                "difficulty_counts": {
                    level: sum(q['difficulty'] == level for q in items)
                    for level in ('easy', 'medium', 'hard')
                },
            }
    all_ids = {q['id'] for questions in bank_items.values() for q in questions}
    if set(review_notes) != all_ids:
        raise ValueError('Review notes must cover exactly the current bank IDs')
    # A failed content review must leave the previous generated bank intact.
    for section, questions in bank_items.items():
        write_json(
            QUESTION_ROOT / section / "questions.json", {"section": section, "questions": questions}
        )
        write_json(QUESTION_ROOT / "answers" / f"{section}.json", bank_answers[section])
    write_json(QUESTION_ROOT / "manifest.json", manifest)
    write_catalogue(ROOT, bank_items, review_notes, manifest)
    print(f"Wrote {manifest['total_questions']} original questions")


if __name__ == "__main__":
    main()
