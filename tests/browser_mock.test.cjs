const { test, expect } = require('@playwright/test');
const { expectFullWidth } = require('./browser_layout_helpers.cjs');

test('module timeout sends the last edit without waiting for autosave', async ({
  page,
  context,
  request,
}) => {
  await prepare(page, context);
  await begin(page);
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  let deadline;
  // Keep server time consistent with the controlled browser clock across draft responses.
  await page.route('**/api/v1/mock/sessions/*', async (route) => {
    const response = await route.fetch();
    const payload = await response.json();
    payload.server_time = await page.evaluate(() => Date.now() / 1000);
    deadline ??= payload.server_time + 2;
    if (payload.phase_index === 0) payload.deadline = deadline;
    await route.fulfill({ response, json: payload });
  });
  await page.reload();
  const input = page.locator('input[data-answer]').first();
  await expect(input).toBeVisible();
  const qid = await input.getAttribute('data-answer');
  await input.fill('a');
  await page.clock.runFor(300);
  await expect(page.locator('#mock-save')).toHaveText('已保存');
  await page.clock.runFor(1600);
  await input.fill('b');
  const sent = page.waitForRequest(
    (r) => r.method() === 'POST' && r.postDataJSON()?.action === 'advance',
  );
  await page.clock.runFor(100);
  expect((await sent).postDataJSON().answers[qid]).toBe('b');
  await expect(page.locator('#mock-directions-title')).toBeVisible();
  const id = await page.evaluate(() => localStorage.getItem('toefl-mock-session'));
  expect((await (await request.get(`/api/v1/mock/sessions/${id}`)).json()).answers[qid]).toBe('b');
});
const fs = require('node:fs/promises');
const path = require('node:path');
const createdSessions = new Set();

test.beforeEach(async ({ request }) => {
  const response = await request.get('/api/v1/resources');
  expect(response.status()).toBe(200);
  test.skip(
    (await response.json()).mock.length !== 5,
    'Import all five local ETS papers to run this regression.',
  );
});

test.afterEach(async ({}, testInfo) => {
  const directory = path.join(testInfo.config.webServer.env.TOEFL_DATA_DIR, 'mock-sessions');
  for (const id of createdSessions) {
    if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('Invalid test session ID');
    await fs.rm(path.join(directory, `${id}.json`), { force: true });
    await fs.rm(path.join(directory, id), { force: true, recursive: true });
  }
  createdSessions.clear();
});

test.use({
  launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] },
});

async function prepare(page, context) {
  await context.grantPermissions(['microphone']);
  await page.route('**/api/v1/tts', (route) =>
    route.fulfill({ status: 503, json: { detail: 'Use controlled test speech' } }),
  );
  await page.addInitScript(() => {
    Math.random = () => 0.5;
    window.testVoices = [
      { name: 'British default', lang: 'en-GB', default: true },
      { name: 'Microsoft Aria Online', lang: 'en-US' },
      { name: 'Microsoft Guy Online', lang: 'en-US' },
    ];
    window.mockSpeechVoices = [];
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
    Object.defineProperty(window, 'speechSynthesis', {
      value: Object.assign(new EventTarget(), {
        getVoices() {
          return window.testVoices;
        },
        speak(utterance) {
          window.mockSpeechVoices.push(utterance.voice?.lang ?? null);
          setTimeout(() => utterance.onend?.(), 20);
        },
        cancel() {},
      }),
    });
  });
  page.on('dialog', (dialog) => dialog.accept());
}

