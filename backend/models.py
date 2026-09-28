"""Pydantic models for the public exam API."""

from __future__ import annotations

from typing import Annotated, Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


SectionName = Literal["all", "reading", "listening", "speaking", "writing"]
QuestionId = Annotated[str, Field(pattern=r"^[RLSW]\d{2,3}$")]


class ExamSubmissionItem(BaseModel):
    question_id: QuestionId
    answer: Any = None
    duration_seconds: int | None = Field(default=None, ge=0, le=3600)

    @field_validator("answer")
    @classmethod
    def validate_answer(cls, value: Any) -> Any:
        if value is None:
            return None
        if isinstance(value, str):
            if len(value) > 5000:
                raise ValueError("answer is too long")
            return value.strip()
        if isinstance(value, int) and not isinstance(value, bool):
            return value
        if isinstance(value, list) and all(isinstance(item, str) for item in value):
            if len(value) > 100 or any(len(item) > 200 for item in value):
                raise ValueError("answer list is too long")
            return [item.strip() for item in value]
        raise ValueError("answer must be text, a number, or a list of words")


class ExamSubmitRequest(BaseModel):
    submission_id: UUID | None = None
    responses: list[ExamSubmissionItem] = Field(default_factory=list, max_length=2115)
    section: SectionName = "all"
    mode: Literal["exam", "bank", "practice"] = "exam"
    task_type: str | None = Field(default=None, max_length=40)
    count: int | None = Field(default=None, ge=1, le=20)
    question_ids: list[QuestionId] | None = Field(default=None, max_length=2115)


class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    voice: str = Field(default="en-US-AriaNeural", max_length=64)

    @field_validator("text")
    @classmethod
    def clean_text(cls, value: str) -> str:
        text = " ".join(value.split())
        if not text:
            raise ValueError("text must not be blank")
        return text

    @field_validator("voice")
    @classmethod
    def restrict_voice(cls, value: str) -> str:
        allowed = {
            "en-US-AriaNeural", "en-US-GuyNeural",
            "en-GB-SoniaNeural", "en-GB-RyanNeural",
            "en-AU-NatashaNeural", "en-AU-WilliamMultilingualNeural",
        }
        return value if value in allowed else "en-US-AriaNeural"
