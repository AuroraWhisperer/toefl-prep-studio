# Question Quality Repair Implementation Plan

**Goal:** Resolve the specific defects in the September 27 realism review without expanding the bank, changing IDs, or claiming official score equivalence.

**Architecture:** Edit the existing source tuples/dictionaries, review the affected groups, and regenerate through the existing builder. Preserve public/private separation and official mock source files. Add bounded regression checks rather than a new content pipeline.

**Tech stack:** Python/FastAPI, JSON, vanilla JavaScript, pytest, existing Playwright suite. Execute inline; no delegation or commits.

## Constraints
- Preserve all 705 IDs, complete groups, user history, recordings, running services, and unrelated edits.
- Do not refresh review metadata for untouched items.
- Use isolated test storage; local targets are not ETS rules.

## Tasks and acceptance
- [x] Revise weak response options and short conversations/talks in `receptive_items.py` and `expanded_listening.py`. Review all changed options with the original intent/key; compare pooled answer-length cues and material lengths.
- [x] Add discourse insertion tasks to selected existing academic groups in `expanded_reading.py`; retain five questions and ensure the marked passage supports all other questions without the omitted sentence.
- [x] Revise statement-heavy sentence items, their frames, contexts, and alternatives; verify exact tile assembly, natural context, and question coverage.
- [x] Expand all email/discussion stimuli in `base_productive.py` and `expanded_productive.py`, adjusting references when required; review each requirement and stance. Shorten overburdened repeat sentences in those same sources while preserving coherent seven-sentence groups.
- [x] Add focused regressions for repetitive subjective responses and official speaker tags. Limit heuristic claims; verify good existing references still receive useful feedback.
- [x] Update only reviewed metadata/fingerprints, regenerate, and run pytest, JavaScript syntax checks, and the relevant browser suites. Compare untouched source/data snapshots and check examples at desktop scaling.
- [x] Add the concise English generation guide and link it from `AGENTS.md`; update stale owning documentation at completion.
- [x] Publish a concise change log with actual changed IDs/counts, verification results, and remaining scoring/audio calibration limitations.

## Completion

See `docs/question-bank/quality-revision-2026-09-27.md`: 332 items revised, all 705 IDs retained, 294 Python tests passed, and browser failures resolved in isolated reruns. Concurrent listening explanation edits were preserved; final source, generated answers, and review fingerprints agree. The owner's running service and saved history were not changed by this work.