async function begin(page) {
  expect((await page.request.get('/')).status()).toBe(200);
  await page.goto('/');
  await page.locator('#open-mocks').click();
  await page.locator('[data-paper=ets-test-1]').click();
  await expectFullWidth(page.locator('.mock-disclaimer p'));
  await page.locator('#mock-sound-check').click();
  await expect(page.locator('#mock-sound-state')).toContainText('示范已播放');
  expect(await page.evaluate(() => window.mockSpeechVoices)).toEqual(['en-US']);
  await page.locator('#mock-mic-check').click();
  await page.locator('#mock-consent').check();
  const created = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/v1/mock/sessions') && response.request().method() === 'POST',
  );
  await page.locator('#begin-mock').click();
  createdSessions.add((await (await created).json()).id);
  await expect(page.locator('.mock-heading h2')).toHaveText('Reading · Module 1');
  await expect(page.locator('#mock-directions-title')).toHaveText('Directions');
  await expect(page.locator('#mock-clock')).toHaveCount(0);
  await beginStage(page);
}

async function beginStage(page) {
  await expect(page.locator('#begin-phase')).toBeVisible();
  await page.locator('#begin-phase').click();
  await expect(page.locator('#begin-phase')).toHaveCount(0);
}

async function submitPhase(page) {
  await page.locator('#mock-submit').click();
  await expect(page.locator('#mock-submit-dialog')).toBeVisible();
  await page.locator('#confirm-mock-submit').click();
  await beginStage(page);
}

test('deadline-crossing navigation submits the preserved final answer', async ({
  page,
  context,
  request,
}, testInfo) => {
  await prepare(page, context);
  await begin(page);
  const id = await page.evaluate(() => localStorage.getItem('toefl-mock-session'));
  const url = `/api/v1/mock/sessions/${id}`;
  const file = path.join(
    testInfo.config.webServer.env.TOEFL_DATA_DIR,
    'mock-sessions',
    `${id}.json`,
  );
  const stored = JSON.parse(await fs.readFile(file, 'utf8'));
  stored.deadline = Date.now() / 1000 + 3;
  await fs.writeFile(file, JSON.stringify(stored));
  await page.reload();
  const calls = [];
  await page.route(`**${url}`, async (route) => {
    const body = route.request().method() === 'POST' ? route.request().postDataJSON() : null;
    if (body?.action === 'navigate')
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, (stored.deadline + 0.5) * 1000 - Date.now())),
      );
    const response = await route.fetch();
    calls.push({ action: body?.action, answers: body?.answers, status: response.status() });
    await route.fulfill({ response });
  });
  const input = page.locator('.mock-letter-input').first();
  const qid = await input.getAttribute('data-answer');
  await input.fill('b');
  await page.locator('#mock-next').click();
  await expect(page.locator('.mock-heading h2')).toHaveText('Reading · Module 2');
  expect(calls.find((call) => call.action === 'navigate').status).toBe(409);
  expect(calls.find((call) => call.action === 'advance').answers[qid]).toBe('b');
  expect((await (await request.get(url)).json()).answers[qid]).toBe('b');
});

for (const fails of [false, true]) {
  test(`pending mock navigation freezes answers and recovers (failure: ${fails})`, async ({
    page,
    context,
  }) => {
    await prepare(page, context);
    await begin(page);
    let release;
    const held = new Promise((resolve) => {
      release = resolve;
    });
    await page.route('**/api/v1/mock/sessions/*', async (route) => {
      if (
        route.request().method() !== 'POST' ||
        route.request().postDataJSON().action !== 'navigate'
      )
        return route.continue();
      await held;
      if (fails)
        await route.fulfill({ status: 503, json: { detail: 'Temporary navigation failure' } });
      else await route.continue();
    });
    const input = page.locator('.mock-letter-input').first();
    await input.fill('a');
    await page.locator('#mock-next').click();
    try {
      await expect(page.locator('.mock-reading-cloze')).toHaveJSProperty('inert', true);
    } finally {
      release();
    }
    if (fails) {
      await expect(page.locator('#mock-error')).toContainText('Temporary navigation failure');
      await expect(page.locator('.mock-reading-cloze')).toHaveJSProperty('inert', false);
      await input.fill('b');
    } else {
      await expect(page.locator('.mock-native-workspace')).toBeVisible();
      await page.locator('#mock-prev').click();
      await expect(input).toHaveValue('a');
    }
  });
}

