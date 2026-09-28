# Beginner-Friendly Teaching Explanations Implementation Plan

**Goal:** Refine all 705 original and 485 imported-mock teaching explanations into understandable bilingual reasoning, without altering questions, scoring, or saved work.

**Architecture:** Keep private teaching notes in the existing source/generation workflow. Display one copy of identical feedback; overlay updated explanations on compatible historical questions without changing archived records. Release mock notes only after the complete exam.

**Tech Stack:** Existing Python/FastAPI, JSON question sources, vanilla JavaScript, pytest, Playwright.

## Constraints
- Preserve IDs, official materials, answer keys, accepted sentence variants, scoring logic, recordings, and original history files.
- Use three lines: `读懂：` (translated evidence), `解析：` (reasoning and traps), `下次：` (a specific reusable approach).
- Keep at most two subagents active; remaining work runs sequentially within their assigned files.
- Do not restart the owner's service; browser checks use isolated `TOEFL_DATA_DIR` storage.

## Execution and Checks
- [x] Locate duplicate rendering and preserve distinct personal feedback in `frontend/app.js`; add review regressions.
- [x] Integrate cloze/productive teaching maps into `scripts/build_question_bank.py`, preserving interview reference points.
- [x] Add read-only historical teaching overlays and test archive immutability in `tests/test_history.py`.
- [x] Add completed-mock learning disclosures and private note version/coverage tests.
- [x] Finish and review all source notes against the exact materials, options, keys, and accepted variants.
- [x] Update only reviewed content fingerprints, regenerate, and compare questions/scoring inputs to the task baseline.
- [x] Run pytest, JavaScript syntax checks, and focused browser regressions; inspect desktop explanation screenshots at 125% and 150% scaling.
- [x] Review task-only changes, clean up owned test resources, and report actual coverage and remaining limitations.

## Verification Commands
```powershell
./.venv/Scripts/python.exe scripts/build_question_bank.py
./.venv/Scripts/python.exe -m pytest -q
node --check frontend/app.js
node --check frontend/mock-exam.js
$env:TOEFL_TEST_PORT='38772'
npx playwright test tests/browser_review.test.cjs tests/browser_practice.test.cjs tests/browser_sentence.test.cjs tests/browser_history.test.cjs tests/browser_mock.test.cjs
```
