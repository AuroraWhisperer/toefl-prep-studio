<div align="center">

<img src="docs/assets/readme-mark.svg" width="64" height="64" alt="">

<h1>TOEFL Prep Studio</h1>

<p><strong>TOEFL iBT 2026 · Local practice, mock exams, and review</strong></p>
<p>English questions, Chinese explanations. Practice all four sections and keep your work on your own computer.</p>

<p>
  <a href="docs/technical/development.md"><img src="https://img.shields.io/badge/Python-3.10%2B-28675D?style=flat-square&amp;labelColor=303B37" alt="Python 3.10+"></a>
  <img src="https://img.shields.io/badge/Windows-Desktop-28675D?style=flat-square&amp;labelColor=303B37" alt="Windows desktop browser">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-Noncommercial-28675D?style=flat-square&amp;labelColor=303B37" alt="Source available · Noncommercial license"></a>
</p>

<p><a href="README.md">简体中文</a> · <strong>English</strong></p>

<p>
  <a href="#quick-start">Quick start</a> ·
  <a href="#practice-and-review">Practice and review</a> ·
  <a href="#question-bank">Question bank</a> ·
  <a href="#usage-notes">Usage notes</a> ·
  <a href="#documentation">Documentation</a>
</p>

</div>

## Quick start

You need **Windows, Python 3.10+, and a desktop browser**. Download and extract the source, then double-click **[TOEFL Prep Studio.cmd](<TOEFL Prep Studio.cmd>)** in the project root.

