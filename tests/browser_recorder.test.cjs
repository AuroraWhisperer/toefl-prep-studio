const { test, expect } = require('@playwright/test');
const { openSettings, start } = require('./browser_practice_helpers.cjs');

test.beforeEach(async ({ page, request }) => {
  expect((await request.get('/')).status()).toBe(200);
  await page.addInitScript(() => {
    const probe = (window.recordingProbe = {
      pending: false,
      permissions: [],
      recorders: [],
      recognitions: [],
      stoppedTracks: 0,
      pendingRecognition: false,
    });
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: () =>
          new Promise((resolve, reject) => {
            const grant = () =>
              resolve({
                getTracks: () => [
                  {
                    stop: () => {
                      probe.stoppedTracks += 1;
                    },
                  },
                ],
              });
            if (probe.pending) probe.permissions.push({ grant, reject });
            else grant();
          }),
      },
    });
    window.MediaRecorder = class extends EventTarget {
      constructor() {
        super();
        this.state = 'inactive';
        this.mimeType = 'audio/webm';
        this.stopCalls = 0;
        probe.recorders.push(this);
      }
      start() {
        this.state = 'recording';
      }
      stop() {
        this.state = 'inactive';
        this.stopCalls += 1;
      }
      finish() {
        this.ondataavailable?.({
          data: new Blob(['recorded audio '.repeat(64)], { type: this.mimeType }),
        });
        this.onstop?.();
        this.dispatchEvent(new Event('stop'));
      }
    };
    window.SpeechRecognition = class {
      constructor() {
        this.stopped = false;
        probe.recognitions.push(this);
      }
      start() {}
      stop() {
        this.stopped = true;
        if (!probe.pendingRecognition) queueMicrotask(() => this.onend?.());
      }
      transcript(text) {
        this.onresult?.({ results: [[{ transcript: text }]] });
      }
    };
    window.webkitSpeechRecognition = undefined;
  });
  await page.route('**/api/v1/tts', (route) =>
    route.fulfill({ json: { url: null, fallback: true } }),
  );
  await page.goto('/');
});

async function speaking(page) {
  await openSettings(page, 'speaking', 'take_interview', 1);
  return start(page);
}

for (const destination of ['question', 'setup']) {
  test(`late microphone permission is cancelled after leaving for ${destination}`, async ({
    page,
  }) => {
    await speaking(page);
    await page.evaluate(() => {
      recordingProbe.pending = true;
    });
    await page.locator('[data-record]').click();
    await expect(page.locator('[data-record]')).toBeDisabled();
    await page.locator(destination === 'question' ? '#next-question' : '#back-home').click();
    await page.evaluate(() => recordingProbe.permissions[0].grant());
    await expect.poll(() => page.evaluate(() => recordingProbe.stoppedTracks)).toBe(1);
    expect(await page.evaluate(() => recordingProbe.recorders.length)).toBe(0);
    if (destination === 'question') await expect(page.locator('[data-record]')).toBeEnabled();
    else await expect(page.locator('#setup-view')).toBeVisible();
  });
}

test('stopped recognition cannot change another question and delayed audio belongs to its original question', async ({
  page,
}) => {
  await speaking(page);
  await page.locator('[data-record]').click();
  await page.evaluate(() => recordingProbe.recognitions[0].transcript('First answer.'));
  await page.locator('#next-question').click();
  await page.evaluate(() => {
    recordingProbe.recognitions[0].transcript('Stale answer.');
    recordingProbe.recorders[0].finish();
  });
  await expect(page.locator('#answer-input')).toHaveValue('');
  await expect(page.locator('[data-recording-playback]')).toBeHidden();
  expect(await page.evaluate(() => recordingProbe.recognitions[0].stopped)).toBe(true);
  await page.locator('#previous-question').click();
  await expect(page.locator('#answer-input')).toHaveValue('First answer.');
  await expect(page.locator('[data-recording-playback]')).toHaveAttribute('src', /^blob:/);
});

test('a delayed recording from a previous practice cannot enter a new practice', async ({
  page,
}) => {
  let selection;
  await page.route('**/api/v1/exam?**', async (route) => {
    if (!selection) selection = await (await route.fetch()).json();
    return route.fulfill({ json: selection });
  });
  await speaking(page);
  await page.locator('[data-record]').click();
  await page.locator('#back-home').click();
  await start(page);
  await page.evaluate(() => recordingProbe.recorders[0].finish());
  await expect(page.locator('[data-recording-playback]')).toBeHidden();
  await expect(page.locator('#answer-input')).toHaveValue('');
});

for (const manualStop of [false, true]) {
  test(`submission waits for recorder completion before rendering or archiving (manual stop: ${manualStop})`, async ({
    page,
  }) => {
    await speaking(page);
    await page.locator('[data-record]').click();
    if (manualStop) await page.locator('[data-record]').click();
    const scored = page.waitForResponse((r) => r.url().endsWith('/api/v1/exam/submit'));
    const uploads = [];
    page.on('request', (r) => {
      if (r.method() === 'PUT' && r.url().includes('/recordings/')) uploads.push(r.url());
    });
    await page.locator('#submit-exam').click();
    await expect(page.locator('#result-view')).toBeHidden();
    expect(uploads).toEqual([]);
    await page.evaluate(() => recordingProbe.recorders[0].finish());
    expect((await scored).status()).toBe(200);
    await expect(page.locator('#result-view')).toBeVisible();
    await expect.poll(() => uploads.length).toBe(1);
    expect(await page.evaluate(() => recordingProbe.recorders[0].stopCalls)).toBe(1);
  });
}

