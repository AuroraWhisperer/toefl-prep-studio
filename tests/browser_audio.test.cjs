const { test, expect } = require('@playwright/test');
const { openSettings, start, submit } = require('./browser_practice_helpers.cjs');

// A short, valid local sound tests the real media element without a TTS network dependency.
const samples = 2400;
const wav = Buffer.alloc(44 + samples * 2);
wav.write('RIFF');
wav.writeUInt32LE(wav.length - 8, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(8000, 24);
wav.writeUInt32LE(16000, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(samples * 2, 40);
for (let index = 0; index < samples; index += 1) {
  wav.writeInt16LE(Math.round(300 * Math.sin((index * 2 * Math.PI * 440) / 8000)), 44 + index * 2);
}
const audioResponse = { contentType: 'audio/wav', body: wav };

test.beforeEach(async ({ page, request }) => {
  expect((await request.get('/')).status()).toBe(200);
  await page.addInitScript(() => {
    Math.random = () => 0.5;
    window.audioMetrics = {
      created: [],
      revoked: [],
      plays: [],
      speech: [],
      voices: [],
      events: [],
      aborted: 0,
    };
    window.testVoices = [
      { name: 'British default', lang: 'en-GB', default: true },
      { name: 'Microsoft Aria Online', lang: 'en-US', default: false },
    ];
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
    speechSynthesis.getVoices = () => window.testVoices;
    const create = URL.createObjectURL;
    const revoke = URL.revokeObjectURL;
    URL.createObjectURL = function (blob) {
      const url = create.call(this, blob);
      window.audioMetrics.created.push(url);
      return url;
    };
    URL.revokeObjectURL = function (url) {
      window.audioMetrics.revoked.push(url);
      localStorage.setItem('released-audio', JSON.stringify(window.audioMetrics.revoked));
      return revoke.call(this, url);
    };
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      window.audioMetrics.plays.push(this.src);
      window.audioMetrics.events.push({ type: 'play', time: performance.now() });
      this.addEventListener(
        'ended',
        () => window.audioMetrics.events.push({ type: 'end', time: performance.now() }),
        { once: true },
      );
      return play.call(this);
    };
    const originalFetch = window.fetch;
    window.fetch = async function (url, options) {
      const signal = String(url).endsWith('/api/v1/tts') && options?.signal;
      const onAbort = () => {
        window.audioMetrics.aborted += 1;
      };
      if (signal) signal.addEventListener('abort', onAbort);
      try {
        return await originalFetch.call(this, url, options);
      } finally {
        if (signal) signal.removeEventListener('abort', onAbort);
      }
    };
    speechSynthesis.speak = (utterance) => {
      window.audioMetrics.speech.push(utterance.text);
      window.audioMetrics.voices.push(utterance.voice?.name ?? null);
      window.audioMetrics.events.push({ type: 'speech', time: performance.now() });
      queueMicrotask(() => utterance.onend?.());
    };
  });
  await page.goto('/');
});

async function captureAudio(page) {
  const calls = [];
  await page.route('**/api/v1/tts', async (route) => {
    calls.push(route.request().postDataJSON().text);
    await route.fulfill(audioResponse);
  });
  return calls;
}

async function waitForPreload(page, selected, calls) {
  const prompts = [
    ...new Set(selected.questions.map((question) => question.audio_text).filter(Boolean)),
  ];
  const texts = await page.evaluate(
    (prompts) => prompts.flatMap((text) => PromptSpeech.parseTurns(text).map((turn) => turn.text)),
    prompts,
  );
  await expect.poll(() => calls.length).toBe(texts.length);
  await expect.poll(() => page.evaluate(() => audioMetrics.created.length)).toBe(texts.length);
  expect([...calls].sort()).toEqual([...texts].sort());
  expect(await page.evaluate(() => audioMetrics.plays)).toEqual([]);
  return texts;
}

async function expectReleased(page) {
  const { created, revoked } = await page.evaluate(() => audioMetrics);
  expect(revoked.sort()).toEqual(created.sort());
}

const conversationTurns = [
  ['Student', 'My internship report is much longer than the limit.'],
  ['Adviser', 'Are you describing every day separately?'],
  ['Student', 'Yes, I kept a daily log.'],
  [
    'Adviser',
    'Use the log as evidence, but organize the report around the three main skills you developed.',
  ],
  ['Student', 'So I can select examples instead of including everything?'],
  ['Adviser', 'Exactly. Explain what the examples show about your learning.'],
];
const conversation = conversationTurns.map(([speaker, text]) => `${speaker}: ${text}`).join(' ');
const announcement = 'The north reading room will open at nine tomorrow.';

async function useAudioText(page, text) {
  await page.route('**/api/v1/exam?*', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    body.questions.forEach((question) => {
      question.audio_text = text;
    });
    await route.fulfill({ response, json: body });
  });
}

