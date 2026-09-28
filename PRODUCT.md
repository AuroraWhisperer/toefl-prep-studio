# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing FastAPI backend with a static HTML/CSS/JavaScript frontend; keep the current stack for this build.

## Users

The primary user is the project owner practicing TOEFL independently. The user opens one section at a time, chooses a fixed full-section practice form or one of 12 task practice types, and reviews immediate feedback.

## Product Purpose

The product provides a local TOEFL iBT 2026 practice workspace for Reading, Listening, Speaking, and Writing. Success means each section can be practiced independently with an original question bank, separated answer keys, server-side scoring, and clear feedback.

## Positioning

The differentiator is a local, inspectable practice loop: original prompts are separated from answer keys, so the same app can be extended without putting answers in the browser payload before submission.

## Operating Context

The user runs the FastAPI app on a local computer, opens the browser, selects a section and either a fixed form or a task with quantity and timing settings, listens or records when required, submits a set, and compares answers and feedback with the original materials.

The owner's target device is a 2560×1440 Windows desktop, including 125% and 150% display scaling; mobile is not a target for this workflow. A Windows double-click launcher opens the local page when ready. Window maximization and fullscreen are handled by the browser.

## Capabilities and Constraints

- Support the post-January-21-2026 TOEFL iBT task descriptions.
- Provide 2,115 original items: Reading 795, Listening 705, Speaking 165, Writing 450 (150 of each writing type). Each of the 12 task pools is exactly three times the previous 705-item bank; original IDs/content and the separate ETS mock forms are preserved. New material includes item-specific teaching notes and, for open-ended production, illustrative responses rather than mandatory opinions or official full-score claims.
- Preserve fixed exam forms selecting Reading 50, Listening 47, Writing 12 (10/1/1), and Speaking 11 (7/4).
- Offer five original-bank comprehensive-test profiles at default levels 2, 4, 5, 7 and 10, with selectable starting levels 1–10. Reading and Listening adapt independently between modules within each profile's bounds; Writing and Speaking remain linear. Preserve complete materials and no repeats within a session; different forms can overlap. Sessions resume without resetting server deadlines, and completed tests save to Test history with only objective totals and manual review for open responses. These are local training levels, not ETS calibration or official scores. See [adaptive test specification](specs/adaptive-tests.md).
- Let the user practice 12 task types across Reading, Listening, Speaking, and Writing separately, with task-specific quantity options and random selection of complete material groups without repetition within a round.
- Reduce repeat exposure in task practice using relative material weight `1 / (1 + submitted_count) ** repeat_decay`. The API parameter defaults to `1`, accepts `0..3`, and `0` disables decay. Count each material once per successfully archived submission, including existing task, full-section, bank, and comprehensive-test records; unanswered items in a submitted set count too. Submission-ID retries do not count twice; merely opening or abandoning a round does not count. Preserve non-easy anchors, whole-material selection, and no repeats within a round. Fixed forms, the separate mock bank, and scoring remain unchanged; there is no decay-strength UI control. The archive's confirmed 重置概率 action persistently excludes existing submission IDs from repeat counts while preserving records and recordings; new submissions count again. Its separate 全部清空 action deletes every category's archived records and recordings and resets counts, regardless of current filters, while preserving active/abandoned mock sessions and question banks. See [history-management design and checks](specs/history-management.md).
- Reading, Listening, and Writing practice offer countup or countdown timing; Speaking uses countdown timing. Setup shows the selected quantity and total countdown duration.
- Unreadable or malformed archives produce an identifiable diagnostic rather than empty history or silently reset sampling weights. Reads do not repair, overwrite, or delete the source files. Rebuildable in-memory indexes accelerate repeated reads while JSON remains authoritative; see [archive diagnosis and recovery](specs/history-management.md#archive-diagnostics-and-recovery).
- Reading includes inline missing-letter completion, daily-life texts, and academic passages.
- Build a Sentence uses word-group tiles and underline blanks, with optional fixed text anywhere in the sentence and optional unused tiles; see [verified format](docs/question-bank/sentence-format.md).
- Review every task by material group, with answers, references, explanations, and time on the left and original materials, prompts, and options on the right. These panes stack in narrow desktop windows as a fallback, not a mobile target; missing-letter review can reveal correct answers in the passage.
- Show identical feedback and explanation text only once in review; preserve distinct feedback. All original tasks and completed mock forms offer beginner-friendly Chinese/English learning explanations in three parts: meaning, reasoning or response organization, and a specific next-time strategy. Mock learning notes are locally authored, not official ETS explanations. See [explanation authoring rules](question_bank/README.md#解析写作约定).
- Saved practice review can display updated learning explanations only when the archived question and reference answer still match the current bank. This is a read-only presentation layer: archived answers, scores, original feedback, and recordings are not rewritten; mismatched versions retain their original explanation.
- Use browser SpeechSynthesis and MediaRecorder where available, with text input fallbacks.
- Keep question JSON and answer JSON in separate directories.
- Scores are practice raw points; omitted answers count as zero. Subjective feedback uses transcript heuristics, with a low-score safeguard for dominant repeated phrases. Passing length and keyword checks does not establish task fulfillment or language quality; these checks do not provide official scoring or pronunciation assessment.

## Evidence on Hand

- Current repository: `backend/app.py`, `backend/scoring.py`, `frontend/index.html`.
- The app supports four sections, twelve task practice types, and grouped answer review; the original three-question speaking API remains available for compatibility.
- Original practice content and the five locally imported ETS mock forms remain in separate banks; see `question_bank/README.md` for source and import boundaries.

## Product Principles

- One section at a time so practice stays focused.
- Original content with explicit task labels.
- Feedback should explain the skill being tested.
- Keep the local app usable when optional audio or speech APIs are unavailable.

## Accessibility & Inclusion

- Use semantic labels, visible keyboard focus, sufficient contrast, responsive layout, and reduced-motion support.
- Every audio or recording interaction has a visible text fallback.
