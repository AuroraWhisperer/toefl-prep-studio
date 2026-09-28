const { test, expect } = require('@playwright/test');
const { openSettings, start } = require('./browser_practice_helpers.cjs');

test.beforeEach(async ({ page, request }) => {
  expect((await request.get('/')).status()).toBe(200);
  await page.route('**/api/v1/tts', (route) =>
    route.fulfill({ json: { url: null, fallback: true } }),
  );
  await page.goto('/');
});

test('answer options distinguish hover, selection and keyboard focus without losing answers', async ({
  page,
}) => {
  await openSettings(page, 'listening', 'listen_conversation', 2);
  await start(page);
  const options = page.locator('#question-content .choice-option');
  const first = options.nth(0);
  const second = options.nth(1);
  await expect(first.locator('.choice-indicator')).toHaveAttribute('aria-hidden', 'true');
  await first.click();
  await second.hover();
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(second).toHaveAttribute('aria-pressed', 'false');
  await expect(first).toHaveCSS('background-color', 'rgb(232, 241, 236)');
  await expect(second).toHaveCSS('background-color', 'rgb(247, 247, 242)');
  const selected = await first.evaluate((el) => getComputedStyle(el).backgroundColor);
  const hovered = await second.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(selected).not.toBe(hovered);
  await expect(first.locator('.choice-indicator svg')).toHaveCSS('opacity', '1');
  await expect(second.locator('.choice-indicator svg')).toHaveCSS('opacity', '0');
  await first.focus();
  await page.keyboard.press('Tab');
  await expect(second).toBeFocused();
  await expect(second).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Space');
  await expect(page.locator('.choice-option[aria-pressed="true"]')).toHaveCount(1);
  await expect(second).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#next-question').click();
  await page.locator('#previous-question').click();
  await expect(second).toHaveAttribute('aria-pressed', 'true');
  await first.press('Enter');
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(second).toHaveAttribute('aria-pressed', 'false');
});

test('long answer options wrap without covering their letter or selection indicator', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.route('**/api/v1/exam?**', async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    data.questions[0].options[0] =
      'The adviser suggests reorganizing the report around the three main skills developed during the internship, using specific examples from the daily log to explain what the student learned rather than describing every working day separately.';
    await route.fulfill({ response, json: data });
  });
  await openSettings(page, 'listening', 'listen_conversation', 2);
  await start(page);
  const option = page.locator('.choice-option').first();
  await option.click();
  const bounds = await option.evaluate((element) => {
    const row = element.getBoundingClientRect();
    const letter = element.querySelector('.choice-letter').getBoundingClientRect();
    const copy = element.querySelector('.choice-copy').getBoundingClientRect();
    const indicator = element.querySelector('.choice-indicator').getBoundingClientRect();
    return {
      lines:
        copy.height /
        parseFloat(getComputedStyle(element.querySelector('.choice-copy')).lineHeight),
      rowBottom: row.bottom,
      textBottom: copy.bottom,
      letterRight: letter.right,
      textLeft: copy.left,
      textRight: copy.right,
      indicatorLeft: indicator.left,
    };
  });
  expect(bounds.lines).toBeGreaterThan(2);
  expect(bounds.textLeft).toBeGreaterThan(bounds.letterRight);
  expect(bounds.textRight).toBeLessThan(bounds.indicatorLeft);
  expect(bounds.textBottom).toBeLessThan(bounds.rowBottom);
  await expect(option).toHaveAttribute('aria-pressed', 'true');
});

test('unrecognized discussion formatting preserves the complete original prompt', async ({
  page,
}) => {
  await page.route('**/api/v1/exam?**', async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    data.questions[0].prompt = data.questions[0].prompt.replace('Student A:', 'First participant:');
    await route.fulfill({ response, json: data });
  });
  await openSettings(page, 'writing', 'academic_discussion', 1);
  const selected = await start(page);
  await expect(page.locator('.practice-material .question-copy')).toHaveText(
    selected.questions[0].prompt,
  );
  await expect(page.locator('.discussion-posts')).toHaveCount(0);
  await expect(page.locator('#answer-input')).toHaveCount(1);
  await page
    .locator('#answer-input')
    .fill('The original discussion remains available while I write.');
  await expect(page.locator('#answered-count')).toContainText('1');
});

