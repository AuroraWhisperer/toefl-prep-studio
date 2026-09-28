const { test, expect } = require('@playwright/test');
const { openSettings, start, submit } = require('./browser_practice_helpers.cjs');
const { randomUUID } = require('node:crypto');
test.use({
  launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] },
});

async function home(page, request) {
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  await expect(page.locator('#section-grid .section-card')).toHaveCount(4);
}

for (const display of [
  { name: 'wide desktop', width: 2560, height: 1320, scale: 1 },
  { name: '125 percent scaling', width: 2048, height: 1056, scale: 1.25 },
  { name: '150 percent scaling', width: 1707, height: 880, scale: 1.5 },
  { name: 'compact desktop', width: 1280, height: 720, scale: 1 },
  { name: 'narrow desktop window', width: 1024, height: 768, scale: 1 },
]) {
  test.describe(display.name, () => {
    test.use({
      viewport: { width: display.width, height: display.height },
      deviceScaleFactor: display.scale,
    });
    test('archive uses the window width with a compact toolbar and readable records', async ({
      page,
      request,
    }, testInfo) => {
      const record = {
        id: randomUUID(),
        completed_at: new Date(2026, 8, 27, 11, 1).getTime() / 1000,
        title: '听力 · 听力应答',
        subtitle: '专项练习',
        answered: 8,
        total: 8,
        earned: 4,
        possible: 8,
        score_label: '练习原始分 · 非官方成绩',
      };
      await page.route('**/api/v1/history?**', (route) =>
        route.fulfill({
          json: { items: [record], total: 1, page: 1, pages: 1 },
        }),
      );
      await home(page, request);
      await page.locator('#open-history').click();
      await expect(page.locator('.history-row')).toHaveCount(1);
      await expect(page.locator('#history-title')).toHaveText('答题记录');
      await expect(page.locator('#history-title')).toBeFocused();
      await expect(page.locator('#history-title')).toHaveCSS('outline-style', 'none');
      await expect(page.locator('#history-count')).toHaveText('1 条记录');
      await expect(page.locator('#history-pagination')).toBeHidden();
      await expect(page.getByLabel('起始日期', { exact: true })).toBeVisible();
      await expect(page.getByLabel('截止日期', { exact: true })).toBeVisible();
      await expect(page.locator('.history-row-score')).toContainText('练习原始分 · 非官方成绩');
      const view = await page.locator('#history-view').boundingBox();
      const row = await page.locator('.history-row').boundingBox();
      expect(view.width).toBeGreaterThan(display.width * 0.92);
      expect(view.x).toBeLessThanOrEqual(80);
      expect(row.y).toBeLessThan(display.width > 1100 ? 240 : 300);
      if (display.width > 1100) {
        const tabs = await page.locator('#history-tabs').boundingBox();
        const filters = await page.locator('#history-filters').boundingBox();
        expect(Math.abs(tabs.y + tabs.height / 2 - filters.y - filters.height / 2)).toBeLessThan(2);
        expect(filters.x).toBeGreaterThan(tabs.x + tabs.width);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({
        path: testInfo.outputPath('history-compact-archive.png'),
        fullPage: true,
      });
      await page.keyboard.press('Tab');
      await expect(page.locator('#history-home')).toBeFocused();
      await expect(page.locator('#history-home')).not.toHaveCSS('outline-style', 'none');
      await page.keyboard.press('Tab');
      await expect(page.locator('#history-management summary')).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.locator('#history-tab-practice')).toBeFocused();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#history-tab-mock')).toHaveAttribute('aria-selected', 'true');
      await page.locator('#history-home').click();
      await expect(page.locator('#landing-view')).toBeVisible();
    });
  });
}

test('real submission survives reload and reopens the original answer review', async ({
  page,
  request,
}, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await home(page, request);
  await openSettings(page, 'writing', 'write_email', 1);
  await start(page);
  await page
    .locator('#answer-input')
    .fill(
      'Dear Professor, <img src=x onerror=alert(1)> I would like to ask about our next assignment. Thank you.',
    );
  const result = await submit(page);
  await expect(page.locator('#recording-archive-status')).toBeHidden();
  const newest = (await (await request.get('/api/v1/history')).json()).items[0];
  expect(newest.title).toBe('写作 · 邮件写作');
  await page.reload();
  await expect(page.locator('#result-title')).toContainText('历史复盘');
  await page.locator('#result-home').click();
  await expect(page.locator('.history-row').first()).toContainText('写作 · 邮件写作');
  await page.locator(`[data-history-id='${newest.id}']`).click();
  await expect(page.locator('#result-title')).toContainText('历史复盘');
  await expect(page.locator('.submitted-answer')).toContainText('<img src=x onerror=alert(1)>');
  expect(await page.locator('.submitted-answer img').count()).toBe(0);
  await expect(page.locator('#result-summary')).toContainText(
    `${result.sections.writing.earned} / ${result.sections.writing.possible}`,
  );
  await page.locator('#result-home').click();
  await expect(page.locator('#history-view')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('history-desktop.png'), fullPage: true });
  await page.locator('#history-home').click();
  await expect(page.locator('#open-history')).toBeFocused();
  await page.locator('#open-history').press('Enter');
  await expect(page.locator('#history-view')).toBeVisible();
  expect(errors).toEqual([]);
});

