"""Validate persisted JSON without rewriting it or hiding unreadable records."""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Literal
from uuid import UUID

from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field, RootModel, model_validator


logger = logging.getLogger(__name__)


class StoredObject(BaseModel):
    model_config = ConfigDict(strict=True, allow_inf_nan=False)


class MaterialReference(StoredObject):
    id: str = Field(min_length=1)
    group_id: str = ''


class MaterialArchive(StoredObject):
    id: str
    questions: list[MaterialReference] = Field(min_length=1)


class SectionScore(StoredObject):
    earned: float
    possible: float


class PracticeResult(StoredObject):
    total_questions: int = Field(ge=0)
    answered_questions: int = Field(ge=0)
    sections: dict[str, SectionScore] = Field(min_length=1)
    feedback: list[dict]


class PracticeArchive(MaterialArchive):
    fingerprint: str
    category: Literal['practice', 'test']
    completed_at: float
    section: Literal['reading', 'listening', 'speaking', 'writing', 'all']
    mode: Literal['practice', 'exam', 'bank']
    task_type: str | None
    result: PracticeResult
    recordings: dict[str, str]


class ExpiredRecording(StoredObject):
    id: str
    upload_until: float


class MockSessionArchive(StoredObject):
    id: str
    paper_id: str = Field(pattern=r'^ets-test-[1-5]$')
    status: Literal['active', 'abandoned', 'completed']
    phase_index: int = Field(ge=0, le=9)
    item_index: int = Field(ge=0)
    started_at: float
    completed_at: float | None = None
    phase_state: Literal['directions', 'active'] = 'active'
    deadline: float | None = None
    response_deadline: float | None = None
    answers: dict[str, str]
    recordings: dict[str, str]
    word_orders: dict[str, list[int | None]] = Field(default_factory=dict)
    heard_groups: list[str] = Field(default_factory=list)
    expired_recording: ExpiredRecording | None = None

    @model_validator(mode='after')
    def check_completion(self):
        if self.status == 'completed' and self.completed_at is None:
            raise ValueError('Completed sessions require a completion time')
        if self.status == 'active' and self.phase_index == 9:
            raise ValueError('Active sessions require a current phase')
        return self


class RepeatReset(RootModel[list[str]]):
    model_config = ConfigDict(strict=True)


def invalid_archive(path: Path):
    logger.warning('Invalid archive file: %s', path)
    return HTTPException(409, f'记录文件 {path.parent.name}/{path.name} 已损坏或不完整。'
                         '原文件未修改；请先备份该数据目录，再从可信备份恢复此文件后重试。')


def unreadable_archive(path: Path):
    logger.warning('Unable to read archive file: %s', path)
    return HTTPException(503, f'无法读取记录文件 {path.parent.name}/{path.name}。'
                         '原文件未修改；请检查文件权限或磁盘状态后重试。')


def read_archive(path: Path, schema: type[BaseModel]):
    try:
        payload = json.loads(path.read_text(encoding='utf-8'))
        schema.model_validate(payload)
        if isinstance(payload, dict):
            UUID(payload['id'])
            if payload['id'] != path.stem:
                raise ValueError('Archive ID does not match its filename')
    except ValueError:
        # Never log validation exceptions: they can include private answer inputs.
        raise invalid_archive(path) from None
    except OSError:
        raise unreadable_archive(path) from None
    # Validation must not coerce, fill defaults in, or discard saved fields.
    return payload
