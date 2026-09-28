const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const createdSessions = new Set();

test.afterEach(async ({}, testInfo) => {
  const directory = path.join(testInfo.config.webServer.env.TOEFL_DATA_DIR, 'mock-sessions');
  for (const id of createdSessions) {
    if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('Invalid test session ID');
    await fs.rm(path.join(directory, `${id}.json`), { force: true });
    await fs.rm(path.join(directory, id), { force: true, recursive: true });
  }
  createdSessions.clear();
});

test.use({ launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] } });

async function prepare(page, context) {
  await context.grantPermissions(['microphone']);
  await page.route('**/api/v1/tts', route => route.fulfill({ status: 503, json: { detail: 'Use controlled test speech' } }));
  await page.addInitScript(() => {
    Math.random = () => 0.5;
    window.testVoices = [{ name: 'British default', lang: 'en-GB', default: true }, { name: 'Microsoft Aria Online', lang: 'en-US' }, { name: 'Microsoft Guy Online', lang: 'en-US' }];
    window.mockSpeechVoices = [];
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', { value: Object.assign(new EventTarget(), {
      getVoices() { return window.testVoices; },
      speak(utterance) { window.mockSpeechVoices.push(utterance.voice?.lang ?? null); setTimeout(() => utterance.onend?.(), 20); }, cancel() {},
    }) });
  });
  page.on('dialog', dialog => dialog.accept());
}