async function prepareMockRecording(page, context, request) {
  await prepare(page, context);
  await page.addInitScript(() => {
    const NativeBlob = window.Blob;
    const probe = (window.mockRecordingProbe = {
      current: null,
      recorders: [],
      blobs: [],
      stops: 0,
      stoppedTracks: 0,
    });
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => ({
          active: true,
          getTracks: () => [
            {
              stop() {
                probe.stoppedTracks += 1;
              },
            },
          ],
        }),
      },
    });
    window.Blob = class extends NativeBlob {
      constructor(...args) {
        super(...args);
        probe.blobs.push(new WeakRef(this));
      }
    };
    window.MediaRecorder = class {
      constructor() {
        this.state = 'inactive';
        this.mimeType = 'audio/webm';
        probe.current = this;
        probe.recorders.push(new WeakRef(this));
      }
      start() {
        this.state = 'recording';
      }
      stop() {
        this.state = 'inactive';
        probe.stops += 1;
      }
      finish() {
        this.ondataavailable?.({
          data: new NativeBlob(['mock recording'], { type: this.mimeType }),
        });
        this.onstop?.();
        probe.current = null;
      }
    };
  });
  const created = await request.post('/api/v1/mock/sessions', { data: { paper_id: 'ets-test-1' } });
  expect(created.status()).toBe(200);
  let session = await created.json();
  createdSessions.add(session.id);
  const url = `/api/v1/mock/sessions/${session.id}`;
  while (session.phase_index < 8) {
    const forward = ['listening', 'speaking'].includes(session.phase.section);
    const action =
      session.phase_state === 'directions'
        ? 'begin'
        : forward
          ? session.response_deadline
            ? 'next'
            : 'respond'
          : 'advance';
    const response = await request.post(url, {
      data: { phase_index: session.phase_index, item_index: session.item_index, action },
    });
    expect(response.status()).toBe(200);
    session = await response.json();
  }
  await page.addInitScript((id) => localStorage.setItem('toefl-mock-session', id), session.id);
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  await page.locator('#resume-mock').click();
  await beginStage(page);
  await expect(page.locator('#mock-record-state')).toHaveText('正在录音，请回答。');
  return { url, questionId: session.phase.items[0].id };
}

for (const expired of [true, false]) {
  test(`recording 422 only syncs an expired question (expired: ${expired})`, async ({
    page,
    context,
    request,
  }, testInfo) => {
    const { url, questionId } = await prepareMockRecording(page, context, request);
    const id = url.split('/').at(-1);
    const file = path.join(
      testInfo.config.webServer.env.TOEFL_DATA_DIR,
      'mock-sessions',
      `${id}.json`,
    );
    const stored = JSON.parse(await fs.readFile(file, 'utf8'));
    stored.response_deadline = Date.now() / 1000 + 2;
    await fs.writeFile(file, JSON.stringify(stored));
    await page.reload();
    let attempts = 0;
    await page.route(`**${url}/recordings/${questionId}`, async (route) => {
      attempts += 1;
      if (attempts === 1)
        await route.fulfill({ status: 503, json: { detail: 'Temporary upload failure' } });
      else if (!expired)
        await route.fulfill({ status: 422, json: { detail: '没有收到录音，请检查麦克风' } });
      else await route.continue();
    });
    await expect.poll(() => page.evaluate(() => mockRecordingProbe.stops)).toBe(1);
    await page.evaluate(() => mockRecordingProbe.current.finish());
    await expect(page.locator('#mock-save')).toContainText('保存失败');
    if (expired) {
      // Move only this owned session beyond its upload grace; do not wait eleven real seconds.
      stored.response_deadline = Date.now() / 1000 - 11;
      await fs.writeFile(file, JSON.stringify(stored));
    }
    await page.locator('#mock-next').click();
    if (expired) {
      await expect(page.locator('.mock-question > .mock-status').first()).toContainText('第 2 / 4');
      await expect(page.locator('#mock-error')).toContainText('录音未能在上传窗口内保存');
      expect((await (await request.get(url)).json()).recordings[questionId]).toBeUndefined();
    } else {
      await expect(page.locator('#mock-error')).toContainText('没有收到录音');
      await expect(page.locator('.mock-question > .mock-status').first()).toContainText('第 1 / 4');
    }
    expect(attempts).toBe(2);
  });
}

