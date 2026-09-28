# Frontend Modularization Implementation Plan

> **For agentic workers:** Execute this plan task-by-task in the current session. The usual `superpowers:executing-plans` helper is not available in this environment; preserve its small-batch implementation and verification checkpoints. Do not delegate or commit into the parent user-directory Git repository.

**Goal:** Reduce frontend responsibility and state coupling incrementally without changing practice, mock exams, review, appearance, or stored data.

**Architecture:** Preserve the vanilla deferred-script architecture. Extract cohesive components with explicit inputs and callbacks, not a shared global application-state module. Keep practice and mock-exam state machines separate and reuse the existing prompt-audio implementation.

**Tech Stack:** FastAPI, vanilla HTML/CSS/JavaScript, existing Playwright and pytest suites; no additional dependencies or build step.

**Status:** All five stages and integrated acceptance completed on 2026-09-27. The final acceptance record below supersedes the historical checkpoints and expansion blocker.

## Global Constraints

- Personal Windows desktop browser; preserve 2560×1440 and 100%/125%/150% display-scale behavior.
- Do not modify question sources/generated banks, backend API contracts, saved histories, recordings, or the owner's running service.
- Browser verification uses the existing isolated server/data-directory configuration and a free `TOEFL_TEST_PORT`; never stop another service.
- Preserve escaped question text, accessible labels, keyboard/mouse behavior, timers, cancellation, retry behavior, and script/style ordering.
- Never give extracted components the complete application `state` or let them reach into unrelated page DOM.
- Verify one component before proceeding. Final completion requires the entire staged scope, not only the first extraction.

## 1. Sentence component

**Files:** Create `frontend/practice-sentence.js`; update `frontend/app.js`, `frontend/index.html`, and `tests/browser_sentence.test.cjs`.

**Interface:** `createSentenceBuilder({ escapeHtml })` returns `markup(question, order, selectedSlot)` and `mount(root, { question, initialOrder, onChange })`. `mount` owns a copied slot order and selection, reports `{ order, answer }`, and returns a disposer. The app retains session answers and per-question saved orders.

- [x] Add a component contract test: instance independence, immutable input order, exactly one callback per edit, disposer removes listeners, hostile text remains text.
- [x] Run the new test against the unchanged application and confirm the missing-component failure.
- [x] Move the existing rendering and input behavior without changing its markup, fixed-text fallback, drag identity, blank-answer semantics, or focus rules.
- [x] Load the component before the app; connect it through explicit callbacks and dispose old bindings when rendering a different question.
- [x] Run `node --check` on changed JavaScript and `npm run test:browser -- tests/browser_sentence.test.cjs`; inspect failures before continuing.

## 2. Practice review component

**Files:** Create `frontend/practice-review.js`; update `frontend/app.js`, `frontend/index.html`, and relevant review/history browser tests.

**Boundary:** Own result/review DOM, selected material, reveal toggle, and grouping inside the component. Receive the submitted result, question snapshot, recordings, section labels, and narrow content-formatting callbacks. Return/archive navigation and recording upload orchestration stay in the app. Do not add a second copy of question material rendering.

- [x] Inspect the current result/source rendering and tests; add a regression for switching between new results and historical review without stale selection or duplicated handlers.
- [x] Extract review state and rendering while preserving markup and all existing explanation/reference-answer rules.
- [x] Remove the app's now-orphaned state, handlers, and functions; preserve audio cancellation before material changes.
- [x] Run syntax checks and the sentence, review, history, and affected audio browser tests.

## 3. Practice recording lifecycle

**Files:** Create `frontend/practice-recorder.js`; update its app integration, script loading, and audio/recording browser tests.

**Boundary:** Own microphone streams, MediaRecorder, speech-recognition handles, recording timeout, and cancellation identity. Send completed recordings/transcripts to the app through callbacks. The app continues to own session recordings, upload retries, and submission identity. Do not merge this workflow with timed mock recording.

