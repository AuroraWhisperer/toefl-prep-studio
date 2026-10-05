// Called from the persistent Playwright QA session with an isolated browser page.
const assert = require('node:assert/strict');

const settings = {
  reading: { complete_words: [1, 2], read_daily_life: [2, 4], read_academic_passage: [1, 2] },
  listening: {
    listen_choose_response: [8, 16],
    listen_conversation: [2, 4],
    listen_announcement: [1, 2],
    listen_academic_talk: [1, 2],
  },
  writing: { build_sentence: [10, 20], write_email: [1, 2, 3], academic_discussion: [1, 2, 3] },
  speaking: { listen_repeat: [1, 2, 3], take_interview: [1, 2, 3] },
};

async function openSettings(page, section, task, count) {
  if (await page.locator('#result-view').isVisible()) await page.locator('#result-home').click();
  if (await page.locator('#exam-view').isVisible()) await page.locator('#back-home').click();
  if (await page.locator('#setup-view').isVisible()) await page.locator('#setup-home').click();
  await page.locator(`[data-action="configure"][data-section="${section}"]`).click();
  await page.locator(`input[name="task_type"][value="${task}"]`).check();
  assert.deepEqual(
    await page
      .locator('input[name="count"]')
      .evaluateAll((nodes) => nodes.map((n) => Number(n.value))),
    settings[section][task],
  );
  assert.deepEqual(
    await page
      .locator('input[name="timer_mode"]')
      .evaluateAll((nodes) => nodes.map((n) => n.value)),
    section === 'speaking' ? ['countdown'] : ['countup', 'countdown'],
  );
  await page.locator(`input[name="count"][value="${count}"]`).check();
}

async function start(page) {
  const response = page.waitForResponse((r) => r.url().includes('/api/v1/exam?'));
  await page.locator('#start-practice').click();
  const result = await response;
  assert.equal(result.status(), 200);
  await page.locator('#exam-view').waitFor({ state: 'visible' });
  return result.json();
}

async function submit(page) {
  const response = page.waitForResponse((r) => r.url().endsWith('/api/v1/exam/submit'));
  await page.locator('#submit-exam').click();
  const result = await response;
  assert.equal(result.status(), 200);
  await page.locator('#result-view').waitFor({ state: 'visible' });
  assert.equal(await page.locator('.review-layout').count(), 1);
  assert.ok(await page.locator('.review-answers').isVisible());
  assert.ok(await page.locator('.review-material').isVisible());
  return result.json();
}

