# 2026-09-27 Question Quality Revision

This revision addresses the findings in [the realism review](realism-review-2026-09-27.md). The English authoring standard is [generation-guidelines.md](generation-guidelines.md), linked from `AGENTS.md` and the bank maintenance guide.

## Scope

All 705 original IDs and material-group sizes are preserved. This content revision affects 332 scored items and refreshes their corresponding review records after inspection; it does not refresh unrelated fingerprints. Counts exclude separately authored, concurrent explanation-only edits. This revision does not modify ETS mock source files or their answer keys.

| Area | Reviewed changes |
|---|---|
| Reading | Four existing academic groups now include one sentence-insertion question each: R215, R225, R238, R243. Their marked passages affect 20 items in total. Backward references and argument flow distinguish the intended position; other questions retain independent evidence. Position choices stay in A–D order so location and option labels agree. |
| Listening responses | Revise distractors in 72 of 85 items; remove duplicate meanings, competing reasonable responses, and excessive answer-length clues while retaining the intended correct responses. |
| Conversations | Expand 20 scripts with meaningful clarifications and consequences; recheck their 40 associated questions. Keep five already-suitable scripts. |
| Academic talks | Expand all 15 scripts with developed explanations, examples, or qualifications; recheck all 60 associated questions. |
| Sentence building | Convert 22 statements into direct or embedded questions and improve four existing question contexts. Recheck fixed text, tiles, distractors, grammar explanations, and accepted answers for these 26 items. |
| Email | Expand all 50 tasks into concrete situations with a recipient, three requested actions, and source-authored subject lines. Check reference alignment; correct W102 so monthly visit totals support a project about seasonal change. |
| Academic discussion | Expand all 50 professor prompts and both student contributions. Retain the original questions and positions, with room for a supported new contribution. |
| Repeat | Shorten 14 overburdened sentences while preserving the five coherent seven-sentence groups and existing response windows. |

## Before and after

Word counts use the same tokenizer on both versions. Listening counts exclude speaker labels. Writing counts include instructions and authored recipient/subject fields. These statistics describe this bank; they are not additional ETS specifications or evidence of calibrated difficulty.

| Measure | Before | After |
|---|---:|---:|
| Correct response uniquely longest | 40/85 | 14/85 |
| Correct response uniquely shortest | 5/85 | 5/85 |
| Conversation words, min / median / max | 50 / 57 / 98 | 74 / 81 / 98 |
| Academic talk words, min / median / max | 141 / 149 / 174 | 191 / 197 / 214 |
| Email stimulus words, min / median / max | 18 / 23 / 28 | 83 / 88.5 / 105 |
| Discussion stimulus words, min / median / max | 29 / 38 / 46 | 131 / 143 / 153 |
| Sentence-building standard answers that are questions | 4/50 | 26/50 |
| Academic insertion questions | 0 | 4 |
| Longest repeat sentence, words | 26 | 16 |

## Related defects

- Repeating the W21 topic keywords previously earned 5/5. A focused safeguard now limits responses dominated by repeated phrases to 1/5, including short interview loops and case/punctuation variations. Natural reuse of topic words and all 100 writing references remain accepted by the practice checks. Feedback describes the checks actually performed rather than asserting semantic quality.
- Audio parsing now recognizes official `(M-Can)` / `(W-Br)` dialogue tags and a `Man: (M-Br)` narrator. Tags are not spoken, dialogue roles remain distinct, and existing voice-selection policy is preserved. This fixes the imported Test 5 conversation and the tagged Test 4 lecture without rewriting official source scripts.
- The generated audit no longer incorrectly describes sentence building as exclusively whole-sentence rearrangement; it records the existing fixed text and unused tiles.
- Ten base discussion prompts use the renderer's canonical consecutive role lines, preserving the professor/student split display. A deterministic check now covers that format across all 50 discussion tasks.

## Verification

- Regenerated all four sections from authoritative sources; source/generated equality, 705 IDs, complete groups, answer privacy, accepted sentence assembly, review fingerprints, and attested vocabulary pass the final Python suite: **294 passed**. Two existing dependency deprecation warnings remain.
- The isolated full browser sweep passed 117 cases; its three remaining listening checks used a server started before the concurrent bilingual-key regeneration. All affected checks passed after synchronization in an **11-case focused review/insertion rerun**. The final ordered-position insertion check then passed again for all four revised tasks. No observed failure remains unresolved.
- Inspected screenshots of expanded email and discussion tasks, sentence building, and insertion questions. The browser suite verifies desktop layouts at 100%, 125%, and 150% device-scale emulation, plus narrower desktop safeguards. Real microphone capture and online voice quality were not tested.
- JavaScript syntax checks pass for the audio parser and changed browser tests. Local documentation links resolve. Test services use separate ports and owned data/output directories.
- Revision evidence is saved locally in `tmp/quality-revision-20260927/`: baseline snapshots, reviewed item IDs, changed IDs, before/after metrics, and test logs. Official-source verification remains in `tmp/artifacts-2026-09-28/qa/question-bank-realism-2026-09-27/source-verification.json`.

An already-running application may retain the old bank in memory. Restart it when convenient to load the regenerated content; this revision does not stop the owner's service.

## Remaining limits

Editorial review and automated tests do not establish ETS difficulty equivalence. No candidate-response calibration or official adaptive routing was added. The repetition safeguard does not turn keyword scoring into semantic assessment; non-repetitive irrelevant writing can still be over-scored, and legitimate wording can be under-scored. Synthesized audio, microphone capture, accent quality, and pronunciation assessment require separate listening/device validation. Reference responses illustrate acceptable approaches and are not certified high-scoring ETS answers.