async function begin(page) {
  expect((await page.request.get('/')).status()).toBe(200);
  await page.goto('/');
  await page.locator('#open-mocks').click();
  await page.locator('[data-paper=ets-test-1]').click();
  await page.locator('#mock-sound-check').click();
  await expect(page.locator('#mock-sound-state')).toContainText('示范已播放');
  expect(await page.evaluate(() => window.mockSpeechVoices)).toEqual(['en-US']);
  await page.locator('#mock-mic-check').click();
  await page.locator('#mock-consent').check();
  const created = page.waitForResponse(response => response.url().endsWith('/api/v1/mock/sessions') && response.request().method() === 'POST');
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

test('mock sound check refuses non-American fallback and permits retry', async ({ page, context }) => {
  await prepare(page, context);
  expect((await page.request.get('/')).status()).toBe(200);
  await page.goto('/');
  await page.locator('#open-mocks').click();
  await page.locator('[data-paper=ets-test-1]').click();
  await page.evaluate(() => { window.testVoices = window.testVoices.slice(0, 1); });
  await page.locator('#mock-sound-check').click();
  await expect(page.locator('#mock-error')).toContainText('未找到美式英语音色');
  await expect(page.locator('#mock-sound-check')).toBeEnabled();
  await expect(page.locator('#begin-mock')).toBeDisabled();
  expect(await page.evaluate(() => window.mockSpeechVoices)).toEqual([]);
  await page.evaluate(() => { window.testVoices = [{ name: 'Microsoft Aria Online', lang: 'en-US' }]; });
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
  test(`${voice} mock sound check uses weighted assignment and preserves its replay voice`, async ({ page, context }) => {
    await prepare(page, context);
    const requested = [];
    await page.route('**/api/v1/tts', route => {
      requested.push(route.request().postDataJSON().voice);
      return route.fulfill({ json: { fallback: true } });
    });
    expect((await page.request.get('/')).status()).toBe(200);
    await page.goto('/');
    await page.locator('#open-mocks').click();
    await page.locator('[data-paper=ets-test-1]').click();
    await page.evaluate(({ accent, voice, draw, genderDraw }) => {
      window.testVoices.push({ name: voice, lang: accent });
      let calls = 0;
      Math.random = () => calls++ % 2 === 0 ? draw : genderDraw;
    }, { accent, voice, draw, genderDraw });
    await expect(page.locator('#mock-view .prompt-accent-info')).toContainText('英国约 10%');
    await expect(page.locator('#mock-view input[name=prompt_accent]')).toHaveCount(0);
    await page.locator('#mock-sound-check').click();
    await expect(page.locator('#mock-sound-state')).toContainText('示范已播放');
    expect(requested).toEqual([voice]);
    expect(await page.evaluate(() => window.mockSpeechVoices)).toEqual([accent]);
    await page.locator('#mock-mic-check').click();
    await page.locator('#mock-consent').check();
    await expect(page.locator('#begin-mock')).toBeEnabled();
    await page.evaluate(() => { Math.random = () => 0.5; });
    await page.locator('#mock-sound-check').click();
    await expect(page.locator('#mock-sound-state')).toContainText('示范已播放');
    expect(requested).toEqual([voice, voice]);
    expect(await page.evaluate(() => window.mockSpeechVoices)).toEqual([accent, accent]);
    await expect(page.locator('#begin-mock')).toBeEnabled();
  });
}

test('home has unique entries and an expandable mock paper picker', async ({ page, request }, testInfo) => {
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
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`), fullPage: true });
    await page.locator('#open-mocks').click();
    await expect(page.locator('[data-paper=ets-test-1]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`papers-${width}.png`), fullPage: true });
    await page.locator('#open-mocks').click();
  }
  await page.locator('[data-section=reading][data-action=configure]').click();
  await expect(page.locator('#setup-view')).toBeVisible();
});

test('reading saves, reload preserves deadline, and modules lock', async ({ page, context, request }) => {
  await prepare(page, context);
  await begin(page);
  const id = await page.evaluate(() => localStorage.getItem('toefl-mock-session'));
  const before = await (await request.get(`/api/v1/mock/sessions/${id}`)).json();
  await page.locator('input[data-answer]').first().fill('ey');
  await expect(page.locator('#mock-save')).toHaveText('已保存');
  await page.reload();
  await page.locator('#resume-mock').click();
  await expect(page.locator('input[data-answer]').first()).toHaveValue('ey');
  const after = await (await request.get(`/api/v1/mock/sessions/${id}`)).json();
  expect(after.deadline).toBe(before.deadline);
  await submitPhase(page);
  await expect(page.locator('.mock-heading h2')).toHaveText('Reading · Module 2');
  expect((await request.post(`/api/v1/mock/sessions/${id}`, { data: { action:'save', phase_index:0 } })).status()).toBe(409);
  await page.locator('#quit-mock').click();
  await expect(page.locator('#landing-view')).toBeVisible();
});

test('complete all nine stages including synthetic microphone recording', async ({ page, context, request }, testInfo) => {
  test.setTimeout(120000);
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await prepare(page, context); await begin(page);
  const id = await page.evaluate(() => localStorage.getItem('toefl-mock-session'));
  await page.screenshot({ path: testInfo.outputPath('reading.png'), fullPage:true });
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
  for (let module=0; module<2; module++) await submitPhase(page);
  await expect(page.locator('.mock-heading h2')).toHaveText('Listening · Module 1');
  for (let index=0; index<34; index++) {
    await expect(page.locator('#mock-listening-answers')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#mock-next')).toBeEnabled({ timeout: 15000 });
    await expect(page.locator('#mock-play')).toBeHidden();
    if (index===0) {
      await expect(page.locator('.mock-question')).not.toContainText('Does the building have a parking garage');
      await expect(page.locator('#mock-response-clock')).toHaveText(/作答剩余 \d+ 秒/);
      await expect(page.locator('#mock-response-progress')).toBeVisible();
      await page.screenshot({ path:testInfo.outputPath('listening.png'), fullPage:true });
    }
    await page.locator('.mock-choice input').first().check();
    await page.locator('#mock-next').click();
    await expect.poll(async () => {
      const s = await (await request.get(`/api/v1/mock/sessions/${id}`)).json();
      return s.phase_index * 100 + s.item_index;
    }).toBe(index<17 ? 200+index+1 : index===17 ? 300 : index<33 ? 300+index-17 : 400);
    if (index===17 || index===33) await beginStage(page);
  }
  await expect(page.locator('.mock-heading h2')).toHaveText('Build a Sentence');
  await page.locator('[data-word="2"]').dragTo(page.locator('[data-slot="0"]'));
  for (const token of [0,5,4,6,3]) {
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
  expect(sentence.answers['ets-test-1-writing-sentence-1']).toBe('he wanted to know when it ended.');
  await page.locator('#mock-next').click();
  await page.locator('#mock-prev').click();
  await expect(page.locator('.mock-word-slot:not(.is-empty)')).toHaveCount(6);
  await page.reload(); await page.locator('#resume-mock').click();
  await expect(page.locator('.mock-word-slot:not(.is-empty)')).toHaveCount(6);
  await page.screenshot({path:testInfo.outputPath('sentence-desktop.png')});
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('sentence-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
  await submitPhase(page);
  await expect(page.locator('.mock-heading h2')).toHaveText('Write an Email');
  const emailAnswer = 'Dear Maria, I will be traveling for a meeting. Could you suggest a quiet restaurant? Thank you.';
  await page.locator('textarea').fill(emailAnswer);
  await submitPhase(page);
  await expect(page.locator('.mock-heading h2')).toHaveText('Academic Discussion');
  const discussionAnswer = 'I agree that remote work may continue to grow because people value flexibility.';
  await page.locator('textarea').fill(discussionAnswer);
  await submitPhase(page);
  for (let index=0; index<11; index++) {
    await expect(page.locator('#mock-record-state')).toHaveText('正在录音，请回答。');
    await expect(page.locator('#mock-next')).toBeEnabled();
    if (index===0) {
      await expect(page.locator('#mock-response-clock')).toHaveText(/作答剩余 \d+ 秒/);
      await expect(page.locator('#mock-response-progress')).toBeVisible();
      await page.screenshot({path:testInfo.outputPath('speaking.png')});
    }
    await page.waitForTimeout(250);
    await page.locator('#mock-next').click();
    await expect.poll(async () => {
      const s = await (await request.get(`/api/v1/mock/sessions/${id}`)).json();
      return s.phase_index * 100 + s.item_index;
    }).toBe(index<6 ? 700+index+1 : index===6 ? 800 : index<10 ? 800+index-6 : 900);
    if(index===6) await beginStage(page);
  }
  await expect(page.locator('.mock-heading h1')).toContainText('模考复盘');
  await expect(page.locator('.mock-review-list > details')).toHaveCount(97);
  await expect(page.locator('.mock-review-list audio')).toHaveCount(11);
  await expect(page.locator('.mock-learning-notes')).toHaveCount(97);
  const firstReview = page.locator('.mock-review-list > details').first();
  await firstReview.locator(':scope > summary').click();
  const learningNotes = firstReview.locator('.mock-learning-notes');
  await expect(learningNotes.locator('summary')).toContainText('非 ETS 官方解析');
  await learningNotes.locator('summary').click();
  await expect(learningNotes.locator('.mock-explanation')).toBeVisible();
  await expect(learningNotes.locator('.mock-explanation')).toContainText('读懂：');
  await expect(learningNotes.locator('.mock-explanation')).toContainText('解析：');
  await expect(learningNotes.locator('.mock-explanation')).toContainText('下次：');
  await expect(learningNotes.locator('.mock-explanation')).toHaveCSS('white-space', 'pre-line');
  const result = await (await request.get(`/api/v1/mock/sessions/${id}/result`)).json();
  expect(result.objective_total).toBe(84); expect(result.pending_review).toBe(13);
  expect(result.review.find(q => q.kind === 'email').answer).toBe(emailAnswer);
  expect(result.review.find(q => q.kind === 'discussion').answer).toBe(discussionAnswer);
  expect((await request.get(result.review.find(q=>q.recording_url).recording_url)).status()).toBe(200);
  await page.screenshot({ path:testInfo.outputPath('result.png') });
  await page.locator('[data-mock-home]').click();
  await page.locator('#open-history').click();
  await page.locator('#history-tab-mock').click();
  await page.locator(`[data-history-id='${id}']`).click();
  await expect(page.locator('.app-shell > section:not([hidden])')).toHaveCount(1);
  await expect(page.locator('.app-shell > section:not([hidden])')).toHaveAttribute('id', 'mock-view');
  await expect(page.getByRole('button', { name: '返回记录' })).toBeFocused();
  await expect(page.locator('.mock-review-list > details')).toHaveCount(97);
  await expect(page.locator('.mock-review-list audio')).toHaveCount(11);
  await page.getByRole('button', { name: '返回记录' }).click();
  await expect(page.locator('.app-shell > section:not([hidden])')).toHaveCount(1);
  await expect(page.locator('.app-shell > section:not([hidden])')).toHaveAttribute('id', 'history-view');
  await expect(page.locator('#history-title')).toBeFocused();
  await expect(page.locator('#history-tab-mock')).toHaveAttribute('aria-selected', 'true');
  expect(errors).toEqual([]);
});
