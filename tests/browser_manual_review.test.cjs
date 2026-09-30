const { test, expect } = require('@playwright/test');
const { openSettings, start, submit } = require('./browser_practice_helpers.cjs');

for (const display of [
  { task: 'write_email', section: 'writing', width: 2048, height: 1152, scale: 1.25 },
  { task: 'academic_discussion', section: 'writing', width: 1707, height: 960, scale: 1.5 },
  { task: 'take_interview', section: 'speaking', width: 2560, height: 1440, scale: 1 },
]) {
  test.describe(display.task, () => {
    test.use({
      viewport: { width: display.width, height: display.height },
      deviceScaleFactor: display.scale,
    });
    test('open responses preserve answers and show manual review without a numeric grade', async ({
      page,
      request,
    }, testInfo) => {
      await page.route('**/api/v1/tts', (route) =>
        route.fulfill({ json: { url: null, fallback: true } }),
      );
      expect((await request.get('/')).status()).toBe(200);
      await page.goto('/');
      await openSettings(page, display.section, display.task, 1);
      const selected = await start(page);
      await expect(page.locator('.reference-answer')).toHaveCount(0);
      if (display.section === 'speaking')
        await page.locator('.speaking-practice-aid summary').click();
      const answer = 'I prefer another approach because it gives students more time to prepare.';
      await page.locator('#answer-input').fill(answer);
      const result = await submit(page);
      expect(result.answered_questions).toBe(1);
      expect(result.feedback.every((item) => item.manual_review && item.correct === null)).toBe(
        true,
      );
      expect(result.sections[display.section].possible).toBe(0);
      await expect(page.locator('#result-summary')).toContainText('待人工复核');
      await expect(page.locator('#result-summary')).toContainText(`1 / ${selected.total}`);
      await expect(page.locator('#result-summary')).not.toContainText('0 / 0');
      await expect(page.locator('#result-summary')).not.toContainText('null%');
      await expect(page.locator('.submitted-answer').first()).toHaveText(answer);
      await expect(page.locator('.review-answer-head').first()).toContainText('待人工复核');
      await expect(page.locator('.answer-incorrect')).toHaveCount(0);
      await page.locator('.review-explanations').first().locator('summary').press('Enter');
      await expect(page.locator('.review-explanations').first()).toContainText('当前有');
      await expect(page.locator('.review-explanations').first()).toContainText('下次：');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({ path: testInfo.outputPath('manual-review.png'), scale: 'css' });
      await page.reload();
      await expect(page.locator('#result-title')).toContainText('历史复盘');
      await expect(page.locator('#result-summary')).toContainText('待人工复核');
      await expect(page.locator('.submitted-answer').first()).toHaveText(answer);
      await page.locator('#result-home').click();
      await expect(page.locator('.history-row-score').first()).toContainText('待人工复核');
      await expect(page.locator('.history-row-score').first()).not.toContainText('0 / 0');
      await page.screenshot({ path: testInfo.outputPath('manual-history.png'), scale: 'css' });
    });
  });
}
