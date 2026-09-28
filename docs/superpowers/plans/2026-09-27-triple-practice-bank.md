# Triple Practice Bank Implementation Plan

> **For agentic workers:** Use subagent-driven development for the independent authoring batches below; keep each worker's source files disjoint and review their results before integration.

**Goal:** Expand the 705 original practice questions to 2,115, with complete, item-specific bilingual teaching notes and unchanged existing questions, IDs, history, and ETS mock papers.

**Architecture:** Retain the current builders and append reviewed source records from `question_bank/sources/expansion_2026_09/`. Each task-type JSON contains `section`, `task_type`, and `items`; each item contains the existing public `question` schema, private `answer` schema, and a `review` record. Apply the existing fingerprint gate to the combined bank before writing generated files.

**Tech Stack:** Existing Python source generator, JSON content, FastAPI, pytest, and Playwright; no new dependencies.

## Global Constraints

- Original practice only: reading 265→795; listening 235→705; writing 150→450; speaking 55→165.
- Preserve every existing item and complete material groups; do not copy ETS passages or substitute names to manufacture volume.
- Read `docs/question-bank/generation-guidelines.md` before authoring. Difficulty labels are local judgments, not calibrated ETS scores.
- Every explanation has exactly three substantive Chinese lines starting `读懂：`, `解析：`, `下次：`, with actual English evidence and item-specific reasoning.
- Choice explanations justify the key and reject all distractors by content, never by shuffled option letter.
- Reviews contain `difficulty`, `skills`, attested `vocabulary`, `rationale`, `answer_evidence`, and `reviewed_on: 2026-09-27`; seal fingerprints only after reviewing the completed question and answer together.
- Source paths are private. Preserve the original answer-isolation contract and use isolated test data.

### Task 1: Author reading sources

- [x] `complete_words.json`: R266–R565, 30 paragraphs, groups cloze_16–cloze_45.
- [x] `read_daily_life.json`: R566–R695, 50 two-question and 10 three-question materials, groups read_daily_life_31–read_daily_life_90.
- [x] `read_academic_passage.json`: R696–R795, 20 five-question passages, groups read_academic_passage_11–read_academic_passage_30.
- [x] Verify spelling, ten alternating cloze targets, literal evidence, all choice keys, complete material groups, and distinctive topics.

### Task 2: Author listening sources

- [x] `listen_choose_response.json`: L236–L405, 170 pragmatic exchanges.
- [x] `listen_conversation.json`: L406–L505, 50 two-question conversations, groups 26–75.
- [x] `listen_announcement.json`: L506–L585, 40 two-question announcements, groups 21–60.
- [x] `listen_academic_talk.json`: L586–L705, 30 four-question talks, groups 16–45.
- [x] Verify natural spoken syntax, supported inference, distinct distractors, lengths, and pooled answer cues.

### Task 3: Author productive sources

- [x] `build_sentence.json`: W151–W250, 100 contextual framed items with exact-tile accepted orders.
- [x] `write_email.json`: W251–W350, 100 different situations, three actionable requirements, references, and task-specific commentary.
- [x] `academic_discussion.json`: W351–W450, 100 developed debates and supported reference contributions.
- [x] `listen_repeat.json`: S56–S125, 10 coherent seven-sentence sets, groups 6–15.
- [x] `take_interview.json`: S126–S165, 10 four-question interview sets, groups 6–15; include illustrative responses, not mandatory opinions.
- [x] Verify sentence frames and alternate answers, reference instruction coverage, and speaking timing/speakability.

### Task 4: Integrate and verify

- [x] Add regression tests for exact triple counts, item preservation, source/answer/review coverage, nonduplicate material, and private answers.
- [x] Extend only the generator's append path, expected counts, and catalogue source mapping. Retain the original review records byte-equivalently as values.
- [x] Run `./.venv/Scripts/python.exe scripts/build_question_bank.py` and `./.venv/Scripts/python.exe -m pytest -q`.
- [x] Run `npm run test:browser` with its isolated server/data directory; inspect representative new prompts and submitted explanations.
- [x] Update the owning README/count tables and expansion audit with actual results and unverified limitations.

Final validation: 362 pytest tests passed. All 154 browser cases are covered by the full run and the successful focused rerun after two obsolete audio assertions were corrected. See [expansion report](../../question-bank/expansion-2026-09-27.md) for results and limitations.
