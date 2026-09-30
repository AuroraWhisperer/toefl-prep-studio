const { test, expect } = require('@playwright/test');
const { openSettings, start, submit } = require('./browser_practice_helpers.cjs');

const banks = {
  reading: require('../question_bank/reading/questions.json').questions,
  listening: require('../question_bank/listening/questions.json').questions,
  writing: require('../question_bank/writing/questions.json').questions,
};

for (const desktop of [
  { scale: 1.25, width: 2048, height: 1152 },
  { scale: 1.5, width: 1707, height: 960 },
]) {
  test.describe(`expanded content at ${desktop.scale * 100}% desktop scaling`, () => {
    test.use({
      viewport: { width: desktop.width, height: desktop.height },
      deviceScaleFactor: desktop.scale,
    });

    for (const [section, task, oldTotal, count] of [
      ['reading', 'complete_words', 1005, 1],
      ['reading', 'read_daily_life', 795, 2],
      ['reading', 'read_academic_passage', 795, 1],
      ['listening', 'listen_choose_response', 705, 8],
      ['listening', 'listen_conversation', 705, 2],
      ['listening', 'listen_announcement', 705, 1],
      ['listening', 'listen_academic_talk', 705, 1],
      ['writing', 'write_email', 150, 1],
      ['writing', 'academic_discussion', 150, 1],
    ]) {
      test(`${task} renders new material and reveals its complete explanation only after submission`, async ({
        page,
        request,
      }, testInfo) => {
        expect((await request.get(`/practice/${section}`)).status()).toBe(200);
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        const groups = new Map();
        for (const question of banks[section]) {
          if (question.task_type !== task || Number(question.id.slice(1)) <= oldTotal) continue;
          const key = question.group_id || question.id;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(question);
        }
        const materials = [...groups.values()].sort(
          (a, b) =>
            Number(a.every((q) => q.difficulty === 'easy')) -
              Number(b.every((q) => q.difficulty === 'easy')) || b.length - a.length,
        );
        expect(materials.length).toBeGreaterThanOrEqual(count);
        const questions = materials.slice(0, count).flat();
        await page.route('**/api/v1/tts', (route) =>
          route.fulfill({ json: { url: null, fallback: true } }),
        );
        // Select reviewed new material deterministically; scoring and review use the real server.
        // Only public generated questions enter the page, never private reference answers.
        await page.route('**/api/v1/exam?**', async (route) => {
          const response = await route.fetch();
          expect(response.status()).toBe(200);
          const body = await response.json();
          await route.fulfill({
            response,
            json: {
              ...body,
              questions,
              question_ids: questions.map((q) => q.id),
              total: questions.length,
            },
          });
        });
        await page.goto('/');
        await openSettings(page, section, task, count);
        const selected = await start(page);
        expect(selected.questions.map((q) => q.id)).toEqual(questions.map((q) => q.id));
        for (const question of selected.questions) {
          for (const field of ['reference', 'explanation', 'correct_index', 'accepted', 'review']) {
            expect(question).not.toHaveProperty(field);
          }
        }
        await expect(page.locator('#question-content')).not.toContainText('读懂：');
        if (task === 'complete_words') {
          await expect(page.locator('.cloze-letters')).toHaveCount(10);
          const input = page.locator('[data-answer-id]').first();
          expect(await input.getAttribute('data-answer-id')).toMatch(/^R\d{4}$/);
          await input.fill('x');
          await expect(input).toHaveValue('x');
        } else if (questions[0].response_type === 'choice') {
          await page.locator('.choice-option').first().focus();
          await page.keyboard.press('Enter');
          await expect(page.locator('.choice-option').first()).toHaveAttribute(
            'aria-pressed',
            'true',
          );
          await page.locator('#next-question').click();
          await page.locator('#previous-question').click();
          await expect(page.locator('.choice-option').first()).toHaveAttribute(
            'aria-pressed',
            'true',
          );
        } else {
          await page
            .locator('#answer-input')
            .fill(
              'I would first clarify the constraints, then suggest a practical approach with a specific example.',
            );
        }
        if (section === 'listening') {
          const script = page.locator('#question-content .script-details');
          await expect(script).not.toHaveAttribute('open', '');
          await script.locator('summary').click();
          await expect(script).toContainText(questions[0].audio_text.split('\n')[0]);
          if (task === 'listen_conversation') {
            await expect(script.locator('p')).toHaveCount(
              questions[0].audio_text.split('\n').length,
            );
          }
          await script.locator('summary').click();
          await expect(script).not.toHaveAttribute('open', '');
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await page.screenshot({
          path: testInfo.outputPath('new-task.png'),
          fullPage: true,
          animations: 'disabled',
        });
        const result = await submit(page);
        expect(result.feedback.map((item) => item.question_id)).toEqual(questions.map((q) => q.id));
        const explanation = page.locator('.review-explanations').first();
        await explanation.locator('summary').focus();
        await page.keyboard.press('Enter');
        await expect(explanation).toContainText(result.feedback[0].explanation);
        await expect(explanation).toContainText('读懂：');
        await expect(explanation).toContainText('解析：');
        await expect(explanation).toContainText('下次：');
        if (section === 'writing') {
          await expect(page.locator('.reference-answer').first()).toHaveText(
            result.feedback[0].reference_answer,
          );
          expect(result.feedback[0].reference_answer.split(/\s+/).length).toBeGreaterThanOrEqual(
            100,
          );
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await page.screenshot({
          path: testInfo.outputPath('new-task-review.png'),
          fullPage: true,
          animations: 'disabled',
        });
        await page.setViewportSize({ width: 1280, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        expect(errors).toEqual([]);
      });
    }
  });
}