async function startConversation(page) {
  await useAudioText(page, conversation);
  await openSettings(page, 'listening', 'listen_conversation', 2);
  return start(page);
}

test('dialogue parsing separates inline and multiline turns without splitting prose', async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const inline =
      'Student: Is this right? Adviser: Yes. Keep the heading: Results. Student: Thanks!';
    const multiline = inline
      .replace(' Adviser:', '\nAdviser:')
      .replace(' Student: Thanks', '\nStudent: Thanks');
    const prose =
      'Notice the connection: plants need light. The timing matters too: measure at noon.';
    return {
      inline: PromptSpeech.parseTurns(inline),
      multiline: PromptSpeech.parseTurns(multiline),
      prose: PromptSpeech.parseTurns(prose),
    };
  });
  expect(result.inline).toEqual([
    { speaker: 'Student', text: 'Is this right?' },
    { speaker: 'Adviser', text: 'Yes. Keep the heading: Results.' },
    { speaker: 'Student', text: 'Thanks!' },
  ]);
  expect(result.multiline).toEqual(result.inline);
  expect(result.prose).toEqual([
    {
      speaker: '',
      text: 'Notice the connection: plants need light. The timing matters too: measure at noon.',
    },
  ]);
});

test('official accent tags identify speakers without being spoken', async ({ page }) => {
  const result = await page.evaluate(() => ({
    dialogue: PromptSpeech.parseTurns(
      '(M-Can) What should we prepare? (W-Br) How about lasagna? (M-Can) Good idea.',
    ),
    lecture: PromptSpeech.parseTurns(
      'Man: (M-Br) Let us discuss language acquisition. It develops through interaction.',
    ),
    prose: PromptSpeech.parseTurns(
      'The code (M-Can) appears in this example. Keep the heading: Results.',
    ),
  }));
  expect(result.dialogue).toEqual([
    { speaker: 'Man', text: 'What should we prepare?' },
    { speaker: 'Woman', text: 'How about lasagna?' },
    { speaker: 'Man', text: 'Good idea.' },
  ]);
  expect(result.lecture).toEqual([
    {
      speaker: 'Man',
      text: 'Let us discuss language acquisition. It develops through interaction.',
    },
  ]);
  expect(result.prose).toEqual([
    { speaker: '', text: 'The code (M-Can) appears in this example. Keep the heading: Results.' },
  ]);
});

test('conversation uses stable distinct voices, ordered clips and natural turn gaps', async ({
  page,
}) => {
  const calls = [];
  await page.route('**/api/v1/tts', async (route) => {
    calls.push(route.request().postDataJSON());
    await route.fulfill(audioResponse);
  });
  await startConversation(page);
  await expect.poll(() => calls.length).toBe(6);
  expect(calls.map((call) => call.text)).toEqual(conversationTurns.map((turn) => turn[1]));
  expect(calls.map((call) => call.voice)).toEqual(
    Array.from({ length: 6 }, (_, index) => (index % 2 ? 'en-US-GuyNeural' : 'en-US-AriaNeural')),
  );
  const button = page.locator('#question-content [data-audio-text]');
  await button.click();
  await expect(button).toBeEnabled({ timeout: 15000 });
  const first = await page.evaluate(() => structuredClone(audioMetrics));
  expect(first.plays).toEqual(first.created);
  expect(first.events.map((event) => event.type)).toEqual(
    Array.from({ length: 6 }, () => ['play', 'end']).flat(),
  );
  for (let index = 1; index < 6; index += 1) {
    const gap = first.events[index * 2].time - first.events[index * 2 - 1].time;
    expect(gap).toBeGreaterThanOrEqual(conversationTurns[index - 1][1].endsWith('?') ? 580 : 380);
    expect(gap).toBeLessThan(1500);
  }
  await button.click();
  await expect(button).toBeEnabled({ timeout: 15000 });
  expect(await page.evaluate(() => audioMetrics.plays.slice(6))).toEqual(first.plays);
  expect(calls).toHaveLength(6);
  await page.locator('#back-home').click();
  await expectReleased(page);
});

