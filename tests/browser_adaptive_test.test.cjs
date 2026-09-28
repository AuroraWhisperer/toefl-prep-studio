const { test, expect } = require('@playwright/test');

async function setup(page, request, level = 5) {
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  await expect(page.locator('#section-grid .section-card')).toHaveCount(4);
  await page.locator('#open-tests').click();
  await expect(page.locator('.test-preset')).toHaveCount(5);
  await expect(page.locator('#test-level option')).toHaveCount(10);
  await page.locator('#test-level').selectOption(String(level));
}

for (const [width, height] of [[2560, 1440], [2048, 1152], [1707, 960], [1280, 720]]) {
  test(`five test profiles fit desktop ${width}x${height}`, async ({ page, request }, testInfo) => {
    await page.setViewportSize({ width, height });
    await setup(page, request, 10);
    await expect(page.locator('#test-level-summary')).toHaveText('挑战卷 · 自适应范围 8–10 档');
    await expect(page.locator('.test-preset[aria-pressed=true]')).toContainText('挑战卷');
    await page.locator('[data-test-level="4"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#test-level')).toHaveValue('4');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('difficulty-selection.png'), fullPage: true });
    await page.locator('#start-test').click();
    await expect(page.locator('#test-title')).toHaveText('阅读 · 模块 1');
    await page.locator('#begin-test-phase').click();
    await expect(page.locator('#exam-title')).toContainText('标准卷 A');
    await expect(page.locator('.cloze-letters')).toHaveCount(10);
  });
}

test('draft and deadline survive refresh; stage submit routes exactly once', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await setup(page, request);
  await page.locator('#start-test').click();
  const started = page.waitForResponse(r => r.url().includes('/tests/sessions/') && r.request().method() === 'POST');
  await page.locator('#begin-test-phase').click();
  const initial = await (await started).json();
  await page.locator('.cloze-letters input').first().fill('a');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('toefl-adaptive-draft'))?.body.responses[0].answer)).toBe('a');
  await page.reload();
  await page.locator('#open-tests').click();
  await page.locator('#resume-test').click();
  await expect(page.locator('#exam-view')).toBeVisible();
  await expect(page.locator('.cloze-letters input').first()).toHaveValue('a');
  const resumed = await (await request.get(`/api/v1/tests/sessions/${initial.id}`)).json();
  expect(resumed.deadline).toBe(initial.deadline);
  await page.locator('#submit-exam').click();
  await expect(page.locator('#test-title')).toHaveText('阅读 · 模块 2');
  await expect(page.locator('.test-directions')).toContainText('当前选材 4 档');
  await expect(page.locator('#result-view')).toBeHidden();
  expect(errors).toEqual([]);
});

test('all nine stages complete, archive under tests and reopen manual-review feedback', async ({ page, request }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await setup(page, request, 7);
  await page.locator('#start-test').click();
  let sessionId;
  for (let stage = 0; stage < 9; stage++) {
    await expect(page.locator('#begin-test-phase')).toBeVisible();
    const begun = page.waitForResponse(r => r.url().includes('/tests/sessions/') && r.request().method() === 'POST');
    await page.locator('#begin-test-phase').click();
    const session = await (await begun).json();
    sessionId = session.id;
    expect(session.phase_index).toBe(stage);
    await expect(page.locator('#exam-view')).toBeVisible();
    await page.locator('#submit-exam').click();
  }
  await expect(page.locator('#result-title')).toHaveText('进阶卷 测验结果');
  await expect(page.locator('#result-summary')).toContainText('客观题正确数');
  await expect(page.locator('#result-summary')).toContainText('0 / 107');
  await expect(page.locator('.test-review-note')).toContainText('起始 7 / 10');
  await page.locator('#review-index button').last().click();
  await expect(page.locator('.review-answer-head').first()).toContainText('待人工复核');
  expect(await page.evaluate(() => localStorage.getItem('toefl-adaptive-session'))).toBeNull();
  const record = await (await request.get(`/api/v1/history/test/${sessionId}`)).json();
  expect(record.questions).toHaveLength(120);
  await page.evaluate(record => {
    document.querySelector('#result-view').hidden = true;
    window.dispatchEvent(new CustomEvent('open-history-practice', { detail: record }));
  }, record);
  await expect(page.locator('#result-title')).toHaveText('进阶卷 历史复盘');
  expect(errors).toEqual([]);
});

test('failed submit preserves answers and supports retry without changing phase', async ({ page, request }) => {
  await setup(page, request);
  await page.locator('#start-test').click();
  await page.locator('#begin-test-phase').click();
  await page.locator('.cloze-letters input').first().fill('a');
  await page.route('**/api/v1/tests/sessions/*', route => {
    if (route.request().postDataJSON()?.action === 'submit') return route.fulfill({ status: 503, json: { detail: '测试保存失败' } });
    return route.continue();
  });
  await page.locator('#submit-exam').click();
  await expect(page.locator('#save-state')).toContainText('提交失败');
  await expect(page.locator('.cloze-letters input').first()).toHaveValue('a');
  await page.unroute('**/api/v1/tests/sessions/*');
  await page.locator('#submit-exam').click();
  await expect(page.locator('#test-title')).toHaveText('阅读 · 模块 2');
});

test('spoken transcription autosaves and saved audio remains playable after refresh', async ({ page, request }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: {
      getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }),
    } });
    window.MediaRecorder = class extends EventTarget {
      constructor() { super(); this.state = 'inactive'; this.mimeType = 'audio/webm'; }
      start() { this.state = 'recording'; }
      stop() {
        this.state = 'inactive';
        setTimeout(() => {
          this.ondataavailable({ data: new Blob(['saved clip'], { type: this.mimeType }) });
          this.onstop();
          this.dispatchEvent(new Event('stop'));
        }, 0);
      }
    };
    window.SpeechRecognition = class {
      start() { window.testRecognition = this; }
      stop() {}
    };
  });
  await setup(page, request);
  const created = await request.post('/api/v1/tests/sessions', { data: { level: 5 } });
  const session = await created.json();
  const url = `/api/v1/tests/sessions/${session.id}`;
  for (let phase = 0; phase < 7; phase++) {
    for (const action of ['begin', 'submit']) {
      expect((await request.post(url, { data: { phase_index: phase, action } })).status()).toBe(200);
    }
  }
  await page.evaluate(id => localStorage.setItem('toefl-adaptive-session', id), session.id);
  await page.reload();
  await page.locator('#open-tests').click();
  await page.locator('#resume-test').click();
  await page.locator('#begin-test-phase').click();
  await page.locator('[data-record]').click();
  await page.evaluate(() => testRecognition.onresult({ results: [[{ transcript: 'Welcome to the learning center.' }]] }));
  await expect.poll(async () => (await (await request.get(url)).json()).responses[0]?.answer).toBe('Welcome to the learning center.');
  await page.locator('[data-record]').click();
  await expect(page.locator('[data-recording-playback]')).toHaveAttribute('src', /\/api\/v1\/tests\/sessions\/.+\/recordings\/S\d+/);
  const audioUrl = await page.locator('[data-recording-playback]').getAttribute('src');
  expect((await request.get(audioUrl)).status()).toBe(200);
  await page.reload();
  await page.locator('#open-tests').click();
  await page.locator('#resume-test').click();
  await expect(page.locator('#answer-input')).toHaveValue('Welcome to the learning center.');
  await expect(page.locator('[data-recording-playback]')).toHaveAttribute('src', audioUrl);
});