async function allTaskFlows(page) {
  const results = [];
  const meta = await (await page.request.get('/api/v1/meta')).json();
  const duration = (seconds) =>
    `${Math.floor(seconds / 60) ? `${Math.floor(seconds / 60)} 分钟` : ''}${seconds % 60 ? `${seconds >= 60 ? ' ' : ''}${seconds % 60} 秒` : ''}`;
  for (const [section, tasks] of Object.entries(settings)) {
    for (const [task, counts] of Object.entries(tasks)) {
      const count = counts.at(-1);
      await openSettings(page, section, task, count);
      const config = meta.sections[section].practice_tasks[task];
      assert.equal(await page.locator('#task-timing, .difficulty-distribution').count(), 0);
      assert.equal(await page.locator('.format-details').evaluate((node) => node.open), false);
      await page.locator('.format-details summary').click();
      assert.ok((await page.locator('.format-details').innerText()).includes(config.description));
      assert.ok((await page.locator('.format-details').innerText()).includes(config.timing.detail));
      assert.ok(await page.locator('.format-details a').count());
      await page.locator('.format-details summary').click();
      const [minimum, maximum] = config.time_range_seconds.map(
        (seconds) => (seconds * count) / config.units_per_set,
      );
      assert.ok(
        (await page.locator('#selection-summary').innerText()).includes(
          `本轮预计 ${duration(minimum)}${minimum === maximum ? '' : `–${duration(maximum)}`}`,
        ),
      );
      assert.ok(
        (await page.locator('#selection-summary').innerText()).includes(
          section === 'speaking' ? '到时自动交卷' : '手动交卷',
        ),
      );
      const selected = await start(page);
      assert.ok(selected.questions.some((question) => question.difficulty !== 'easy'));
      assert.equal(
        await page.locator('#difficulty-tag').innerText(),
        { easy: 'Easy', medium: 'Medium', hard: 'Hard' }[selected.questions[0].difficulty],
      );
      assert.equal(
        await page
          .locator('#difficulty-tag')
          .evaluate((node) => getComputedStyle(node).textTransform),
        'none',
      );
      assert.ok(
        await page
          .locator('#difficulty-tag')
          .evaluate(
            (node) =>
              getComputedStyle(node).fontFamily ===
              getComputedStyle(document.documentElement).fontFamily,
          ),
      );
      if (task === 'complete_words') {
        assert.equal(await page.locator('.cloze-letters').count(), 10);
        assert.equal(await page.locator('#question-index button').count(), count);
        const input = page.locator('[data-answer-id]').first();
        const id = await input.getAttribute('data-answer-id');
        await input.fill('x');
        await page.locator('#next-question').click();
        await page.locator('#previous-question').click();
        assert.equal(await page.locator(`[data-answer-id="${id}"]`).first().inputValue(), 'x');
      } else if (selected.questions[0].response_type === 'choice') {
        await page.locator('[data-choice="1"]').click();
        await page.locator('#next-question').click();
        await page.locator('#previous-question').click();
        assert.equal(await page.locator('[data-choice="1"]').getAttribute('aria-pressed'), 'true');
      } else if (task === 'build_sentence') {
        await page.locator('[data-word]').first().click();
        assert.equal(await page.locator('.sentence-slot:not(.is-empty)').count(), 1);
        await page.locator('[data-clear-sentence]').click();
        assert.equal(await page.locator('.sentence-slot:not(.is-empty)').count(), 0);
        await page.locator('[data-word]').first().click();
        await page.locator('#next-question').click();
        await page.locator('#previous-question').click();
        assert.equal(await page.locator('.sentence-slot:not(.is-empty)').count(), 1);
      } else {
        if (selected.questions[0].response_type === 'recording_text')
          await page.locator('.speaking-practice-aid summary').click();
        await page
          .locator('#answer-input')
          .fill(
            'I would choose this option because it helps students plan their work. For example, a clear schedule gives everyone time to prepare and ask questions.',
          );
        if (await page.locator('#next-question').isVisible()) {
          await page.locator('#next-question').click();
          await page.locator('#previous-question').click();
          assert.match(await page.locator('#answer-input').inputValue(), /^I would/);
        }
      }
      const scored = await submit(page);
      assert.equal(scored.total_questions, selected.total);
      assert.equal(scored.answered_questions, 1);
      assert.equal(scored.feedback[0].question_id, selected.questions[0].id);
      if (selected.questions[0].response_type === 'choice') {
        const feedback = scored.feedback[0];
        const options = page.locator('.review-original').first().locator('.review-options li');
        assert.equal(
          await options.nth(feedback.correct_index).getAttribute('class'),
          'option-correct',
        );
        assert.equal(
          await options.nth(1).getAttribute('class'),
          feedback.correct ? 'option-correct' : 'option-incorrect',
        );
        assert.equal(
          await page.locator('.review-options .option-incorrect').count(),
          feedback.correct ? 0 : 1,
        );
        assert.equal(await page.locator('.review-options small').count(), 0);
      }
      if (task === 'complete_words') {
        assert.equal(await page.locator('.cloze-review-table tbody tr').count(), 10);
        await page.locator('#reveal-correct').check();
        assert.deepEqual(
          await page.locator('.cloze-answer').allTextContents(),
          scored.feedback.slice(0, 10).map((f) => f.missing_letters),
        );
        await page.locator('#reveal-correct').uncheck();
        assert.equal(
          (await page.locator('.cloze-answer').first().textContent()).replace(/\s/g, ''),
          'x',
        );
      }
      const learning = page.locator('.review-explanations').first();
      await learning.locator('summary').click();
      for (const label of ['读懂：', '解析：', '下次：']) {
        assert.ok((await learning.innerText()).includes(label), `${task} is missing ${label}`);
      }
      assert.equal(
        await learning
          .locator('p')
          .last()
          .evaluate((node) => getComputedStyle(node).whiteSpace),
        'pre-line',
      );
      await learning.locator('summary').click();
      if ((await page.locator('#review-index button').count()) > 1) {
        await page.locator('#review-index button').last().click();
        assert.equal(
          await page.locator('#review-index button').last().getAttribute('aria-current'),
          'step',
        );
        await page.locator('#review-index button').first().click();
      }
      results.push({ section, task, count, questions: selected.total, reviewed: true });
    }
  }
  return results;
}

async function timingAndRecovery(page, url) {
  await page.clock.install();
  await page.goto(url);
  for (const timerMode of ['countup', 'countdown']) {
    await openSettings(page, 'reading', 'complete_words', 1);
    await page.locator(`input[name="timer_mode"][value="${timerMode}"]`).check();
    const selected = await start(page);
    await page.locator('[data-answer-id]').first().fill('x');
    await page.route(
      '**/api/v1/exam/submit',
      (route) =>
        route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'QA: temporary connection failure' }),
        }),
      { times: 1 },
    );
    if (timerMode === 'countup') {
      await page.clock.runFor(2200);
      assert.equal(await page.locator('#timer-value').innerText(), '00:02');
      await page.locator('#submit-exam').click();
    } else {
      await page.clock.fastForward((selected.time_limit_seconds + 1) * 1000);
      assert.equal(await page.locator('#timer-value').innerText(), '00:00');
    }
    await page.getByText('提交失败，答案仍保留。请点击提交重试。', { exact: true }).waitFor();
    assert.equal(await page.locator('[data-answer-id]').first().inputValue(), 'x');
    assert.ok(await page.locator('#submit-exam').isEnabled());
    const scored = await submit(page);
    assert.equal(scored.answered_questions, 1);
    assert.deepEqual(
      scored.feedback.map((f) => f.question_id),
      selected.question_ids,
    );
  }
  return { countup: true, countdownAutoSubmit: true, sameSelectionRetry: true };
}