test('conversation browser fallback preserves both speakers and pauses', async ({ page }) => {
  await page.route('**/api/v1/tts', (route) => route.fulfill({ status: 503, json: {} }));
  await page.evaluate(() => testVoices.push({ name: 'Microsoft Guy Online', lang: 'en-US' }));
  await startConversation(page);
  const button = page.locator('#question-content [data-audio-text]');
  await button.click();
  await expect(button).toBeEnabled({ timeout: 15000 });
  const metrics = await page.evaluate(() => audioMetrics);
  expect(metrics.speech).toEqual(conversationTurns.map((turn) => turn[1]));
  expect(metrics.voices).toEqual(
    Array.from({ length: 6 }, (_, index) => `Microsoft ${index % 2 ? 'Guy' : 'Aria'} Online`),
  );
  for (let index = 1; index < 6; index += 1) {
    expect(metrics.events[index].time - metrics.events[index - 1].time).toBeGreaterThanOrEqual(
      index === 2 || index === 5 ? 580 : 380,
    );
  }
});

test('conversation refuses a missing second speaker instead of reading both roles with one voice', async ({
  page,
}) => {
  await page.route('**/api/v1/tts', (route) => route.fulfill({ status: 503, json: {} }));
  await startConversation(page);
  const button = page.locator('#question-content [data-audio-text]');
  await button.click();
  await expect(page.locator('#toast')).toContainText('Guy');
  await expect(button).toBeEnabled();
  expect(await page.evaluate(() => audioMetrics.speech)).toEqual([]);
});

test('switching questions during a conversation gap cancels all remaining turns', async ({
  page,
}) => {
  await captureAudio(page);
  await startConversation(page);
  await page.locator('#question-content [data-audio-text]').click();
  await page.waitForFunction(() => audioMetrics.events.some((event) => event.type === 'end'));
  await page.locator('#next-question').click();
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => audioMetrics.plays.length)).toBe(1);
  await expect(page.locator('#question-content [data-audio-text]')).toBeEnabled();
  await page.locator('#back-home').click();
  await expectReleased(page);
});

test('explicit Man and Woman labels override random gender while preserving replay assignments', async ({
  page,
}) => {
  const calls = await captureAudio(page);
  const profiles = await page.evaluate(async () => {
    const text = 'Man: Is this your book? Woman: Yes, thank you. Man: You are welcome.';
    const assignments = new Map();
    const cache = new PromptAudioCache([text], assignments);
    const first = (await cache.get(text)).map((part) => part.profile);
    cache.dispose();
    const review = new PromptAudioCache([text], assignments);
    const second = (await review.get(text)).map((part) => part.profile);
    review.dispose();
    return { first, second };
  });
  expect(profiles.first.map((profile) => profile.gender)).toEqual(['male', 'female', 'male']);
  expect(profiles.second).toEqual(profiles.first);
  expect(calls).toHaveLength(6);
  await expectReleased(page);
});

