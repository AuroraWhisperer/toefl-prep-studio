const { test, expect } = require('@playwright/test');
const { openSettings, start, submit } = require('./browser_practice_helpers.cjs');
const bank = require('../question_bank/listening/questions.json').questions;
const translations = require('../question_bank/sources/listening_translations.json');
const ids = ['L367', 'L893', 'L73', 'L256', 'L393', 'L878', 'L928', 'L960'];

for (const desktop of [
  { width: 2560, height: 1440, scale: 1 },
  { width: 2048, height: 1152, scale: 1.25 },
  { width: 1707, height: 960, scale: 1.5 },
]) {
  test.describe(`listening translation at ${desktop.scale * 100}% scaling`, () => {
    test.use({
      viewport: { width: desktop.width, height: desktop.height },
      deviceScaleFactor: desktop.scale,
    });

    test('review pairs the original with Chinese and preserves history review', async ({
      page,
      request,
    }, testInfo) => {
      await page.route('**/api/v1/tts', (route) => route.abort());
      await page.route('**/api/v1/exam?*', async (route) => {
        const response = await route.fetch();
        const exam = await response.json();
        exam.questions = ids.map((id) => bank.find((q) => q.id === id));
        exam.question_ids = ids;
        await route.fulfill({ response, json: exam });
      });
      expect((await request.get('/practice/listening')).status()).toBe(200);
      await page.goto('/practice/listening');
      await openSettings(page, 'listening', 'listen_choose_response', 8);
      const exam = await start(page);
      expect(exam).not.toHaveProperty('audio_translations');
      const practice = page.locator('#question-content .audio-panel');
      await expect(practice).not.toContainText('练习辅助');
      await expect(practice.locator('details')).not.toHaveAttribute('open');
      await practice.locator('summary').press('Enter');
      await expect(practice.locator('p[lang="en"]')).toHaveText(translations.L367.source);
      await expect(practice.locator('.audio-translation')).toHaveCount(0);
      await page.locator('.choice-option').first().click();

      const result = await submit(page);
      const panel = page.locator('#feedback-list .audio-panel');
      for (const [index, id] of ids.entries()) {
        await page.locator(`[data-review-index="${index}"]`).click();
        await expect(panel).not.toContainText('练习辅助');
        await expect(panel.locator('.audio-translation')).toHaveCount(1);
        await expect(panel.locator('.audio-translation')).toHaveText(translations[id].translation);
        expect(result.audio_translations[id]).toBe(translations[id].translation);
        await expect(panel.locator('p[lang="en"]')).toHaveText(translations[id].source);
        await expect(panel.locator('[data-audio-text]')).toHaveCount(1);
        const geometry = await panel.evaluate((node) => {
          const english = node.querySelector('p[lang="en"]').getBoundingClientRect();
          const chinese = node.querySelector('.audio-translation').getBoundingClientRect();
          return {
            gap: chinese.top - english.bottom,
            aligned: Math.abs(chinese.left - english.left) < 1,
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        expect(geometry).toEqual({ gap: 4, aligned: true, overflow: false });
      }
      await page.locator('[data-review-index="0"]').press('Enter');
      await panel.locator('summary').press('Enter');
      await expect(panel.locator('.audio-translation')).toBeHidden();
      await panel.locator('summary').click();
      await expect(panel.locator('.audio-translation')).toBeVisible();
      await page.screenshot({
        path: testInfo.outputPath('listening-translation.png'),
        fullPage: true,
      });

      await page.route('**/api/v1/history/practice/*', async (route) => {
        const response = await route.fetch();
        const record = await response.json();
        delete record.result.audio_translations;
        await route.fulfill({ response, json: record });
      });
      expect((await request.get(page.url())).status()).toBe(200);
      await page.reload();
      await expect(page.locator('#result-title')).toContainText('历史复盘');
      await expect(panel.locator('.audio-translation')).toHaveText(translations.L367.translation);
      await page.setViewportSize({ width: 1000, height: 800 });
      await expect(panel.locator('.audio-translation')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
        false,
      );
    });
  });
}
