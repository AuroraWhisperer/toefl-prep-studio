const { test, expect } = require('@playwright/test');
const { openSettings, start, submit } = require('./browser_practice_helpers.cjs');

async function onlyView(page, id, path) {
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await expect(page.locator('.app-shell > section:not([hidden])')).toHaveCount(1);
  await expect(page.locator(`#${id}`)).toBeVisible();
}

test('browser Back and Forward retain the current practice without requesting new questions', async ({
  page,
  request,
}) => {
  const loads = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/v1/exam?')) loads.push(r.url());
  });
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  await openSettings(page, 'writing', 'write_email', 1);
  await onlyView(page, 'setup-view', '/practice/writing');
  await start(page);
  const run = new URL(page.url()).pathname;
  expect(run).toMatch(/^\/practice\/writing\/run\//);
  await page
    .locator('#answer-input')
    .fill('Dear Professor, I have a question about the assignment.');
  await page.goBack();
  await onlyView(page, 'setup-view', '/practice/writing');
  await expect(page.locator('input[name="task_type"]:checked')).toHaveValue('write_email');
  await page.goForward();
  await onlyView(page, 'exam-view', run);
  await expect(page.locator('#answer-input')).toHaveValue(
    'Dear Professor, I have a question about the assignment.',
  );
  expect(loads).toHaveLength(1);
  await page.reload();
  await onlyView(page, 'setup-view', '/practice/writing');
  await expect(page.locator('#toast')).toContainText('未提交');
  expect(loads).toHaveLength(1);
});

test('direct setup routes, section tabs and browser history work at desktop scaling sizes', async ({
  page,
  request,
}, testInfo) => {
  expect((await request.get('/practice/reading')).status()).toBe(200);
  await page.goto('/practice/reading');
  for (const [width, height] of [
    [2048, 1152],
    [1707, 960],
    [1200, 900],
  ]) {
    await page.setViewportSize({ width, height });
    await onlyView(page, 'setup-view', '/practice/reading');
    await page.locator('#tab-reading').focus();
    await page.keyboard.press('ArrowRight');
    await onlyView(page, 'setup-view', '/practice/listening');
    await page.goBack();
    await onlyView(page, 'setup-view', '/practice/reading');
    await expect(page.locator('#tab-reading')).toHaveAttribute('aria-selected', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath(`routes-${width}.png`) });
  }
  await page.reload();
  await onlyView(page, 'setup-view', '/practice/reading');
});