test('conversation transcript fills the panel with one paragraph per turn at desktop scales', async ({
  page,
}, testInfo) => {
  await captureAudio(page);
  await startConversation(page);
  const details = page.locator('#question-content .script-details');
  await details.locator('summary').focus();
  await page.keyboard.press('Enter');
  for (const [width, height] of [
    [2560, 1440],
    [2048, 1152],
    [1707, 960],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(details.locator('p')).toHaveCount(6);
    await expect(details.locator('strong')).toHaveText(
      conversationTurns.map((turn) => `${turn[0]}:`),
    );
    const geometry = await details.evaluate((node) => ({
      width: node.getBoundingClientRect().width,
      rows: [...node.querySelectorAll('p')].map((p) => ({
        width: p.getBoundingClientRect().width,
        top: p.getBoundingClientRect().top,
        bottom: p.getBoundingClientRect().bottom,
      })),
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    }));
    expect(geometry.overflow).toBe(false);
    geometry.rows.forEach((row, index) => {
      expect(row.width).toBeGreaterThanOrEqual(geometry.width - 2);
      if (index) expect(row.top).toBeGreaterThan(geometry.rows[index - 1].bottom);
    });
    await page.screenshot({
      path: testInfo.outputPath(`conversation-${width}.png`),
      fullPage: true,
    });
  }
  await details.locator('summary').click();
  await expect(details).not.toHaveAttribute('open');
  await submit(page);
  await expect(page.locator('#feedback-list .script-details').first().locator('p')).toHaveCount(6);
});

for (const [section, task, count] of [
  ['listening', 'listen_choose_response', 8],
  ['listening', 'listen_conversation', 2],
  ['listening', 'listen_announcement', 1],
  ['listening', 'listen_academic_talk', 1],
  ['speaking', 'listen_repeat', 1],
  ['speaking', 'take_interview', 1],
]) {
  test(`${task} preloads unique prompts and replays without requests`, async ({ page }) => {
    const calls = await captureAudio(page);
    await openSettings(page, section, task, count);
    const selected = await start(page);
    const texts = await waitForPreload(page, selected, calls);
    const turnCount = await page.evaluate(
      (text) => PromptSpeech.parseTurns(text).length,
      selected.questions[0].audio_text,
    );
    const button = page.locator('#question-content [data-audio-text]');
    await button.click();
    await expect(button).toBeEnabled({ timeout: 15000 });
    await button.click();
    await expect(button).toBeEnabled({ timeout: 15000 });
    const plays = await page.evaluate(() => audioMetrics.plays);
    expect(plays).toHaveLength(2 * turnCount);
    expect(plays.slice(0, turnCount)).toEqual(plays.slice(turnCount));
    expect(plays[0]).toMatch(/^blob:/);
    expect(calls).toHaveLength(texts.length);
    expect(await page.evaluate(() => audioMetrics.speech)).toEqual([]);
    if (selected.questions[0].audio_text === selected.questions[1].audio_text) {
      await page.locator('#next-question').click();
      await button.click();
      await expect(button).toBeEnabled({ timeout: 15000 });
      expect((await page.evaluate(() => audioMetrics.plays)).slice(-turnCount)).toEqual(
        plays.slice(0, turnCount),
      );
      expect(calls).toHaveLength(texts.length);
    }
    await page.locator('#back-home').click();
    await expectReleased(page);
  });
}

for (const section of ['listening', 'speaking']) {
  test(`${section} exam preloads the selected prompts`, async ({ page }) => {
    const calls = await captureAudio(page);
    const response = page.waitForResponse((r) => r.url().includes('/api/v1/exam?'));
    await page.locator(`[data-section="${section}"][data-mode="exam"]`).click();
    await waitForPreload(page, await (await response).json(), calls);
    await page.locator('#back-home').click();
    await expectReleased(page);
  });
}

test('pending playback shares preloading, switching prioritizes, and exit cancels work', async ({
  page,
}) => {
  const pending = [];
  await page.route('**/api/v1/tts', (route) => {
    pending.push(route);
  });
  await openSettings(page, 'listening', 'listen_choose_response', 8);
  const selected = await start(page);
  await expect.poll(() => pending.length).toBe(2);
  await page.locator('#question-content [data-audio-text]').click();
  await expect(page.locator('#question-content [data-audio-text]')).toHaveText('加载音频…');
  expect(pending).toHaveLength(2);
  await page.locator('[data-question-index="7"]').click();
  await pending[0].fulfill(audioResponse);
  await expect.poll(() => pending.length).toBe(3);
  const prioritizedText = await page.evaluate(
    (text) => PromptSpeech.parseTurns(text)[0].text,
    selected.questions[7].audio_text,
  );
  expect(pending[2].request().postDataJSON().text).toBe(prioritizedText);
  expect(await page.evaluate(() => audioMetrics.plays)).toEqual([]);
  await page.locator('#question-content [data-audio-text]').click();
  await page.locator('#back-home').click();
  await expect.poll(() => page.evaluate(() => audioMetrics.aborted)).toBe(2);
  for (const route of pending.slice(1)) await route.fulfill(audioResponse);
  const metrics = await page.evaluate(() => audioMetrics);
  expect(metrics.created).toHaveLength(1);
  expect(metrics.revoked).toEqual(metrics.created);
  expect(metrics.plays).toEqual([]);
  expect(pending).toHaveLength(3);
});

test('failed submission keeps audio, success releases it, and review loads on demand', async ({
  page,
}) => {
  const calls = await captureAudio(page);
  await openSettings(page, 'listening', 'listen_conversation', 2);
  const selected = await start(page);
  const texts = await waitForPreload(page, selected, calls);
  await page.route(
    '**/api/v1/exam/submit',
    (route) => route.fulfill({ status: 503, json: { detail: 'test outage' } }),
    { times: 1 },
  );
  await page.locator('#submit-exam').click();
  await expect(page.locator('#save-state')).toContainText('提交失败');
  expect(await page.evaluate(() => audioMetrics.revoked)).toEqual([]);
  await page.locator('#question-content [data-audio-text]').click();
  await expect(page.locator('#question-content [data-audio-text]')).toBeEnabled({ timeout: 15000 });
  expect(calls).toHaveLength(texts.length);
  await submit(page);
  await expectReleased(page);
  expect(calls).toHaveLength(texts.length);
  await page.locator('#feedback-list [data-audio-text]').click();
  await expect(page.locator('#feedback-list [data-audio-text]')).toBeEnabled({ timeout: 15000 });
  const reviewTurns = await page.evaluate(
    (text) => PromptSpeech.parseTurns(text).length,
    selected.questions[0].audio_text,
  );
  expect(calls).toHaveLength(texts.length + reviewTurns);
  await page.locator('#result-home').click();
  await expectReleased(page);
});

test('page navigation releases audio and returning starts a fresh round', async ({
  page,
  request,
}) => {
  const calls = await captureAudio(page);
  await openSettings(page, 'listening', 'listen_announcement', 1);
  await waitForPreload(page, await start(page), calls);
  const created = await page.evaluate(() => audioMetrics.created);
  expect((await request.get('/?returned')).status()).toBe(200);
  await page.goto('/?returned');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('released-audio')))).toEqual(
    created,
  );
  await openSettings(page, 'listening', 'listen_announcement', 1);
  await start(page);
  await expect.poll(() => calls.length).toBe(2);
  await expect.poll(() => page.evaluate(() => audioMetrics.created.length)).toBe(1);
  expect((await page.evaluate(() => audioMetrics.created))[0]).not.toBe(created[0]);
});

