# TOEFL Weighted Prompt Accents Implementation Plan

> Execute inline in the current workspace; no delegation or commits.

**Goal:** Randomly assign each distinct prompt approximately 80% North American (US), 10% British, and 10% Australian speech, with approximately equal male/female voices within each accent. Remove New Zealand. Keep replay and browser fallback on the same named voice. These are training weights, not ETS exam statistics or identical ETS voices.

**Architecture:** Keep the existing TTS endpoint and PromptAudioCache. Centralize six male/female voice profiles and weighted sampling in audio-cache.js. Retain a text-to-voice assignment map per practice round or mock session, separate from disposable audio bytes, so shared material, replay, review, and page-history restoration retain their assigned voice. Strict browser fallback must match the assigned locale and named speaker or explain its absence rather than silently change gender.

**Tech Stack:** FastAPI/Pydantic, edge-tts, browser SpeechSynthesis, pytest, Playwright.

## Global Constraints
- Preserve audio caching, cancellation, question content, exam timing, and recordings.
- Generated prompts use US Aria/Guy, GB Sonia/Ryan, and AU Natasha/WilliamMultilingual at normal speed/pitch. Choose male/female with independent 50/50 probability after choosing the accent. Unsupported requests, including en-NZ-MollyNeural, normalize to Aria under the existing API contract.
- Weights apply independently per distinct prompt, not per question type. Small rounds need not have an exact 80/10/10 split. Do not change question selection or make UK/AU exclusive to particular task types.
- ETS's 2026 PDF lists North America, the UK, and Australia. The current webpage additionally lists New Zealand, which the user now explicitly excludes. No source identifies equivalent TTS voices or official 80/10/10 frequencies.
- Sources checked on 2026-09-26: https://www.ets.org/pdfs/toefl/toefl-ibt-test-overview.pdf ; https://www.ets.org/toefl/test-takers/ibt/about/content/listening.html ; https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts

## Tasks
- [x] Verify the baseline and preserve regression coverage for explicitly locale-matched browser fallback.
- [x] Update regression tests: backend voice whitelist, weighted boundaries/distribution, repeated text, cache recreation, task-independent mixing, strict fallback, and removal of controls/NZ. Confirmed two expected backend failures and the missing accentFor browser failure before implementation.
- [x] Implement the weighted assignment in the shared cache and update practice/mock call sites without changing question selection, timing, or recordings.
- [x] Update README and script versions; verify all three female voices against the live provider catalog. Real same-sentence synthesis returned 21,168 bytes (Aria), 18,576 bytes (Sonia), and 22,032 bytes (Natasha), with no audio files persisted.
- [x] Run pytest (177 passed), JavaScript syntax checks (all passed), and the full browser suite (58 passed). Repeat all 32 audio/mock checks on isolated port 8768 with a unique output directory (32 passed). Confirm desktop/mobile layouts at 1440px/390px without horizontal overflow and visually review the mobile practice and desktop mock screenshots. Confirm no NZ or obsolete selector references remain in frontend/backend code. Preserve concurrent history changes and leave the user's running app untouched.

## Follow-up: Include Male Voices
- [x] Verify all three male voices against the live catalog, reproduce missing GB/AU backend support and missing voiceFor assignment tests, then implement independent gender selection with stable per-material voices.
- [x] Add distribution, male playback, opposite-gender fallback rejection, and mock sound-check coverage; update README and cache-busting versions.
- [x] Verify actual synthesis: Guy 20,304 bytes; Ryan 21,024 bytes; WilliamMultilingual 16,704 bytes. No audio files persisted.
- [x] Complete full pytest regression (179 passed), full browser regression (67 passed), and JavaScript syntax checks. Confirm desktop/mobile layouts without overflow and visually review updated 390px practice copy. Tests used isolated port 8768 and cleaned up successfully; the user's running app was not restarted.