test('submitted review replaces the run, reloads by ID and returns through history', async ({
  page,
  request,
}) => {
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  await openSettings(page, 'writing', 'write_email', 1);
  await start(page);
  await submit(page);
  const detail = new URL(page.url()).pathname;
  expect(detail).toMatch(/^\/history\/practice\//);
  await page.reload();
  await onlyView(page, 'result-view', detail);
  await page.locator('#result-home').click();
  await onlyView(page, 'history-view', '/history');
  await page.goBack();
  await onlyView(page, 'result-view', detail);
  await page.goBack();
  await onlyView(page, 'setup-view', '/practice/writing');
  await page.goForward();
  await onlyView(page, 'result-view', detail);
});

test('adaptive Back saves answers and Forward or refresh preserves the server deadline', async ({
  page,
  request,
}) => {
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  await page.locator('#open-tests').click();
  await onlyView(page, 'test-setup', '/tests');
  await page.locator('#start-test').click();
  await expect(page).toHaveURL(/\/tests\/[^/]+$/);
  const path = new URL(page.url()).pathname;
  await page.locator('#begin-test-phase').click();
  await expect(page.locator('#exam-view')).toBeVisible();
  const url = `/api/v1/tests/sessions/${path.split('/').at(-1)}`;
  const initial = await (await request.get(url)).json();
  await page.locator('.cloze-letters input').first().fill('z');
  await page.goBack();
  await onlyView(page, 'test-setup', '/tests');
  const saved = await (await request.get(url)).json();
  expect(saved.responses[0].answer).toBe('z');
  expect(saved.deadline).toBe(initial.deadline);
  await page.goForward();
  await onlyView(page, 'exam-view', path);
  await expect(page.locator('.cloze-letters input').first()).toHaveValue('z');
  await page.reload();
  await onlyView(page, 'exam-view', path);
  await expect(page.locator('.cloze-letters input').first()).toHaveValue('z');
  expect((await (await request.get(url)).json()).deadline).toBe(initial.deadline);
});

test('the mock picker participates in browser history, including an empty local bank', async ({
  page,
  request,
}) => {
  expect((await request.get('/mocks')).status()).toBe(200);
  await page.goto('/');
  await page.locator('#open-mocks').click();
  await onlyView(page, 'landing-view', '/mocks');
  await expect(page.locator('#mock-papers')).toBeVisible();
  await page.goBack();
  await onlyView(page, 'landing-view', '/');
  await expect(page.locator('#mock-papers')).toBeHidden();
  await page.goForward();
  await expect(page.locator('#mock-papers')).toBeVisible();
  await page.reload();
  await onlyView(page, 'landing-view', '/mocks');
  await expect(page.locator('#mock-papers')).toBeVisible();
});

test('failed adaptive departure keeps the current history entry and can be retried', async ({
  page,
  request,
}) => {
  expect((await request.get('/tests')).status()).toBe(200);
  await page.goto('/tests');
  await page.locator('#start-test').click();
  await page.locator('#begin-test-phase').click();
  const path = new URL(page.url()).pathname;
  await page.locator('.cloze-letters input').first().fill('q');
  await page.route('**/api/v1/tests/sessions/*', (route) => {
    if (route.request().postDataJSON()?.action === 'save') {
      return route.fulfill({ status: 503, json: { detail: '临时保存失败' } });
    }
    return route.continue();
  });
  await page.goBack();
  await onlyView(page, 'exam-view', path);
  await expect(page.locator('#toast')).toContainText('保存未完成');
  await expect(page.locator('.cloze-letters input').first()).toHaveValue('q');
  await page.unroute('**/api/v1/tests/sessions/*');
  await page.goBack();
  await onlyView(page, 'test-setup', '/tests');
  await page.goForward();
  await onlyView(page, 'exam-view', path);
  await expect(page.locator('.cloze-letters input').first()).toHaveValue('q');
});

test('missing saved records and expired in-memory links recover without a new round', async ({
  page,
  request,
}) => {
  const loads = [];
  page.on('request', (r) => {
    if (
      r.url().includes('/api/v1/exam?') ||
      (r.method() === 'POST' && r.url().includes('/sessions'))
    )
      loads.push(r.url());
  });
  for (const path of [
    '/history/practice/00000000-0000-4000-8000-000000000000',
    '/tests/00000000-0000-4000-8000-000000000000',
    '/mocks/sessions/00000000-0000-4000-8000-000000000000',
    '/practice/not-a-section',
  ]) {
    expect((await request.get(path)).status()).toBe(200);
    await page.goto(path);
    await onlyView(page, 'landing-view', '/');
    await expect(page.locator('#toast')).toBeVisible();
  }
  expect(loads).toEqual([]);
});

test('mock Back saves pending answers and Forward resumes the same server session', async ({
  page,
  request,
}) => {
  const resources = await (await request.get('/api/v1/resources')).json();
  test.skip(!resources.mock.length, 'Requires a locally imported mock paper.');
  const created = await (
    await request.post('/api/v1/mock/sessions', { data: { paper_id: resources.mock[0].id } })
  ).json();
  expect((await request.get('/mocks')).status()).toBe(200);
  await page.goto('/mocks');
  await expect(page.locator('#mock-papers')).toBeVisible();
  await page.evaluate((id) => {
    localStorage.setItem('toefl-mock-session', id);
    return appViews.navigate(`/mocks/sessions/${id}`);
  }, created.id);
  await page.goBack();
  await onlyView(page, 'landing-view', '/mocks');
  await page.goForward();
  await onlyView(page, 'mock-view', `/mocks/sessions/${created.id}`);
  await page.locator('#begin-phase').click();
  await expect(page.locator('input[data-answer]').first()).toBeVisible();
  const url = `/api/v1/mock/sessions/${created.id}`;
  const initial = await (await request.get(url)).json();
  await page.locator('input[data-answer]').first().fill('xy');
  await page.goBack();
  await onlyView(page, 'landing-view', '/mocks');
  const saved = await (await request.get(url)).json();
  expect(saved.answers[initial.phase.items[0].id]).toBe('xy');
  expect(saved.deadline).toBe(initial.deadline);
  expect(saved.status).toBe('active');
  await page.goForward();
  await onlyView(page, 'mock-view', `/mocks/sessions/${created.id}`);
  await expect(page.locator('input[data-answer]').first()).toHaveValue('xy');
  page.on('dialog', (dialog) => dialog.accept());
  await page.reload();
  await onlyView(page, 'mock-view', `/mocks/sessions/${created.id}`);
  await expect(page.locator('input[data-answer]').first()).toHaveValue('xy');
  expect((await (await request.get(url)).json()).deadline).toBe(initial.deadline);
});

test('a slow session restore cannot overwrite a newer Back navigation', async ({
  page,
  request,
}) => {
  expect((await request.get('/tests')).status()).toBe(200);
  await page.goto('/tests');
  await page.locator('#start-test').click();
  await page.locator('#begin-test-phase').waitFor();
  const path = new URL(page.url()).pathname;
  await page.goBack();
  await onlyView(page, 'test-setup', '/tests');
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/api/v1/tests/sessions/*', async (route) => {
    if (route.request().method() === 'GET') await gate;
    return route.continue();
  });
  const pending = page.waitForRequest(
    (r) => r.url().includes('/tests/sessions/') && r.method() === 'GET',
  );
  await page.goForward();
  await pending;
  await page.goBack();
  release();
  await onlyView(page, 'test-setup', '/tests');
  await expect(page.locator('#start-test')).toBeVisible();
  await page.goForward();
  await onlyView(page, 'test-setup', path);
  await expect(page.locator('#begin-test-phase')).toBeVisible();
});

test('a slow mock resume from the picker cannot overwrite a newer Back navigation', async ({
  page,
  request,
}) => {
  const resources = await (await request.get('/api/v1/resources')).json();
  test.skip(!resources.mock.length, 'Requires a locally imported mock paper.');
  const created = await (
    await request.post('/api/v1/mock/sessions', { data: { paper_id: resources.mock[0].id } })
  ).json();
  await page.addInitScript((id) => localStorage.setItem('toefl-mock-session', id), created.id);
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  await page.locator('#open-mocks').click();
  await onlyView(page, 'landing-view', '/mocks');
  const url = `/api/v1/mock/sessions/${created.id}`;
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(`**${url}`, async (route) => {
    await gate;
    await route.continue();
  });
  const pending = page.waitForRequest((r) => r.url().endsWith(url));
  await page.locator('#resume-mock').press('Enter');
  await pending;
  await page.goBack();
  const resumed = page.waitForResponse((r) => r.url().endsWith(url));
  release();
  await resumed;
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  await onlyView(page, 'landing-view', '/');
  await expect(page.locator('.app-shell')).toHaveJSProperty('inert', false);
});

test('a slow adaptive resume from the picker cannot overwrite a newer Back navigation', async ({
  page,
  request,
}) => {
  const created = await (
    await request.post('/api/v1/tests/sessions', { data: { level: 5 } })
  ).json();
  await page.addInitScript((id) => localStorage.setItem('toefl-adaptive-session', id), created.id);
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  await page.locator('#open-tests').click();
  await onlyView(page, 'test-setup', '/tests');
  const url = `/api/v1/tests/sessions/${created.id}`;
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(`**${url}`, async (route) => {
    await gate;
    await route.continue();
  });
  const pending = page.waitForRequest((r) => r.url().endsWith(url));
  await page.locator('#resume-test').press('Enter');
  await pending;
  await page.goBack();
  const resumed = page.waitForResponse((r) => r.url().endsWith(url));
  release();
  await resumed;
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  await onlyView(page, 'landing-view', '/');
  await expect(page.locator('.app-shell')).toHaveJSProperty('inert', false);
});

for (const destination of ['history', 'home']) {
  test(`leaving a slow practice load keeps the newer ${destination} view`, async ({
    page,
    request,
  }) => {
    expect((await request.get('/')).status()).toBe(200);
    await page.goto('/');
    let release, finish;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const delivered = new Promise((resolve) => {
      finish = resolve;
    });
    await page.route('**/api/v1/exam?*', async (route) => {
      const response = await route.fetch();
      await gate;
      await route.fulfill({ response });
      finish();
    });
    const pending = page.waitForRequest((r) => r.url().includes('/api/v1/exam?'));
    await page.locator('[data-section="reading"][data-mode="exam"]').click();
    await pending;
    await page.locator('#open-history').click();
    await onlyView(page, 'history-view', '/history');
    if (destination === 'home') {
      await page.locator('#history-home').click();
      await onlyView(page, 'landing-view', '/');
    }
    release();
    await delivered;
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    await onlyView(
      page,
      destination === 'history' ? 'history-view' : 'landing-view',
      destination === 'history' ? '/history' : '/',
    );
    await expect(page.locator('#toast')).toBeHidden();
    if (destination === 'history') await page.locator('#history-home').click();
    await page.unroute('**/api/v1/exam?*');
    await page.locator('[data-section="reading"][data-mode="exam"]').click();
    await expect(page.locator('#exam-view')).toBeVisible();
  });
}

