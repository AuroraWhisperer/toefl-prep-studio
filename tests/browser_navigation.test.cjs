const { test, expect } = require('@playwright/test');

async function expectLeftAlignedReturn(page, titleSelector, buttonSelector) {
  const { title, button, fitsViewport } = await page.evaluate(({ titleSelector, buttonSelector }) => ({
    title: document.querySelector(titleSelector).getBoundingClientRect().toJSON(),
    button: document.querySelector(buttonSelector).getBoundingClientRect().toJSON(),
    fitsViewport: document.documentElement.scrollWidth <= innerWidth,
  }), { titleSelector, buttonSelector });
  expect(button.x + button.width).toBeLessThanOrEqual(title.x + 1);
  expect(Math.abs(button.y + button.height / 2 - title.y - title.height / 2)).toBeLessThan(2);
  expect(button.height).toBeGreaterThanOrEqual(44);
  expect(fitsViewport).toBe(true);
  await expect(page.locator(buttonSelector)).toHaveCSS('align-items', 'center');
  await expect(page.locator(buttonSelector)).toHaveCSS('border-radius', '8px');
  await expect(page.locator(`${buttonSelector} svg[aria-hidden="true"]`)).toHaveCount(1);
}

for (const width of [2048, 1440, 390, 320]) {
  test(`subject tabs and return controls stay in place at ${width}px`, async ({ page, request }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.route('**/api/v1/tts', route => route.fulfill({ json: { url: null, fallback: true } }));
    expect((await request.get('/')).status()).toBe(200);
    await page.goto('/');
    await page.locator('[data-action="configure"][data-section="reading"]').click();

    for (const section of ['reading', 'listening', 'writing', 'speaking']) {
      await page.locator(`#tab-${section}`).click();
      await expect(page.locator(`#tab-${section}`)).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#setup-tabs [role="tab"]')).toHaveCount(4);
      await expect(page.locator('.setup-nav #setup-home')).toHaveCount(1);
      await expect(page.locator('#setup-tabs #setup-home')).toHaveCount(0);
      await expect(page.locator('#setup-content h2, .setup-intro, .task-description, .setup-bank-count')).toHaveCount(0);
      await expectLeftAlignedReturn(page, '#setup-tabs', '#setup-home');
      const tabs = await page.locator('#setup-tabs [role="tab"]').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().y));
      expect(Math.max(...tabs) - Math.min(...tabs)).toBeLessThan(2);
      const [quantity, timer] = await page.locator('.setup-options-row fieldset').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().toJSON()));
      if (width > 760) {
        expect(Math.abs(quantity.y - timer.y)).toBeLessThan(2);
        expect(quantity.x + quantity.width).toBeLessThanOrEqual(timer.x);
      } else {
        expect(quantity.y + quantity.height).toBeLessThanOrEqual(timer.y);
      }
      await expect(page.locator('.format-details')).toHaveJSProperty('open', false);
      await expect(page.locator('.format-details p').first()).toBeHidden();
      await expect(page.locator('#selection-summary')).toContainText('本轮预计');
      const start = await page.locator('#start-practice').boundingBox();
      expect(start.y + start.height).toBeLessThanOrEqual(1000);
      await page.locator('input[name="task_type"]').last().check();
      await expectLeftAlignedReturn(page, '#setup-tabs', '#setup-home');
    }

    if (width === 2048 || width === 390) {
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
      await page.screenshot({ path: testInfo.outputPath('setup-navigation.png') });
    }
    await page.locator('#tab-speaking').focus();
    await page.keyboard.press('Home');
    await expect(page.locator('#tab-reading')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-listening')).toHaveAttribute('aria-selected', 'true');
    await page.locator('#setup-home').click();
    await expect(page.locator('#landing-view')).toBeVisible();

    for (const section of ['reading', 'listening', 'writing', 'speaking']) {
      await page.locator(`[data-action="configure"][data-section="${section}"]`).click();
      await page.locator('input[name="task_type"]').last().check();
      await page.locator('input[name="count"]').last().check();
      await page.locator('input[name="timer_mode"]').last().check();
      const selection = await page.locator('#practice-settings').evaluate(form => Object.fromEntries(new FormData(form)));
      await page.locator('#start-practice').click();
      await expect(page.locator('#exam-view')).toBeVisible();
      await expect(page.locator('#back-home')).toHaveText('返回上一页');
      await expectLeftAlignedReturn(page, '#exam-title', '#back-home');
      await page.locator('#back-home').click();
      await expect(page.locator('#setup-view')).toBeVisible();
      await expect(page.locator('#landing-view')).toBeHidden();
      await expect(page.locator(`#tab-${section}`)).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#start-practice')).toBeFocused();
      expect(await page.locator('#practice-settings').evaluate(form => Object.fromEntries(new FormData(form)))).toEqual(selection);
      await page.locator('#start-practice').click();
      await expect(page.locator('#exam-view')).toBeVisible();
      await page.locator('#submit-exam').click();
      await expect(page.locator('#result-view')).toBeVisible();
      await expectLeftAlignedReturn(page, '#result-title', '#result-home');
      if (section === 'reading' && (width === 2048 || width === 390)) {
        await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
        await page.screenshot({ path: testInfo.outputPath('result-navigation.png') });
      }
      await page.locator('#result-home').click();
      await expect(page.locator('#landing-view')).toBeVisible();
    }

    await page.locator('[data-action="configure"][data-section="reading"]').click();
    await page.locator('#start-practice').click();
    await expect(page.locator('#exam-view')).toBeVisible();
    if (width === 2048 || width === 390) {
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
      await page.screenshot({ path: testInfo.outputPath('exam-navigation.png') });
    }
    await page.locator('#back-home').click();
    await expect(page.locator('#setup-view')).toBeVisible();
    await page.locator('#setup-home').click();
    await expect(page.locator('#landing-view')).toBeVisible();

    await page.locator('[data-section="reading"][data-mode="exam"]').click();
    await expect(page.locator('#exam-view')).toBeVisible();
    await expect(page.locator('#back-home')).toHaveText('返回上一页');
    await page.locator('#back-home').click();
    await expect(page.locator('#landing-view')).toBeVisible();
    await expect(page.locator('#setup-view')).toBeHidden();
  });
}
