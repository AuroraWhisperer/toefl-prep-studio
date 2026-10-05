const { test, expect } = require('@playwright/test');
const { openSettings, start, submit } = require('./browser_practice_helpers.cjs');

const accent = 'rgb(40, 103, 93)';
const accentHover = 'rgb(29, 81, 73)';
const selectedSurface = 'rgb(232, 241, 236)';

function contrast(first, second) {
  const luminance = (color) => {
    const channels = color.startsWith('#')
      ? color
          .slice(1)
          .match(/../g)
          .map((channel) => parseInt(channel, 16))
      : color
          .match(/[\d.]+/g)
          .slice(0, 3)
          .map(Number);
    const linear = channels.map((value) => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

async function checkText(locator) {
  const { color, background } = await locator.evaluate((element) => {
    let surface = element;
    while (
      getComputedStyle(surface).backgroundColor === 'rgba(0, 0, 0, 0)' &&
      surface.parentElement
    ) {
      surface = surface.parentElement;
    }
    return {
      color: getComputedStyle(element).color,
      background: getComputedStyle(surface).backgroundColor,
    };
  });
  expect(contrast(color, background)).toBeGreaterThanOrEqual(4.5);
}

async function checkRoles(view) {
  const tokens = await view.evaluate((element) => {
    const style = getComputedStyle(element);
    return Object.fromEntries(
      [
        'ink',
        'paper',
        'white',
        'slate',
        'quiet-paper',
        'signal',
        'signal-hover',
        'signal-soft',
        'focus',
        'control-border',
        'success',
        'success-soft',
        'error',
        'error-soft',
      ].map((name) => [name, style.getPropertyValue(`--${name}`).trim()]),
    );
  });
  expect(tokens.signal).toBe('#28675d');
  for (const [foreground, background] of [
    ['ink', 'white'],
    ['slate', 'paper'],
    ['slate', 'quiet-paper'],
    ['white', 'signal'],
    ['white', 'signal-hover'],
    ['signal', 'signal-soft'],
    ['success', 'success-soft'],
    ['error', 'error-soft'],
    ['white', 'error'],
  ])
    expect(
      contrast(tokens[foreground], tokens[background]),
      `${foreground} on ${background}`,
    ).toBeGreaterThanOrEqual(4.5);
  for (const foreground of ['focus', 'control-border']) {
    expect(contrast(tokens[foreground], tokens.paper)).toBeGreaterThanOrEqual(3);
    expect(contrast(tokens[foreground], tokens.white)).toBeGreaterThanOrEqual(3);
  }
}

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
]) {
  test.describe(`workbench palette at ${viewport.scale * 100}% desktop scaling`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.scale,
    });
    test('four subjects keep readable action, selection, hover and keyboard colors', async ({
      page,
    }, testInfo) => {
      await expect(page.locator('.brand-mark')).toHaveCSS('color', accent);
      for (const [section, task, count] of [
        ['reading', 'complete_words', 1],
        ['listening', 'listen_choose_response', 8],
        ['writing', 'write_email', 1],
        ['speaking', 'listen_repeat', 1],
      ]) {
        await openSettings(page, section, task, count);
        await checkRoles(page.locator('#setup-view'));
        await checkText(page.locator('.task-bank-count').first());
        await expect(page.locator('.setup-tabs [aria-selected="true"]')).toHaveCSS('color', accent);
        const selected = page.locator('.setup-task-options .setting-choice:has(input:checked)');
        await expect(selected).toHaveCSS('background-color', selectedSurface);
        await checkText(selected);
        const primary = page.locator('#start-practice');
        await expect(primary).toHaveCSS('background-color', accent);
        await primary.hover();
        await expect(primary).toHaveCSS('background-color', accentHover);
        await checkText(primary);
        await page.mouse.move(0, 0);
        await primary.focus();
        await page.keyboard.press('Tab');
        await page.keyboard.press('Shift+Tab');
        await expect(primary).toBeFocused();
        await expect(primary).toHaveCSS('outline-color', accent);
        await expect(primary).toHaveCSS('outline-style', 'solid');
        await expect(primary).toBeInViewport();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        if (section === 'listening')
          await page.screenshot({ path: testInfo.outputPath('setup-palette.png'), fullPage: true });
      }
      await page.locator('#setup-home').click();
      await expect(page.locator('.brand-mark')).toHaveCSS('color', accent);
      await expect(page.locator('.section-card').nth(1)).toHaveCSS(
        'background-color',
        'rgb(48, 59, 55)',
      );
    });
  });
}

test('practice, review, archive and mock setup use the same semantic palette', async ({
  page,
}, testInfo) => {
  await openSettings(page, 'listening', 'listen_choose_response', 8);
  await start(page);
  await checkRoles(page.locator('#exam-view'));
  const audio = page.locator('.question-content .audio-button');
  await expect(audio).toHaveCSS('background-color', selectedSurface);
  await checkText(audio);
  await audio.hover();
  await expect(audio).toHaveCSS('background-color', accent);
  await checkText(audio);
  const choice = page.locator('.choice-option').first();
  await choice.click();
  await expect(choice).toHaveAttribute('aria-pressed', 'true');
  await expect(choice).toHaveCSS('background-color', selectedSurface);
  await checkText(choice.locator('.choice-copy'));
  await page.screenshot({ path: testInfo.outputPath('practice-palette.png'), fullPage: true });
  await submit(page);
  await checkRoles(page.locator('#result-view'));
  for (const button of await page.locator('#review-index button').all()) await checkText(button);
  await page.screenshot({ path: testInfo.outputPath('review-palette.png'), fullPage: true });
  await page.locator('#result-home').click();
  await page.locator('#open-history').click();
  await checkRoles(page.locator('#history-view'));
  await checkText(page.locator('.history-tabs [aria-selected="true"]'));
  await expect(page.locator('.history-filters .primary-button')).toHaveCSS(
    'background-color',
    accent,
  );
  await page.locator('.history-management summary').click();
  await expect(page.locator('.history-delete strong')).toHaveCSS('color', 'rgb(170, 68, 59)');
  await checkText(page.locator('.history-delete strong'));
  await page.screenshot({ path: testInfo.outputPath('archive-palette.png'), fullPage: true });
  await page.locator('#history-home').click();
  await page.locator('#open-mocks').click();
  const resources = await (await page.request.get('/api/v1/resources')).json();
  if (!resources.mock.some((paper) => paper.id === 'ets-test-1')) {
    await expect(page.getByRole('heading', { name: '尚未导入模考试卷' })).toBeVisible();
    return;
  }
  await page.locator('[data-paper="ets-test-1"]').click();
  await checkRoles(page.locator('#mock-view'));
  for (const link of await page.locator('.mock-view a').all()) {
    await expect(link).toHaveCSS('color', accent);
    await checkText(link);
  }
  await expect(page.locator('#begin-mock')).toBeDisabled();
  await page.screenshot({ path: testInfo.outputPath('mock-palette.png'), fullPage: true });
});
