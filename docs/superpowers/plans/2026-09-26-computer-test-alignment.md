# Computer-based mock examination alignment

**Goal:** Correct the existing mock's timing enforcement, computer-based answer controls, and stage transitions without changing the original practice bank.

**Architecture:** Extend the existing FastAPI session state and native JavaScript mock view. Keep five fixed ETS practice forms, private answer keys, existing saved sessions, and result review. Add structured question presentation from the already imported official text.

**Constraints:** No invented official adaptive algorithm, recordings, scores, or undocumented exact timings. Unknown timing remains explicitly labeled as a local simulation setting. Escape question content; validate all state transitions server-side; never disclose answer keys before completion. Test servers and sessions must be isolated from the user's running app.

- [x] Add regression tests for late answers, untimed directions, forward-only navigation, and recording cutoff; implement server-owned transitions and verify tests.
- [x] Extract reading prompts/materials and sentence word banks for all five forms; verify item IDs, counts, answer isolation, and token conservation.
- [x] Replace PDF answer sheets with question screens, inline cloze inputs, selectable word tiles, directions, and explicit module submission; verify keyboard use and saved-answer restoration.
- [x] Run backend and browser regressions, inspect desktop/mobile screenshots, document verified behavior and remaining nonofficial boundaries, and clean up owned test resources.

**Files:** backend/mock_exam.py; scripts/import_mock_tests.py; question_bank/mock/ets-test-{1..5}.json; frontend/mock-exam.js; frontend/mock-exam.css; tests/test_mock_exam.py; tests/browser_mock.test.cjs; README.md; docs/question-bank/mock-isolation.md.

**Security checkpoint:** Existing local-only deployment remains unchanged. UUID session paths, answer allowlists, recording content types and size limits remain enforced. New begin/navigation actions must not bypass deadlines or reopen completed phases. Client rendering continues HTML escaping.

## Verification

- Full backend suite: 153 passed; two existing dependency deprecation warnings.
- Full browser suite: 25 passed, including all twelve original practice task types and the complete nine-stage mock with 11 synthetic microphone recordings.
- Added checks for exact-deadline rejection, legacy session restoration, private reference variants, recording overwrite protection, and sentence keyboard/drag-and-drop interaction.
- Desktop/mobile question layouts, listening, and result screenshots inspected. JavaScript syntax check passed; Impeccable detector returned no findings.
- Tests use their own server and browser contexts; mock tests remove only the session IDs they create. User sessions and the running application are not restarted or removed.
- Completion means the verified interaction and timing-enforcement fixes are delivered, not a claim of ETS adaptive routing, original audio, undocumented exact timings, or pixel-identical official screens.
