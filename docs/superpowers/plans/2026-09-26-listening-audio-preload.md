# Listening Audio Preload Implementation Plan

> Execute inline in this session, with regression checks after each deliverable.

**Goal:** Prepare selected listening and speaking prompts before playback, reuse each material within a round, and release requests and audio on successful submission, exit, or page close.

**Architecture:** A small browser cache downloads at most two unique prompts concurrently and puts the current question ahead of queued work. The TTS endpoint returns MP3 bytes directly; the browser owns temporary blob URLs. No generated audio is written to disk. Review playback creates a new cache only when requested.

**Tech Stack:** Existing vanilla JavaScript, FastAPI, edge-tts, pytest, Playwright.

## Constraints

- Cover four listening task types, both speaking task types, practice, exams, and review playback.
- Keep current controls and browser speech fallback; never autoplay during preload.
- Retain the round cache after a failed submission. Cancel work and revoke URLs after successful submission or exit.
- Use isolated test servers and browser contexts; leave existing user processes and old audio files alone.

## Task 1: Return temporary audio without persistent files

Files: `backend/app.py`, `tests/test_exam_api.py`, `tests/test_tts.py`.

- [x] Add tests with a fake `edge_tts.Communicate.stream()` yielding audio chunks; assert `POST /api/v1/tts` returns their concatenated bytes, `audio/mpeg`, and `Cache-Control: no-store`.
- [x] Exercise failure, timeout, client disconnection, and cancellation; verify synthesis exits without leaving a task running.
- [x] Replace MP3 file generation with an in-memory stream collector and cancel it when the request disconnects. Keep the 20-second deadline and JSON browser-fallback response.
- [x] Verify with `.venv/Scripts/python.exe -m pytest tests/test_tts.py tests/test_exam_api.py -q`.

## Task 2: Preload and release browser audio

Files: `frontend/audio-cache.js`, `frontend/app.js`, `frontend/index.html`, `tests/browser_audio.test.cjs`, `playwright.config.cjs`, `tests/browser_practice.test.cjs`.

Interfaces: `new PromptAudioCache(texts)`, `get(text): Promise<string|null>`, `prioritize(text)`, `dispose()`.

- [x] Add browser tests with delayed audio responses: verify requests start before any click, identical material makes one request, pending playback shares that request, and repeat playback makes no network request.
- [x] Add the bounded queue, blob URLs, shared promises, and abort/revoke cleanup. Move the current question to the front of pending work.
- [x] Connect cache creation to successful question selection; connect disposal to successful submission, home navigation, and `pagehide`. Review uses lazy playback; browser history restoration resumes preloading.
- [x] Test exit while loading, late completion, successful/failed submission, review playback, page navigation/unload, and offline fallback. Stub TTS in existing unrelated browser tests to avoid new background network use.
- [x] Run `node --check` for changed JavaScript, full pytest, and `npm run test:browser`.

## Task 3: Verify playback and document limits

Files: `README.md`.

- [x] Document preloading, cleanup, first-request/network limitations, and the new binary TTS success response.
- [x] Use an isolated persistent Playwright session to inspect the ordinary listening controls and capture ready/playing states at desktop and narrow widths.
- [x] Attempt a real TTS smoke check; report service availability separately from deterministic caching tests.
- [x] Close owned browser contexts and test servers.

## Verification results

- 135 pytest checks and 17 Playwright tests passed; changed JavaScript passed syntax checks.
- A real 28.704-second announcement took about 5.01 seconds to synthesize. After preload, two clicks reached the media `playing` event in approximately 402 ms and 626 ms. Both used the same blob URL and only one TTS request. This is one local sample, not a latency guarantee.
- Returning home revoked the generated URL. The old audio directory remained at 11 files / 219024 bytes, confirming this run created no persistent audio files.
- Ready and playing views were inspected at 1600×1000, and the listening controls at 390×844. No horizontal overflow or clipped playback controls were found. Screenshots are under `artifacts/audio-qa/`.
- The isolated browser and servers on ports 8765/8766 were closed. Existing user processes were left running.
