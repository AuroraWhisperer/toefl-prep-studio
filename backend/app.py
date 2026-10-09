"""TOEFL iBT practice API and static frontend server."""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from time import perf_counter

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles

try:  # Works both as `python backend/app.py` and as an imported package.
    from .logging_config import server_log_config
    from .models import ExamSubmitRequest, TTSRequest
    from .question_store import material_groups, store
    from .scoring import compare
    from .mock_exam import router as mock_router
    from .history import router as history_router, save_submission, submitted_material_counts
    from .adaptive_test import router as test_router
except ImportError:  # pragma: no cover - exercised by the direct script command.
    from logging_config import server_log_config
    from models import ExamSubmitRequest, TTSRequest
    from question_store import material_groups, store
    from scoring import compare
    from mock_exam import router as mock_router
    from history import router as history_router, save_submission, submitted_material_counts
    from adaptive_test import router as test_router


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend" / "index.html"
TTS_TIMEOUT_SECONDS = 20

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("toefl_trainer")


class FrontendFiles(StaticFiles):
    """Serve current frontend files even when an old browser sends cache validators."""

    def file_response(self, full_path, stat_result, scope, status_code=200) -> FileResponse:
        return FileResponse(
            full_path,
            stat_result=stat_result,
            status_code=status_code,
            headers={"Cache-Control": "no-store"},
        )


app = FastAPI(title="TOEFL iBT 2026 Practice API", version="1.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:38761", "http://localhost:38761"],
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["Content-Type"],
)
app.mount("/frontend", FrontendFiles(directory=str(ROOT / "frontend")), name="frontend")
mock_pages = ROOT / 'question_bank' / 'mock' / 'pages'
if mock_pages.is_dir():
    app.mount('/mock-pages', StaticFiles(directory=str(mock_pages)), name='mock-pages')
app.include_router(mock_router)
app.include_router(history_router)
app.include_router(test_router)


@app.get("/", include_in_schema=False)
@app.get("/guide", include_in_schema=False)
@app.get("/foundations", include_in_schema=False)
@app.get("/practice/{section}", include_in_schema=False)
@app.get("/practice/{section}/run/{run_id}", include_in_schema=False)
@app.get("/exam/{section}/{run_id}", include_in_schema=False)
@app.get("/history", include_in_schema=False)
@app.get("/history/{category}/{record_id}", include_in_schema=False)
@app.get("/tests", include_in_schema=False)
@app.get("/tests/{session_id}", include_in_schema=False)
@app.get("/mocks", include_in_schema=False)
@app.get("/mocks/sessions/{session_id}", include_in_schema=False)
@app.get("/mocks/{paper_id}", include_in_schema=False)
def home() -> FileResponse:
    return FileResponse(FRONTEND, headers={"Cache-Control": "no-store"})


@app.get("/api/v1/health")
def health() -> dict:
    return {"status": "ok", "service": "toefl-practice"}


@app.get("/api/v1/meta")
def meta() -> dict:
    return store.manifest()


@app.get("/api/v1/exam")
def exam(
    section: str = Query(default="all", pattern="^(all|reading|listening|speaking|writing)$"),
    mode: str = Query(default="exam", pattern="^(exam|bank|practice)$"),
    task_type: str | None = Query(default=None, max_length=40),
    count: int | None = Query(default=None, ge=1, le=20),
    timer_mode: str | None = Query(default=None, pattern="^(countup|countdown)$"),
    repeat_decay: float = Query(default=1.0, ge=0, le=3),
) -> dict:
    try:
        if mode == "practice":
            config = store.practice_config(section, task_type, count)
            timer_mode = timer_mode or config["timer_modes"][0]
            if timer_mode not in config["timer_modes"]:
                raise ValueError("该题型仅支持倒计时练习")
            questions = store.practice_questions(
                section,
                task_type,
                count,
                submission_counts=submitted_material_counts() if repeat_decay else None,
                repeat_decay=repeat_decay,
            )
            time_limit = sum(
                config['group_seconds'][str(len(group))]
                for group in material_groups(questions).values()
            )
        else:
            if count is not None or timer_mode is not None:
                raise ValueError("题量和计时选项仅适用于专项练习")
            questions = store.questions_for(section, mode, task_type)
            time_limit = sum(
                info["time_minutes"] * 60
                for key, info in store.manifest()["sections"].items()
                if section in ("all", key)
            )
            timer_mode = "countdown" if mode == "exam" else "countup"
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {
        "section": section,
        "mode": mode,
        "task_type": task_type,
        "count": count,
        "question_ids": [question["id"] for question in questions],
        "timer_mode": timer_mode,
        "time_limit_seconds": time_limit,
        "estimated_time_seconds": time_limit if mode != "bank" else None,
        "questions": questions,
        "total": len(questions),
        "bank_total": store.manifest()["sections"].get(section, {}).get("question_count")
        if section != "all"
        else store.manifest()["total_questions"],
        "note": "Question content is original practice material. Answer keys remain on the server until submission.",
    }