test('browser Back saves a stopped mock recording and Forward keeps its deadline', async ({
  page,
  context,
  request,
}) => {
  const { url, questionId } = await prepareMockRecording(page, context, request);
  const initial = await (await request.get(url)).json();
  await page.goBack();
  await expect.poll(() => page.evaluate(() => mockRecordingProbe.stops)).toBe(1);
  await page.evaluate(() => mockRecordingProbe.current.finish());
  await expect(page.locator('#landing-view')).toBeVisible();
  const saved = await (await request.get(url)).json();
  expect(saved.recordings[questionId]).toBeTruthy();
  expect(saved.response_deadline).toBe(initial.response_deadline);
  expect(saved.status).toBe('active');
  await page.goForward();
  await expect(page.locator('#mock-view')).toBeVisible();
  await expect(page.locator('#mock-next')).toBeEnabled();
  expect((await (await request.get(url)).json()).response_deadline).toBe(initial.response_deadline);
  expect(await page.evaluate(() => mockRecordingProbe.recorders.length)).toBe(1);
});

for (const exit of ['abandon', 'pagehide']) {
  test(`mock recording cleanup releases delayed recording after ${exit}`, async ({
    page,
    context,
    request,
  }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await prepareMockRecording(page, context, request);
    if (exit === 'abandon') {
      await page.locator('#quit-mock').click();
      await expect(page.locator('#landing-view')).toBeVisible();
    } else await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide')));
    expect(
      await page.evaluate(() => ({
        stops: mockRecordingProbe.stops,
        tracks: mockRecordingProbe.stoppedTracks,
      })),
    ).toEqual({ stops: 1, tracks: 1 });
    await page.evaluate(() => mockRecordingProbe.current.finish());
    expect(await page.evaluate(() => mockRecordingProbe.blobs.length)).toBe(0);
    const cdp = await context.newCDPSession(page);
    await cdp.send('HeapProfiler.collectGarbage');
    expect(
      await page.evaluate(() => mockRecordingProbe.recorders.map((ref) => !!ref.deref())),
    ).toEqual([false]);
    expect(errors).toEqual([]);
  });
}

for (const action of ['abandon', 'retry']) {
  test(`mock recording cleanup preserves failed upload until ${action}`, async ({
    page,
    context,
    request,
  }) => {
    const { url, questionId } = await prepareMockRecording(page, context, request);
    const uploads = [];
    await page.route(`**${url}/recordings/${questionId}`, async (route) => {
      uploads.push(route.request().postDataBuffer().toString());
      if (uploads.length === 1)
        await route.fulfill({ status: 503, json: { detail: 'Test upload failure' } });
      else await route.continue();
    });
    await page.locator('#mock-next').click();
    await expect.poll(() => page.evaluate(() => mockRecordingProbe.stops)).toBe(1);
    await page.evaluate(() => mockRecordingProbe.current.finish());
    await expect(page.locator('#mock-save')).toContainText('保存失败');
    const cdp = await context.newCDPSession(page);
    await cdp.send('HeapProfiler.collectGarbage');
    expect(await page.evaluate(() => !!mockRecordingProbe.blobs[0].deref())).toBe(true);
    if (action === 'abandon') {
      await page.locator('#quit-mock').click();
      await expect(page.locator('#landing-view')).toBeVisible();
    } else {
      await page.locator('#mock-next').click();
      await expect.poll(async () => (await (await request.get(url)).json()).item_index).toBe(1);
      expect(uploads).toEqual(['mock recording', 'mock recording']);
      expect((await (await request.get(url)).json()).recordings[questionId]).toBe('audio/webm');
    }
    await cdp.send('HeapProfiler.collectGarbage');
    expect(
      await page.evaluate(() => ({
        recorder: !!mockRecordingProbe.recorders[0].deref(),
        blob: !!mockRecordingProbe.blobs[0].deref(),
      })),
    ).toEqual({ recorder: false, blob: false });
  });
}