for (const microphone of ['unavailable', 'denied']) {
  test(`speaking exposes the manual fallback when the microphone is ${microphone}`, async ({
    page,
  }) => {
    await page.addInitScript((mode) => {
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value:
          mode === 'unavailable'
            ? undefined
            : {
                getUserMedia: async () => {
                  throw new DOMException('Denied in test', 'NotAllowedError');
                },
              },
      });
    }, microphone);
    await page.reload();
    await openSettings(page, 'speaking', 'take_interview', 1);
    await start(page);
    await expect(page.locator('#answer-input')).toBeHidden();
    await page.locator('[data-record]').click();
    await expect(page.locator('.speaking-practice-aid')).toHaveAttribute('open', '');
    await expect(page.locator('#answer-input')).toBeFocused();
    await page.locator('#answer-input').fill('My response is preserved in the practice aid.');
    await page.locator('#next-question').click();
    await expect(page.locator('#answer-input')).toBeHidden();
    await page.locator('#previous-question').click();
    await expect(page.locator('#answer-input')).toHaveValue(
      'My response is preserved in the practice aid.',
    );
    await expect(page.locator('#answer-input')).toBeVisible();
  });
}

for (const viewport of [
  { width: 2560, height: 1440, scale: 1 },
  { width: 2048, height: 1152, scale: 1.25 },
  { width: 1707, height: 960, scale: 1.5 },
  { width: 1280, height: 800, scale: 1 },
  { width: 1000, height: 800, scale: 1 },
]) {
  test.describe(`${viewport.width}px desktop`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.scale,
    });
    test('practice surfaces stay readable', async ({ page }, testInfo) => {
      expect(await page.evaluate(() => window.devicePixelRatio)).toBe(viewport.scale);
      for (const [section, task, count] of [
        ['reading', 'complete_words', 1],
        ['reading', 'read_daily_life', 2],
        ['reading', 'read_academic_passage', 1],
        ['listening', 'listen_choose_response', 8],
        ['listening', 'listen_conversation', 2],
        ['listening', 'listen_announcement', 1],
        ['listening', 'listen_academic_talk', 1],
        ['writing', 'write_email', 1],
        ['writing', 'academic_discussion', 1],
        ['writing', 'build_sentence', 10],
        ['speaking', 'listen_repeat', 1],
        ['speaking', 'take_interview', 1],
      ]) {
        await openSettings(page, section, task, count);
        const selected = await start(page);
        await page
          .locator('.question-sheet')
          .evaluate((element) =>
            Promise.all(element.getAnimations().map((animation) => animation.finished)),
          );
        const content = page.locator('#question-content');
        const bounds = await content.boundingBox();
        const usableWidth = await page.locator('.question-sheet').evaluate((element) => {
          const style = getComputedStyle(element);
          return (
            element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
          );
        });
        if (task === 'complete_words') expect(bounds.width).toBeLessThanOrEqual(usableWidth);
        else expect(bounds.width).toBeCloseTo(usableWidth, 0);
        const material = content.locator(
          section === 'speaking'
            ? '.speaking-task'
            : section === 'reading'
              ? '.reading-question-layout > :first-child'
              : '.practice-material',
        );
        const response = content.locator(
          section === 'speaking'
            ? '.speaking-practice-aid'
            : section === 'reading'
              ? '.reading-answer-panel'
              : '.practice-response',
        );
        if (task === 'complete_words') {
          await expect(content.locator('.cloze-instruction')).toHaveText(
            'Fill in the missing letters in the paragraph.',
          );
          await expect(content.locator('.cloze-letters')).toHaveCount(10);
          await expect(
            content.locator('.reading-question-layout, .practice-split-layout'),
          ).toHaveCount(0);
        } else if (task === 'build_sentence') {
          await expect(content.locator('.practice-split-layout')).toHaveCount(0);
          const context = await content.locator('.question-copy').boundingBox();
          const frame = await content.locator('.sentence-line').boundingBox();
          const words = await content.locator('.word-bank').boundingBox();
          expect(words.y).toBeGreaterThan(context.y + context.height);
          expect(frame.y).toBeGreaterThan(words.y + words.height);
          expect(frame.x).toBeCloseTo(context.x, 0);
        } else if (section === 'speaking') {
          const stage = await material.boundingBox();
          const aid = await response.boundingBox();
          expect(aid.y).toBeGreaterThan(stage.y + stage.height);
          expect(stage.x + stage.width / 2).toBeCloseTo(bounds.x + bounds.width / 2, 0);
          await expect(response).not.toHaveAttribute('open', '');
          await expect(content.locator('textarea')).toBeHidden();
          await expect(material.locator('[data-audio-text]')).toBeFocused();
        } else {
          await expect(material).toHaveCount(1);
          await expect(response).toHaveCount(1);
          const materialBounds = await material.boundingBox();
          const responseBounds = await response.boundingBox();
          if (viewport.width >= 1100) {
            expect(responseBounds.x).toBeGreaterThan(materialBounds.x + materialBounds.width);
            expect(responseBounds.y).toBeCloseTo(materialBounds.y, 0);
            expect(materialBounds.width).toBeGreaterThan(300);
            if (section === 'reading')
              expect(materialBounds.width).toBeCloseTo(responseBounds.width, 0);
            else expect(responseBounds.width).toBeGreaterThan(materialBounds.width);
          } else {
            expect(responseBounds.y).toBeGreaterThan(materialBounds.y + materialBounds.height);
            expect(responseBounds.x).toBeCloseTo(materialBounds.x, 0);
          }
        }
        if (section === 'speaking') {
          await expect(material.locator('[data-record]')).toHaveCount(1);
          await expect(material.locator('textarea')).toHaveCount(0);
          await expect(response.locator('summary')).toHaveText('练习辅助：回答转写');
          await expect(response).toContainText('不是考试作答区');
          await expect(content.locator('#answer-input')).toHaveCount(1);
          if (task === 'listen_repeat')
            await expect(content.locator('.question-copy')).toHaveText(
              selected.questions[0].prompt,
            );
          else
            await expect(material.locator('.script-details')).toContainText(
              selected.questions[0].prompt,
            );
        }
        if (task === 'academic_discussion') {
          const [professor, first, second, , instruction] =
            selected.questions[0].prompt.split('\n');
          await expect(material.locator('.question-copy')).toHaveText(professor);
          await expect(material.locator('.discussion-instruction')).toHaveText(instruction);
          await expect(response.locator('.discussion-posts p')).toHaveText([first, second]);
          await expect(content.getByText(first, { exact: true })).toHaveCount(1);
          const posts = await response.locator('.discussion-posts').boundingBox();
          const editor = await response.locator('textarea').boundingBox();
          expect(editor.y).toBeGreaterThan(posts.y + posts.height);
        }
        if (task === 'write_email') {
          await expect(material.locator('.question-copy')).toHaveText(selected.questions[0].prompt);
        }
        if (selected.questions[0].response_type === 'essay') {
          const header = await content.locator('.writing-response-header').boundingBox();
          const editor = await content.locator('textarea').boundingBox();
          expect(editor.y).toBeGreaterThan(header.y + header.height);
          await expect(content.locator('.writing-response-header [data-word-count]')).toHaveCount(
            1,
          );
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          viewport.width,
        );
        await page.screenshot({
          path: testInfo.outputPath(`${task}-initial.png`),
          fullPage: true,
          animations: 'disabled',
          scale: 'css',
        });
        if (task === 'complete_words') {
          await content.locator('.cloze-letters input').first().fill('a');
        } else if (section === 'reading') {
          await content.locator('.choice-option').nth(1).click();
          await expect(content.locator('.choice-option[aria-pressed="true"]')).toHaveCount(1);
        } else if (section === 'listening') {
          await expect(content.locator('.script-details')).not.toHaveAttribute('open', '');
          await content.locator('.choice-option').nth(1).click();
          await expect(content.locator('.choice-letter').first()).toHaveCSS('border-radius', '6px');
          const questionTop = await response
            .locator('.question-copy')
            .evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
          await material.locator('.script-details summary').click();
          if (viewport.width >= 1100) {
            expect(
              await response
                .locator('.question-copy')
                .evaluate((element) => element.getBoundingClientRect().top + window.scrollY),
            ).toBeCloseTo(questionTop, 0);
          }
        } else if (task === 'build_sentence') {
          await content.locator('[data-word]').first().click();
          await expect(content.locator('.sentence-slot:not(.is-empty)')).toHaveCount(1);
          await expect(page.locator('#answered-count')).toContainText('1');
        } else {
          if (section === 'speaking') await response.locator('summary').click();
          await content.locator('textarea').fill('This is a saved practice response.');
          await expect(page.locator('#answered-count')).toContainText('1');
        }
        await page.screenshot({
          path: testInfo.outputPath(`${task}.png`),
          fullPage: true,
          animations: 'disabled',
          scale: 'css',
        });
        await page.locator('#submit-exam').scrollIntoViewIfNeeded();
        await expect(page.locator('#submit-exam')).toBeInViewport();
      }
    });
  });
}