- [x] Establish tests for cancellation while permission is pending, question/session changes, stop-before-submit, delayed recorder completion, and manual-transcription fallback.
- [x] Extract only the recording lifecycle; preserve submission's wait for the recorder stop event and the existing stale-session protections.
- [x] Verify targeted audio/recording tests and syntax before proceeding.

## 4. View transitions

**Files:** Introduce a small frontend view-transition module and update `app.js`, `history.js`, `mock-exam.js`, `index.html`, and navigation tests.

**Boundary:** Centralize section visibility and explicit enter/leave hooks. Each feature retains its own cleanup, focus target, timers, drafts, and request cancellation. Preserve existing history event payloads unless all producers/consumers and tests are updated together.

- [x] Trace every current transition and record focus/cleanup behavior before changing it.
- [x] Test practice → home, setup → practice → setup, history → practice review → history, and history → mock review → history; ensure one active view and no duplicate requests/listeners.
- [x] Route existing transitions through the small shared entry point without introducing a framework or combining state machines.
- [x] Run navigation, history, mock, and audio lifecycle regressions.

## 5. Stylesheet responsibilities and final verification

**Files:** Keep shared tokens/base rules in `frontend/styles.css`; extract cohesive landing, practice, and review style ownership as supported by the actual cascade; update `index.html` and the owning architecture documentation.

- [x] Capture baseline rendered/computed styles on representative homepage, question, setup, and review views before CSS changes.
- [x] Move related rules only when source order and shared dependencies can be preserved; do not mix visual redesign into the split.
- [x] Compare desktop rendering at 100%/125%/150%, including keyboard focus, long material, and resized windows.
- [x] Run all frontend syntax checks, the full browser suite, and `python -m pytest tests -q` in isolated test storage. Scope pytest to `tests/` while other work creates copied test trees under `artifacts/`.
- [x] Inspect the final changed-file set, script/style resource responses, documentation links, and owned process/data cleanup (recursive data cleanup was rejected by execution policy; see final record).
- [x] Document actual results and remaining limitations; only mark the goal complete after all stages and checks are satisfied.

## Execution Record

- Plan created before code changes. Prior review reported 306 pytest passes and four JS syntax checks, but those results are historical evidence rather than verification of the upcoming edits.
- Existing backend boundaries, data storage, mock-exam state machine, and `audio-cache.js` are intentionally outside the structural changes.
- Stage 1: the unchanged app passed the four existing sentence tests and failed only the new missing-component assertion. After extraction, all five passed (7.5 seconds); changed JavaScript syntax checks passed. Tests used port 8776 and the runner-owned temporary data directory.
- Stage 2: the new historical-review test first failed on the missing component. Its first integration run caught an omitted result-container reference before further extraction; that reference was restored and the now-unused review-state field removed. Both new review tests then passed, including private DOM ownership, one listener per action, disposal, immutable inputs, and selection/reveal reset across new and historical results.
- The first full checkpoint passed 125 browser tests and 306 pytest tests (two dependency deprecation warnings). Its source guard detected concurrent updates to three stylesheets and their HTML cache keys; these changes were preserved rather than reverted. A fresh full browser run includes the concurrently added palette tests and must finish on stable source before this batch is closed.
- Additional differential checks compared the extracted renderer with the pre-edit code: 612 sentence-markup cases (all 50 current sentence questions plus one legacy fixture) and 180 practice/review cloze cases (15 material groups) were byte-for-byte identical. These are rendering-parity checks, not a replacement for browser interaction tests.
- Evidence is stored under `artifacts/qa/frontend-modularization-b5b3dd00-11d6-4bf3-8069-3ee14b6e5327/`; the original stability failure remains in `verification.json` rather than being overwritten by the follow-up run.

### Historical checkpoint: extracted components, integration still in progress

