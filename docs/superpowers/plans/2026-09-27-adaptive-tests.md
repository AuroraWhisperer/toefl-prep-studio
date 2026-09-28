# Adaptive Tests Implementation Plan

> **For agentic workers:** Execute inline in this session. No delegation or unrelated refactor.

**Goal:** Enable five mixed-difficulty test profiles with selectable 1–10 starting levels and bounded reading/listening module adaptation.

**Architecture:** Extend the original-question practice renderer, scorer and archive. Add an isolated adaptive session owner, not a duplicate mock implementation. Preserve all existing content and review fingerprints.

**Tech Stack:** Existing FastAPI/Pydantic, vanilla JavaScript/CSS, pytest and Playwright.

## Global Constraints

- Desktop-only local application; preserve the user's live service and data.
- Follow `specs/adaptive-tests.md`; no official score/difficulty claims.
- Keep answer keys server-side and select whole material groups without repeats.

## Tasks

- [x] Backend: create `backend/adaptive_test.py`, register its router in `backend/app.py`, expose outlines in `/resources`; focused tests in `tests/test_adaptive_test.py`.
  - Validate: `python -m pytest tests/test_adaptive_test.py -q`.
  - Route contracts: `POST /api/v1/tests/sessions {level}`, `GET /api/v1/tests/sessions/{id}`, `POST .../{id} {phase_index, action, responses}`. Return only current phase, saved current responses and public settings; completion returns archived questions/result.
  - Tests: all levels/profile bounds; high/low/boundary routing; exactly 120 unique selected IDs; snapshots and idempotent submission; private data absent.
- [x] UI: add `frontend/adaptive-test.js` and scoped CSS; activate `#open-tests` in `frontend/index.html`; reuse `app.js` answer/render/record/review lifecycle for the staged session.
  - Validate: `node --check frontend/app.js`; `node --check frontend/adaptive-test.js`; `npx playwright test tests/browser_adaptive_test.test.cjs`.
  - Tests: five presets, ten levels, keyboard start, preserved drafts after refresh, module transition, completion/history, standard practice unchanged.
- [x] Documentation and regression: update `README.md`, `PRODUCT.md`, `DESIGN.md`, `question_bank/README.md` with links to the owning spec; run Python/browser suites and inspect desktop layouts; compare changed files against the pre-edit snapshot.

## Verification Record

Validated on 2026-09-27:

- Focused Python suite: **143 passed**, covering adaptive tests, history, clearing, archive boundaries/diagnostics and sampling counts. The observed transient Windows file-lock failure was fixed with the existing mock persistence retry pattern and a regression test.
- Browser adaptive/mock/recorder/setup suite: **33 passed**. After a concurrent shared-navigation update, the **8 adaptive browser tests passed again** against the current files. Coverage includes all nine phases, exact routing, draft/clock restoration, failed submission retry, final history, spoken transcript autosave and recording uploads. JavaScript syntax checks passed.
- Desktop screenshots inspected at 2560×1440 and the 125% / 150% equivalent viewports (2048×1152, 1707×960), plus 1280×720. The initial homepage height regression was fixed by shortening the test-entry description; the subsequent full browser run passed homepage layout checks.
- Exact `/` and `/api/v1/tests/catalog` returned HTTP 200 on the owned isolated server. CUA independently verified the visible five presets and challenge selection at 10/10 with an 8–10 range. Temporary browser and server were closed; no owner history or running service was used.
- ETS specifications were retrieved successfully (HTTP 200); page 3 identifies Reading/Listening as two-stage adaptive and Writing/Speaking as linear. Local thresholds, level labels and timing remain explicitly labeled as training choices.
- Full-suite status is **not clean**: the shared workspace's separate bank-expansion work expects 2,115 items while generated data still contains 705, with additional source/review consistency failures. The full Python run recorded 26 such failures plus the subsequently fixed Windows file-lock failure. The full browser run recorded six expansion failures, one subsequently corrected disabled-entry assertion and one transient browser network suspension that passed on rerun. No expansion source, generated question, key or review fingerprint was modified by this task.
- Test logs and the final screenshot are saved under `artifacts/adaptive-tests-qa/`. Real microphone and online TTS quality were not verified by mocked browser audio checks.
- Cleanup of the task-created `artifacts/adaptive-tests-baseline/` backup was rejected by command safety policy (`blocked by policy`); the backup is retained. Its Python/JavaScript copies use `.before` suffixes to avoid test discovery. The snapshot comparison is saved as `artifacts/adaptive-tests-qa/shared-workspace.diff` and explicitly includes concurrent edits; it is not a task-only Git diff.
