const { test, expect } = require('@playwright/test');
const { randomUUID } = require('node:crypto');
const { openSettings, start, submit } = require('./browser_practice_helpers.cjs');
const answerKeys = {
  listening: require('../question_bank/answers/listening.json'),
  reading: require('../question_bank/answers/reading.json'),
};

const colors = {
  correct: { color: 'rgb(53, 99, 67)', background: 'rgb(237, 244, 232)' },
  incorrect: { color: 'rgb(170, 68, 59)', background: 'rgb(251, 239, 236)' },
};

test('new results and historical review reset material selection and reveal state', async ({ page, request }) => {
  expect((await request.get('/')).status()).toBe(200);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => typeof window.createPracticeReview)).toBe('function');
  await openSettings(page, 'reading', 'complete_words', 2);
  await start(page);
  const submitted = page.waitForRequest(request => request.url().endsWith('/api/v1/exam/submit') && request.method() === 'POST');
  await submit(page);
  const historyId = (await submitted).postDataJSON().submission_id;
  await page.locator('[data-review-index="1"]').click();
  await page.locator('#reveal-correct').check();
  await expect(page.locator('.cloze-answer.is-incorrect')).toHaveCount(0);
  await page.locator('#result-home').click();

  await openSettings(page, 'reading', 'complete_words', 1);
  await start(page);
  await submit(page);
  await expect(page.locator('#review-index')).toBeHidden();
  await expect(page.locator('#reveal-correct')).not.toBeChecked();
  await expect(page.locator('.cloze-answer.is-incorrect')).toHaveCount(10);
  await page.locator('#result-home').click();
  await page.locator('#open-history').click();

  for (let visit = 0; visit < 2; visit++) {
    await page.locator(`[data-history-id="${historyId}"]`).click();
    await expect(page.locator('#result-title')).toContainText('历史复盘');
    await expect(page.locator('[data-review-index="0"]')).toHaveAttribute('aria-current', 'step');
    await expect(page.locator('#reveal-correct')).not.toBeChecked();
    await page.locator('[data-review-index="1"]').click();
    await expect(page.locator('[data-review-index="1"]')).toBeFocused();
    await page.locator('#reveal-correct').check();
    await page.locator('[data-review-index="0"]').click();
    await expect(page.locator('#reveal-correct')).not.toBeChecked();
    await expect(page.locator('.cloze-answer.is-incorrect')).toHaveCount(10);
    await page.locator('#result-home').click();
    await expect(page.locator('#history-view')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('review instances keep DOM local and register navigation only once', async ({ page, request }) => {
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  const result = await page.evaluate(() => {
    const root = document.createElement('section');
    root.innerHTML = '<h2 id="result-title"></h2><dl id="result-summary"></dl><div id="review-index"></div><div id="feedback-list"></div><button id="result-home"><span></span></button><div id="recording-archive-status"></div>';
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => `&#${character.charCodeAt(0)};`);
    let selections = 0;
    const review = window.createPracticeReview({
      root, sectionLabels: { reading: 'Reading' }, taskLabels: { read_daily_life: 'Daily life' },
      format: { escapeHtml, formatTime: String, formatAnswer: value => String(value ?? '') },
      content: { materialMarkup: () => '', clozeMarkup: () => '', audioMarkup: () => '' },
      onSelectMaterial: () => { selections += 1; }, onPlayAudio: () => {},
    });
    const snapshot = {
      section: 'reading', historyReview: false, recordings: {}, tasks: { read_daily_life: { label: '短文' } },
      questions: ['first', 'second'].map(id => ({ id, task_type: 'read_daily_life', response_type: 'choice', prompt: '<b>Question</b>', options: ['A', 'B'] })),
      result: {
        sections: { reading: { earned: 2, possible: 2, percentage: 100, answered: 2, total: 2 } },
        feedback: ['first', 'second'].map(question_id => ({ question_id, task_type: 'read_daily_life', correct: true, answer: 0, correct_index: 0, answered: true, earned: 1, possible: 1, duration_seconds: 1, reference_answer: 'A' })),
      },
    };
    const before = JSON.stringify(snapshot);
    const pageTitle = document.querySelector('#result-title').textContent;
    review.show(snapshot);
    review.show({ ...snapshot, historyReview: true });
    root.querySelector('[data-review-index="1"]').click();
    const selectedOnce = selections;
    review.show(snapshot);
    const reset = root.querySelector('[data-review-index="0"]').getAttribute('aria-current');
    review.dispose();
    root.querySelector('[data-review-index="1"]').click();
    return {
      selectedOnce, afterDispose: selections, reset,
      unchangedInput: JSON.stringify(snapshot) === before,
      unchangedPage: document.querySelector('#result-title').textContent === pageTitle,
      injectedElements: root.querySelectorAll('.review-original b').length,
    };
  });
  expect(result).toEqual({ selectedOnce: 1, afterDispose: 1, reset: 'step', unchangedInput: true, unchangedPage: true, injectedElements: 0 });
});

async function expectResultColor(locator, correct) {
  const expected = colors[correct ? 'correct' : 'incorrect'];
  await expect(locator).toHaveCSS('color', expected.color);
  await expect(locator).toHaveCSS('border-top-color', expected.color);
  await expect(locator).toHaveCSS('background-color', expected.background);
}

for (const desktop of [
  { scale: 1, width: 2560, height: 1440 },
  { scale: 1.25, width: 2048, height: 1152 },
  { scale: 1.5, width: 1707, height: 960 },
]) {
  test.describe(`choice review at ${desktop.scale * 100}% desktop scaling`, () => {
    test.use({ viewport: { width: desktop.width, height: desktop.height }, deviceScaleFactor: desktop.scale });

    for (const [section, task, count] of [
      ['listening', 'listen_choose_response', 8],
      ['reading', 'read_daily_life', 4],
    ]) {
      test(`${section} colors correct, wrong and unanswered results after submission and reload`, async ({ page, request }, testInfo) => {
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        expect((await request.get('/')).status()).toBe(200);
        await page.route('**/api/v1/tts', route => route.fulfill({ json: { url: null, fallback: true } }));
        await page.goto('/');
        await openSettings(page, section, task, count);
        const exam = await start(page);
        const groups = [...new Set(exam.questions.map(question => question.group_id || question.id))];
        expect(groups.length).toBeGreaterThanOrEqual(3);
        const first = exam.questions[0];
        const correctIndex = answerKeys[section][first.id].correct_index;
        const wrongIndex = (correctIndex + 1) % first.options.length;
        for (const [index, question] of exam.questions.entries()) {
          // Leave one entire group unanswered; make only the first question wrong.
          if ((question.group_id || question.id) === groups[2]) continue;
          await page.locator(`[data-question-index="${index}"]`).click();
          const answer = index === 0 ? wrongIndex : answerKeys[section][question.id].correct_index;
          const option = page.locator('.choice-option').nth(answer);
          await option.click();
          await expect(option).toHaveCSS('background-color', 'rgb(232, 241, 236)');
          await expect(page.locator('.option-correct, .option-incorrect')).toHaveCount(0);
        }
        const result = await submit(page);
        if (section === 'listening') {
          for (const item of result.feedback) {
            expect(item.explanation).toMatch(/[\u3400-\u9fff]/);
            expect(item.explanation).toMatch(/[a-z]{2,}/i);
          }
        }
        const nav = page.locator('#review-index button');
        await expect(nav).toHaveCount(groups.length);
        for (let index = 0; index < groups.length; index += 1) {
          const questions = exam.questions.filter(question => (question.group_id || question.id) === groups[index]);
          const allCorrect = questions.every(question => result.feedback.find(item => item.question_id === question.id).correct);
          expect(allCorrect).toBe(index !== 0 && index !== 2);
          await expectResultColor(nav.nth(index), allCorrect);
          await expect(nav.nth(index)).toHaveAttribute('aria-label', new RegExp(allCorrect ? '全部正确' : '有错题或未作答'));
        }

        async function expectWrongAnswer() {
          const firstFeedback = result.feedback.find(item => item.question_id === first.id);
          const explanation = page.locator('.review-answer').first().locator('.review-explanations');
          await explanation.locator('summary').click();
          await expect(explanation.locator('p')).toHaveText([firstFeedback.explanation]);
          await expect(explanation.locator('p')).toHaveCSS('white-space', 'pre-line');
          await expect(explanation.locator('p')).toContainText('下次：');
          await explanation.locator('summary').press('Enter');
          await expect(explanation).not.toHaveAttribute('open', '');
          const options = page.locator('.review-options').first().locator('li');
          await expectResultColor(options.nth(wrongIndex), false);
          await expectResultColor(options.nth(correctIndex), true);
          await expect(options.nth(wrongIndex).locator('.choice-letter')).toHaveCSS('color', colors.incorrect.color);
          await expect(options.nth(correctIndex).locator('.choice-letter')).toHaveCSS('color', colors.correct.color);
          await expect(page.locator('.review-options .option-incorrect')).toHaveCount(1);
          for (let index = 0; index < first.options.length; index += 1) {
            if (index !== wrongIndex && index !== correctIndex) {
              await expect(options.nth(index)).not.toHaveClass(/option-(correct|incorrect)/);
              await expect(options.nth(index)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
            }
          }
        }

        await expectWrongAnswer();
        await nav.nth(1).click();
        await expectResultColor(nav.nth(1), true);
        await expect(nav.nth(1)).toHaveAttribute('aria-current', 'step');
        await expect(nav.nth(1)).not.toHaveCSS('box-shadow', 'none');
        await expect(page.locator('.review-options .option-incorrect')).toHaveCount(0);
        await nav.nth(2).focus();
        await page.keyboard.press('Enter');
        await expect(nav.nth(2)).toHaveAttribute('aria-current', 'step');
        await expectResultColor(nav.nth(2), false);
        await expect(page.locator('.review-options .option-incorrect')).toHaveCount(0);
        await expect(page.locator('.review-options .option-correct').first()).toBeVisible();
        await nav.nth(0).click();
        await expectWrongAnswer();
        await expect(nav.nth(0)).toHaveAttribute('aria-current', 'step');
        await expectResultColor(nav.nth(0), false);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.locator('.review-answer').first().locator('.review-explanations summary').press('Enter');
        await page.screenshot({ path: testInfo.outputPath('choice-review.png'), fullPage: true });

        const newest = (await (await request.get('/api/v1/history')).json()).items[0];
        await page.reload();
        await page.locator('#open-history').click();
        await page.locator(`[data-history-id='${newest.id}']`).click();
        await expect(page.locator('#result-title')).toContainText('历史复盘');
        await expectWrongAnswer();
        await expectResultColor(nav.nth(0), false);
        await expectResultColor(nav.nth(1), true);
        await expectResultColor(nav.nth(2), false);
        await page.setViewportSize({ width: 1280, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await nav.nth(1).press('Space');
        await expect(nav.nth(1)).toHaveAttribute('aria-current', 'step');
        await expectResultColor(nav.nth(1), true);
        expect(errors).toEqual([]);
      });
    }
  });
}

for (const scenario of ['distinct feedback', 'repeated reference', 'whitespace duplicate']) {
  test(`review preserves ${scenario} without losing useful content`, async ({ page, request }) => {
    expect((await request.get('/')).status()).toBe(200);
    await page.goto('/');
    await openSettings(page, 'writing', 'write_email', 1);
    await start(page);
    let expected;
    await page.route('**/api/v1/exam/submit', async route => {
      const response = await route.fetch();
      const result = await response.json();
      const item = result.feedback[0];
      item.feedback = '内容反馈：请补充 deadline 对计划的影响。';
      item.explanation = scenario === 'repeated reference' ? item.reference_answer
        : scenario === 'whitespace duplicate' ? `  ${item.feedback}\n`
        : '结构解析：先说明 request，再用 because 补充原因；不要写成 <request> 标签。';
      expected = scenario === 'distinct feedback' ? [item.feedback, item.explanation] : [item.feedback];
      await route.fulfill({ response, json: result });
    });
    await submit(page);
    const explanation = page.locator('.review-explanations');
    await explanation.locator('summary').press('Enter');
    await expect(explanation.locator('p')).toHaveText(expected);
    await expect(explanation.locator('request')).toHaveCount(0);
  });
}

test('deadline response shows one evidence-based bilingual explanation in history', async ({ page, request }, testInfo) => {
  const id = randomUUID();
  const questionIds = ['L62', 'L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07'];
  const response = await request.post('/api/v1/exam/submit', { data: {
    submission_id: id, section: 'listening', mode: 'practice',
    task_type: 'listen_choose_response', count: 8, question_ids: questionIds,
    responses: [{ question_id: 'L62', answer: 0, duration_seconds: 61 }],
  } });
  expect(response.status()).toBe(200);
  expect((await request.get('/')).status()).toBe(200);
  await page.setViewportSize({ width: 2048, height: 1152 });
  await page.route(`**/api/v1/history/practice/${id}`, async route => {
    const response = await route.fetch();
    const record = await response.json();
    const item = record.result.feedback.find(entry => entry.question_id === 'L62');
    item.explanation = 'The deadline is later, but revise sooner.';
    item.feedback = `  ${item.explanation}\n`;
    await route.fulfill({ response, json: record });
  });
  await page.goto('/');
  await page.locator('#open-history').click();
  await page.locator(`[data-history-id='${id}']`).click();
  const answer = page.locator('.review-answer').first();
  await expect(answer.locator('.reference-answer')).toHaveText("D. That's a relief; I can revise my draft.");
  const explanation = answer.locator('.review-explanations');
  await explanation.locator('summary').press('Enter');
  await expect(explanation.locator('p')).toHaveText([answerKeys.listening.L62.explanation]);
  await expect(explanation.locator('p')).toContainText(/推迟|延后/);
  await expect(explanation.locator('p')).toContainText(/pushed the deadline back/);
  await expect(explanation.locator('p')).toContainText('下次：');
  await expect(explanation.locator('p')).toHaveCSS('white-space', 'pre-line');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('deadline-explanation.png'), fullPage: true });
});
