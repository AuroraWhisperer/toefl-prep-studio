const { test, expect } = require('@playwright/test');
const { openSettings, start, submit } = require('./browser_practice_helpers.cjs');
const { questions } = require('../question_bank/reading/questions.json');
const answerKeys = require('../question_bank/answers/reading.json');

test.use({ viewport: { width: 1707, height: 960 }, deviceScaleFactor: 1.5 });

test('all revised insertion tasks preserve markers, choices and scored review', async ({
  page,
  request,
}, testInfo) => {
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  let material = [];
  await page.route('**/api/v1/exam?*', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    // Force a real complete public material group; keys remain outside the payload.
    await route.fulfill({ response, json: { ...body, questions: material } });
  });
  for (const id of ['R215', 'R225', 'R238', 'R243']) {
    const target = questions.find((question) => question.id === id);
    material = questions.filter((question) => question.group_id === target.group_id);
    await openSettings(page, 'reading', 'read_academic_passage', 1);
    const selected = await start(page);
    expect(selected.questions).toHaveLength(5);
    expect(selected.questions.some((question) => 'correct_index' in question)).toBe(false);
    await page
      .locator(`[data-question-index="${material.findIndex((question) => question.id === id)}"]`)
      .click();
    const content = page.locator('#question-content');
    await expect(content).toContainText(target.prompt);
    for (const letter of 'ABCD') await expect(content).toContainText(`[${letter}]`);
    await expect(content.locator('.choice-copy')).toHaveText(target.options);
    await content.locator('.choice-option').nth(answerKeys[id].correct_index).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: testInfo.outputPath(`${id}.png`),
      fullPage: true,
      animations: 'disabled',
      scale: 'css',
    });
    const result = await submit(page);
    expect(result.feedback.find((item) => item.question_id === id).correct).toBe(true);
    await expect(page.locator('.review-material')).toContainText(target.prompt);
  }
});
