const { test, expect } = require('@playwright/test');
const { openSettings, start, submit } = require('./browser_practice_helpers.cjs');

const banks = {
  reading: require('../question_bank/reading/questions.json').questions,
  writing: require('../question_bank/writing/questions.json').questions,
};

for (const desktop of [
  { scale: 1.25, width: 2048, height: 1152 },
  { scale: 1.5, width: 1707, height: 960 },
]) {
  test.describe(`expanded content at ${desktop.scale * 100}% desktop scaling`, () => {
    test.use({ viewport: { width: desktop.width, height: desktop.height }, deviceScaleFactor: desktop.scale });

    for (const [section, task, oldTotal] of [
      ['reading', 'read_academic_passage', 265],
      ['writing', 'write_email', 150],
      ['writing', 'academic_discussion', 150],
    ]) {
      test(`${task} renders new material and reveals its complete explanation only after submission`, async ({ page, request }, testInfo) => {
        expect((await request.get('/')).status()).toBe(200);
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const first = banks[section].find(q => q.task_type === task && Number(q.id.slice(1)) > oldTotal && q.difficulty !== 'easy');
        expect(first).toBeTruthy();
        const questions = first.group_id ? banks[section].filter(q => q.group_id === first.group_id) : [first];
        // Select reviewed new material deterministically; scoring and review use the real server.
        // Only public generated questions enter the page, never private reference answers.
        await page.route('**/api/v1/exam?**', async route => {
          const response = await route.fetch();
          expect(response.status()).toBe(200);
          const body = await response.json();
          await route.fulfill({ response, json: { ...body, questions, question_ids: questions.map(q => q.id), total: questions.length } });
        });
        await page.goto('/');
        await openSettings(page, section, task, 1);
        const selected = await start(page);
        expect(selected.questions.map(q => q.id)).toEqual(questions.map(q => q.id));
        for (const question of selected.questions) {
          for (const field of ['reference', 'explanation', 'correct_index', 'accepted', 'review']) {
            expect(question).not.toHaveProperty(field);
          }
        }
        await expect(page.locator('#question-content')).not.toContainText('读懂：');
        if (section === 'reading') {
          await page.locator('.choice-option').first().focus();
          await page.keyboard.press('Enter');
          await expect(page.locator('.choice-option').first()).toHaveAttribute('aria-pressed', 'true');
          await page.locator('#next-question').click();
          await page.locator('#previous-question').click();
        } else {
          await page.locator('#answer-input').fill('I would first clarify the constraints, then suggest a practical approach with a specific example.');
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath('new-task.png'), fullPage: true, animations: 'disabled' });
        const result = await submit(page);
        expect(result.feedback.map(item => item.question_id)).toEqual(questions.map(q => q.id));
        const explanation = page.locator('.review-explanations').first();
        await explanation.locator('summary').focus();
        await page.keyboard.press('Enter');
        await expect(explanation).toContainText(result.feedback[0].explanation);
        await expect(explanation).toContainText('读懂：');
        await expect(explanation).toContainText('解析：');
        await expect(explanation).toContainText('下次：');
        if (section === 'writing') {
          await expect(page.locator('.reference-answer').first()).toHaveText(result.feedback[0].reference_answer);
          expect(result.feedback[0].reference_answer.split(/\s+/).length).toBeGreaterThanOrEqual(100);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath('new-task-review.png'), fullPage: true, animations: 'disabled' });
        await page.setViewportSize({ width: 1280, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(errors).toEqual([]);
      });
    }
  });
}
