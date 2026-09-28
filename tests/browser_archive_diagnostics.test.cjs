const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

for (const display of [
  { name: 'desktop', width: 2560, height: 1320, scale: 1 },
  { name: '125 percent', width: 2048, height: 1056, scale: 1.25 },
  { name: '150 percent', width: 1707, height: 880, scale: 1.5 },
  { name: 'narrow desktop', width: 1024, height: 768, scale: 1 },
]) {
  test.describe(display.name, () => {
    test.use({ viewport: { width: display.width, height: display.height }, deviceScaleFactor: display.scale });
    test('a real damaged archive shows its filename and recovers by keyboard retry', async ({ page, request }, testInfo) => {
      const directory = testInfo.config.webServer.env.TOEFL_DATA_DIR;
      expect(path.dirname(directory)).toBe(path.resolve('artifacts/browser-data'));
      const id = randomUUID();
      const submitted = await request.post('/api/v1/exam/submit', { data: { section: 'reading', submission_id: id } });
      expect(submitted.status()).toBe(200);
      const filename = path.join(directory, 'practice-history', `${id}.json`);
      const original = await fs.readFile(filename);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        await fs.writeFile(filename, '{');
        expect((await request.get('/')).status()).toBe(200);
        const failed = await request.get('/api/v1/history');
        expect(failed.status()).toBe(409);
        await page.goto('/');
        await page.locator('#open-history').click();
        const alert = page.locator('#history-list [role=alert]');
        await expect(alert).toContainText(`practice-history/${id}.json`);
        await expect(alert).toContainText('原文件未修改');
        await expect(page.locator('#history-count')).toHaveText('记录未能加载');
        expect(await fs.readFile(filename, 'utf8')).toBe('{');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath('archive-diagnostic.png'), fullPage: true });
        await fs.writeFile(filename, original);
        const retry = page.getByRole('button', { name: '重新加载', exact: true });
        await retry.focus();
        await page.keyboard.press('Enter');
        await expect(page.locator(`[data-history-id="${id}"]`)).toBeVisible();
        await expect(alert).toHaveCount(0);
        await page.locator('#history-home').click();
        await expect(page.locator('#landing-view')).toBeVisible();
        expect(errors).toEqual([]);
      } finally {
        await fs.writeFile(filename, original);
      }
    });
  });
}
