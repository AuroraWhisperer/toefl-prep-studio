# Project Guide

## Purpose and Scope
- Personal TOEFL iBT 2026 practice workbench covering Reading, Listening, Speaking, and Writing, with targeted practice, full-section practice, mock exams, and saved review history.
- Runs locally on the owner's Windows computer in a desktop browser. **There is no mobile app or mobile target.** Do not add mobile-specific layouts, touch workflows, cloud deployment, or multi-user features unless explicitly requested.
- Target display: 2560×1440, including 125% and 150% Windows scaling. Existing narrow-window fallbacks are desktop safeguards, not mobile requirements.

## Documentation
- `AGENTS.md`: repository-wide working rules and desktop-only scope.
- `README.md`: setup, launch, APIs, and test commands.
- `PRODUCT.md`: product behavior and feature boundaries.
- `DESIGN.md`: visual language, layout, and interaction conventions.
- `question_bank/README.md`: content sources, generation, review, and import procedures.

Read the relevant document before editing. Update its owning document when behavior changes; link to details instead of duplicating them here. Surface conflicting requirements rather than silently expanding scope.

## Architecture
- `backend/`: Python FastAPI APIs, server-side scoring, exam sessions, history, and speech synthesis.
- `frontend/`: vanilla HTML, CSS, and JavaScript served by FastAPI; no frontend framework or build step.
- `question_bank/`: questions, separate answer keys, source materials, and mock-test resources.
- `scripts/`: launch, question generation/import, and audits; `tests/`: pytest and Playwright regression tests.
- `artifacts/`: local sessions, practice history, recordings, and test output.
- Local hosting does not imply fully offline operation; speech synthesis may require network access.

## Change Rules
- State material assumptions; briefly plan multi-step work with verifiable outcomes. Clarify ambiguity that prevents a safe change.
- Find the owning implementation and its callers first. Extend existing behavior; avoid duplicate UI, event handlers, or requests.
- Keep changes minimal and follow nearby conventions. Preserve unrelated edits; avoid speculative abstractions, dependencies, and stack changes.
- Keep practice and mock-exam flows distinct. Keep scoring server-side and answer keys out of pre-submission question payloads.
- For question changes, edit the documented sources, preserve existing IDs, regenerate, and audit. Do not patch generated output alone or refresh review fingerprints for unreviewed content.
- Before generating or revising questions, follow `docs/question-bank/generation-guidelines.md`; it defines content quality, official-source boundaries, and the review gate.
- Preserve the owner's history, recordings, and running service. Use isolated `TOEFL_DATA_DIR` storage for manual tests that write data; clean up only resources created by your test.

## Learning Explanation Standard
Write for learners with limited English: use plain Chinese with only essential English cues, immediately explained in Chinese. Teach the reasoning, not just the answer.

Use exactly three lines with these learner-facing labels:
- `读懂：` Explain what is being asked and translate the decisive English cue, not the whole passage.
- `解析：` Connect **evidence → meaning or rule → answer**. Explain the specific misreading, distractor, or missing requirement; do not assume which mistake the learner made.
- `下次：` Give a short, reusable **cue → action → check** procedure. Avoid empty advice such as “read carefully” or “choose what fits the context.”

Adapt the reasoning to the task:
- **Choices:** justify the correct option and distinguish the distractors by content, not shuffled A/B/C/D labels. Separate explicit facts, inference, negation, contrast, and scope.
- **Missing letters / sentence building:** explain meaning and structure, then the exact missing letters or word-group order. Respect fixed text, unused tiles, and accepted variants.
- **Repetition:** explain the sentence, give meaningful memory chunks, and identify words or ordering to check. Text matching is not a pronunciation or fluency assessment.
- **Writing / interviews:** unpack the requirements and show a concrete organization strategy. Examples and positions are possibilities, not uniquely correct answers.

Keep each part brief and non-repetitive; expand only when needed to resolve a genuine ambiguity. Do not repeat a full English answer already displayed. Show identical feedback and explanation only once, while preserving distinct personal feedback.

Ground quoted evidence in the actual material; label invented examples as illustrations. Flag source errors, ambiguous keys, and accepted-answer limitations honestly—never invent a justification or silently change grading to hide them. Keep locally authored notes distinct from official ETS explanations.

For source editing, review fingerprints, release timing, and historical-record safeguards, follow the [question-bank authoring rules](question_bank/README.md#解析写作约定).

## Run and Verify
Run from the project root:

```powershell
.\.venv\Scripts\python.exe scripts/launch.py
.\.venv\Scripts\python.exe -m pytest -q
npm run test:browser
```

The launcher opens `http://127.0.0.1:38761/`. Browser tests use an isolated server and data directory; set `TOEFL_TEST_PORT` if their port is occupied instead of stopping an existing service.

- Behavior changes: add or update focused regression tests and run relevant suites. Run `node --check` on changed JavaScript files.
- UI changes: check the exact local route's HTTP response, then verify desktop rendering, keyboard/mouse interaction, resizing, and relevant display scaling.
- Documentation-only changes: verify referenced paths and commands; application tests are unnecessary unless behavior also changes.
- Before finishing: review the diff for unrelated changes and leftovers; report what changed, checks run, and any unverified limitations. Mocked audio tests do not verify real microphone or online speech-service quality.
