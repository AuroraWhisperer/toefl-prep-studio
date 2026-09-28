const { test, expect } = require('@playwright/test');

for (const [width, height] of [
  [2048, 1152],
  [1707, 960],
  [1280, 720],
]) {
  test(`empty mock library remains usable at ${width}x${height}`, async ({
    page,
    request,
  }, testInfo) => {
    await page.setViewportSize({ width, height });
    expect((await request.get('/')).status()).toBe(200);
    let resourceRequests = 0;
    await page.route('**/api/v1/resources', async (route) => {
      resourceRequests += 1;
      const response = await route.fetch();
      expect(response.status()).toBe(200);
      const resources = await response.json();
      await route.fulfill({ response, json: { ...resources, mock: [] } });
    });
    await page.goto('/');
    const toggle = page.locator('#open-mocks');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('heading', { name: '尚未导入模考试卷' })).toBeVisible();
    await expect(page.locator('[data-paper]')).toHaveCount(0);
    await expect(page.locator('#library-content')).toContainText('原创练习和综合测验可直接使用');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath('empty-mock-library.png'), fullPage: true });
    await toggle.click();
    await expect(page.locator('#mock-papers')).toBeHidden();
    await toggle.click();
    await expect(page.getByRole('heading', { name: '尚未导入模考试卷' })).toHaveCount(1);
    expect(resourceRequests).toBe(1);
    await page.locator('[data-action="configure"][data-section="reading"]').click();
    await expect(page.locator('#setup-view')).toBeVisible();
    await page.locator('#setup-home').click();
    await page.locator('#open-tests').click();
    await expect(page.locator('#test-setup')).toBeVisible();
  });
}
