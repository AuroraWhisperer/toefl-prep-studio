# Browser History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Give existing screens local URL paths so browser Back, Forward and refresh have useful, safe behavior.

**Architecture:** Extend the existing `appViews` controller with History API entries and route handlers supplied by the owning features. FastAPI serves the existing HTML on explicit application paths; APIs and private files retain their existing boundaries. Keep the current ordinary practice in memory, and use existing server sessions and archive readers for persistent screens.

**Tech Stack:** Vanilla JavaScript, FastAPI, pytest, Playwright; no new dependencies.

## Global Constraints

- Desktop browser only; preserve the owner's running service and personal data.
- Preserve unrelated working-tree edits; do not commit them as part of this change.
- No answer data in URLs or browser history state; no new scoring or storage format.
- Back/Forward must not draw a new random round or reset an exam deadline.
- Refreshing an unsubmitted ordinary round returns to setup (or home for fixed forms); submitted reviews and saved sessions reopen from their IDs.

## Task 1: Explicit routes and browser history

**Files:** `frontend/view-navigation.js`, `backend/app.py`, `tests/test_page_routes.py`, `tests/browser_url_navigation.test.cjs`.

**Interfaces:** Keep `appViews.show(view, options)`. Add `register(pattern, open)`, `beforeNavigate(check)`, `navigate(path)`, `start()`, and `setPath(path, {replace})`. Route handlers reuse existing feature functions; departure checks may reject navigation while a save fails or an action is busy.

- [x] Add regressions for direct paths, real browser Back/Forward, refresh, missing sessions and API/private-file 404 boundaries.
- [x] Confirm the new path regression fails against the current implementation:
  ```powershell
  .\.venv\Scripts\python.exe -m pytest tests/test_page_routes.py -q
  ```
- [x] Implement explicit page routes and the existing controller's history lifecycle. Deduplicate identical paths; do not append history when restoring an entry.

## Task 2: Existing feature lifecycle integration

**Files:** `frontend/app.js`, `frontend/adaptive-test.js`, `frontend/mock-exam.js`, `frontend/history.js`, `frontend/index.html`, `tests/browser_adaptive_test.test.cjs`.

- [x] Map setup to `/practice/{section}`, active ordinary rounds to unique run paths, archive lists/details to `/history` and `/history/{category}/{id}`, tests to `/tests` and `/tests/{id}`, and mock picker/intros/sessions to `/mocks`, `/mocks/{paper}` and `/mocks/sessions/{id}`.
- [x] Save ordinary answers and stop audio/recording on Back; Forward restores only the matching in-memory round. Expired countdowns do not reset. Replace the round entry with its archived result on submission.
- [x] Save active server sessions before leaving, reject failed departures without losing the current entry, and restore the latest server phase on Forward/refresh. Keep question and phase changes out of browser history.
- [x] Reuse history loading, filtering, review events and existing cleanup; prevent delayed requests from reopening screens after navigation.
- [x] Update refresh regressions to expect direct restoration instead of a forced trip through the homepage.
- [x] Run focused browser regressions using the test runner's isolated server/data root:
  ```powershell
  npx playwright test tests/browser_url_navigation.test.cjs tests/browser_view_navigation.test.cjs tests/browser_adaptive_test.test.cjs tests/browser_mock.test.cjs tests/browser_history.test.cjs tests/browser_audio.test.cjs tests/browser_recorder.test.cjs
  ```

## Task 3: Document and verify

**Files:** `PRODUCT.md`, `docs/technical/architecture.md`, `README.md`, `README.en.md`.

- [x] Document page paths, Back/Forward behavior and the ordinary-practice refresh limitation, keeping both README versions aligned.
- [x] Run syntax/format checks for changed source files, route tests and related browser suites. Verify desktop keyboard/mouse navigation and 125%/150% viewport scaling; inspect the rendered screen in CUA after checking its HTTP status.
- [x] Review the task diff against the pre-edit files for unrelated changes, duplicate requests and owned process/data cleanup; report evidence and remaining limitations.
