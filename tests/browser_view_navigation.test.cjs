const { test, expect } = require('@playwright/test');
const { openSettings, start, submit } = require('./browser_practice_helpers.cjs');

async function onlyView(page, id) {
  await expect(page.locator('.app-shell > section:not([hidden])')).toHaveCount(1);
  await expect(page.locator('.app-shell > section:not([hidden])')).toHaveAttribute('id', id);
}

test('practice, setup and history round trips keep one view and one request per action', async ({
  page,
  request,
}) => {
  const errors = [],
    loads = [],
    details = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (r) => {
    if (r.url().includes('/api/v1/exam?')) loads.push(r.url());
    if (r.url().includes('/api/v1/history/practice/')) details.push(r.url());
  });
  expect((await request.get('/')).status()).toBe(200);
  await page.route('**/api/v1/tts', (route) =>
    route.fulfill({ json: { url: null, fallback: true } }),
  );
  await page.goto('/');
  await onlyView(page, 'landing-view');
  await openSettings(page, 'writing', 'write_email', 1);
  await onlyView(page, 'setup-view');
  for (let round = 0; round < 2; round += 1) {
    await start(page);
    await onlyView(page, 'exam-view');
    await page.locator('#back-home').click();
    await onlyView(page, 'setup-view');
    await expect(page.locator('#start-practice')).toBeFocused();
  }
  await start(page);
  expect(loads).toHaveLength(3);
  await page
    .locator('#answer-input')
    .fill('Dear Professor, I would like to ask about the next assignment. Thank you.');
  await submit(page);
  await onlyView(page, 'result-view');
  const newest = (await (await request.get('/api/v1/history')).json()).items[0];
  await page.locator('#result-home').click();
  await onlyView(page, 'landing-view');
  await page.locator('#open-history').click();
  for (let round = 0; round < 2; round += 1) {
    await onlyView(page, 'history-view');
    await expect(page.locator('#history-title')).toBeFocused();
    await page.locator(`[data-history-id='${newest.id}']`).click();
    await onlyView(page, 'result-view');
    await expect(page.locator('#result-home')).toBeFocused();
    await page.locator('#result-home').click();
  }
  expect(details).toHaveLength(2);
  await onlyView(page, 'history-view');
  await page.locator('#history-home').click();
  await onlyView(page, 'landing-view');
  await expect(page.locator('#open-history')).toBeFocused();
  await page.locator('[data-section="reading"][data-mode="exam"]').click();
  await onlyView(page, 'exam-view');
  await page.locator('#back-home').click();
  await onlyView(page, 'landing-view');
  expect(errors).toEqual([]);
});

test('adaptive and mock entry screens return to a single landing view', async ({
  page,
  request,
}) => {
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  for (let round = 0; round < 2; round += 1) {
    await page.locator('#open-tests').click();
    await onlyView(page, 'test-setup');
    await expect(page.locator('#test-title')).toBeFocused();
    await page.locator('[data-test-home]').click();
    await onlyView(page, 'landing-view');
  }
  await page.locator('#open-mocks').click();
  if (!(await (await request.get('/api/v1/resources')).json()).mock.length) {
    await expect(page.getByRole('heading', { name: '尚未导入模考试卷' })).toBeVisible();
    await onlyView(page, 'landing-view');
    return;
  }
  await page.locator('[data-paper=ets-test-1]').click();
  await onlyView(page, 'mock-view');
  await page.locator('[data-mock-home]').click();
  await onlyView(page, 'landing-view');
  await expect(page.locator('#open-mocks')).toBeFocused();
});