On the first run, the launcher creates a Python environment, installs dependencies, and opens the [local workbench](http://127.0.0.1:38761/) once the service is ready. If the service is already running, it opens the page directly. Everyday use requires no Node.js or frontend build.

<details>
<summary><strong>Prefer the command line? Start from PowerShell</strong></summary>

Run these commands from the project root:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe scripts/launch.py
```

For later launches, run only the last line. See the [development guide](docs/technical/development.md) for configuration and startup troubleshooting.

</details>

> **First session:** Pick a section and start task or section practice. The original question bank is included, and comprehensive tests are ready to use. ETS mock exams require a separate [local import of papers you are entitled to use](question_bank/README.md#模考导入与隔离); official materials are not included in the public source.

Keep the service window open while practicing; minimizing it is fine. Closing it stops the service, but closing the browser page does not. The first installation needs internet access, and recording requires microphone permission in your browser.

## Practice and review

Use task practice to work on a particular question type, or section practice to work on pacing. For a full run through all four sections, choose a mock exam or a comprehensive test.

<table>
  <thead>
    <tr>
      <th width="200" align="left">Mode</th>
      <th width="250" align="left">When to use it</th>
      <th width="550" align="left">What you do</th>
    </tr>
  </thead>
  <tbody>
    <tr valign="top">
      <td><strong>Task practice</strong></td>
      <td>Focus on one task type</td>
      <td>Choose the quantity and timer. Practice with randomly selected, complete passages, conversations, or interviews.</td>
    </tr>
    <tr valign="top">
      <td><strong>Section practice</strong></td>
      <td>Get used to a section's pace</td>
      <td>Complete a fixed set within the section time limit, then review your submission.</td>
    </tr>
    <tr valign="top">
      <td><strong>Mock exams</strong></td>
      <td>Follow a published paper from start to finish</td>
      <td>Locally import ETS Practice Tests 1–5, with 97 questions per form.</td>
    </tr>
    <tr valign="top">
      <td><strong>Comprehensive tests</strong></td>
      <td>Practice all four sections at a chosen difficulty</td>
      <td>Take 120 questions from the original bank. Choose one of five profiles and a starting level from 1–10; Reading and Listening adjust material selection between modules.</td>
    </tr>
  </tbody>
</table>

After submitting, compare your responses and reference answers with the original material. Learning notes follow **“Understand → Reason → Try next time”**: identify the key cue, see why an answer works, and take away a method for the next question.

Answers, time spent, feedback, and uploaded recordings are saved locally. Find a previous session by category or date to revisit an explanation or listen to a recording. Saved mock exams and comprehensive tests can also be resumed.

<details>
<summary><strong>More about sampling, timers, and audio</strong></summary>

- **Sampling:** Task practice keeps materials intact and avoids repeats within a round. Materials you have already submitted are less likely to appear again.
- **Timers:** Reading, Listening, and Writing task practice offer count-up and countdown timers. Speaking uses a countdown.
- **Answering:** Fill missing letters directly in the passage. Build sentences by selecting, dragging, and removing word tiles.
- **Audio:** Synthesized prompts support multiple English accents and distinct dialogue voices. Speaking includes microphone recording, playback, and text transcription.

</details>

## Question bank

The original bank contains **2,115 scored items across 12 task types**. “Section set” below is the number of items in one fixed section practice session.

<table>
  <thead>
    <tr>
      <th width="180" align="left">Section</th>
      <th width="500" align="left">Task types</th>
      <th width="160" align="right">Bank items</th>
      <th width="160" align="right">Section set</th>
    </tr>
  </thead>
  <tbody>
    <tr valign="top">
      <td><strong>Reading</strong></td>
      <td>Complete the Words<br>Read in Daily Life · Read an Academic Passage</td>
      <td align="right">795</td>
      <td align="right">50</td>
    </tr>
    <tr valign="top">
      <td><strong>Listening</strong></td>
      <td>Choose a Response · Conversation<br>Announcement · Academic Talk</td>
      <td align="right">705</td>
      <td align="right">47</td>
    </tr>
    <tr valign="top">
      <td><strong>Writing</strong></td>
      <td>Build a Sentence · Write an Email<br>Academic Discussion</td>
      <td align="right">450</td>
      <td align="right">12</td>
    </tr>
    <tr valign="top">
      <td><strong>Speaking</strong></td>
      <td>Listen and Repeat · Take an Interview</td>
      <td align="right">165</td>
      <td align="right">11</td>
    </tr>
  </tbody>
</table>

ETS mock papers are stored separately and excluded from original-practice sampling. Question content and answer keys are kept apart, with scoring handled by the server. See the [question-bank guide](question_bank/README.md) for sources, review requirements, and generation procedures.

## Usage notes

The interface is primarily in Chinese and targets **2560×1440 desktop displays with 125% or 150% Windows scaling**. A maximized browser window works best.

<details>
<summary><strong>What happens if I leave or refresh the page?</strong></summary>

Regular practice is archived after a successful submission. Back and Forward retain the current round within the same tab. **Refreshing discards unsubmitted work** and returns you to setup or home.

Mock exams and comprehensive tests can resume saved progress, but their timers do not pause or reset when you leave or refresh. Answers and review are available only after you complete the test.

Screens have their own paths, such as `/practice/reading`, `/history`, and `/tests`. Archived reviews and saved exam sessions can be opened directly. See [navigation behavior](docs/technical/architecture.md#页面路径与浏览器导航) for paths and recovery limits.

</details>

<details>
<summary><strong>Where are my records and recordings stored?</strong></summary>

Data is saved under the local `artifacts/` directory by default. Set `TOEFL_DATA_DIR` before starting the service to use a different location. See [storage and recovery](docs/technical/architecture.md#存储与归档) for details.

If a recording upload fails, retry before leaving the page.

</details>

<details>
<summary><strong>Do listening and speaking need internet access?</strong></summary>

Prompts use an online speech service first, with a matching browser voice as a fallback. Mock exam audio is synthesized from the paper's scripts. Running locally does not mean everything works offline.

Speech recognition depends on browser support. You can correct a transcript manually or enter text yourself.

</details>

<details>
<summary><strong>How should I interpret the scores?</strong></summary>

Regular practice gives raw scores and text feedback, with heuristic checks for open responses. Mock exams and comprehensive tests report objective correct-answer counts; open writing responses and speaking tasks need manual review.

These results are for practice. **They do not predict official scores or assess pronunciation, intonation, or fluency.** Difficulty levels, module routing, and some time limits are local training settings. Mock exam learning notes are written for this project, not supplied by ETS.

</details>

## Documentation

For a closer look at a feature or before changing the code, start with the relevant guide. Technical and question-bank documentation is currently in Chinese.

<table>
  <thead>
    <tr>
      <th width="300" align="left">Document</th>
      <th width="700" align="left">What you will find</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><a href="docs/technical/development.md"><strong>Development guide</strong></a></td><td>Environment setup, startup troubleshooting, tests, and formatting</td></tr>
    <tr><td><a href="PRODUCT.md"><strong>Product specification</strong></a></td><td>Feature behavior, practice rules, and scope</td></tr>
    <tr><td><a href="DESIGN.md"><strong>Design specification</strong></a></td><td>Visual language, layouts, and keyboard and mouse interaction</td></tr>
    <tr><td><a href="docs/technical/architecture.md"><strong>System architecture</strong></a></td><td>Stack, module responsibilities, data flow, and storage</td></tr>
    <tr><td><a href="docs/technical/api.md"><strong>API reference</strong></a></td><td>Practice, exams, history, and speech endpoints</td></tr>
    <tr><td><a href="question_bank/README.md"><strong>Question-bank guide</strong></a></td><td>Sources, review, generation, and mock paper import</td></tr>
    <tr><td><a href="AGENTS.md"><strong>Development conventions</strong></a></td><td>Change scope, data protection, and verification requirements</td></tr>
  </tbody>
</table>

## License and distribution

Original code and content use the **[TOEFL Prep Studio Noncommercial License 1.0](LICENSE)**. This is a source-available, noncommercial license, not a standard open-source license.

Noncommercial learning, research, modification, and sharing are permitted under its terms. Sales, paid hosting, commercial teaching, business use, advertising, and other commercial exploitation require separate written permission. Redistribution must retain license and copyright notices, identify changes, and include corresponding source. The full LICENSE controls.

The license does not grant rights in ETS materials, fonts, dependencies, or personal data. See [third-party notices](THIRD_PARTY_NOTICES.md) and [distribution boundaries](docs/distribution.md), which also cover previously published Git history.
