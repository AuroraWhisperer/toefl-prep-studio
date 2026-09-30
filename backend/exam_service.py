"""Server-side scoring for objective and practice-response TOEFL items."""

from __future__ import annotations

import re
from difflib import SequenceMatcher
from typing import Any

try:
    from .question_store import SECTIONS, QuestionStore
except ImportError:  # pragma: no cover - direct script compatibility.
    from question_store import SECTIONS, QuestionStore


WORD_RE = re.compile(r"[a-z]+(?:'[a-z]+)?", re.IGNORECASE)


def normalize_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        value = " ".join(str(item) for item in value)
    return " ".join(WORD_RE.findall(str(value).lower()))


def _choice_index(value: Any) -> int | None:
    return value if isinstance(value, int) and not isinstance(value, bool) else None


def _word_count(value: Any) -> int:
    return len(WORD_RE.findall(str(value or "")))


def _score_choice(key: dict, answer: Any) -> tuple[float, float, str, bool]:
    expected = key.get("correct_index")
    received = _choice_index(answer)
    correct = received is not None and received == expected
    if correct:
        return 1.0, 1.0, "答对了。可以用下面的原句线索核对自己的判断。", True
    if received is None:
        return 0.0, 1.0, "这题未选择答案。先看题目在问什么，再对照解析中的原句线索。", False
    return 0.0, 1.0, key.get("explanation", "回到原文或音频脚本，找出能直接支持答案的句子。"), False


def _score_text(key: dict, answer: Any) -> tuple[float, float, str, bool]:
    received = normalize_text(answer)
    accepted = {normalize_text(item) for item in key.get("accepted", [])}
    correct = bool(received) and received in accepted
    if correct:
        return 1.0, 1.0, "填对了。继续核对这个词在句中的意思和作用。", True
    return (
        0.0,
        1.0,
        key.get("explanation", "先判断空格需要表示什么，再用前后搭配和已给字母检查拼写。"),
        False,
    )


def _score_sentence(key: dict, answer: Any) -> tuple[float, float, str, bool]:
    received = normalize_text(answer)
    accepted = [normalize_text(item) for item in key.get("accepted", [])]
    correct = bool(received) and received in accepted
    if correct:
        return 1.0, 1.0, "词序符合本题的可接受答案。可以对照解析理解句子结构。", True
    return (
        0.0,
        1.0,
        key.get("explanation", "先找谁做什么，再安排其他词块；有些词块可能不需要使用。"),
        False,
    )


def _score_repeat(key: dict, answer: Any) -> tuple[float, float, str, bool]:
    received = normalize_text(answer)
    reference = normalize_text(key.get("reference", ""))
    ratio = SequenceMatcher(None, reference, received).ratio() if received else 0.0
    points = round(ratio * 5, 1)
    correct = ratio >= 0.92
    if not received:
        feedback = "尚无可比对的文字。请核对转写或输入所说的句子；这里不会直接给录音做发音评分。"
    elif ratio >= 0.92:
        feedback = "按转写文字比对，词语和顺序与原句很接近；这不代表发音或流利度评价。"
    elif ratio >= 0.65:
        feedback = "转写文字与原句仍有差异。先核对漏词，再核对词序；文字比对不能判断发音。"
    else:
        feedback = "先按意思把原句分成短块练习，再连成整句；当前只比较转写文字，不判断发音。"
    return points, 5.0, feedback, correct


def _score_subjective(key: dict, answer: Any, section: str) -> tuple[float, float, str, None]:
    text = str(answer or "").strip()
    words = _word_count(text)
    min_words = int(key.get("min_words", 20))
    if not text:
        feedback = "这题没有提交文字回答。可以先按下面的思路列出要点，再组织成句子。"
    else:
        feedback = f"当前有 {words} 词。"
        if words < min_words:
            feedback += f"本练习的展开目标为 {min_words} 词；请优先补足题目要求、原因和例子。"
    tokens = normalize_text(text).split()
    if len(tokens) >= 12:
        trigrams = list(zip(tokens, tokens[1:], tokens[2:]))
        if len(set(trigrams)) <= len(trigrams) / 2:
            feedback += "检测到较多重复词组，请核对是否只在重复同一个意思，并补充具体内容。"
    feedback += "待人工复核：请对照题目要求检查内容、理由和表达；参考内容只是一种写法，不要求相同立场或措辞。"
    if section == "speaking":
        feedback += "这里只检查转写文字，不评估发音和流利度。"
    # Open responses have no numeric weight: string matches cannot judge task fulfillment.
    return 0.0, 0.0, feedback, None


def score_one(question: dict, key: dict, answer: Any) -> tuple[float, float, str, bool | None]:
    kind = key.get("type")
    if kind == "choice":
        return _score_choice(key, answer)
    if kind == "text":
        return _score_text(key, answer)
    if kind == "sentence":
        return _score_sentence(key, answer)
    if kind == "repeat":
        return _score_repeat(key, answer)
    if kind == "subjective":
        return _score_subjective(key, answer, question["section"])
    return 0.0, 1.0, "这道题暂时没有自动评分规则，请对照题目要求人工复核。", False