for (const manualStop of [false, true]) {
  test(`final recognition after stop is included in the scoring snapshot (manual: ${manualStop})`, async ({
    page,
  }) => {
    const exam = await speaking(page);
    await page.evaluate(() => {
      recordingProbe.pendingRecognition = true;
    });
    await page.locator('[data-record]').click();
    await page.evaluate(() => recordingProbe.recognitions[0].transcript('My partial'));
    if (manualStop) await page.locator('[data-record]').click();
    const submissions = [];
    page.on('request', (request) => {
      if (request.url().endsWith('/api/v1/exam/submit')) submissions.push(request.postDataJSON());
    });
    await page.locator('#submit-exam').click();
    await page.evaluate(() => recordingProbe.recorders[0].finish());
    expect(submissions).toEqual([]);
    await page.evaluate(() => {
      recordingProbe.recognitions[0].transcript('My final complete answer.');
      recordingProbe.recognitions[0].onend();
    });
    await expect(page.locator('#result-view')).toBeVisible();
    expect(submissions).toHaveLength(1);
    expect(
      submissions[0].responses.find((answer) => answer.question_id === exam.questions[0].id).answer,
    ).toBe('My final complete answer.');
  });
}

test('recognition that never ends has a bounded wait', async ({ page }) => {
  await speaking(page);
  await page.clock.install();
  await page.evaluate(() => {
    recordingProbe.pendingRecognition = true;
  });
  await page.locator('[data-record]').click();
  await page.evaluate(() => recordingProbe.recognitions[0].transcript('Retain this answer.'));
  await page.locator('#submit-exam').click();
  await page.evaluate(() => recordingProbe.recorders[0].finish());
  await page.clock.fastForward(1600);
  await expect(page.locator('#result-view')).toBeVisible();
  await expect(page.locator('.submitted-answer').first()).toHaveText('Retain this answer.');
});

for (const action of ['submit', 'return']) {
  test(`adaptive ${action} waits for audio upload before saving or advancing`, async ({
    page,
    request,
  }) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const created = await request.post('/api/v1/tests/sessions', { data: { level: 5 } });
    expect(created.status()).toBe(200);
    const session = await created.json();
    const url = `/api/v1/tests/sessions/${session.id}`;
    for (let phase = 0; phase < 7; phase += 1) {
      for (const event of ['begin', 'submit']) {
        expect(
          (await request.post(url, { data: { phase_index: phase, action: event } })).status(),
        ).toBe(200);
      }
    }
    await page.evaluate((id) => localStorage.setItem('toefl-adaptive-session', id), session.id);
    await page.locator('#open-tests').click();
    await page.locator('#resume-test').click();
    await page.locator('#begin-test-phase').click();
    await page.locator('[data-record]').click();
    const writes = [];
    page.on('request', (r) => {
      if (r.url().includes(url) && ['POST', 'PUT'].includes(r.method()))
        writes.push(r.method() === 'PUT' ? 'upload' : r.postDataJSON().action);
    });
    await page.locator(action === 'submit' ? '#submit-exam' : '#back-home').click();
    await expect(page.locator('#exam-view')).toBeVisible();
    expect(writes).toEqual([]);
    await page.evaluate(() => recordingProbe.recorders[0].finish());
    if (action === 'submit') await expect(page.locator('#test-title')).toHaveText('口语 · 访谈');
    else await expect(page.locator('#landing-view')).toBeVisible();
    expect(writes).toEqual(['upload', action === 'submit' ? 'submit' : 'save']);
    const saved = await (await request.get(url)).json();
    expect(saved.phase_index).toBe(action === 'submit' ? 8 : 7);
    expect(Object.keys(saved.recordings)).toHaveLength(1);
    expect(errors).toEqual([]);
  });
}

test('recording limit releases microphone and recognition without changing the answer', async ({
  page,
}) => {
  await page.route('**/api/v1/exam?**', async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    data.questions[0].max_seconds = 1;
    await route.fulfill({ response, json: data });
  });
  await page.clock.install();
  await speaking(page);
  await page.locator('[data-record]').click();
  await page.evaluate(() => recordingProbe.recognitions[0].transcript('My timed answer.'));
  await page.clock.fastForward(1100);
  await expect(page.locator('[data-record]')).toContainText('开始录音');
  expect(
    await page.evaluate(() => ({
      stops: recordingProbe.recorders[0].stopCalls,
      tracks: recordingProbe.stoppedTracks,
      recognition: recordingProbe.recognitions[0].stopped,
    })),
  ).toEqual({ stops: 1, tracks: 1, recognition: true });
  await expect(page.locator('#answer-input')).toHaveValue('My timed answer.');
});