- The second full browser run passed **129 tests** (5.5 minutes), including four concurrently added palette tests. Its broad post-run hash loop was interrupted because another in-progress question-bank task removed `question_bank/sources/expansion_2026_09/_author.py`; this was a verification-script error, not a browser assertion failure. No unrelated files were restored or deleted.
- A subsequent focused run passed **36 tests** (1.6 minutes): sentence, review, all twelve practice tasks, history/recording archival, and palette checks. The persisted source guard reported concurrent backend, test-fixture, and expansion-source changes; it does **not** establish a frozen whole-project baseline.
- The latest backend run scoped to the repository tests reported **318 passed / 31 failed** (55.67 seconds). Observed failures include newly expected 2,115 questions versus 705 generated questions, 45 versus 15 cloze groups, missing expansion-source files, and updated mock/resource expectations. These are outside this frontend extraction's writes. Do not regenerate banks, alter reviews, weaken assertions, or revert the adaptive-test implementation merely to make this checkpoint green.
- An unscoped pytest attempt also collected another task's `artifacts/adaptive-tests-baseline/tests/test_mock_exam.py` and hit an import-name collision. Its diagnostic is preserved in `pytest-current.log`; `pytest-final-scoped.log` records the actual repository-test failures.
- Concurrent adaptive-test integration subsequently modified both `app.js` and `practice-review.js`. It adds combined-section task labels and adaptive/manual-review presentation while retaining the extracted factories. Those changes were inspected and preserved. Therefore the earlier 1,059-line app size and unchanged-module hashes are historical checkpoints, not claims about the current file.
- After those overlapping edits, all **three new component/state-isolation regressions passed** (4.0 seconds). Syntax checks passed, and SHA-256 hashes of both components, the app, HTML entrypoint, and their two test files remained unchanged throughout that run. See `browser-components-current.log` and `verification-components-current.json`.
- Tests used an isolated server on 8776 and runner-owned data; the final component run left no listener on that port. The owner's service was not restarted. Real microphone and online speech-service quality remain outside these tests.
- The overall goal remains **active**, not complete: steps 3–5 and stable integrated acceptance remain open. Step 2's final integration checkbox stays open because the shared application continues to change, despite the successful extraction-specific checks.

### Revalidation before the next batch

- Re-read current adaptive-test code and callers before extracting recording: both ordinary `submitExam` and the newly added `saveTestRecordings` / `returnFromExam` flows must preserve their recorder-stop ordering and draft/session guarantees.
- Re-enumerate views and transition events before step 4; include the newly added test flow rather than using the pre-integration page list.
- Treat the current semantic palette as the future CSS baseline; do not restore the older theme or claim that this refactor authored the concurrent palette changes.
- Re-run the repository-scoped backend tests after the in-progress question-bank/adaptive-test changes have settled. The current 31 failures are an integration limitation, not a reason to mark the full goal complete or to mark it blocked on its first occurrence.

### Stage 3: recording lifecycle checkpoint

- Added `practice-recorder.js`: owns streams, MediaRecorder, recognition, timeout and cancellation identity. The app receives blobs/transcripts and retains session identity, object URLs, upload queues and retry handling.
- Six characterization tests passed before extraction; eight targeted cases (including denied/unavailable microphone fallback) passed after extraction. The subsequent audio, recorder and history run passed **59 tests** (2.2 minutes), including real MediaRecorder with Chromium's fake microphone.
- Both adaptive submit and save/return wait for delayed recording completion, upload exactly once, then submit/save. A manual stop immediately followed by submit now also waits for the outstanding stop event instead of losing the final blob.
- Logs: `artifacts/qa/recorder-modularization/`. Real hardware and online speech quality were not tested.

### Stage 4: transition inventory before editing

| Transition | Existing cleanup and focus owned by the feature |
| --- | --- |
| Landing → setup / setup tab | Render choices; scroll to top; keyboard tab navigation restores selected tab focus |
| Landing or setup → practice | Stop old recording/audio, reset session, start timer, render question; scroll to top |
| Practice → setup / landing | Stop timer, recorder and prompt cache, invalidate practice identity, revoke blob URLs; returning to setup focuses Start |
| Practice → result | Await recorder stop; preserve recording archive/retry; release prompt cache; scroll to top |
| Adaptive selection / directions / exam / result | Existing `present` and `showTestSession` retain session, draft, deadline and upload ordering; directions focus title |
| History open / close | Pause audio; send existing `history-opened` cleanup event; title focus on entry; abort pending history request on close and focus archive button |
| History → practice review → history | Keep `open-history-practice` payload; use result return-button focus, then history title focus |
| History → mock review → history | Keep `open-history-mock` payload; mock cleanup, render and focus Return; history title focus on return |
| Mock entry / home | Keep its independent recorder/timer/cache cleanup and library rendering; home focuses mock-library button |