def reference_answer(question: dict, key: dict) -> str:
    if key['type'] == 'choice':
        index = key['correct_index']
        return f"{chr(65 + index)}. {question['options'][index]}"
    return key.get('reference') or key.get('accepted', [None])[0] or key.get('explanation', '')


def _half_band(value: float) -> float:
    return max(1.0, min(6.0, round(value * 2) / 2))


def score_submission(
    store: QuestionStore,
    responses: list[dict],
    section: str = "all",
    mode: str = "exam",
    task_type: str | None = None,
    count: int | None = None,
    question_ids: list[str] | None = None,
) -> dict:
    store.validate_integrity()
    if mode == "practice":
        if question_ids is None:
            raise ValueError("提交专项练习时必须附上本轮题目列表")
        questions = store.practice_questions(section, task_type, count, question_ids)
    else:
        if count is not None or question_ids is not None:
            raise ValueError("自选题目仅适用于专项练习")
        questions = store.questions_for(section, mode, task_type)
    question_map = {item["id"]: item for item in questions}
    submitted: dict[str, Any] = {}
    durations: dict[str, int] = {}
    section_totals = {
        section: {"earned": 0.0, "possible": 0.0, "answered": 0, "total": 0} for section in SECTIONS
    }
    feedback: list[dict] = []
    manual_sections: set[str] = set()

    for item in responses:
        question_id = item.get("question_id")
        if question_id in submitted:
            raise ValueError(f"duplicate question_id: {question_id}")
        question = question_map.get(question_id)
        if question is None:
            raise ValueError(f"question_id is not in the selected set: {question_id}")
        answer = item.get("answer")
        if answer not in (None, ""):
            if question["response_type"] == "choice":
                if _choice_index(answer) is None or not 0 <= answer < len(question["options"]):
                    raise ValueError(f"answer for {question_id} must be a valid option index")
            elif not isinstance(answer, str):
                raise ValueError(f"answer for {question_id} must be text")
        submitted[question_id] = answer
        durations[question_id] = item.get("duration_seconds") or 0

    for question in questions:
        question_id = question["id"]
        key = store.answer(question_id)
        answer = submitted.get(question_id)
        answered = answer is not None and (not isinstance(answer, str) or bool(answer.strip()))
        earned, possible, message, correct = score_one(question, key, answer)
        manual = key.get("type") == "subjective"
        if manual:
            manual_sections.add(question["section"])
        totals = section_totals[question["section"]]
        totals["earned"] += earned
        totals["possible"] += possible
        totals["total"] += 1
        totals["answered"] += int(answered)
        reference = reference_answer(question, key)
        feedback.append(
            {
                "question_id": question_id,
                "section": question["section"],
                "task_type": question["task_type"],
                "earned": earned,
                "possible": possible,
                "correct": correct,
                "manual_review": manual,
                "feedback": message if answered or manual else "未作答，本题计 0 分。",
                "answered": answered,
                "answer": answer,
                "reference_answer": reference,
                "explanation": key.get("explanation", ""),
                "duration_seconds": durations.get(question_id, 0),
                "correct_index": key.get("correct_index"),
                "missing_letters": key["reference"][len(question["prefix"]) :]
                if question["task_type"] == "complete_words"
                else None,
            }
        )

    sections: dict[str, dict] = {}
    completed_legacy: list[float] = []
    completed_bands: list[float] = []
    for section, totals in section_totals.items():
        if totals["possible"] == 0:
            sections[section] = {
                "answered": totals["answered"],
                "total": totals["total"],
                "earned": 0,
                "possible": 0,
                "percentage": None,
                "legacy_score": None,
                "band6": None,
            }
            continue
        percentage = totals["earned"] / totals["possible"]
        legacy_score = round(percentage * 30, 1) if section not in manual_sections else None
        band = _half_band(1 + percentage * 5) if section not in manual_sections else None
        if band is not None:
            completed_legacy.append(legacy_score)
            completed_bands.append(band)
        sections[section] = {
            "answered": totals["answered"],
            "total": totals["total"],
            "earned": round(totals["earned"], 1),
            "possible": totals["possible"],
            "percentage": round(percentage * 100, 1),
            "legacy_score": legacy_score,
            "band6": band,
        }

    return {
        "sections": sections,
        "overall_band6": _half_band(sum(completed_bands) / len(completed_bands))
        if completed_bands and not manual_sections
        else None,
        "legacy_total": round(sum(completed_legacy), 1) if len(completed_legacy) == 4 else None,
        "feedback": feedback,
        "answered_questions": sum(item["answered"] for item in feedback),
        "total_questions": len(questions),
        "note": "仅汇总可自动核对题目的练习分，漏答计零。邮件、讨论与访谈待人工复核，不计入分数或正确率；复述仅比对转写文字，不评价发音。结果不等同于官方 TOEFL 成绩。",
    }