test('mock sound check refuses non-American fallback and permits retry', async ({
  page,
  context,
}) => {
  await prepare(page, context);
  expect((await page.request.get('/')).status()).toBe(200);
  await page.goto('/');
  await page.locator('#open-mocks').click();
  await page.locator('[data-paper=ets-test-1]').click();
  await page.evaluate(() => {
    window.testVoices = window.testVoices.slice(0, 1);
  });
  await page.locator('#mock-sound-check').click();
  await expect(page.locator('#mock-error')).toContainText('未找到美式英语音色');
  await expect(page.locator('#mock-sound-check')).toBeEnabled();
  await expect(page.locator('#begin-mock')).toBeDisabled();
  expect(await page.evaluate(() => window.mockSpeechVoices)).toEqual([]);
  await page.evaluate(() => {
    window.testVoices = [{ name: 'Microsoft Aria Online', lang: 'en-US' }];
  });
  await page.locator('#mock-sound-check').click();
  await expect(page.locator('#mock-sound-state')).toContainText('示范已播放');
  expect(await page.evaluate(() => window.mockSpeechVoices)).toEqual(['en-US']);
});

for (const [accent, voice, draw, genderDraw] of [
  ['en-GB', 'en-GB-SoniaNeural', 0.85, 0.75],
  ['en-AU', 'en-AU-NatashaNeural', 0.95, 0.75],
  ['en-US', 'en-US-GuyNeural', 0.4, 0.25],
  ['en-GB', 'en-GB-RyanNeural', 0.85, 0.25],
  ['en-AU', 'en-AU-WilliamMultilingualNeural', 0.95, 0.25],
]) {
  test(`${voice} mock sound check uses weighted assignment and preserves its replay voice`, async ({
    page,
    context,
  }) => {
    await prepare(page, context);
    const requested = [];
    await page.route('**/api/v1/tts', (route) => {
      requested.push(route.request().postDataJSON().voice);
      return route.fulfill({ json: { fallback: true } });
    });
    expect((await page.request.get('/')).status()).toBe(200);
    await page.goto('/');
    await page.locator('#open-mocks').click();
    await page.locator('[data-paper=ets-test-1]').click();
    await page.evaluate(
      ({ accent, voice, draw, genderDraw }) => {
        window.testVoices.push({ name: voice, lang: accent });
        let calls = 0;
        Math.random = () => (calls++ % 2 === 0 ? draw : genderDraw);
      },
      { accent, voice, draw, genderDraw },
    );
    await expect(page.locator('#mock-view .prompt-accent-info')).toContainText('英国约 10%');
    await expect(page.locator('#mock-view input[name=prompt_accent]')).toHaveCount(0);
    await page.locator('#mock-sound-check').click();
    await expect(page.locator('#mock-sound-state')).toContainText('示范已播放');
    expect(requested).toEqual([voice]);
    expect(await page.evaluate(() => window.mockSpeechVoices)).toEqual([accent]);
    await page.locator('#mock-mic-check').click();
    await page.locator('#mock-consent').check();
    await expect(page.locator('#begin-mock')).toBeEnabled();
    await page.evaluate(() => {
      Math.random = () => 0.5;
    });
    await page.locator('#mock-sound-check').click();
    await expect(page.locator('#mock-sound-state')).toContainText('示范已播放');
    expect(requested).toEqual([voice, voice]);
    expect(await page.evaluate(() => window.mockSpeechVoices)).toEqual([accent, accent]);
    await expect(page.locator('#begin-mock')).toBeEnabled();
  });
}