test('two quick Back actions during a failed save restore the active entry without corrupting history', async ({
  page,
  request,
}) => {
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  await page.locator('#open-tests').click();
  await page.locator('#start-test').click();
  await page.locator('#begin-test-phase').click();
  await expect(page.locator('#exam-view')).toBeVisible();
  const path = new URL(page.url()).pathname;
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/api/v1/tests/sessions/*', async (route) => {
    if (route.request().postDataJSON()?.action === 'save') {
      await gate;
      return route.fulfill({ status: 503, json: { detail: '暂时无法保存' } });
    }
    return route.continue();
  });
  const pending = page.waitForRequest(
    (r) => r.method() === 'POST' && r.postDataJSON()?.action === 'save',
  );
  await page.goBack();
  await pending;
  await page.goBack();
  release();
  await onlyView(page, 'exam-view', path);
  await expect(page.locator('#toast')).toContainText('保存未完成');
  await page.unroute('**/api/v1/tests/sessions/*');
  await page.goBack();
  await onlyView(page, 'test-setup', '/tests');
  await page.goBack();
  await onlyView(page, 'landing-view', '/');
});

test('returning to an expired practice submits the same round without resetting its timer', async ({
  page,
  request,
}) => {
  await page.clock.install();
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  await openSettings(page, 'writing', 'write_email', 1);
  await page.locator('input[name="timer_mode"][value="countdown"]').check();
  const selected = await start(page);
  await page.locator('#answer-input').fill('Dear Professor, could we meet tomorrow?');
  await page.goBack();
  await onlyView(page, 'setup-view', '/practice/writing');
  await page.clock.fastForward((selected.time_limit_seconds + 1) * 1000);
  const submitted = page.waitForResponse((r) => r.url().endsWith('/api/v1/exam/submit'));
  await page.goForward();
  const result = await (await submitted).json();
  expect(result.feedback.map((q) => q.question_id)).toEqual(selected.question_ids);
  expect(result.answered_questions).toBe(1);
  await expect(page.locator('#result-view')).toBeVisible();
  await expect(page).toHaveURL(/\/history\/practice\//);
});

test('late mock microphone permission is released after browser Back', async ({
  page,
  request,
}) => {
  const resources = await (await request.get('/api/v1/resources')).json();
  test.skip(!resources.mock.length, 'Requires a locally imported mock paper.');
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.stoppedMockTracks = 0;
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: () =>
          new Promise((resolve) => {
            window.grantMockMicrophone = () =>
              resolve({
                getTracks: () => [
                  {
                    stop() {
                      window.stoppedMockTracks += 1;
                    },
                  },
                ],
              });
          }),
      },
    });
  });
  expect((await request.get('/mocks')).status()).toBe(200);
  await page.goto('/mocks');
  await page.locator(`[data-paper="${resources.mock[0].id}"]`).click();
  await page.locator('#mock-mic-check').click();
  await page.goBack();
  await onlyView(page, 'landing-view', '/mocks');
  await page.evaluate(() => grantMockMicrophone());
  await expect.poll(() => page.evaluate(() => stoppedMockTracks)).toBe(1);
  expect(errors).toEqual([]);
});