test('submission cancels pending prompts and cannot start playback in review', async ({ page }) => {
  const pending = [];
  await page.route('**/api/v1/tts', (route) => {
    pending.push(route);
  });
  await openSettings(page, 'listening', 'listen_choose_response', 8);
  await start(page);
  await expect.poll(() => pending.length).toBe(2);
  await page.locator('#question-content [data-audio-text]').click();
  await submit(page);
  await expect.poll(() => page.evaluate(() => audioMetrics.aborted)).toBe(2);
  for (const route of pending) await route.fulfill(audioResponse);
  expect(await page.evaluate(() => audioMetrics.created)).toEqual([]);
  expect(await page.evaluate(() => audioMetrics.plays)).toEqual([]);
  expect(pending).toHaveLength(2);
});

test('restoring a page from browser history creates fresh audio', async ({ page }) => {
  const calls = await captureAudio(page);
  await openSettings(page, 'listening', 'listen_announcement', 1);
  await waitForPreload(page, await start(page), calls);
  const firstUrl = await page.evaluate(() => audioMetrics.created[0]);
  await page.evaluate(() =>
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })),
  );
  await expectReleased(page);
  await page.evaluate(() =>
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })),
  );
  await expect.poll(() => calls.length).toBe(2);
  await expect.poll(() => page.evaluate(() => audioMetrics.created.length)).toBe(2);
  await page.locator('#question-content [data-audio-text]').click();
  await expect(page.locator('#question-content [data-audio-text]')).toBeEnabled();
  expect((await page.evaluate(() => audioMetrics.plays))[0]).not.toBe(firstUrl);
  await page.locator('#back-home').click();
  await expectReleased(page);
});

