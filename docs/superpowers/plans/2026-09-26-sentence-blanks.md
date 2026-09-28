# Sentence Blanks Implementation Plan

> Execute locally, task by task, with focused regression checks.

**Goal:** Align original writing practice with ETS Build a Sentence blanks, fixed text and optional extra word groups.
**Architecture:** Extend the existing practice question generator and practice renderer. Preserve the mock exam's existing template/token contract and server-side scoring. Keep original content and IDs; do not copy third-party screenshots into the bank.
**Tech Stack:** FastAPI, vanilla JavaScript/CSS, pytest, Playwright.

## Constraints
- Desktop only, including 2560×1440 at 125% and 150% scaling.
- Do not restart the owner's service or change history/recordings.
- Keep answers private; regenerate from reviewed sources, not generated JSON alone.

## Tasks
- [x] Extend `question_bank/sources/sentence_answers.py` and `scripts/build_question_bank.py` with reviewed frames and optional distractors; test assembly of every accepted answer and regenerate only after reviewing the 50 affected items.
- [x] Update `frontend/app.js` and sentence styles: blank lines, immutable fixed text, single-use token indices, click/keyboard/drag/undo/reset and navigation retention; preserve text-based server submissions and review history compatibility.
- [x] Update focused pytest/Playwright regressions and owning documentation; run bank audits, JavaScript syntax checks, relevant/full tests, and isolated desktop screenshots. Review changes against the saved pre-edit baseline.

## Evidence
ETS Writing description and Practice Test 1 (printed pp. 26–27) show entirely blank sentences, fixed text at different positions, and seven supplied groups for six blanks in item 1. Practice Test 2 (printed p. 28) also shows a fixed suffix and extra groups. See `docs/question-bank/sentence-format.md` for verified URLs and examples.

## Verification results
- Full pytest suite: 181 passed; the 98 focused tests also passed after final assertions.
- Full browser suite: 84 passed, including complete nine-stage mock flow and legacy cached practice payloads.
- JavaScript syntax and mock isolation audits passed. Desktop screenshots reviewed at 125% and 150% scaling.
- All original practice answer keys, non-sentence writing items and IDs unchanged. Only the 50 reviewed sentence fingerprints changed.
- User service and personal data were not restarted or modified. Browser tests use their existing isolated-data teardown.
- A cleanup command was denied by the execution policy; the temporary pre-edit baseline remains at `C:/Users/Tom/AppData/Local/Temp/toefl-sentence-before-abl3y0zk`. No alternate deletion was attempted.
