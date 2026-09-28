"""Load public questions and private answer keys from the repository."""

from __future__ import annotations

import copy
import json
import random
from collections import Counter
from pathlib import Path
from typing import Any


SECTIONS = ("reading", "listening", "writing", "speaking")


def material_groups(questions: list[dict]) -> dict[str, list[dict]]:
    groups: dict[str, list[dict]] = {}
    for question in questions:
        groups.setdefault(question.get('group_id', question['id']), []).append(question)
    return groups


class QuestionStore:
    def __init__(self, root: Path | None = None) -> None:
        self.root = root or Path(__file__).resolve().parents[1]
        self.question_root = self.root / "question_bank"
        self._questions: dict[str, dict] | None = None
        self._answers: dict[str, dict] | None = None
        self._manifest: dict | None = None

    def _read(self, path: Path) -> Any:
        return json.loads(path.read_text(encoding="utf-8"))

    def _load_questions(self) -> dict[str, dict]:
        if self._questions is None:
            questions: dict[str, dict] = {}
            for section in SECTIONS:
                payload = self._read(self.question_root / section / "questions.json")
                for item in payload.get("questions", []):
                    question_id = item.get("id")
                    if not isinstance(question_id, str) or question_id in questions:
                        raise ValueError(f"Invalid or duplicate question ID: {question_id!r}")
                    questions[question_id] = item
            self._questions = questions
        return self._questions

    def _load_answers(self) -> dict[str, dict]:
        if self._answers is None:
            answers: dict[str, dict] = {}
            for section in SECTIONS:
                payload = self._read(self.question_root / "answers" / f"{section}.json")
                for question_id, answer in payload.items():
                    if question_id in answers:
                        raise ValueError(f"Duplicate answer key: {question_id}")
                    answers[question_id] = answer
            self._answers = answers
        return self._answers

    def manifest(self) -> dict:
        if self._manifest is None:
            self._manifest = self._read(self.question_root / "manifest.json")
        return copy.deepcopy(self._manifest)

    def _sort_key(self, item: dict) -> tuple[int, int, int]:
        if self._manifest is None:
            self.manifest()
        task_types = self._manifest["sections"][item["section"]]["task_types"]
        return (
            SECTIONS.index(item["section"]),
            task_types.index(item["task_type"]),
            int(item["id"][1:]),
        )

    def all_questions(self) -> list[dict]:
        return [
            copy.deepcopy(item)
            for item in sorted(self._load_questions().values(), key=self._sort_key)
        ]

    def practice_config(self, section: str, task_type: str | None, count: int | None) -> dict:
        if section not in SECTIONS:
            raise ValueError("专项练习必须选择一个科目")
        config = self.manifest()["sections"][section]["practice_tasks"].get(task_type)
        if config is None:
            raise ValueError("请选择该科目支持的题型")
        if count not in config["count_options"]:
            raise ValueError("所选题量不适用于该题型")
        return config

    def practice_questions(
        self,
        section: str,
        task_type: str,
        count: int,
        question_ids: list[str] | None = None,
        *,
        submission_counts: dict[str, int] | None = None,
        repeat_decay: float = 1.0,
    ) -> list[dict]:
        config = self.practice_config(section, task_type, count)
        groups = material_groups(self.questions_for(section, 'bank', task_type))
        units = config['units_per_set']
        sets = count // units
        if question_ids is None:
            available = list(groups)
            counts = submission_counts or {}
            weights = {key: 1 / (1 + counts.get(key, 0)) ** repeat_decay for key in available}

            def draw(candidates):
                key = random.choices(candidates, weights=[weights[key] for key in candidates], k=1)[
                    0
                ]
                available.remove(key)
                return key

            selected = []
            for _ in range(sets):
                # Reserve one non-easy material per block, without requiring any easy items.
                anchor = draw(
                    [
                        key
                        for key in available
                        if any(q['difficulty'] != 'easy' for q in groups[key])
                    ]
                )
                block = [anchor] + [draw(available) for _ in range(units - 1)]
                random.shuffle(block)
                selected.extend(block)
            return [question for key in selected for question in groups[key]]
        minimum, maximum = config['items_per_set_range']
        if (
            len(question_ids) != len(set(question_ids))
            or not sets * minimum <= len(question_ids) <= sets * maximum
        ):
            raise ValueError("本轮题目重复或数量与所选题量不一致")
        by_id = {q['id']: q for group in groups.values() for q in group}
        if any(question_id not in by_id for question_id in question_ids):
            raise ValueError('本轮包含不属于该题型的题目')
        ordered = [by_id[question_id] for question_id in question_ids]
        selected_groups = [groups[key] for key in material_groups(ordered)]
        selected_ids = set(question_ids)
        expected_ids = {q["id"] for group in selected_groups for q in group}
        if (
            expected_ids != selected_ids
            or len(selected_groups) != count
            or any(len(group) not in config['group_sizes'] for group in selected_groups)
        ):
            raise ValueError("本轮题目必须由该题型的完整材料组组成")
        if [q['id'] for group in selected_groups for q in group] != question_ids:
            raise ValueError('本轮须保留完整材料的题目顺序')
        for start in range(0, len(selected_groups), units):
            if all(
                q['difficulty'] == 'easy'
                for group in selected_groups[start : start + units]
                for q in group
            ):
                raise ValueError('每份练习须包含适中或困难题，不能全是简单题')
        return ordered

    def questions_for(
        self, section: str = "all", mode: str = "exam", task_type: str | None = None
    ) -> list[dict]:
        if section != "all" and section not in SECTIONS:
            raise ValueError("unknown section")
        if mode not in {"exam", "bank"}:
            raise ValueError("unknown mode")
        if task_type is not None:
            if mode != "bank" or section == "all":
                raise ValueError("task_type requires bank mode and a single section")
            if task_type not in self.manifest()["sections"][section]["task_types"]:
                raise ValueError("unknown task_type for this section")
        requested_sections = SECTIONS if section == "all" else (section,)
        all_items = [
            item
            for item in self._load_questions().values()
            if task_type is None or item["task_type"] == task_type
        ]
        selected: list[dict] = []
        targets = self.manifest().get("exam_task_targets", {})
        for requested in requested_sections:
            section_items = sorted(
                (item for item in all_items if item["section"] == requested), key=self._sort_key
            )
            if mode == "bank":
                selected.extend(section_items)
                continue
            for task_type, target in targets.get(requested, {}).items():
                task_items = [item for item in section_items if item['task_type'] == task_type]
                if task_type == 'read_daily_life':
                    groups = list(material_groups(task_items).values())
                    # One fixed section form; random practice permits any mix of 2/3-question texts.
                    pattern = [2, 3]
                    by_size = {
                        size: [group for group in groups if len(group) == size]
                        for size in set(pattern)
                    }
                    for size in pattern * (target // sum(pattern)):
                        selected.extend(by_size[size].pop(0))
                else:
                    selected.extend(task_items[:target])
        return [copy.deepcopy(item) for item in selected]

    def question(self, question_id: str) -> dict | None:
        item = self._load_questions().get(question_id)
        return copy.deepcopy(item) if item else None

    def answer(self, question_id: str) -> dict | None:
        item = self._load_answers().get(question_id)
        return copy.deepcopy(item) if item else None

    def validate_integrity(self) -> None:
        question_ids = set(self._load_questions())
        answer_ids = set(self._load_answers())
        if question_ids != answer_ids:
            missing = sorted(question_ids - answer_ids)
            extra = sorted(answer_ids - question_ids)
            raise ValueError(f"Question/answer mismatch; missing={missing}, extra={extra}")
        expected = int(self.manifest().get("total_questions", 0))
        if len(question_ids) != expected:
            raise ValueError(f"Expected {expected} questions, got {len(question_ids)}")
        for section, info in self.manifest()["sections"].items():
            items = self.questions_for(section, "bank")
            if len(items) != info["question_count"]:
                raise ValueError(f"Unexpected bank count for {section}")
            targets = info["exam_task_targets"]
            if sum(targets.values()) != info["exam_question_count"]:
                raise ValueError(f"Unexpected exam count for {section}")
            for task_type, count in targets.items():
                if sum(item["task_type"] == task_type for item in items) < count:
                    raise ValueError(f"Insufficient items for {section}/{task_type}")
            for task_type, config in info["practice_tasks"].items():
                task_items = [item for item in items if item["task_type"] == task_type]
                groups = material_groups(task_items)
                if (
                    len(task_items) != config["bank_questions"]
                    or len(groups) != config["bank_units"]
                ):
                    raise ValueError(f"Unexpected practice bank count for {task_type}")
                units = config['units_per_set']
                if any(count % units for count in config['count_options']):
                    raise ValueError(
                        f'Practice choices must contain complete blocks for {task_type}'
                    )
                sizes = Counter(len(group) for group in groups.values())
                if set(sizes) != set(config['group_sizes']) or len(groups) < max(
                    config['count_options']
                ):
                    raise ValueError(f"Incomplete or insufficient groups for {task_type}")
                non_easy = sum(
                    any(q['difficulty'] != 'easy' for q in group) for group in groups.values()
                )
                if non_easy < max(config['count_options']) // units:
                    raise ValueError(f'Insufficient non-easy materials for {task_type}')


store = QuestionStore()