test('home has unique entries and an expandable mock paper picker', async ({
  page,
  request,
}, testInfo) => {
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  await expect(page.locator('.section-card')).toHaveCount(4);
  await expect(page.locator('.exam-entry')).toHaveCount(2);
  await expect(page.locator('#open-tests')).toBeEnabled();
  await expect(page.locator('#landing-title')).toHaveClass('brand-wordmark');
  await expect(page.locator('#landing-title')).toHaveText('TOEFL TRAINING');
  await expect(page.getByText('今天，练习还是模考？')).toHaveCount(0);
  await expect(page.locator('#library-tabs')).toHaveCount(0);
  await expect(page.locator('[data-practice-entry]')).toHaveCount(0);
  await expect(page.locator('#mock-papers')).toBeHidden();
  await expect(page.locator('#open-mocks')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('#open-mocks').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#mock-papers')).toBeVisible();
  await expect(page.locator('#open-mocks')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-paper]')).toHaveCount(5);
  await page.keyboard.press('Enter');
  await expect(page.locator('#mock-papers')).toBeHidden();
  await expect(page.locator('#open-mocks')).toHaveAttribute('aria-expanded', 'false');
  await page.evaluate(() => localStorage.setItem('toefl-mock-session', 'saved-record'));
  await page.reload();
  await expect(page.locator('#resume-mock')).toBeVisible();
  await expect(page.locator('#mock-papers')).toBeHidden();
  await page.evaluate(() => localStorage.removeItem('toefl-mock-session'));
  await page.reload();
  await expect(page.locator('.section-card')).toHaveCount(4);
  await expect(page.locator('#resume-mock')).toHaveCount(0);
  for (const width of [2048, 1707, 1440, 390]) {
    await page.setViewportSize({ width, height: width >= 1707 ? 960 : 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`), fullPage: true });
    await page.locator('#open-mocks').click();
    await expect(page.locator('[data-paper=ets-test-1]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath(`papers-${width}.png`), fullPage: true });
    await page.locator('#open-mocks').click();
  }
  await page.locator('[data-section=reading][data-action=configure]').click();
  await expect(page.locator('#setup-view')).toBeVisible();
});

test('reading saves, reload preserves deadline, and modules lock', async ({
  page,
  context,
  request,
}) => {
  await prepare(page, context);
  await begin(page);
  const id = await page.evaluate(() => localStorage.getItem('toefl-mock-session'));
  const before = await (await request.get(`/api/v1/mock/sessions/${id}`)).json();
  await page.locator('input[data-answer]').first().fill('ey');
  await expect(page.locator('#mock-save')).toHaveText('已保存');
  await page.reload();
  await expect(page.locator('input[data-answer]').first()).toHaveValue('ey');
  const after = await (await request.get(`/api/v1/mock/sessions/${id}`)).json();
  expect(after.deadline).toBe(before.deadline);
  await submitPhase(page);
  await expect(page.locator('.mock-heading h2')).toHaveText('Reading · Module 2');
  expect(
    (
      await request.post(`/api/v1/mock/sessions/${id}`, {
        data: { action: 'save', phase_index: 0 },
      })
    ).status(),
  ).toBe(409);
  await page.locator('#quit-mock').click();
  await expect(page.locator('#landing-view')).toBeVisible();
});

test('complete all nine stages including synthetic microphone recording', async ({
  page,
  context,
  request,
}, testInfo) => {
  test.setTimeout(120000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await prepare(page, context);
  await begin(page);
  const id = await page.evaluate(() => localStorage.getItem('toefl-mock-session'));
  await page.screenshot({ path: testInfo.outputPath('reading.png'), fullPage: true });
  await expect(page.locator('.mock-letter-input')).toHaveCount(10);
  await expect(page.locator('.mock-paper img')).toHaveCount(0);
  await page.locator('#mock-next').click();
  await expect(page.locator('.mock-native-answer .mock-choice')).toHaveCount(4);
  await page.locator('.mock-native-answer input').first().check();
  await page.locator('#mock-prev').click();
  await expect(page.locator('.mock-letter-input')).toHaveCount(10);
  await page.locator('#mock-submit').click();
  await page.locator('#cancel-mock-submit').click();
  await expect(page.locator('#mock-submit-dialog')).not.toBeVisible();
  for (let module = 0; module < 2; module++) await submitPhase(page);
  await expect(page.locator('.mock-heading h2')).toHaveText('Listening · Module 1');
  for (let index = 0; index < 34; index++) {
    await expect(page.locator('#mock-listening-answers')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#mock-next')).toBeEnabled({ timeout: 15000 });
    await expect(page.locator('#mock-play')).toBeHidden();
    if (index === 0) {
      await expect(page.locator('.mock-question')).not.toContainText(
        'Does the building have a parking garage',
      );
      await expect(page.locator('#mock-response-clock')).toHaveText(/作答剩余 \d+ 秒/);
      await expect(page.locator('#mock-response-progress')).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath('listening.png'), fullPage: true });
    }
    await page.locator('.mock-choice input').first().check();
    await page.locator('#mock-next').click();
    await expect
      .poll(async () => {
        const s = await (await request.get(`/api/v1/mock/sessions/${id}`)).json();
        return s.phase_index * 100 + s.item_index;
      })
      .toBe(
        index < 17 ? 200 + index + 1 : index === 17 ? 300 : index < 33 ? 300 + index - 17 : 400,
      );
    if (index === 17 || index === 33) await beginStage(page);
  }
  await expect(page.locator('.mock-heading h2')).toHaveText('Build a Sentence');
  await page.locator('[data-word="2"]').dragTo(page.locator('[data-slot="0"]'));
  for (const token of [0, 5, 4, 6, 3]) {
    await page.locator(`[data-word="${token}"]`).focus();
    await page.keyboard.press('Enter');
  }
  await page.locator('[data-slot="5"]').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.mock-word-slot:not(.is-empty)')).toHaveCount(5);
  await page.locator('[data-word="3"]').click();
  await expect(page.locator('.mock-word-slot:not(.is-empty)')).toHaveCount(6);
  await expect(page.locator('#mock-save')).toHaveText('已保存');
  const sentence = await (await request.get(`/api/v1/mock/sessions/${id}`)).json();
  expect(sentence.answers['ets-test-1-writing-sentence-1']).toBe(
    'he wanted to know when it ended.',
  );
  await page.locator('#mock-next').click();
  await page.locator('#mock-prev').click();
  await expect(page.locator('.mock-word-slot:not(.is-empty)')).toHaveCount(6);
  await page.reload();
  await expect(page.locator('.mock-word-slot:not(.is-empty)')).toHaveCount(6);
  await page.screenshot({ path: testInfo.outputPath('sentence-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('sentence-mobile.png'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await submitPhase(page);
  await expect(page.locator('.mock-heading h2')).toHaveText('Write an Email');
  const emailAnswer =
    'Dear Maria, I will be traveling for a meeting. Could you suggest a quiet restaurant? Thank you.';
  await page.locator('textarea').fill(emailAnswer);
  await submitPhase(page);
  await expect(page.locator('.mock-heading h2')).toHaveText('Academic Discussion');
  const discussionAnswer =
    'I agree that remote work may continue to grow because people value flexibility.';
  await page.locator('textarea').fill(discussionAnswer);
  await submitPhase(page);
  for (let index = 0; index < 11; index++) {
    await expect(page.locator('#mock-record-state')).toHaveText('正在录音，请回答。');
    await expect(page.locator('#mock-next')).toBeEnabled();
    if (index === 0) {
      await expect(page.locator('#mock-response-clock')).toHaveText(/作答剩余 \d+ 秒/);
      await expect(page.locator('#mock-response-progress')).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath('speaking.png') });
    }
    await page.waitForTimeout(250);
    await page.locator('#mock-next').click();
    await expect
      .poll(async () => {
        const s = await (await request.get(`/api/v1/mock/sessions/${id}`)).json();
        return s.phase_index * 100 + s.item_index;
      })
      .toBe(index < 6 ? 700 + index + 1 : index === 6 ? 800 : index < 10 ? 800 + index - 6 : 900);
    if (index === 6) await beginStage(page);
  }
  await expect(page.locator('.mock-heading h1')).toContainText('模考复盘');
  await expect(page.locator('.mock-review-list > details')).toHaveCount(97);
  await expect(page.locator('.mock-review-list audio')).toHaveCount(11);
  const result = await (await request.get(`/api/v1/mock/sessions/${id}/result`)).json();
  const explainedItems = result.review.filter((item) => item.explanation);
  await expect(page.locator('.mock-learning-notes')).toHaveCount(explainedItems.length);
  const firstReview = page.locator('.mock-review-list > details').first();
  await firstReview.locator(':scope > summary').click();
  const learningNotes = firstReview.locator('.mock-learning-notes');
  if (result.review[0].explanation) {
    await expect(learningNotes.locator('summary')).toContainText('非 ETS 官方解析');
    await learningNotes.locator('summary').click();
    await expect(learningNotes.locator('.mock-explanation')).toBeVisible();
    await expect(learningNotes.locator('.mock-explanation')).toContainText('读懂：');
    await expect(learningNotes.locator('.mock-explanation')).toContainText('解析：');
    await expect(learningNotes.locator('.mock-explanation')).toContainText('下次：');
    await expect(learningNotes.locator('.mock-explanation')).toHaveCSS('white-space', 'pre-line');
  } else {
    await expect(page.locator('#mock-view')).toContainText('未安装本地学习解析');
  }
  await expectFullWidth(firstReview.locator('p:visible'));
  expect(result.objective_total).toBe(84);
  expect(result.pending_review).toBe(13);
  expect(result.review.find((q) => q.kind === 'email').answer).toBe(emailAnswer);
  expect(result.review.find((q) => q.kind === 'discussion').answer).toBe(discussionAnswer);
  expect(
    (await request.get(result.review.find((q) => q.recording_url).recording_url)).status(),
  ).toBe(200);
  await page.screenshot({ path: testInfo.outputPath('result.png') });
  await page.locator('[data-mock-home]').click();
  await page.locator('#open-history').click();
  await page.locator('#history-tab-mock').click();
  await page.locator(`[data-history-id='${id}']`).click();
  await expect(page.locator('.app-shell > section:not([hidden])')).toHaveCount(1);
  await expect(page.locator('.app-shell > section:not([hidden])')).toHaveAttribute(
    'id',
    'mock-view',
  );
  await expect(page.getByRole('button', { name: '返回记录' })).toBeFocused();
  await expect(page.locator('.mock-review-list > details')).toHaveCount(97);
  await expect(page.locator('.mock-review-list audio')).toHaveCount(11);
  await page.getByRole('button', { name: '返回记录' }).click();
  await expect(page.locator('.app-shell > section:not([hidden])')).toHaveCount(1);
  await expect(page.locator('.app-shell > section:not([hidden])')).toHaveAttribute(
    'id',
    'history-view',
  );
  await expect(page.locator('#history-title')).toBeFocused();
  await expect(page.locator('#history-tab-mock')).toHaveAttribute('aria-selected', 'true');
  expect(errors).toEqual([]);
});
