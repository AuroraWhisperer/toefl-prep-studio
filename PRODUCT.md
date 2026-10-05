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

The owner's target device is a 2560×1440 Windows desktop, including 125% and 150% display scaling; mobile is not a target for this workflow. A Windows double-click launcher runs the service in the system tray and opens the local page when ready. Its tray menu reopens the page, shows the local log, or gracefully stops its own service; closing the browser leaves the service running. Repeated launches reuse the existing service. Window maximization and fullscreen are handled by the browser.

## Capabilities and Constraints

- Give screens local paths and support browser Back/Forward: subject setup, the current ordinary round, saved review, mock selection/sessions and comprehensive tests. Leaving a server session saves its current work; a failed save keeps the learner on the current screen. Browser navigation does not create a new round or reset deadlines. Ordinary unsubmitted work remains available only for the current in-memory round; refresh returns to setup (home for a fixed form). See [page routes](docs/technical/architecture.md#页面路径与浏览器导航).
- Support the post-January-21-2026 TOEFL iBT task descriptions.
- Provide a small homepage entry to `/guide`, explaining all 12 task types with whole-section reference passage/recording counts and questions per material. Derive material counts from the ETS 2026 blueprint including unscored items, label them as references, and explicitly identify counts ETS has not fixed. Writing and Speaking state what the learner must produce and any official response limits. Practice times use plain material units and current metadata; the guide offers keyboard-accessible subject disclosures and browser history, and links to the official evidence. See [the timing review](docs/toefl-2026-guide.md).
- Provide 5,745 original items: Reading 3,390, Listening 1,410, Speaking 495, Writing 450 (150 of each writing type). The October 5 expansion adds 180 cloze passages, 30 repetition groups and 30 interview groups: their pools now contain 270 passages / 2,700 blanks, 45 groups / 315 sentences and 45 groups / 180 questions respectively. Each is three times its pre-expansion size; see the [expansion report](docs/question-bank/cloze-speaking-expansion-2026-10-05.md). Preserve the 3,615 previously reviewed items and their IDs, keys and review metadata.
- Difficulty reflects the learner's actual task, including visible clues, syntax, collocations, information integration and memory demands. Retain grammatical targets at every cloze level and contextualize specialist vocabulary. Do not equate difficulty with rare words, enforce level quotas, or judge a prompt by its illustrative answer. Open responses may support different positions; authoring and review follow [AGENTS](AGENTS.md#question-design-principles) and the [generation guide](docs/question-bank/generation-guidelines.md).
- Preserve fixed exam forms selecting Reading 50, Listening 47, Writing 12 (10/1/1), and Speaking 11 (7/4).
- Offer five original-bank comprehensive-test profiles at default levels 2, 4, 5, 7 and 10, with selectable starting levels 1–10. Reading and Listening adapt independently between modules within each profile's bounds; Writing and Speaking remain linear. Preserve complete materials and no repeats within a session; different forms can overlap. Sessions resume without resetting server deadlines, and completed tests save to Test history with only objective totals and manual review for open responses. These are local training levels, not ETS calibration or official scores. See [adaptive test specification](specs/adaptive-tests.md).
- Let the user practice 12 task types across Reading, Listening, Speaking, and Writing separately, with task-specific quantity options and random selection of complete material groups without repetition within a round.
- Reduce repeat exposure in task practice using relative material weight `1 / (1 + submitted_count) ** repeat_decay`. The API parameter defaults to `1`, accepts `0..3`, and `0` disables decay. Count each material once per successfully archived submission, including existing task, full-section, bank, and comprehensive-test records; unanswered items in a submitted set count too. Submission-ID retries do not count twice; merely opening or abandoning a round does not count. Preserve non-easy anchors, whole-material selection, and no repeats within a round. Fixed forms, the separate mock bank, and scoring remain unchanged; there is no decay-strength UI control. The archive's confirmed 重置概率 action persistently excludes existing submission IDs from repeat counts while preserving records and recordings; new submissions count again. Its separate 全部清空 action deletes every category's archived records and recordings and resets counts, regardless of current filters, while preserving active/abandoned mock sessions and question banks. See [history-management design and checks](specs/history-management.md).
- Reading, Listening, and Writing practice offer countup or countdown timing; Speaking uses countdown timing. Setup shows the selected quantity and total countdown duration. Each task choice also shows its original-bank total from metadata beside its name, using the task's quantity unit (篇/组/题); bank totals are separate from the selected round quantity.
- Unreadable or malformed archives produce an identifiable diagnostic rather than empty history or silently reset sampling weights. Reads do not repair, overwrite, or delete the source files. Rebuildable in-memory indexes accelerate repeated reads while JSON remains authoritative; see [archive diagnosis and recovery](specs/history-management.md#archive-diagnostics-and-recovery).
- Reading includes inline missing-letter completion, daily-life texts, and academic passages. In practice and comprehensive tests, typing a letter in a word's final missing-letter slot advances focus to the next word's first slot in the same passage; the final word retains focus.
- Reading vocabulary questions highlight the quoted word or phrase in the original material, respecting an explicit paragraph reference. On entry, an independently scrolling academic passage moves to that paragraph and keeps the target visible; selecting an answer preserves the learner's manual scroll position. Task practice, full-section practice, and comprehensive tests share this behavior.
- Build a Sentence uses word-group tiles and underline blanks, with optional fixed text anywhere in the sentence and optional unused tiles; see [verified format](docs/question-bank/sentence-format.md).
- Review every task by material group, with answers, references, explanations, and time on the left and original materials, prompts, and options on the right. These panes stack in narrow desktop windows as a fallback, not a mobile target; missing-letter review can reveal correct answers in the passage.
- Show identical feedback and explanation text only once in review; preserve distinct feedback. All original tasks offer beginner-friendly Chinese/English learning explanations in three parts: meaning, reasoning or response organization, and a specific next-time strategy. Completed mock forms show these notes when locally reviewed supplements are installed; missing notes are identified in review. Mock learning notes are locally authored, not official ETS explanations. See [explanation authoring rules](question_bank/README.md#解析写作约定).
- Saved practice review can display updated learning explanations only when the archived question and reference answer still match the current bank. This is a read-only presentation layer: archived answers, scores, original feedback, and recordings are not rewritten; mismatched versions retain their original explanation.
- Use browser SpeechSynthesis and MediaRecorder where available, with text input fallbacks.
- Stopping practice recording waits briefly for the final transcript before forming the scoring snapshot; leaving the question cancels its late transcription callbacks. Failed recording uploads stay available in this page session, including after starting another round; reopen the saved review to retry. Refresh or closing the page warns while audio is still pending. Successful uploads no longer trigger that warning.
- Keep question JSON and answer JSON in separate directories.
- Distribute original practice content with the source; ETS mock questions, answer keys, page images, and notes quoting those materials stay local. Without an import, the app starts normally, lists no mock papers, and explains local import in the picker. Original practice and adaptive tests remain available. Imported papers without local teaching notes or accepted-answer supplements still run; review explicitly states those limitations. Preserve all existing local materials and personal records. See [distribution boundaries](docs/distribution.md).
- Practice scores total only automatically checked items; omitted answers for these items count as zero. Emails, discussions and interviews require manual review, with no numeric grade or correct/incorrect judgment. Word-count and repeated-phrase hints do not assess task fulfillment or language quality, and reference keywords do not affect results. Open responses remain in completion counts but are excluded from points and percentages; sections containing them have no projected band or legacy score. Repeat tasks compare transcripts only. Historical results and feedback retain their original scoring, including on an identical submission retry. No practice result provides official scoring or pronunciation assessment.

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