Only top-level `.app-shell > section` visibility moves to the shared entry point. Nested panels, feature state machines, focus targets and asynchronous workflows keep their owners.

### Pre-expansion checkpoint: all extractions implemented, global acceptance pending

- Navigation baseline: two round-trip tests passed before extraction. The first integrated run caught a remaining `adaptiveTest.hide()` caller; it was removed and a full search verified no remaining callers. The corrected navigation/adaptive/mock/recorder suite passed **32 tests**, including nine-stage mock completion, recording archival, original history payloads, return focus, one visible top-level view and one request per action.
- `view-navigation.js` owns only section visibility and explicit leave/enter callbacks. The app and three feature modules use that single entry point. Existing audio, focus, draft and cleanup ownership remains with each feature.
- CSS now has shared tokens/base/controls in `styles.css` (331 lines), homepage rules in `landing.css`, question and shared material/audio rules in `practice.css`, configuration in `practice-setup.css`, and results in `practice-review.css`. Existing mock/adaptive/history sheets retain their order after those files. All **424 selectors/at-rules with declarations and media conditions** survived extraction; declaration order within each owning file was preserved.
- Before extraction, screenshots and complete computed styles were captured for homepage, settings, reading and review. After extraction those four 100% views matched both computed styles and screenshots exactly. Existing desktop visual/interaction suites passed at 100%, 125% and 150%, including all twelve tasks, long content, keyboard focus and narrow desktop safeguards. Additional 125% sentence and 150% reading/review screenshots were inspected; resizing review to 1000×800 remained within the viewport. Device scale was emulated; native Windows settings were not changed.
- The extended per-state CSS comparison encountered transient inherited SVG colors immediately after selecting answers, and its long REPL call timed out. Those partial comparisons are diagnostic evidence, not a claim of universal pixel equality. Follow-up checks after rendering settled confirmed white selected checkmarks at 125% and 150%; the full color and interaction suites passed. The QA browser was subsequently closed.
- Final full browser run: **148 passed / 6 failed** (6.4 minutes). Every failure is in `browser_bank_expansion.test.cjs:26`: the requested newly generated question is absent before page navigation. The other 148 include sentence/review isolation, recorder cancellation and delayed completion, adaptive autosave, manual microphone fallback, real MediaRecorder with synthetic input, history retries, all twelve task types, display scales and full mock flow.
- Final repository-scoped backend run: **332 passed / 30 failed** (66.10 seconds; two dependency deprecation warnings). Failures concern the generated 705-question bank versus the 2,115-question expansion, source/review sealing, and expansion content constraints. This frontend batch did not edit those files, regenerate the bank, change keys or refresh fingerprints.
- Source guard captured 125 files. All frontend modules, backend runtime, generated banks and test files remained unchanged from the start of full verification through final inspection. Only expansion source JSON and its temporary authoring scripts changed. `final-audit.json` lists the exact paths; this is not a frozen whole-repository claim.
- All nine frontend scripts and five changed browser test files passed `node --check`. The 17 linked scripts/styles are unique, correctly ordered, HTTP 200 and served with correct MIME types. Referenced module/document paths exist. README documents recorder-stop ordering; DESIGN documents CSS ownership.
- Evidence: `artifacts/qa/recorder-modularization/` contains the baseline, failed-then-fixed navigation logs, full logs, CSS rule audit, snapshots, resource responses and final audit. The failed checks remain visible.
- Test ports 8776 and 8782 no longer listen; owned browser sessions are closed. The execution tool rejected recursive deletion with `blocked by policy`. Its two isolated data directories remain: `artifacts/browser-data/510cfd3c-f07b-46e5-9eb5-433df4cb332a/` and `artifacts/browser-data/9ca524ce-cd6e-4520-88d0-0742c9a850c8/`. No alternate deletion mechanism was used. The owner service and personal history were not operated on.
- The structural implementation is finished. The overall goal remains active because the plan's final integrated acceptance is not globally green while question-bank expansion is still changing. Do not repeat successful extraction work or weaken the content checks. Next acceptance work is to recheck the finalized bank and rerun the currently failing expansion/backend cases after their authoritative inputs change. Real microphone and online speech quality remain outside this automated evidence.