test('retry after a lost submission response creates only one history record', async ({
  page,
  request,
}) => {
  await home(page, request);
  await openSettings(page, 'reading', 'read_daily_life', 2);
  await start(page);
  const before = (await (await request.get('/api/v1/history')).json()).total;
  let first = true;
  await page.route('**/api/v1/exam/submit', async (route) => {
    const response = await route.fetch();
    if (first) {
      first = false;
      await route.abort('failed');
    } else await route.fulfill({ response });
  });
  await page.locator('#submit-exam').click();
  await expect(page.locator('#save-state')).toContainText('提交失败');
  await page.locator('#submit-exam').click();
  await expect(page.locator('#result-view')).toBeVisible();
  expect((await (await request.get('/api/v1/history')).json()).total).toBe(before + 1);
});

test.describe('recorded practice archive', () => {
  test('failed recording survives a new round and history retry, then plays after reload', async ({
    page,
    request,
    context,
  }, testInfo) => {
    await context.grantPermissions(['microphone']);
    await page.addInitScript(() => {
      window.SpeechRecognition = undefined;
      window.webkitSpeechRecognition = undefined;
    });
    await home(page, request);
    await openSettings(page, 'speaking', 'take_interview', 1);
    const exam = await start(page);
    const questionId = exam.questions[0].id;
    await page.locator('.speaking-practice-aid summary').click();
    await page.locator('#answer-input').fill('I enjoy learning languages with my friends.');
    await page.locator('[data-record]').click();
    await expect(page.locator('[data-record]')).toContainText('停止录音');
    // Allow the real MediaRecorder to capture several audio frames before submitting.
    await page.waitForTimeout(350);
    let rejectUpload = true;
    await page.route('**/api/v1/history/practice/*/recordings/*', (route) => {
      if (route.request().method() === 'PUT' && rejectUpload)
        return route.fulfill({ status: 503, json: { detail: 'Temporary upload failure' } });
      return route.continue();
    });
    await submit(page);
    await expect(page.locator('#recording-archive-status')).toContainText('1 段录音尚未保存');
    const newest = (await (await request.get('/api/v1/history')).json()).items[0];
    const detailURL = `/api/v1/history/practice/${newest.id}`;
    expect((await (await request.get(detailURL)).json()).recordings).toEqual({});
    const unloadProtected = () =>
      page.evaluate(() => {
        const event = new Event('beforeunload', { cancelable: true });
        window.dispatchEvent(event);
        return event.defaultPrevented;
      });
    expect(await unloadProtected()).toBe(true);
    await page.locator('#result-home').click();
    await openSettings(page, 'writing', 'write_email', 1);
    await start(page);
    await page.locator('#back-home').click();
    await page.locator('#setup-home').click();
    await page.locator('#open-history').click();
    await page.locator(`[data-history-id="${newest.id}"]`).click();
    await expect(page.locator('#recording-archive-status')).toContainText('1 段录音尚未保存');
    const pendingAudio = page.locator('.review-answers audio').first();
    await expect(pendingAudio).toHaveAttribute('src', /^blob:/);
    expect(
      await pendingAudio.evaluate(async (audio) => (await (await fetch(audio.src)).blob()).size),
    ).toBeGreaterThan(100);
    await page.screenshot({ path: testInfo.outputPath('recording-retry.png'), fullPage: true });
    rejectUpload = false;
    const uploaded = page.waitForResponse(
      (response) =>
        response.request().method() === 'PUT' &&
        response.url().includes(`/recordings/${questionId}`),
    );
    await page.locator('#retry-recording-archive').click();
    expect((await uploaded).status()).toBe(200);
    await expect(page.locator('#recording-archive-status')).toBeHidden();
    expect(await unloadProtected()).toBe(false);
    const detail = await (await request.get(detailURL)).json();
    const recordingURL = detail.recordings[questionId];
    expect(recordingURL).toBe(`${detailURL}/recordings/${questionId}`);
    expect((await (await request.get(recordingURL)).body()).length).toBeGreaterThan(100);
    await page.reload();
    await expect(page.locator('#result-title')).toContainText('历史复盘');
    const audio = page.locator('.review-answers audio').first();
    await expect(audio).toHaveAttribute('src', recordingURL);
    await expect.poll(() => audio.evaluate((node) => node.readyState)).toBeGreaterThanOrEqual(2);
    await audio.evaluate((node) => node.play());
    await expect.poll(() => audio.evaluate((node) => node.currentTime)).toBeGreaterThan(0);
    expect(await audio.evaluate((node) => node.error)).toBeNull();
    await page.locator('#result-home').click();
    await expect(page.locator('#history-view')).toBeVisible();
  });
});

