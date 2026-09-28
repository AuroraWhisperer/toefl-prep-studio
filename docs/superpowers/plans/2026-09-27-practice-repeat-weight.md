# Practice Repeat Weight Implementation Plan

**Goal:** Make submitted materials less likely to recur in targeted practice, with a configurable decay strength.

**Architecture:** Derive per-material submission counts from the existing successful submission archive. Pass counts into the current question store and use weighted draws without replacement, preserving its non-easy anchor and whole-material constraints.

**Tech Stack:** Existing Python, FastAPI, and pytest; no new dependencies or storage schema.

## Global Constraints

- Keep practice and mock-exam flows distinct.
- Preserve the owner's history, recordings, and running service.
- Use the existing isolated history fixture for tests; do not restart the live service.
- Do not modify question content, scoring, or frontend controls.

## Design

- Add the practice query parameter `repeat_decay`, default `1`, accepted range `0..3`.
- For a material submitted `n` times, use relative weight `1 / (1 + n) ** repeat_decay`.
- `0` disables the penalty; all materials retain positive weights.
- Count each material once per archived submission, including unanswered questions in a submitted set. Existing submission IDs already deduplicate retries.
- Count matching material IDs across task, full-section, bank, and comprehensive submissions. Mock exams use a separate bank and remain unchanged.
- Reading or abandoning a set does not count; explicit submitted question IDs are validated without resampling.

## Steps and Verification

- [x] Add `tests/test_practice_weights.py` covering archive counting, retries, rejection, exact weights, grouped draws, parameter bounds, and unaffected fixed forms. Run it and confirm failures before implementation.
- [x] Add `submitted_material_counts()` in `backend/history.py`, extend `QuestionStore.practice_questions()` in `backend/question_store.py` with keyword-only counts and decay, and wire `repeat_decay` through `backend/app.py`. Run the new tests plus existing practice/history tests.
- [x] Update the behavior contract in `PRODUCT.md` and API usage in `README.md`. Adapt the existing deterministic mocks in `tests/test_practice_alignment.py` to weighted draws without changing their assertions. Run the full pytest suite and review the changes against preserved source baselines. No browser or microphone behavior changes are intended.

## Commands

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_practice_weights.py -q
.\.venv\Scripts\python.exe -m pytest tests/test_practice_weights.py tests/test_task_practice.py tests/test_history.py -q
.\.venv\Scripts\python.exe -m pytest -q
```

## Verification Result

- The 45 new regression cases failed before implementation and passed afterwards.
- Focused practice/history verification: 102 passed.
- Full backend suite after updating the old sampler mocks: 226 passed, with two dependency deprecation warnings.
- OpenAPI exposes `repeat_decay` with default `1` and bounds `0..3`.
- Source diffs, UTF-8 text, and whitespace were checked. No frontend files or owner records were changed; browser/audio checks were not run for this backend-only change.
- The owner's service was not restarted. Changes take effect on its next launch or restart.
