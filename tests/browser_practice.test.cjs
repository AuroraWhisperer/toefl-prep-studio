const { test, expect } = require('@playwright/test');
const {
  allTaskFlows,
  clozeLetterInputs,
  timingAndRecovery,
  openSettings,
  start,
  submit,
} = require('./browser_practice_helpers.cjs');

test.beforeEach(async ({ page, request }) => {
  await page.route('**/api/v1/tts', (route) =>
    route.fulfill({ json: { url: null, fallback: true } }),
  );
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  await page.goto('/');
});

test('all twelve task types preserve answers and show grouped review', async ({
  page,
}, testInfo) => {
  const results = await allTaskFlows(page);
  expect(results).toHaveLength(12);
  await page.locator('.review-explanations').first().locator('summary').click();
  await page.screenshot({
    path: testInfo.outputPath('productive-explanation.png'),
    fullPage: true,
  });
});

test('cloze letter inputs support editing, bounded paste and review', async ({
  page,
}, testInfo) => {
  await clozeLetterInputs(page);
  const explanation = page.locator('.review-explanations');
  await explanation.locator('summary').press('Enter');
  await expect(explanation.locator('p')).toHaveCount(10);
  await expect(explanation.locator('p').first()).toContainText('下次：');
  await expect(explanation.locator('p').first()).toHaveCSS('white-space', 'pre-line');
  for (const viewport of [
    { width: 2560, height: 1440 },
    { width: 2048, height: 1152 },
    { width: 1707, height: 960 },
  ]) {
    await page.setViewportSize(viewport);
    for (const reveal of [false, true]) {
      await page.locator('#reveal-correct').setChecked(reveal);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        viewport.width,
      );
      expect(
        await page.locator('.cloze-answer').evaluateAll((answers) =>
          answers.every((answer) => {
            const slots = [...answer.children].map((slot) => slot.getBoundingClientRect());
            return slots.every(
              (slot, index) => slot.width > 0 && (!index || slot.left > slots[index - 1].right),
            );
          }),
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(
          `cloze-review-${viewport.width}-${reveal ? 'correct' : 'submitted'}.png`,
        ),
        fullPage: true,
        animations: 'disabled',
        scale: 'css',
      });
    }
  }
});

test('timers and failed submissions preserve the original selection', async ({ page, baseURL }) => {
  await timingAndRecovery(page, baseURL);
});

test('expired practice remains read-only after navigating and can retry submission', async ({
  page,
}) => {
  await page.route('**/api/v1/exam?*', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, json: { ...(await response.json()), time_limit_seconds: 2 } });
  });
  await page.route(
    '**/api/v1/exam/submit',
    (route) => route.fulfill({ status: 503, json: { detail: 'Temporary failure' } }),
    { times: 1 },
  );
  await openSettings(page, 'writing', 'write_email', 2);
  await page.locator('input[name=timer_mode][value=countdown]').check();
  await start(page);
  await expect(page.locator('#save-state')).toContainText('提交失败');
  await page.locator('#next-question').click();
  await expect(page.locator('#timer-value')).toHaveText('00:00');
  await expect(page.locator('#question-content')).toHaveJSProperty('inert', true);
  const result = await submit(page);
  expect(result.answered_questions).toBe(0);
});

test('all audio scripts keep compact spacing and line breaks in practice and review', async ({
  page,
}, testInfo) => {
  async function expectCompactScript(script, text) {
    const paragraphs = await page.evaluate(
      (text) =>
        PromptSpeech.parseTurns(text).map((turn) =>
          turn.speaker ? `${turn.speaker}: ${turn.text}` : turn.text,
        ),
      text,
    );
    await expect(script.locator('p')).toHaveText(paragraphs);
    for (const paragraph of await script.locator('p').all()) {
      await expect(paragraph).toHaveCSS('white-space', 'pre-line');
      await expect(paragraph).toHaveCSS('max-width', 'none');
    }
    const spacing = await script.evaluate((element) => {
      const summary = element.querySelector('summary').getBoundingClientRect();
      const paragraph = element.querySelector('p').getBoundingClientRect();
      const lastParagraph = element.querySelector('p:last-child').getBoundingClientRect();
      return {
        leading: summary.top - element.getBoundingClientRect().top,
        gap: paragraph.top - summary.bottom,
        trailing: element.getBoundingClientRect().bottom - lastParagraph.bottom,
      };
    });
    expect(spacing.leading).toBeCloseTo(0, 0);
    expect(spacing.gap).toBeCloseTo(10, 0);
    expect(spacing.trailing).toBeCloseTo(0, 0);
  }

  for (const viewport of [
    { width: 2048, height: 1152 },
    { width: 1707, height: 960 },
  ]) {
    await page.setViewportSize(viewport);
    for (const [section, task, count] of [
      ['listening', 'listen_choose_response', 8],
      ['listening', 'listen_conversation', 2],
      ['listening', 'listen_announcement', 1],
      ['listening', 'listen_academic_talk', 1],
      ['speaking', 'listen_repeat', 2],
      ['speaking', 'take_interview', 2],
    ]) {
      await openSettings(page, section, task, count);
      const selected = await start(page);
      const text = selected.questions[0].audio_text;
      const practiceScript = page.locator('#question-content .script-details');
      await expect(practiceScript).not.toHaveAttribute('open', '');
      await practiceScript.locator('summary').click();
      await expectCompactScript(practiceScript, text);
      await submit(page);
      const groups = new Map();
      for (const question of selected.questions) {
        const key = question.group_id || question.id;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(question);
      }
      for (const [groupIndex, questions] of [...groups.values()].entries()) {
        if (groupIndex > 0) await page.locator(`[data-review-index="${groupIndex}"]`).click();
        const texts = questions.map((question) => question.audio_text);
        const expectedTexts = texts.every((value) => value === texts[0]) ? [texts[0]] : texts;
        const scripts = page.locator('.review-material .script-details');
        await expect(scripts).toHaveCount(expectedTexts.length);
        for (const [index, expectedText] of expectedTexts.entries()) {
          const reviewScript = scripts.nth(index);
          await expect(reviewScript).toHaveAttribute('open', '');
          await expectCompactScript(reviewScript, expectedText);
          await reviewScript.locator('summary').click();
          for (const paragraph of await reviewScript.locator('p').all())
            await expect(paragraph).toBeHidden();
          await reviewScript.locator('summary').click();
          await expectCompactScript(reviewScript, expectedText);
        }
      }
      await page
        .locator('.review-material .audio-panel')
        .first()
        .screenshot({
          path: testInfo.outputPath(`${task}-${viewport.width}.png`),
        });
    }
  }
});
