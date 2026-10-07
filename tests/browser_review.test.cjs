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

for (const desktop of [
  { width: 2560, height: 1440, scale: 1 },
  { width: 2048, height: 1152, scale: 1.25 },
  { width: 1707, height: 960, scale: 1.5 },
]) {
  test.describe(`cloze translation at ${desktop.scale * 100}% scaling`, () => {
    test.use({
      viewport: { width: desktop.width, height: desktop.height },
      deviceScaleFactor: desktop.scale,
    });
    test('review shows one translation per passage below the English', async ({
      page,
      request,
    }, testInfo) => {
      expect((await request.get('/practice/reading')).status()).toBe(200);
      await page.goto('/practice/reading');
      await openSettings(page, 'reading', 'complete_words', 2);
      const exam = await start(page);
      expect(JSON.stringify(exam)).not.toContain('translation');
      await expect(page.locator('.review-translation')).toHaveCount(0);
      const result = await submit(page);
      const groupIds = [...new Set(exam.questions.map((q) => q.group_id))];
      for (const [index, groupId] of groupIds.entries()) {
        await page.locator(`[data-review-index="${index}"]`).click();
        await expect(page.locator('.review-translation')).toHaveCount(1);
        await expect(page.locator('.review-translation p')).toHaveText(
          result.passage_translations[groupId],
        );
        await expect(page.locator('.cloze-review-table .review-difficulty')).toHaveText(
          exam.questions
            .filter((q) => q.group_id === groupId)
            .map((q) => ({ easy: 'Easy', medium: 'Medium', hard: 'Hard' })[q.difficulty]),
        );
        if (index === 0) await page.locator('.review-explanations summary').press('Enter');
        await expect(page.locator('.review-explanations')).toHaveAttribute('open', '');
        await expect(page.locator('.review-explanations p').first()).toHaveCSS('font-size', '15px');
        const geometry = await page.evaluate(() => {
          const answers = document.querySelector('.review-answers').getBoundingClientRect();
          const english = document
            .querySelector('.review-material .cloze-passage')
            .getBoundingClientRect();
          const chinese = document.querySelector('.review-translation').getBoundingClientRect();
          return {
            width: answers.width,
            gap: chinese.top - english.bottom,
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        expect(geometry.width).toBeCloseTo(594, 0);
        expect(geometry.gap).toBeCloseTo(32, 0);
        expect(geometry.overflow).toBe(false);
        const answers = page.locator('.review-answers');
        const material = page.locator('.review-material');
        const materialBounds = await material.boundingBox();
        expect(await answers.evaluate((pane) => pane.scrollTop)).toBe(0);
        expect(await answers.evaluate((pane) => pane.scrollHeight > pane.clientHeight)).toBe(true);
        expect(await material.evaluate((pane) => pane.scrollHeight <= pane.clientHeight)).toBe(
          true,
        );
        expect(
          await page
            .locator('.cloze-review-table tbody tr')
            .first()
            .evaluate((row) => row.getBoundingClientRect().height),
        ).toBeLessThan(34);
        await expect(answers).toHaveCSS('scrollbar-width', 'none');
        expect(await answers.evaluate((pane) => pane.offsetWidth - pane.clientWidth)).toBe(0);
        expect(
          await page.evaluate(() =>
            document.dispatchEvent(
              new WheelEvent('wheel', { cancelable: true, ctrlKey: true, deltaY: 80 }),
            ),
          ),
        ).toBe(true);
        for (const target of [answers, material, page.locator('.result-header'), null]) {
          await answers.press('Home');
          await expect.poll(() => answers.evaluate((pane) => pane.scrollTop)).toBe(0);
          if (target) await target.hover();
          else await page.mouse.move(4, desktop.height / 2);
          await page.mouse.wheel(0, 80);
          await expect
            .poll(() => answers.evaluate((pane) => pane.scrollTop))
            .toBeCloseTo(
              Math.min(
                Math.round(80 / desktop.scale),
                await answers.evaluate((pane) => pane.scrollHeight - pane.clientHeight),
              ),
              0,
            );
          expect(await material.evaluate((pane) => pane.scrollTop)).toBe(0);
          expect(await page.evaluate(() => window.scrollY)).toBe(0);
        }
        await answers.press('End');
        await expect
          .poll(() =>
            answers.evaluate((pane) => pane.scrollHeight - pane.clientHeight - pane.scrollTop),
          )
          .toBeLessThan(2);
        await expect(page.locator('.review-explanations p').last()).toBeInViewport();
        expect(await material.boundingBox()).toEqual(materialBounds);
        expect(await material.evaluate((pane) => pane.scrollTop)).toBe(0);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
        expect(
          await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight),
        ).toBe(true);
        if (index === 0) {
          await page.screenshot({ path: testInfo.outputPath('cloze-left-scrolled.png') });
        }
        const answerScroll = await answers.evaluate((pane) => pane.scrollTop);
        await page.locator('#reveal-correct').press('Space');
        await expect(page.locator('#reveal-correct')).toBeChecked();
        expect(await answers.evaluate((pane) => pane.scrollTop)).toBe(answerScroll);
        await expect(page.locator('.review-translation p')).toHaveText(
          result.passage_translations[groupId],
        );
        await answers.press('Home');
        await expect.poll(() => answers.evaluate((pane) => pane.scrollTop)).toBe(0);
      }
      await page.screenshot({ path: testInfo.outputPath('cloze-translation.png'), fullPage: true });
      await page.route('**/api/v1/history/practice/*', async (route) => {
        const response = await route.fetch();
        const record = await response.json();
        delete record.result.passage_translations;
        await route.fulfill({ response, json: record });
      });
      await page.reload();
      await expect(page.locator('.review-translation p')).toHaveText(
        result.passage_translations[groupIds[0]],
      );
      await page.setViewportSize({ width: 1280, height: 400 });
      const shortMaterial = page.locator('.review-material');
      expect(await shortMaterial.evaluate((pane) => pane.scrollHeight > pane.clientHeight)).toBe(
        true,
      );
      await shortMaterial.press('End');
      await expect
        .poll(() =>
          shortMaterial.evaluate((pane) => pane.scrollHeight - pane.clientHeight - pane.scrollTop),
        )
        .toBeLessThan(2);
      await expect(page.locator('.review-translation p')).toBeInViewport();
      for (const width of [1280, 960, 740]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await expect(page.locator('.review-translation p')).toBeVisible();
      }
      await page.locator('.review-explanations summary').click();
      await page.mouse.move(700, 450);
      await page.mouse.wheel(0, 400);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
      await page.locator('#result-home').click();
      await expect(page.locator('#history-view')).toBeVisible();
      expect(
        await page.evaluate(() =>
          document.dispatchEvent(new WheelEvent('wheel', { cancelable: true, deltaY: 80 })),
        ),
      ).toBe(true);
    });
  });
}

test('page-wide cloze scrolling moves continuously and responds to interruption', async ({
  page,
  request,
}) => {
  expect((await request.get('/practice/reading')).status()).toBe(200);
  await page.goto('/practice/reading');
  await openSettings(page, 'reading', 'complete_words', 2);
  await start(page);
  await submit(page);
  await page.locator('.review-explanations summary').click();
  const answers = page.locator('.review-answers');
  const motion = await page.evaluate(async () => {
    const pane = document.querySelector('.review-answers');
    const positions = [pane.scrollTop];
    document.dispatchEvent(new WheelEvent('wheel', { cancelable: true, deltaY: 200 }));
    positions.push(pane.scrollTop);
    for (let frame = 0; frame < 12; frame += 1) {
      await new Promise(requestAnimationFrame);
      positions.push(pane.scrollTop);
    }
    return positions;
  });
  expect(motion[1]).toBe(0);
  expect(new Set(motion.filter((position) => position > 0 && position < 200)).size).toBeGreaterThan(
    3,
  );
  await expect.poll(() => answers.evaluate((pane) => pane.scrollTop)).toBeCloseTo(200, 0);
  await page.evaluate(() => {
    for (let tick = 0; tick < 3; tick += 1)
      document.dispatchEvent(new WheelEvent('wheel', { cancelable: true, deltaY: 60 }));
  });
  await expect.poll(() => answers.evaluate((pane) => pane.scrollTop)).toBeCloseTo(380, 0);
  await page.evaluate(() => {
    document.dispatchEvent(new WheelEvent('wheel', { cancelable: true, deltaY: 160 }));
    document.dispatchEvent(new WheelEvent('wheel', { cancelable: true, deltaY: -80 }));
  });
  await expect.poll(() => answers.evaluate((pane) => pane.scrollTop)).toBeCloseTo(300, 0);
  await page.locator('.review-material').hover();
  await page.mouse.wheel(0, 200);
  await answers.press('Home');
  await expect.poll(() => answers.evaluate((pane) => pane.scrollTop)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await page.evaluate(() => {
      document.dispatchEvent(new WheelEvent('wheel', { cancelable: true, deltaY: 80 }));
      return document.querySelector('.review-answers').scrollTop;
    }),
  ).toBe(80);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.mouse.wheel(0, 200);
  await page.locator('[data-review-index="1"]').click();
  expect(await answers.evaluate((pane) => pane.scrollTop)).toBe(0);
  expect(await page.locator('.review-material').evaluate((pane) => pane.scrollTop)).toBe(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

for (const [section, task, count] of [
  ['writing', 'build_sentence', 10],
  ['reading', 'read_daily_life', 2],
  ['reading', 'complete_words', 2],
]) {
  test(`${task} shares explanation state across questions and materials`, async ({
    page,
    request,
  }) => {
    expect((await request.get('/')).status()).toBe(200);
    await page.goto('/');
    await openSettings(page, section, task, count);
    await start(page);
    await submit(page);
    expect((await request.get(page.url())).status()).toBe(200);
    const disclosures = page.locator('.review-explanations');
    const opened = page.locator('.review-explanations[open]');
    const closed = page.locator('.review-explanations:not([open])');
    if (task === 'read_daily_life') expect(await disclosures.count()).toBeGreaterThan(1);
    for (let visit = 0; visit < 2; visit++) {
      await expect(opened).toHaveCount(0);
      await disclosures.first().locator('summary').press('Enter');
      await expect(closed).toHaveCount(0);
      await page.locator('[data-review-index="1"]').click();
      await expect(closed).toHaveCount(0);
      await expect(disclosures.first().locator('p').first()).toBeVisible();
      await page.locator('[data-review-index="0"]').press('Space');
      await expect(closed).toHaveCount(0);
      await disclosures.last().locator('summary').click();
      await expect(opened).toHaveCount(0);
      await page.locator('[data-review-index="1"]').press('Enter');
      await expect(opened).toHaveCount(0);
      await disclosures.first().locator('summary').click();
      await expect(closed).toHaveCount(0);
      await page.reload();
    }
    await expect(opened).toHaveCount(0);
  });
}

test('new results and historical review reset material selection and reveal state', async ({
  page,
  request,
}) => {
  expect((await request.get('/')).status()).toBe(200);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => typeof window.createPracticeReview)).toBe('function');
  await openSettings(page, 'reading', 'complete_words', 2);
  await start(page);
  const submitted = page.waitForRequest(
    (request) => request.url().endsWith('/api/v1/exam/submit') && request.method() === 'POST',
  );
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

test('review instances keep DOM local and register navigation only once', async ({
  page,
  request,
}) => {
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  const result = await page.evaluate(() => {
    const root = document.createElement('section');
    root.innerHTML =
      '<h2 id="result-title"></h2><dl id="result-summary"></dl><div id="review-index"></div><div id="feedback-list"></div><button id="result-home"><span></span></button><div id="recording-archive-status"></div>';
    const escapeHtml = (value) =>
      String(value ?? '').replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
    let selections = 0;
    const review = window.createPracticeReview({
      root,
      sectionLabels: { reading: 'Reading' },
      taskLabels: { read_daily_life: 'Daily life' },
      format: { escapeHtml, formatTime: String, formatAnswer: (value) => String(value ?? '') },
      content: { materialMarkup: () => '', clozeMarkup: () => '', audioMarkup: () => '' },
      onSelectMaterial: () => {
        selections += 1;
      },
      onPlayAudio: () => {},
    });
    const snapshot = {
      section: 'reading',
      historyReview: false,
      recordings: {},
      tasks: { read_daily_life: { label: '短文' } },
      questions: ['first', 'second'].map((id) => ({
        id,
        task_type: 'read_daily_life',
        response_type: 'choice',
        prompt: '<b>Question</b>',
        options: ['A', 'B'],
      })),
      result: {
        sections: { reading: { earned: 2, possible: 2, percentage: 100, answered: 2, total: 2 } },
        feedback: ['first', 'second'].map((question_id) => ({
          question_id,
          task_type: 'read_daily_life',
          correct: true,
          answer: 0,
          correct_index: 0,
          answered: true,
          earned: 1,
          possible: 1,
          duration_seconds: 1,
          reference_answer: 'A',
        })),
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
      selectedOnce,
      afterDispose: selections,
      reset,
      unchangedInput: JSON.stringify(snapshot) === before,
      unchangedPage: document.querySelector('#result-title').textContent === pageTitle,
      injectedElements: root.querySelectorAll('.review-original b').length,
    };
  });
  expect(result).toEqual({
    selectedOnce: 1,
    afterDispose: 1,
    reset: 'step',
    unchangedInput: true,
    unchangedPage: true,
    injectedElements: 0,
  });
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
    test.use({
      viewport: { width: desktop.width, height: desktop.height },
      deviceScaleFactor: desktop.scale,
    });

    for (const [section, task, count] of [
      ['listening', 'listen_choose_response', 8],
      ['reading', 'read_daily_life', 4],
    ]) {
      test(`${section} colors correct, wrong and unanswered results after submission and reload`, async ({
        page,
        request,
      }, testInfo) => {
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        expect((await request.get('/')).status()).toBe(200);
        await page.route('**/api/v1/tts', (route) =>
          route.fulfill({ json: { url: null, fallback: true } }),
        );
        await page.goto('/');
        await openSettings(page, section, task, count);
        const exam = await start(page);
        const groups = [
          ...new Set(exam.questions.map((question) => question.group_id || question.id)),
        ];
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
          const questions = exam.questions.filter(
            (question) => (question.group_id || question.id) === groups[index],
          );
          const allCorrect = questions.every(
            (question) => result.feedback.find((item) => item.question_id === question.id).correct,
          );
          expect(allCorrect).toBe(index !== 0 && index !== 2);
          await expectResultColor(nav.nth(index), allCorrect);
          await expect(nav.nth(index)).toHaveAttribute(
            'aria-label',
            new RegExp(allCorrect ? '全部正确' : '有错题或未作答'),
          );
        }

        async function expectWrongAnswer() {
          const firstFeedback = result.feedback.find((item) => item.question_id === first.id);
          const explanation = page
            .locator('.review-answer')
            .first()
            .locator('.review-explanations');
          await explanation.locator('summary').click();
          await expect(explanation.locator('p')).toHaveText([firstFeedback.explanation]);
          await expect(explanation.locator('p')).toHaveCSS('white-space', 'pre-line');
          await expect(explanation.locator('p')).toContainText('下次：');
          await explanation.locator('summary').press('Enter');
          await expect(explanation).not.toHaveAttribute('open', '');
          const options = page.locator('.review-options').first().locator('li');
          await expectResultColor(options.nth(wrongIndex), false);
          await expectResultColor(options.nth(correctIndex), true);
          await expect(options.nth(wrongIndex).locator('.choice-letter')).toHaveCSS(
            'color',
            colors.incorrect.color,
          );
          await expect(options.nth(correctIndex).locator('.choice-letter')).toHaveCSS(
            'color',
            colors.correct.color,
          );
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
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await page
          .locator('.review-answer')
          .first()
          .locator('.review-explanations summary')
          .press('Enter');
        await page.screenshot({ path: testInfo.outputPath('choice-review.png'), fullPage: true });

        const newest = (await (await request.get('/api/v1/history')).json()).items[0];
        await page.reload();
        await expect(page).toHaveURL(new RegExp(`/history/practice/${newest.id}$`));
        await expect(page.locator('#result-title')).toContainText('历史复盘');
        await expectWrongAnswer();
        await expectResultColor(nav.nth(0), false);
        await expectResultColor(nav.nth(1), true);
        await expectResultColor(nav.nth(2), false);
        await page.setViewportSize({ width: 1280, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
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
    await page.route('**/api/v1/exam/submit', async (route) => {
      const response = await route.fetch();
      const result = await response.json();
      const item = result.feedback[0];
      item.feedback = '内容反馈：请补充 deadline 对计划的影响。';
      item.explanation =
        scenario === 'repeated reference'
          ? item.reference_answer
          : scenario === 'whitespace duplicate'
            ? `  ${item.feedback}\n`
            : '结构解析：先说明 request，再用 because 补充原因；不要写成 <request> 标签。';
      expected =
        scenario === 'distinct feedback' ? [item.feedback, item.explanation] : [item.feedback];
      await route.fulfill({ response, json: result });
    });
    await submit(page);
    const explanation = page.locator('.review-explanations');
    await explanation.locator('summary').press('Enter');
    await expect(explanation.locator('p')).toHaveText(expected);
    await expect(explanation.locator('request')).toHaveCount(0);
  });
}

test('deadline response shows one evidence-based bilingual explanation in history', async ({
  page,
  request,
}, testInfo) => {
  const id = randomUUID();
  const questionIds = ['L62', 'L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07'];
  const response = await request.post('/api/v1/exam/submit', {
    data: {
      submission_id: id,
      section: 'listening',
      mode: 'practice',
      task_type: 'listen_choose_response',
      count: 8,
      question_ids: questionIds,
      responses: [{ question_id: 'L62', answer: 0, duration_seconds: 61 }],
    },
  });
  expect(response.status()).toBe(200);
  expect((await request.get('/')).status()).toBe(200);
  await page.setViewportSize({ width: 2048, height: 1152 });
  await page.route(`**/api/v1/history/practice/${id}`, async (route) => {
    const response = await route.fetch();
    const record = await response.json();
    const item = record.result.feedback.find((entry) => entry.question_id === 'L62');
    item.explanation = 'The deadline is later, but revise sooner.';
    item.feedback = `  ${item.explanation}\n`;
    await route.fulfill({ response, json: record });
  });
  await page.goto('/');
  await page.locator('#open-history').click();
  await page.locator(`[data-history-id='${id}']`).click();
  const answer = page.locator('.review-answer').first();
  await expect(answer.locator('.reference-answer')).toHaveText(
    "D. That's a relief; I can revise my draft.",
  );
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