test('all categories paginate newest first, date filters persist, and tab keys work', async ({
  page,
  request,
}, testInfo) => {
  const rows = Array.from({ length: 13 }, (_, index) => ({
    id: randomUUID(),
    completed_at: new Date(2026, 8, 26 - index, 10, 30).getTime() / 1000,
    title: `阅读 · 日常阅读 ${index + 1}`,
    subtitle: '专项练习',
    answered: 4,
    total: 4,
    earned: 3,
    possible: 4,
    score_label: '练习原始分 · 非官方成绩',
  }));
  const queries = [];
  await page.route('**/api/v1/history?**', (route) => {
    const params = new URL(route.request().url()).searchParams;
    queries.push(Object.fromEntries(params));
    const category = params.get('category');
    const filtered = rows.filter(
      (row) =>
        (!params.has('start_at') ||
          row.completed_at >= Date.parse(params.get('start_at')) / 1000) &&
        (!params.has('end_at') || row.completed_at < Date.parse(params.get('end_at')) / 1000),
    );
    const pageNumber = Number(params.get('page'));
    return route.fulfill({
      json: {
        items: filtered
          .slice((pageNumber - 1) * 10, pageNumber * 10)
          .map((row) => ({ ...row, category })),
        page: pageNumber,
        pages: Math.max(1, Math.ceil(filtered.length / 10)),
        total: filtered.length,
      },
    });
  });
  await home(page, request);
  await page.locator('#open-history').click();
  for (const category of ['practice', 'mock', 'test']) {
    await page.locator(`#history-tab-${category}`).click();
    await expect(page.locator('.history-row')).toHaveCount(10);
    await expect(page.locator('.history-row').first()).toContainText(rows[0].title);
    await page.locator('#history-next').click();
    await expect(page.locator('.history-row')).toHaveCount(3);
    await expect(page.locator('.history-row').first()).toContainText(rows[10].title);
    await expect(page.locator('#history-next')).toBeDisabled();
    await page.locator('#history-prev').click();
    await expect(page.locator('#history-page')).toHaveText('1 / 2 页');
  }
  await page.locator('#history-from').fill('2026-09-25');
  await page.locator('#history-to').fill('2026-09-26');
  await page.getByRole('button', { name: '查找记录', exact: true }).click();
  await expect(page.locator('.history-row')).toHaveCount(2);
  await expect(page.locator('#history-pagination')).toBeHidden();
  await page.locator('#history-tab-test').focus();
  await page.keyboard.press('Home');
  await expect(page.locator('#history-tab-practice')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.history-row')).toHaveCount(2);
  await expect(page.locator('#history-from')).toHaveValue('2026-09-25');
  await page.locator('#history-from').fill('2026-09-27');
  await page.getByRole('button', { name: '查找记录', exact: true }).click();
  await expect(page.locator('#history-filter-error')).toContainText('不能晚于');
  await page.locator('#history-clear').click();
  await expect(page.locator('.history-row')).toHaveCount(10);
  await expect(page.locator('#history-filter-error')).toBeHidden();
  await page.screenshot({ path: testInfo.outputPath('history-populated.png'), fullPage: true });
  await page.setViewportSize({ width: 2560, height: 1440 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('history-wide-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 1024, height: 1000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(queries.some((query) => query.start_at && query.end_at)).toBe(true);
});

test('empty categories, date filters, and network retry are distinct states', async ({
  page,
  request,
}) => {
  let fail = true;
  await page.route('**/api/v1/history?**', (route) =>
    route.fulfill(
      fail
        ? { status: 503, json: { detail: '服务暂时不可用' } }
        : { json: { items: [], total: 0, page: 1, pages: 1 } },
    ),
  );
  await home(page, request);
  await page.locator('#open-history').click();
  await expect(page.locator('.history-empty')).toContainText('暂时无法读取');
  fail = false;
  await page.getByRole('button', { name: '重新加载' }).click();
  await expect(page.locator('.history-empty')).toContainText('还没有单项训练记录');
  await page.locator('#history-tab-test').click();
  await expect(page.locator('.history-empty')).toContainText('完成首页的综合测验后');
  await page.locator('#history-from').fill('2000-01-01');
  await page.locator('#history-to').fill('2000-01-02');
  await page.getByRole('button', { name: '查找记录', exact: true }).click();
  await expect(page.locator('.history-empty')).toContainText('这段时间没有记录');
  await page.locator('[data-history-clear]').click();
  await expect(page.locator('#history-from')).toHaveValue('');
  await expect(page.locator('.history-empty')).toContainText('完成首页的综合测验后');
});

test('switching tabs ignores an older in-flight response', async ({ page, request }) => {
  await page.route('**/api/v1/history?**', async (route) => {
    const category = new URL(route.request().url()).searchParams.get('category');
    if (category === 'practice') await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({ json: { items: [], total: 0, page: 1, pages: 1 } }).catch(() => {});
  });
  await home(page, request);
  await page.locator('#open-history').click();
  await page.locator('#history-tab-mock').click();
  await expect(page.locator('.history-empty')).toContainText('还没有模拟考记录');
  await expect(page.locator('#history-panel')).toHaveAttribute(
    'aria-labelledby',
    'history-tab-mock',
  );
});