for (const [speaker, name] of [
  ['', 'Aria'],
  ['Man', 'Guy'],
  ['Woman', 'Aria'],
]) {
  test(`failed preloads use speech only on click without retrying the network (${speaker || 'unlabelled'})`, async ({
    page,
  }) => {
    let calls = 0;
    await useAudioText(page, speaker ? `${speaker}: ${announcement}` : announcement);
    await page.evaluate(() => testVoices.push({ name: 'Microsoft Guy Online', lang: 'en-US' }));
    await page.route('**/api/v1/tts', (route) => {
      calls += 1;
      return route.fulfill({ json: { url: null, fallback: true } });
    });
    await openSettings(page, 'listening', 'listen_announcement', 1);
    await start(page);
    await expect.poll(() => calls).toBe(1);
    expect(await page.evaluate(() => audioMetrics.speech)).toEqual([]);
    const button = page.locator('#question-content [data-audio-text]');
    await button.click();
    await expect(button).toBeEnabled();
    await button.click();
    await expect(button).toBeEnabled();
    expect(await page.evaluate(() => audioMetrics.speech)).toEqual([announcement, announcement]);
    expect(await page.evaluate(() => audioMetrics.voices)).toEqual([
      `Microsoft ${name} Online`,
      `Microsoft ${name} Online`,
    ]);
    expect(calls).toBe(1);
  });
}

test('practice refuses a British-only browser fallback', async ({ page }) => {
  await page.route('**/api/v1/tts', (route) => route.fulfill({ json: { fallback: true } }));
  await page.evaluate(() => {
    window.testVoices = window.testVoices.slice(0, 1);
  });
  await openSettings(page, 'listening', 'listen_announcement', 1);
  await start(page);
  const button = page.locator('#question-content [data-audio-text]');
  await button.click();
  await expect(page.locator('#toast')).toContainText('未找到美式英语音色');
  await expect(button).toBeEnabled();
  expect(await page.evaluate(() => audioMetrics.speech)).toEqual([]);
});

test('browser fallback waits for explicitly American voices to load', async ({ page }) => {
  const result = await page.evaluate(async () => {
    window.testVoices = [];
    const pending = window.PromptSpeech.createUtterance('Delayed voice.');
    window.testVoices = [{ name: 'Microsoft Aria Online', lang: 'en_US' }];
    speechSynthesis.dispatchEvent(new Event('voiceschanged'));
    const utterance = await pending;
    return { name: utterance.voice.name, lang: utterance.lang, rate: utterance.rate };
  });
  expect(result).toEqual({ name: 'Microsoft Aria Online', lang: 'en-US', rate: 1 });
});

test('leaving practice cancels a pending browser voice lookup', async ({ page }) => {
  await page.route('**/api/v1/tts', (route) => route.fulfill({ json: { fallback: true } }));
  await page.evaluate(() => {
    window.testVoices = [];
  });
  await openSettings(page, 'listening', 'listen_announcement', 1);
  await start(page);
  const button = page.locator('#question-content [data-audio-text]');
  await button.click();
  await expect(button).toBeDisabled();
  await page.locator('#back-home').click();
  await page.evaluate(() => {
    window.testVoices = [{ name: 'US voice', lang: 'en-US' }];
    speechSynthesis.dispatchEvent(new Event('voiceschanged'));
  });
  expect(await page.evaluate(() => audioMetrics.speech)).toEqual([]);
});

test('weighted prompt accents use 80/10/10 boundaries and survive cache recreation', async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const originalRandom = Math.random;
    const assignments = new Map();
    const cache = new PromptAudioCache([], assignments);
    const counts = {};
    try {
      for (let index = 0; index < 1000; index += 1) {
        Math.random = () => (index + 0.5) / 1000;
        const accent = cache.accentFor(`Prompt ${index}`);
        counts[accent] = (counts[accent] || 0) + 1;
      }
      const boundaries = [0, 0.799999, 0.8, 0.899999, 0.9, 0.999999].map((value) => {
        Math.random = () => value;
        return cache.accentFor(`Boundary ${value}`);
      });
      Math.random = () => 0.5;
      const repeated = cache.accentFor('Prompt 850');
      cache.dispose();
      const review = new PromptAudioCache([], assignments);
      const restored = review.accentFor('Prompt 950');
      review.dispose();
      return { counts, boundaries, repeated, restored };
    } finally {
      cache.dispose();
      Math.random = originalRandom;
    }
  });
  expect(result).toEqual({
    counts: { 'en-US': 800, 'en-GB': 100, 'en-AU': 100 },
    boundaries: ['en-US', 'en-US', 'en-GB', 'en-GB', 'en-AU', 'en-AU'],
    repeated: 'en-GB',
    restored: 'en-AU',
  });
});

