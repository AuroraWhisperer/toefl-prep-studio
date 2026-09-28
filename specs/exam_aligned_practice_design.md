# Exam-aligned practice

Each practice choice represents one or more complete tasks or sample parts from ETS specifications or ETS Practice Test 1. Daily-life reading randomly draws complete texts, each with two or three questions according to the material. Two texts may total four, five or six questions; four texts may total eight through twelve. Each block contains medium or hard content; there is no requirement to include easy questions.

Regression coverage is maintained in [the practice alignment tests](../tests/test_practice_alignment.py) and [the browser tests](../tests/browser_practice.test.cjs).

## Frontend

Read block sizes, physical units, timing and source explanations from the manifest. Preserve the current settings flow and input handling. Display additional repetitions as additional practice; use actual group sizes in the question guide.

## Backend

The authoring structure defines allowed material sizes and the number of materials per task block. The question store selects whole groups and validates submitted IDs against their actual complete membership. Selection cannot split a text, reuse a group, or return an entirely easy block. Time is summed from the actual selected materials. Fixed section forms remain deterministic so retries score the original selection.

## Validation and data access

Retain the local-only API, request schemas, private answer files and existing output escaping. Validate counts and submitted IDs on the server; do not trust the UI's count summary. New authoring evidence stays outside public routes. No new authentication or storage is needed for this local task.

## Sources

- [ETS 2026 specifications](https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-test-specifications-2026.pdf), task counts and adaptive/linear distinction.
- [ETS Practice Test 1](https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-1.pdf), printed pages 3–5, 15–18 and 26–29. Verified 2026-09-26.

Official sources establish structure, not the statistical difficulty of this original question bank. Replay, transcripts, scoring heuristics and fixed section forms retain their existing practice limitations.
