const { test, expect } = require('@playwright/test');

async function openHome(page, request) {
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  await expect(page.locator('#section-grid .section-card')).toHaveCount(4);
  await page.evaluate(() => document.fonts.ready);
}

for (const [width, height] of [[2560, 1440], [2048, 1152], [2048, 1040], [1707, 960], [1707, 840], [1440, 800], [1280, 720], [1024, 1000], [768, 1000], [390, 844], [320, 800]]) {
  test(`homepage cards and wordmark fit at ${width}x${height}`, async ({ page, request }, testInfo) => {
    await page.setViewportSize({ width, height });
    await openHome(page, request);
    await expect(page.locator('#landing-title')).toBeVisible();
    await expect(page.locator('#landing-title')).toHaveText('TOEFL TRAINING');
    await expect(page.locator('#bank-total')).toHaveCount(0);
    await expect(page.locator('.brand-mark')).toHaveCSS('width', '36px');
    await expect(page.locator('#landing-title')).toHaveCSS('font-style', 'italic');
    await expect(page.locator('#landing-view .training-card')).toHaveCount(7);
    await expect(page.locator('#open-tests')).toBeEnabled();
    await expect(page.locator('#open-tests')).toHaveCSS('opacity', '1');
    const layout = await page.evaluate(() => ({
      fits: document.documentElement.scrollWidth <= innerWidth,
      fitsHeight: document.documentElement.scrollHeight <= innerHeight,
      wordmarkLoaded: [...document.fonts].some(font => font.family === 'Workbench Wordmark' && font.status === 'loaded'),
      gap: parseFloat(getComputedStyle(document.querySelector('#section-grid')).gap),
      cards: [...document.querySelectorAll('.training-card')].map(card => card.getBoundingClientRect().toJSON()),
      frames: [...document.querySelectorAll('.training-card')].map(card => ({
        border: getComputedStyle(card).borderTopWidth,
        inner: getComputedStyle(card, '::before').content,
        pointerEvents: getComputedStyle(card, '::before').pointerEvents,
      })),
    }));
    expect(layout.fits).toBe(true);
    expect(layout.wordmarkLoaded).toBe(true);
    for (const frame of layout.frames) {
      expect(frame.border).toBe('1px');
      expect(frame.inner).not.toBe('none');
      expect(frame.pointerEvents).toBe('none');
    }
    if (width >= 1100) {
      expect(layout.fitsHeight).toBe(true);
      expect(layout.gap).toBeCloseTo(Math.min(28, Math.max(20, height / 30 - 4)), 1);
      const [reading, listening, writing, speaking, mock, real] = layout.cards;
      expect(listening.y - reading.y).toBe(16);
      expect(speaking.y - writing.y).toBe(16);
      expect(writing.y).toBeGreaterThan(reading.bottom);
      expect(mock.x).toBeGreaterThan(listening.right);
      expect(real.y).toBeGreaterThan(mock.bottom);
      expect(Math.max(...layout.cards.map(card => card.bottom))).toBeLessThan(height);
      if (height >= 800) {
        expect(reading.height).toBeGreaterThan(240);
        expect(layout.gap).toBeGreaterThan(20);
      }
      if (height <= 1040) expect(height - layout.cards[6].bottom).toBeLessThan(100);
    }
    await page.screenshot({ path: testInfo.outputPath('homepage.png'), fullPage: true });
  });
}

test('desktop resizing keeps every homepage action on screen', async ({ page, request }) => {
  await openHome(page, request);
  for (const [width, height] of [[2048, 1040], [1707, 840], [1280, 720], [1440, 800]]) {
    await page.setViewportSize({ width, height });
    for (const button of await page.locator('#landing-view .training-card button').all()) {
      await expect(button).toBeInViewport({ ratio: 1 });
    }
  }
  const history = page.locator('#open-history');
  await history.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#history-view')).toBeVisible();
  await page.locator('#history-home').click();
  await expect(history).toBeInViewport({ ratio: 1 });
});

