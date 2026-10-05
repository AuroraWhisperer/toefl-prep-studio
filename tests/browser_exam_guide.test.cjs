const { test, expect } = require('@playwright/test');
const { expectFullWidth } = require('./browser_layout_helpers.cjs');

test('exam guide opens once, supports keyboard and history, and keeps practice estimates separate', async ({
  page,
  request,
}) => {
  expect((await request.get('/')).status()).toBe(200);
  const examRequests = [];
  const errors = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/v1/exam?')) examRequests.push(r.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const entry = page.getByRole('button', { name: '2026 新托福指南', exact: true });
  await expect(entry).toHaveCount(1);
  await entry.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/guide$/);
  await expect(page.locator('.app-shell > section:not([hidden])')).toHaveAttribute(
    'id',
    'exam-guide',
  );
  await expect(page.locator('#guide-title')).toBeFocused();
  await expect(page.locator('[data-guide-budget]')).toHaveCount(12);
  await expect(page.locator('[data-guide-budget="reading.complete_words"]')).toHaveText(
    '每篇 2 分钟',
  );
  await expect(page.locator('[data-guide-budget="reading.read_daily_life"]')).toHaveText(
    '2 题用 2 分钟；3 题用 3 分钟',
  );
  await expect(page.locator('[data-guide-budget="writing.build_sentence"]')).toHaveText(
    '10 题共 6 分钟',
  );
  await expect(page.locator('[data-guide-budget="listening.listen_conversation"]')).toHaveText(
    '每段 1 分钟 40 秒',
  );
  await expect(page.locator('[data-guide-budget="writing.write_email"]')).toHaveText('每封 7 分钟');
  await expect(page.locator('[data-guide-budget="speaking.listen_repeat"]')).toHaveText(
    '整组约 3 分钟',
  );
  for (const section of ['listening', 'writing', 'speaking']) {
    const summary = page.locator(`#guide-${section} > summary`);
    await summary.focus();
    await page.keyboard.press('Space');
    await expect(page.locator(`#guide-${section}`)).toHaveAttribute('open', '');
  }
  await expect(page.locator('#guide-speaking')).toContainText('8–12 秒');
  await expect(page.locator('#guide-speaking')).toContainText('45 秒');
  await expect(page.locator('#guide-writing')).toContainText('组句时间为本应用设置');
  await expect(page.locator('#exam-guide')).toContainText('本应用练习用时');
  await expect(page.locator('#exam-guide')).toContainText('2026-10-05');
  const sources = page.locator('.guide-sources a');
  await expect(sources).toHaveCount(5);
  for (const link of await sources.all()) {
    expect(['www.ets.org', 'files.eric.ed.gov']).toContain(
      new URL(await link.getAttribute('href')).hostname,
    );
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
  await page.goBack();
  await expect(page.locator('#landing-view')).toBeVisible();
  await expect(entry).toBeFocused();
  await page.goForward();
  await expect(page.locator('#exam-guide')).toBeVisible();
  expect((await request.get('/guide')).status()).toBe(200);
  await page.reload();
  await expect(page.locator('#guide-title')).toBeVisible();
  await page.getByRole('button', { name: '返回练习首页', exact: true }).click();
  await expect(entry).toBeFocused();
  await entry.click();
  await expect(page.locator('#exam-guide')).toBeVisible();
  expect(examRequests).toEqual([]);
  expect(errors).toEqual([]);
});

for (const [width, height, scale] of [
  [2560, 1440, 1],
  [2048, 1152, 1.25],
  [1707, 960, 1.5],
  [1280, 720, 1],
]) {
  test.describe(`guide at ${width}x${height}, scale ${scale}`, () => {
    test.use({ viewport: { width, height }, deviceScaleFactor: scale });
    test('entry and expanded content fit the desktop window', async ({
      page,
      request,
    }, testInfo) => {
      expect((await request.get('/')).status()).toBe(200);
      await page.goto('/');
      const entry = page.locator('#open-exam-guide');
      await expect(entry).toBeInViewport({ ratio: 1 });
      const brand = await page.locator('.training-brand').boundingBox();
      expect((await entry.boundingBox()).x).toBeGreaterThan(brand.x + brand.width);
      await page.screenshot({ path: testInfo.outputPath('homepage-guide-entry.png') });
      await entry.click();
      await expect(page.locator('#exam-guide')).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath('guide-reading.png'), fullPage: true });
      for (const section of ['listening', 'writing', 'speaking']) {
        await page.locator(`#guide-${section} > summary`).click();
      }
      await expectFullWidth(page.locator('.guide-intro, .guide-section-body > p, .guide-sources'));
      await page.getByRole('link', { name: 'ETS 考试结构', exact: true }).scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      for (const table of await page.locator('.guide-table').all()) {
        expect(await table.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
      }
      await page.screenshot({
        path: testInfo.outputPath('guide-all-sections.png'),
        fullPage: true,
      });
      await page.setViewportSize({ width: 1100, height: 800 });
      await expectFullWidth(page.locator('.guide-intro, .guide-section-body > p, .guide-sources'));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });
  });
}

test('guide remains readable when question-bank metadata is unavailable', async ({
  page,
  request,
}) => {
  expect((await request.get('/guide')).status()).toBe(200);
  await page.route('**/api/v1/meta', (route) =>
    route.fulfill({ status: 503, json: { detail: 'Unavailable' } }),
  );
  await page.goto('/guide');
  await expect(page.locator('#exam-guide')).toBeVisible();
  await expect(page.locator('#guide-reading')).toContainText('每篇 10 个空');
  await expect(page.locator('[data-guide-budget="reading.complete_words"]')).toHaveText(
    '见专项练习设置',
  );
  await expect(page.locator('[data-guide-budget="writing.write_email"]')).toHaveText('每封 7 分钟');
  await expect(page.locator('[data-guide-budget="writing.academic_discussion"]')).toHaveText(
    '每篇 10 分钟',
  );
  await page.getByRole('button', { name: '返回练习首页', exact: true }).click();
  await expect(page.locator('#landing-view')).toBeVisible();
});
