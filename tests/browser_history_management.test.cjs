const { test, expect } = require('@playwright/test');
const { randomUUID } = require('node:crypto');

async function openHistory(page, request) {
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  await page.locator('#open-history').click();
  await expect(page.locator('#history-panel')).toHaveAttribute('aria-busy', 'false');
}

test('both actions require confirmation and clearing ignores the selected category and dates', async ({ page, request }, testInfo) => {
  const id = randomUUID();
  expect((await request.post('/api/v1/exam/submit', { data: { section: 'reading', submission_id: id } })).status()).toBe(200);
  const before = await (await request.get('/api/v1/history')).json();
  const mutations = [];
  page.on('request', request => {
    if (request.url().endsWith('/api/v1/history/reset')) mutations.push(request.postDataJSON());
  });
  await openHistory(page, request);
  const menu = page.locator('#history-management');
  const reset = page.locator('[data-history-reset=probability]');
  const clear = page.locator('[data-history-reset=all]');
  await menu.locator('summary').click();
  await expect(reset.locator('strong')).toHaveText('重置概率');
  await expect(clear.locator('strong')).toHaveText('全部清空');
  await page.screenshot({ path: testInfo.outputPath('history-management.png'), fullPage: true });
  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveAttribute('open');
  await expect(menu.locator('summary')).toBeFocused();
  await menu.locator('summary').click();
  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain('答题记录和录音全部保留');
    await dialog.dismiss();
  });
  await reset.click();
  expect(mutations).toEqual([]);
  await expect(menu.locator('summary')).toBeFocused();
  await menu.locator('summary').click();
  page.once('dialog', dialog => dialog.accept());
  await reset.click();
  await expect(page.locator('#history-management-status')).toContainText('答题记录与录音已保留');
  expect((await (await request.get('/api/v1/history')).json()).total).toBe(before.total);
  expect((await request.get(`/api/v1/history/practice/${id}`)).status()).toBe(200);

  await page.locator('#history-tab-test').click();
  await page.getByLabel('起始日期', { exact: true }).fill('2000-01-01');
  await page.getByLabel('截止日期', { exact: true }).fill('2000-01-02');
  await page.getByRole('button', { name: '查找记录', exact: true }).click();
  await expect(page.locator('.history-empty')).toContainText('这段时间没有记录');
  await menu.locator('summary').click();
  page.once('dialog', async dialog => {
    expect(dialog.message()).toContain('不限当前筛选');
    expect(dialog.message()).toContain('无法恢复');
    await dialog.dismiss();
  });
  await clear.click();
  expect(mutations).toEqual([{ scope: 'probability', confirm: true }]);
  expect((await request.get(`/api/v1/history/practice/${id}`)).status()).toBe(200);
  await menu.locator('summary').click();
  page.once('dialog', dialog => dialog.accept());
  await clear.click();
  await expect(page.locator('#history-management-status')).toContainText('全部答题记录与已归档录音已清空');
  await expect(page.locator('#history-from')).toHaveValue('');
  await expect(page.locator('#history-to')).toHaveValue('');
  expect(mutations).toEqual([{ scope: 'probability', confirm: true }, { scope: 'all', confirm: true }]);
  for (const category of ['practice', 'mock', 'test']) {
    await page.locator(`#history-tab-${category}`).click();
    await expect(page.locator('#history-count')).toHaveText('0 条记录');
    await expect(page.locator('.history-row')).toHaveCount(0);
    expect((await (await request.get(`/api/v1/history?category=${category}`)).json()).total).toBe(0);
  }
});

test('pending operations cannot be duplicated and errors remain retryable', async ({ page, request }) => {
  let finish;
  let attempts = 0;
  await page.route('**/api/v1/history/reset', async route => {
    attempts += 1;
    if (attempts > 1) return route.continue();
    await new Promise(resolve => { finish = resolve; });
    await route.fulfill({ status: 503, json: { detail: '暂时无法保存，请重试。' } });
  });
  await openHistory(page, request);
  const menu = page.locator('#history-management');
  await menu.locator('summary').click();
  page.once('dialog', dialog => dialog.accept());
  await page.locator('[data-history-reset=probability]').click();
  await expect(menu).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('[data-history-reset=probability]')).toBeDisabled();
  await expect(page.locator('[data-history-reset=all]')).toBeDisabled();
  await menu.locator('summary').click();
  await expect(menu).not.toHaveAttribute('open');
  expect(attempts).toBe(1);
  finish();
  await expect(page.locator('#history-management-status')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#history-management-status')).toContainText('暂时无法保存');
  await expect(page.locator('[data-history-reset=probability]')).toBeEnabled();
  await menu.locator('summary').click();
  page.once('dialog', dialog => dialog.accept());
  await page.locator('[data-history-reset=probability]').click();
  await expect(page.locator('#history-management-status')).toHaveAttribute('data-state', 'success');
  expect(attempts).toBe(2);
});