test('male and female voices are balanced independently of accent and remain stable', async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const originalRandom = Math.random;
    const assignments = new Map();
    const cache = new PromptAudioCache([], assignments);
    const counts = {};
    try {
      for (let index = 0; index < 1000; index += 1) {
        for (const genderDraw of [0.25, 0.75]) {
          const draws = [(index + 0.5) / 1000, genderDraw];
          Math.random = () => draws.shift();
          const profile = cache.voiceFor(`${index}-${genderDraw}`);
          counts[profile.voice] = (counts[profile.voice] || 0) + 1;
        }
      }
      Math.random = () => {
        throw new Error('Replay must not resample');
      };
      const original = cache.voiceFor('850-0.25');
      cache.dispose();
      const review = new PromptAudioCache([], assignments);
      const restored = review.voiceFor('850-0.25');
      review.dispose();
      return { counts, original, restored };
    } finally {
      Math.random = originalRandom;
      cache.dispose();
    }
  });
  expect(result.counts).toEqual({
    'en-US-GuyNeural': 800,
    'en-US-AriaNeural': 800,
    'en-GB-RyanNeural': 100,
    'en-GB-SoniaNeural': 100,
    'en-AU-WilliamMultilingualNeural': 100,
    'en-AU-NatashaNeural': 100,
  });
  expect(result.original).toMatchObject({
    accent: 'en-GB',
    gender: 'male',
    voice: 'en-GB-RyanNeural',
  });
  expect(result.restored).toEqual(result.original);
});

test('practice describes the random mix and ignores obsolete New Zealand preference', async ({
  page,
}) => {
  await page.evaluate(() => localStorage.setItem('toefl-prompt-accent', 'en-NZ'));
  await page.reload();
  await openSettings(page, 'listening', 'listen_announcement', 1);
  await expect(page.locator('#setup-content .prompt-accent-info')).toContainText(
    '北美（美式）约 80%',
  );
  await expect(page.locator('#setup-content .prompt-accent-info')).toContainText('英国约 10%');
  await expect(page.locator('#setup-content .prompt-accent-info')).toContainText('澳大利亚约 10%');
  await expect(page.locator('#setup-content .prompt-accent-info')).toContainText('男女声约各半');
  await expect(page.locator('input[name=prompt_accent]')).toHaveCount(0);
  await expect(page.locator('#setup-content')).not.toContainText('新西兰');
});

test('mixed accent explanation remains accessible in practice and mock setup', async ({
  page,
}, testInfo) => {
  const resources = await (await page.request.get('/api/v1/resources')).json();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await openSettings(page, 'listening', 'listen_announcement', 1);
    await expect(page.locator('#setup-content .prompt-accent-info')).toBeHidden();
    await page.locator('#setup-content .setup-audio-details summary').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#setup-content .prompt-accent-info')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: testInfo.outputPath(`accents-practice-${width}.png`),
      fullPage: true,
    });
    await page.locator('#setup-home').click();
    if (!resources.mock.some((paper) => paper.id === 'ets-test-1')) continue;
    await page.locator('#open-mocks').click();
    await page.locator('[data-paper=ets-test-1]').click();
    await expect(page.locator('#mock-view .prompt-accent-info')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: testInfo.outputPath(`accents-mock-${width}.png`),
      fullPage: true,
    });
  }
});

