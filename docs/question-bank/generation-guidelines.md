# Question Generation Guide

Applies to original practice content for the TOEFL iBT format introduced on January 21, 2026. Read `question_bank/README.md` for the source, generation, and review workflow. Official references were checked on September 27, 2026.

## Evidence and scope
- Use current ETS specifications, the test overview, and several official sample forms. Distinguish official requirements from local training targets and sample observations. Never turn a sample's word count, answer distribution, or grammar mix into a universal exam rule.
- Keep original practice separate from imported ETS forms. Preserve existing IDs and complete material groups. Do not copy official passages or merely substitute names.
- Difficulty comes from language, information integration, inference, memory, and communication demands—not obscure subject knowledge, excessive length, or misleading instructions. Explain specialist terms in context.

## Item design
- Write natural material with a clear purpose before writing questions. Every scored answer must have specific evidence; review the whole group when its material changes. Check names, dates, quantities, conditions, and causal links.
- Give multiple-choice items one defensible best answer. Distractors should reflect plausible contextual misreadings, not unrelated word association. Avoid correct-answer cues from length, detail, grammar, repeated wording, or absolutes. Audit patterns across the pool; do not force identical option lengths.
- Cover main ideas, details, purpose, inference, vocabulary, reference, and cohesion where appropriate. Include sentence-insertion tasks with four unambiguous marked positions; keep position choices in passage order and ensure other items remain answerable before insertion.
- Complete the Words: approximately 70–100 words, an intact opening sentence, ten missing word endings, and the established alternating-word pattern. Check spelling and possible competing completions.
- Daily-life reading: use realistic messages, notices, schedules, and other everyday formats, with two or three questions as appropriate. Academic reading: approximately 200 words and five questions; do not omit discourse-level work.
- Listening: write speech, not an essay read aloud. Use natural turns, references, clarification, and implied intentions without gratuitous filler. Retain short/easy material while providing enough sustained listening. ETS overview ranges include roughly 40–85 words for announcements and 100–250 for academic talks; sample comparisons are diagnostic, not additional limits.
- Build a Sentence: use a natural preceding utterance and a grammatical, contextually appropriate reply/question. Mix statements, direct and embedded questions, tense, negation, and common clause structures. Vary fixed text and unused tiles; verify every accepted answer against the exact tiles and frame. Do not rely on a small hand-built list to claim all valid alternatives are accepted.
- Email: give sufficient situation, recipient relationship, and distinct actionable requirements. Ensure the reference response fulfills each requirement without inventing essential facts. Seven minutes is official; a 100-word practice target is not an official minimum.
- Discussion: provide a developed professor prompt and two substantive, distinct student contributions. Leave room for a new supported contribution, not just agreement or paraphrase. Keep the task accessible without specialist knowledge; allow multiple justified positions. Ten minutes and ETS's at-least-100-word advice apply.
- Repeat: keep seven sentences in one coherent setting. Increase memory/syntax demands without turning every later sentence into a long nested clause. Check speakability within the existing 8–12-second response windows; label unusually demanding material as extra practice rather than claiming equivalence.
- Interview: keep four related questions, moving from experience to supported views on broader issues, with 45 seconds per answer. Reference points illustrate possibilities, not mandatory opinions.

## Review gate
- Review material, task, options/tiles, key, explanation, and reference response together. Reject ambiguous keys, unnatural exchanges, unsupported conclusions, formulaic padding, and reference answers that miss instructions.
- Record difficulty, skills, attested vocabulary, answer evidence, review date, and the content fingerprint only for items actually reviewed. Never refresh unchanged or unreviewed fingerprints to make generation pass.
- Check pooled length/answer-position cues and task/grammar coverage. Compare several official samples, but retain legitimate variation and easy items. Content labels are not calibrated ETS or CEFR difficulty.
- Regenerate from sources, run content/API regressions, inspect representative rendered tasks and post-submission review, and verify no answers leak before submission. Test source changes and generated output together.
- Preserve the renderer's content format. Discussion prompts use consecutive `Professor:`, `Student A:`, and `Student B:` lines, then a blank line and the task instruction; extra blank lines must not silently disable the split layout.
- Synthetic speech is not inherently inauthentic; verify speaker parsing, pronunciation, prosody, and playback separately. Text-only heuristic feedback is not pronunciation assessment or an official score. Passing code tests is not expert language review or psychometric validation.

## Official references
- [Test specifications](https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-test-specifications-2026.pdf)
- [Test overview and scoring guides](https://www.ets.org/pdfs/toefl/toefl-ibt-test-overview.pdf)
- [Practice Test 1](https://www.ets.org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-1.pdf); compare the other official forms as well.
