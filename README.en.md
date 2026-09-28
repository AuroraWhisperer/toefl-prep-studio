# TOEFL Prep Studio

**Local practice, mock exams, and review for TOEFL iBT 2026.**

[简体中文](README.md) · **English**

TOEFL Prep Studio brings Reading, Listening, Writing, and Speaking into one desktop browser application. Work on individual task types, complete a comprehensive test, and return to saved answers, recordings, and explanations. The application runs on a personal Windows computer. Practice materials are in English; the interface and learning explanations are primarily in Chinese.

[Highlights](#highlights) · [Practice modes](#practice-modes) · [Question bank](#question-bank) · [Quick start](#quick-start) · [Usage notes](#usage-notes) · [Documentation](#documentation)

## Highlights

- **A complete practice workflow.** Train by task type or section, take a fixed mock exam, or choose a comprehensive test by difficulty. Sampling preserves complete passages, conversations, and interviews.
- **Explanations grounded in the material.** Review each material alongside your responses and reference answers. Three-part learning notes—understand, reason, and apply next time—explain the decisive cues and a reusable approach.
- **Listening and speaking tools.** Synthesized prompts support multiple English accents and distinct dialogue voices. Speaking practice includes microphone recording, playback, and text transcription.
- **Review history stored locally.** Save question snapshots, answers, feedback, time spent, and uploaded recordings. Filter history by category or date, and resume saved mock exams and comprehensive tests.

## Practice modes

| Mode | Purpose | How it works |
| --- | --- | --- |
| **Task practice** | Focus on one task type | Choose quantity and timing, then receive complete materials sampled at random. Materials do not repeat within a round; previously submitted materials receive lower sampling weights. |
| **Section practice** | Work on pacing and completion | Complete a fixed set for one section within its time limit, then review the submission. |
| **Mock exams** | Practice the full sequence with published papers | Locally import ETS Practice Tests 1–5 that you are entitled to use, with 97 questions per form. Official materials are not included in the public source distribution. |
| **Comprehensive tests** | Practice all four sections at different difficulty levels | Sample 120 questions from the original bank using five profiles and starting levels 1–10. Reading and Listening each adjust material selection between modules. |

In task practice, Reading, Listening, and Writing offer count-up and countdown timers; Speaking uses a countdown. Missing-letter tasks are answered directly in the passage. Sentence building supports selecting, dragging, and removing word tiles.

## Question bank

The original practice bank contains **2,115 scored items across 12 task types**. ETS mock papers are stored separately and are excluded from original-practice sampling.

| Section | Task types | Bank items | Section practice items |
| --- | --- | ---: | ---: |
| Reading | Complete the Words; Read in Daily Life; Read an Academic Passage | 795 | 50 |
| Listening | Choose a Response; Conversation; Announcement; Academic Talk | 705 | 47 |
| Writing | Build a Sentence; Write an Email; Academic Discussion | 450 | 12 |
| Speaking | Listen and Repeat; Take an Interview | 165 | 11 |

Question content and answer keys are stored separately, with scoring handled by the server. See the [question-bank guide](question_bank/README.md) for sources, review requirements, and generation procedures.

## Quick start

You need **Windows, Python 3.10+, and a desktop browser**. Installing dependencies for the first time requires an internet connection. Speaking recordings require browser permission to use the microphone.

### One-click launch

Double-click **[TOEFL Prep Studio.cmd](<TOEFL Prep Studio.cmd>)** in the project root. The launcher prepares the Python environment and opens [http://127.0.0.1:38761](http://127.0.0.1:38761/) when the service is ready. If the practice service is already running, it opens the page directly.

### Command-line launch

Open PowerShell in the project root:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe scripts/launch.py
```

For subsequent launches, run only the last command. Normal use requires neither Node.js nor a frontend build.

Keep the service window open while practicing. Closing it stops the service; closing only the browser page does not. The interface targets 2560×1440 desktop displays with 125% or 150% Windows display scaling. A maximized browser window is recommended.

See [development and verification](docs/technical/development.md) for environment configuration, tests, and startup diagnostics.

Original practice and comprehensive tests work immediately after installation. Without a local paper import, the mock picker explains how to get started. See the optional [local import procedure](question_bank/README.md#模考导入与隔离).

## Usage notes

**Page navigation.** Screens have their own paths, such as `/practice/reading`, `/history` and `/tests`, and support browser Back and Forward. Archived reviews and saved mock/comprehensive-test sessions can reopen directly or after refresh. See [navigation behavior](docs/technical/architecture.md#页面路径与浏览器导航) for paths and recovery limits.

**Progress and data.** Regular practice is archived after a successful submission. Back and Forward retain the current round within the current tab; refreshing discards unsubmitted work and returns to setup or home. Mock exams and comprehensive tests release answers and review only after completion. Once started, timers do not pause or reset when you leave or refresh the page. Records are stored under the local `artifacts/` directory by default; set `TOEFL_DATA_DIR` to use another location. See [storage and recovery](docs/technical/architecture.md#存储与归档) for details.

**Audio dependencies.** Prompts use an online speech service first, with a matching browser voice as a fallback. Mock exam audio is synthesized from the paper's scripts. Speech recognition depends on browser support; transcripts can be entered or corrected manually. If a recording upload fails, retry before leaving the page.

**Scoring and exam fidelity.** Regular practice provides raw scores and text feedback, with heuristic checks for open responses. Mock exams and comprehensive tests report objective correct-answer counts; open writing responses and speaking tasks require manual review. Difficulty levels, module routing, and some time limits are local training settings. The application does not predict official scores or assess pronunciation, intonation, or fluency. Mock exam learning notes are authored by this project.

## License and distribution

Original project code and content use the **TOEFL Prep Studio Noncommercial License 1.0**, a source-available license rather than an OSI open-source license. It permits noncommercial learning, research, modification, and sharing under its conditions. Sales, paid hosting, commercial teaching, business use, advertising, and other commercial exploitation require separate written permission. Redistribution must retain notices, identify changes, and include corresponding source. The full [LICENSE](LICENSE) controls.

This license does not grant rights in ETS materials, fonts, dependencies, or personal data. See [third-party notices](THIRD_PARTY_NOTICES.md) and [distribution boundaries](docs/distribution.md), including the separate treatment required for previously published Git history.

## Documentation

The README provides the project overview. Product rules, implementation details, and maintenance workflows are documented separately. Technical and question-bank guides are currently in Chinese.

| Document | Covers |
| --- | --- |
| [Product specification](PRODUCT.md) | Feature behavior, practice rules, and scope |
| [Design specification](DESIGN.md) | Visual language, page layouts, and keyboard and mouse interaction |
| [System architecture](docs/technical/architecture.md) | Stack, module responsibilities, data flow, and storage |
| [API reference](docs/technical/api.md) | Practice, mock exams, comprehensive tests, history, and speech endpoints |
| [Development guide](docs/technical/development.md) | Environment setup, launch commands, tests, and formatting |
| [Question-bank guide](question_bank/README.md) | Sources, review, generation, and mock paper import |
| [Development conventions](AGENTS.md) | Change scope, data protection, and verification requirements |