### Historical acceptance blocker audit after three consecutive goal turns

The five implementation stages and their focused regression checks are finished. The same external acceptance blocker was observed in the full-verification turn, the subsequent verified wait, and the current revalidation: generated data is still 705 questions while the existing expansion tests require 2,115. Runtime and test fingerprints remain unchanged. The question-bank chat is confirmed active; it has not stopped or completed.

No further independent refactor work is required. Repeating the same tests cannot change their missing-content precondition, and this task must not publish unreviewed content, rewrite the other chat's sources or weaken its tests. The blocker audit therefore qualifies for goal status `blocked`, awaiting reviewed/generated bank updates. Resume with the failing backend/expansion cases and affected browser tests once those authoritative inputs change. Preserve the already successful extraction work. See `artifacts/qa/recorder-modularization/blocked-audit.json`.

### Final integrated acceptance after expansion completion

- The other task completed the reviewed/generated 2,115-question bank. This batch resumed verification without editing question content, review fingerprints, backend runtime or the completed frontend extractions.
- Repository-scoped backend acceptance: **362 passed** (111.65 seconds; two dependency deprecation warnings), using `python -m pytest tests -q -p no:cacheprovider`.
- Browser full run: **153 passed / 1 failed** (6.4 minutes). All expansion, recording, history, adaptive-test, navigation, review and nine-stage mock cases passed. The sole failure was a test fixture assumption: a randomly selected announcement had an explicit `Man` label, while the test exposed only Aria and expected female speech. The application correctly refused the missing Guy voice.
- Fixed only the audio test fixture: reuse its existing response override for controlled scripts; cover unlabelled, `Man` and `Woman` announcements explicitly; use unlabelled scripts when testing random gender assignment. Assertions still require no automatic speech, the correct voice/text, replay stability and no extra TTS requests. No production audio change was needed.
- The entire affected audio file then passed **41 tests** (1.7 minutes). Current browser coverage is **156 tests**: 115 unaffected cases from the full run plus all 41 current audio cases. This is full-suite plus affected-file revalidation, not a claim that one final invocation ran 156 tests.
- All 128 guarded runtime, source and test files were unchanged throughout the full run. Between runs, only `tests/browser_audio.test.cjs` changed intentionally; the guarded files stayed unchanged during audio revalidation. All nine frontend scripts and seven relevant browser test files passed syntax checks. The root and all 17 unique linked JS/CSS resources returned HTTP 200 with correct MIME types and dependency order.
- The earlier CSS inventory/parity checks and 100%/125%/150% desktop interaction evidence still apply: production frontend files did not change in this acceptance pass. The latest full run includes the scale, keyboard, narrow-window, long-content and expanded-bank regressions.
- Both resumed test runners exited. Port 8776 has no listener and their temporary data was cleaned by normal teardown. The two older directories whose deletion was rejected remain untouched; no alternative deletion mechanism was attempted. The owner's service and personal data were not operated on. Real microphone hardware and online speech-service quality remain unverified.
- Evidence: `artifacts/qa/recorder-modularization/acceptance-final.json`, `pytest-acceptance.log`, `browser-acceptance.log`, `acceptance-audio-failure.md`, `browser-audio-acceptance.log` and `browser-acceptance-list.txt`. Earlier failures remain as historical evidence. The staged modularization goal is complete; no required implementation or acceptance work remains.