test('all seven cards follow the pointer and reset on exit', async ({ page, request }, testInfo) => {
  await openHome(page, request);
  const cards = page.locator('.training-card');
  for (let index = 0; index < 7; index += 1) {
    const card = cards.nth(index);
    const box = await card.boundingBox();
    await page.mouse.move(box.x + box.width * .2, box.y + box.height * .2);
    await expect(card).toHaveClass(/is-tilting/);
    await expect.poll(() => card.evaluate(node => parseFloat(node.style.getPropertyValue('--tilt-y')))).toBeLessThan(0);
    await page.mouse.move(box.x + box.width * .8, box.y + box.height * .8);
    await expect.poll(() => card.evaluate(node => parseFloat(node.style.getPropertyValue('--tilt-y')))).toBeGreaterThan(0);
    await expect(card).not.toHaveCSS('transform', 'none');
    if (index === 0) await page.screenshot({ path: testInfo.outputPath('homepage-tilt.png') });
    await page.mouse.move(0, 0);
    await expect(card).not.toHaveClass(/is-tilting/);
    await expect.poll(() => card.evaluate(node => node.style.getPropertyValue('--tilt-y'))).toBe('');
  }
});

test('reduced motion removes tilt, including an active tilt', async ({ page, request }) => {
  await openHome(page, request);
  const card = page.locator('.training-card').first();
  await card.hover({ position: { x: 30, y: 30 } });
  await expect(card).toHaveClass(/is-tilting/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(card).not.toHaveClass(/is-tilting/);
  await page.mouse.move(0, 0);
  await card.hover({ position: { x: 40, y: 40 } });
  await expect(card).not.toHaveClass(/is-tilting/);
  await expect(card).toHaveCSS('transform', 'none');
});

test('scrolling resets an active card angle', async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 500 });
  await openHome(page, request);
  const card = page.locator('.training-card').first();
  await card.hover({ position: { x: 30, y: 30 } });
  await expect(card).toHaveClass(/is-tilting/);
  await page.mouse.wheel(0, 100);
  await expect(card).not.toHaveClass(/is-tilting/);
});

test.describe('touchscreen', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  test('cards remain still and practice opens with a tap', async ({ page, request }) => {
    await openHome(page, request);
    const card = page.locator('.training-card').first();
    await card.dispatchEvent('pointermove', { pointerType: 'touch', clientX: 40, clientY: 220 });
    await expect(card).not.toHaveClass(/is-tilting/);
    await expect(card).toHaveCSS('transform', 'none');
    await card.getByRole('button', { name: '阅读专项练习', exact: true }).tap();
    await expect(page.locator('#setup-view')).toBeVisible();
  });
});

test('card surface, keyboard actions and mock toggle keep their original behavior', async ({ page, request }) => {
  await openHome(page, request);
  for (const section of ['reading', 'listening', 'writing', 'speaking']) {
    const button = page.locator(`[data-action="configure"][data-section="${section}"]`);
    const heading = await button.locator('xpath=ancestor::article').locator('h2').boundingBox();
    // The existing stretched button intentionally covers the heading hit area.
    await page.mouse.click(heading.x + heading.width / 2, heading.y + heading.height / 2);
    await expect(page.locator('#setup-view')).toBeVisible();
    await expect(page.locator(`#tab-${section}`)).toHaveAttribute('aria-selected', 'true');
    await page.locator('#setup-home').click();
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#setup-view')).toBeVisible();
    await page.locator('#setup-home').click();
  }
  await page.locator('#open-mocks').click();
  await expect(page.locator('#mock-papers')).toBeVisible();
  await expect(page.locator('#open-mocks')).toHaveAttribute('aria-expanded', 'true');
  await page.locator('#open-mocks').click();
  await expect(page.locator('#mock-papers')).toBeHidden();
});