for (const [accent, voice, name, label, draw] of [
  ['en-GB', 'en-GB-SoniaNeural', 'Microsoft Sonia Online', '英国英语', 0.85],
  ['en-AU', 'en-AU-NatashaNeural', 'Microsoft Natasha Online', '澳大利亚英语', 0.95],
]) {
  for (const [section, task] of [
    ['listening', 'listen_announcement'],
    ['speaking', 'take_interview'],
  ]) {
    test(`${accent} ${section} randomly assigns matching online and fallback voices with stable replay`, async ({
      page,
    }) => {
      await useAudioText(page, announcement);
      const requested = [];
      await page.route('**/api/v1/tts', (route) => {
        requested.push(route.request().postDataJSON().voice);
        return route.fulfill({ json: { fallback: true } });
      });
      await page.evaluate(
        ({ accent, name, draw }) => {
          window.testVoices.push({ name, lang: accent });
          Math.random = () => draw;
        },
        { accent, name, draw },
      );
      await openSettings(page, section, task, 1);
      const selected = await start(page);
      const expected = [
        ...new Set(selected.questions.map((question) => question.audio_text).filter(Boolean)),
      ].map(() => voice);
      await expect.poll(() => requested).toEqual(expected);
      const button = page.locator('#question-content [data-audio-text]');
      await button.click();
      await expect(button).toBeEnabled();
      expect(await page.evaluate(() => audioMetrics.voices)).toEqual([name]);
      await page.evaluate(() => {
        Math.random = () => 0.5;
      });
      await button.click();
      await expect(button).toBeEnabled();
      expect(await page.evaluate(() => audioMetrics.voices)).toEqual([name, name]);
      expect(requested).toEqual(expected);
    });
  }

  test(`${accent} practice never substitutes an available American voice`, async ({ page }) => {
    await page.route('**/api/v1/tts', (route) => route.fulfill({ json: { fallback: true } }));
    await page.evaluate((draw) => {
      Math.random = () => draw;
      window.testVoices = window.testVoices.filter((voice) => voice.lang === 'en-US');
    }, draw);
    await openSettings(page, 'listening', 'listen_announcement', 1);
    await start(page);
    const button = page.locator('#question-content [data-audio-text]');
    await button.click();
    await expect(page.locator('#toast')).toContainText(`未找到${label}音色`);
    await expect(button).toBeEnabled();
    expect(await page.evaluate(() => audioMetrics.speech)).toEqual([]);
  });
}

for (const [accent, voice, name, draw] of [
  ['en-US', 'en-US-GuyNeural', 'Guy', 0.4],
  ['en-GB', 'en-GB-RyanNeural', 'Ryan', 0.85],
  ['en-AU', 'en-AU-WilliamMultilingualNeural', 'William', 0.95],
]) {
  test(`${voice} practice uses a male voice online, in fallback, and on replay`, async ({
    page,
  }) => {
    await useAudioText(page, announcement);
    const requested = [];
    await page.route('**/api/v1/tts', (route) => {
      requested.push(route.request().postDataJSON().voice);
      return route.fulfill({ json: { fallback: true } });
    });
    await page.evaluate(
      ({ accent, name, draw }) => {
        let calls = 0;
        Math.random = () => (calls++ % 2 === 0 ? draw : 0.25);
        window.testVoices.push({ name: `Microsoft ${name} Online`, lang: accent });
      },
      { accent, name, draw },
    );
    await openSettings(page, 'listening', 'listen_announcement', 1);
    await start(page);
    await expect.poll(() => requested).toEqual([voice]);
    const button = page.locator('#question-content [data-audio-text]');
    await button.click();
    await expect(button).toBeEnabled();
    await page.evaluate(() => {
      Math.random = () => 0.75;
    });
    await button.click();
    await expect(button).toBeEnabled();
    expect(await page.evaluate(() => audioMetrics.voices)).toEqual([
      `Microsoft ${name} Online`,
      `Microsoft ${name} Online`,
    ]);
    expect(requested).toEqual([voice]);
  });
}

test('assigned male speech never falls back to an available female voice', async ({ page }) => {
  await useAudioText(page, announcement);
  await page.route('**/api/v1/tts', (route) => route.fulfill({ json: { fallback: true } }));
  await page.evaluate(() => {
    Math.random = () => 0.25;
  });
  await openSettings(page, 'listening', 'listen_announcement', 1);
  await start(page);
  const button = page.locator('#question-content [data-audio-text]');
  await button.click();
  await expect(page.locator('#toast')).toContainText('男声 Guy');
  await expect(button).toBeEnabled();
  expect(await page.evaluate(() => audioMetrics.speech)).toEqual([]);
});
