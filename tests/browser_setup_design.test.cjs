const { test, expect } = require('@playwright/test');
const { expectFullWidth } = require('./browser_layout_helpers.cjs');
const { openSettings, start } = require('./browser_practice_helpers.cjs');

test.beforeEach(async ({ page, request }) => {
  await page.route('**/api/v1/tts', (route) =>
    route.fulfill({ json: { url: null, fallback: true } }),
  );
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
});

for (const viewport of [
  { width: 2560, height: 1440, scale: 1 },
  { width: 2048, height: 1152, scale: 1.25 },
  { width: 1707, height: 960, scale: 1.5 },
  { width: 1280, height: 720, scale: 1 },
  { width: 1000, height: 800, scale: 1 },
]) {
  test.describe(`${viewport.width}px setup`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.scale,
    });
    test('four subjects keep clear choices and an unclipped start action', async ({
      page,
    }, testInfo) => {
      for (const [section, task, count, title] of [
        ['reading', 'complete_words', 1, '阅读'],
        ['listening', 'listen_choose_response', 8, '听力'],
        ['writing', 'write_email', 3, '写作'],
        ['speaking', 'listen_repeat', 3, '口语'],
      ]) {
        await openSettings(page, section, task, count);
        await expect(page.locator('.setup-heading h1')).toHaveText(`${title}专项练习`);
        await expect(page.locator('#practice-settings')).toHaveCount(1);
        await expect(page.locator('#start-practice')).toBeInViewport();
        await expect(page.locator('.format-details summary')).toBeInViewport();
        await expectFullWidth(page.locator('.format-details'));
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        const choices = await page.locator('.setup-task-options .setting-choice').all();
        for (const choice of choices) {
          const bounds = await choice.boundingBox();
          expect(bounds.height).toBeGreaterThanOrEqual(60);
          expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
        }
        const summary = await page.locator('#selection-summary').boundingBox();
        const action = await page.locator('#start-practice').boundingBox();
        expect(action.x).toBeGreaterThan(summary.x + summary.width);
        const audioDetails = page.locator('.setup-audio-details');
        if (['listening', 'speaking'].includes(section)) {
          await expect(audioDetails).not.toHaveAttribute('open', '');
          await audioDetails.locator('summary').click();
          await expect(audioDetails.locator('p')).toContainText('非 ETS 官方比例或原声');
          await expectFullWidth(audioDetails.locator('p'));
          await audioDetails.locator('summary').click();
        } else await expect(audioDetails).toHaveCount(0);
        if (section === 'reading' || section === 'listening')
          await page.screenshot({
            path: testInfo.outputPath(`${section}-setup.png`),
            fullPage: true,
          });
      }
    });
  });
}

test('task choices show bank totals separately from the selected round quantity', async ({
  page,
}) => {
  for (const [section, task, count, totals] of [
    ['reading', 'complete_words', 2, ['270 篇', '180 篇', '60 篇']],
    ['listening', 'listen_choose_response', 16, ['510 题', '150 组', '120 组', '90 组']],
    ['writing', 'build_sentence', 20, ['450 题', '150 题', '150 题']],
    ['speaking', 'listen_repeat', 3, ['45 组', '45 组']],
  ]) {
    await openSettings(page, section, task, count);
    const bankCounts = page.locator('.setup-task-options .task-bank-count');
    await expect(bankCounts).toHaveText(totals);
    await expect(page.locator('.setup-task-options')).not.toContainText(/材料|小题|题库共/);
    await expect(bankCounts.first()).toHaveAttribute('title', '题库数量');
    await expect(page.locator('#selection-summary')).not.toContainText('题库');
    const lastTask = page.locator('input[name="task_type"]').last();
    await lastTask.focus();
    await page.keyboard.press('Space');
    await expect(lastTask).toBeChecked();
    await expect(lastTask).toBeFocused();
    await expect(bankCounts).toHaveText(totals);
    await page.locator('input[name="count"]').last().check();
    await expect(bankCounts).toHaveText(totals);
  }
});

test('keyboard choices preserve focus, update estimates, and start only once', async ({ page }) => {
  await openSettings(page, 'listening', 'listen_choose_response', 8);
  await page.locator('input[name="count"]:checked').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('input[name="count"][value="16"]')).toBeChecked();
  await expect(page.locator('input[name="count"][value="16"]')).toBeFocused();
  await expect(page.locator('#selection-summary')).toContainText('本轮预计 5 分钟 20 秒');
  await page.locator('input[name="timer_mode"]:checked').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('input[value="countdown"]')).toBeChecked();
  await expect(page.locator('#selection-summary')).toContainText('到时自动交卷');
  const focusStyle = await page
    .locator('input[value="countdown"]')
    .evaluate((input) => getComputedStyle(input.closest('label')).outlineStyle);
  expect(focusStyle).toBe('solid');
  await page.locator('.setup-audio-details summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.setup-audio-details')).toHaveAttribute('open', '');
  await page.keyboard.press('Enter');
  await page.locator('input[name="task_type"][value="listen_conversation"]').check();
  await expect(page.locator('input[name="count"]:checked')).toHaveValue('2');
  await expect(page.locator('#selection-summary')).toContainText('到时自动交卷');
  let examRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/exam?')) examRequests += 1;
  });
  const selected = await start(page);
  expect(selected.timer_mode).toBe('countdown');
  expect(examRequests).toBe(1);
  await expect(page.locator('#setup-view')).toBeHidden();
});

test('subject tabs keep keyboard navigation and speaking has one timer mode', async ({ page }) => {
  await openSettings(page, 'writing', 'write_email', 3);
  await page.locator('#tab-writing').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tab-speaking')).toBeFocused();
  await expect(page.locator('#tab-speaking')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('input[name="timer_mode"]')).toHaveCount(1);
  await expect(page.locator('input[name="timer_mode"]')).toBeChecked();
  await expect(page.locator('#selection-summary')).toContainText('到时自动交卷');
  await page.locator('#setup-home').click();
  await expect(page.locator('#landing-view')).toBeVisible();
});