@app.post("/api/v1/exam/submit")
def submit(payload: ExamSubmitRequest) -> dict:
    started = perf_counter()
    try:
        result = save_submission(payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    logger.info(
        "Submission scored section=%s mode=%s task=%s received=%d answered=%d total=%d elapsed_ms=%.1f",
        payload.section,
        payload.mode,
        payload.task_type or "all",
        len(payload.responses),
        result["answered_questions"],
        result["total_questions"],
        (perf_counter() - started) * 1000,
    )
    return result


async def synthesize_audio(payload: TTSRequest) -> bytes:
    import edge_tts

    chunks = []
    async for chunk in edge_tts.Communicate(payload.text, payload.voice).stream():
        if chunk["type"] == "audio":
            chunks.append(chunk["data"])
    audio = b"".join(chunks)
    if not audio:
        raise ValueError("No audio received")
    return audio


async def wait_for_disconnect(request: Request) -> None:
    while True:
        message = await request.receive()
        if message["type"] == "http.disconnect":
            return


@app.post("/api/v1/tts", response_class=Response)
async def tts(payload: TTSRequest, request: Request) -> Response:
    """Return temporary MP3 bytes, or JSON requesting browser speech fallback."""
    synthesis = asyncio.create_task(synthesize_audio(payload))
    disconnected = asyncio.create_task(wait_for_disconnect(request))
    headers = {"Cache-Control": "no-store"}
    try:
        done, _ = await asyncio.wait(
            {synthesis, disconnected},
            timeout=TTS_TIMEOUT_SECONDS,
            return_when=asyncio.FIRST_COMPLETED,
        )
        if disconnected in done:
            return Response(status_code=499)
        if synthesis not in done:
            raise TimeoutError("Speech synthesis timed out")
        return Response(synthesis.result(), media_type="audio/mpeg", headers=headers)
    except Exception as exc:  # Optional network/model dependency; fallback is expected.
        logger.warning("TTS fallback: %s: %s", exc.__class__.__name__, exc)
        return JSONResponse({"url": None, "text": payload.text, "fallback": True}, headers=headers)
    finally:
        synthesis.cancel()
        disconnected.cancel()
        await asyncio.gather(synthesis, disconnected, return_exceptions=True)


# Compatibility routes for the original three-question speaking trainer.
@app.get("/questions", include_in_schema=False)
def legacy_questions() -> dict:
    repeats = [
        item for item in store.questions_for("speaking") if item["task_type"] == "listen_repeat"
    ][:3]
    return {
        "title": "TOEFL Speaking · Listen and Repeat",
        "questions": [{"id": item["id"], "text": item["audio_text"]} for item in repeats],
    }


@app.post("/score", include_in_schema=False)
async def legacy_score(data: dict) -> dict:
    original = data.get("original")
    answer = data.get("answer")
    if not isinstance(original, str) or not isinstance(answer, str):
        raise HTTPException(status_code=422, detail="original and answer must be strings")
    return compare(original[:5000], answer[:5000])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=38761, log_config=server_log_config())