async function clozeLetterInputs(page) {
  await openSettings(page, 'reading', 'complete_words', 2);
  const selected = await start(page);
  const blanks = selected.questions.slice(0, 10);
  for (const blank of blanks) {
    const letters = page.locator(`[data-answer-id="${blank.id}"]`);
    assert.equal(
      await letters.count(),
      blank.missing_length,
      `${blank.id}: one field per missing letter`,
    );
    assert.ok(
      (await letters.evaluateAll((nodes) => nodes.map((n) => n.maxLength))).every(
        (length) => length === 1,
      ),
    );
  }

  const blank = blanks.find((item) => item.missing_length >= 3);
  const letters = page.locator(`[data-answer-id="${blank.id}"]`);
  const values = () => letters.evaluateAll((nodes) => nodes.map((n) => n.value));
  await letters.first().focus();
  await page.keyboard.type('1!');
  assert.equal(await letters.first().inputValue(), '');
  await page.keyboard.type('ab');
  assert.deepEqual((await values()).slice(0, 3), ['a', 'b', '']);
  assert.equal(await letters.nth(2).evaluate((node) => node === document.activeElement), true);
  await page.keyboard.press('Backspace');
  assert.deepEqual((await values()).slice(0, 3), ['a', '', '']);
  await page.keyboard.type('c');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.type('d');
  assert.deepEqual((await values()).slice(0, 3), ['a', 'd', '']);
  await letters.first().focus();
  await page.keyboard.press('Tab');
  assert.equal(await letters.nth(1).evaluate((node) => node === document.activeElement), true);
  await page.keyboard.press('Shift+Tab');
  assert.equal(await letters.first().evaluate((node) => node === document.activeElement), true);
  await letters.first().fill('');
  await page.locator('#next-question').click();
  await page.locator('#previous-question').click();
  assert.deepEqual((await values()).slice(0, 3), ['', 'd', '']);

  const pasted = 'xy'.repeat(blank.missing_length);
  // A real DataTransfer exercises the browser paste handler without changing the system clipboard.
  await letters.first().evaluate((node, text) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData('text', `1!${text}`);
    node.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }),
    );
  }, pasted);
  assert.equal((await values()).join(''), pasted.slice(0, blank.missing_length));
  for (const other of blanks.filter((item) => item.id !== blank.id)) {
    assert.ok(
      (
        await page
          .locator(`[data-answer-id="${other.id}"]`)
          .evaluateAll((nodes) => nodes.map((n) => n.value))
      ).every((value) => value === ''),
    );
  }
  await letters.last().focus();
  await page.keyboard.type('q');
  assert.equal(await letters.last().inputValue(), 'q');
  await letters.first().fill('');
  const saved = `_${pasted.slice(1, blank.missing_length - 1)}q`;
  const scored = await submit(page);
  const result = scored.feedback.find((item) => item.question_id === blank.id);
  assert.equal(result.answer, saved);
  assert.equal(result.correct, false);
  assert.equal(scored.answered_questions, 1);
  async function assertReviewLetters(reveal) {
    const answers = page.locator('.cloze-answer');
    assert.equal(await answers.count(), blanks.length);
    for (const [index, item] of blanks.entries()) {
      const feedback = scored.feedback.find((entry) => entry.question_id === item.id);
      const answer = reveal ? feedback.missing_letters : feedback.answer || '';
      const expected = Array.from(answer.padEnd(item.missing_length, '_'), (letter) =>
        letter === '_' ? '\u00a0' : letter,
      );
      const review = answers.nth(index);
      const slots = review.locator('.cloze-answer-letter');
      assert.deepEqual(
        await slots.allTextContents(),
        expected,
        `${item.id}: one review slot per letter, including unfilled positions`,
      );
      assert.ok(
        await review.evaluate(
          (node, correct) => node.classList.contains(correct ? 'is-correct' : 'is-incorrect'),
          reveal || feedback.correct,
        ),
      );
      assert.ok(
        await slots.evaluateAll((nodes) =>
          nodes.every((node) => {
            const style = getComputedStyle(node);
            return style.borderBottomStyle === 'solid' && parseFloat(style.borderBottomWidth) > 0;
          }),
        ),
        `${item.id}: every review letter has its own underline`,
      );
    }
  }
  await assertReviewLetters(false);
  await page.locator('#reveal-correct').check();
  assert.deepEqual(
    await page.locator('.cloze-answer').allTextContents(),
    scored.feedback.slice(0, 10).map((item) => item.missing_letters),
  );
  await assertReviewLetters(true);
  await page.locator('#reveal-correct').uncheck();
  await assertReviewLetters(false);
  return {
    perLetterFields: true,
    keyboardEditing: true,
    pasteBounded: true,
    partialAnswerPreserved: true,
    review: true,
  };
}

module.exports = {
  openSettings,
  start,
  submit,
  allTaskFlows,
  timingAndRecovery,
  clozeLetterInputs,
};
