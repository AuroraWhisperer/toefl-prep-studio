const { test, expect } = require('@playwright/test');
const { randomUUID } = require('node:crypto');
const bank = require('../question_bank/listening/questions.json').questions;
const answers = require('../question_bank/answers/listening.json');

const talk = bank
  .filter((question) => question.task_type === 'listen_academic_talk')
  .sort(
    (left, right) => answers[right.id].explanation.length - answers[left.id].explanation.length,
  )[0];
const cases = [
  {
    name: 'representative sample',
    task: 'listen_choose_response',
    count: 8,
    ids: ['L367', 'L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07'],
  },
  {
    name: 'long academic explanation',
    task: 'listen_academic_talk',
    count: 1,
    ids: bank
      .filter((question) => question.group_id === talk.group_id)
      .map((question) => question.id),
  },
];

for (const desktop of [
  { width: 2560, height: 1440, scale: 1 },
  { width: 2048, height: 1152, scale: 1.25 },
  { width: 1707, height: 960, scale: 1.5 },
]) {
  test.describe(`listening explanations at ${desktop.scale * 100}%`, () => {
    test.use({
      viewport: { width: desktop.width, height: desktop.height },
      deviceScaleFactor: desktop.scale,
    });
    for (const fixture of cases) {
      test(`${fixture.name} remains readable in saved review`, async ({
        page,
        request,
      }, testInfo) => {
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        const publicResponse = await request.get(
          `/api/v1/exam?section=listening&mode=bank&task_type=${fixture.task}`,
        );
        expect(publicResponse.status()).toBe(200);
        const publicQuestions = (await publicResponse.json()).questions;
        for (const question of publicQuestions) {
          expect(question).not.toHaveProperty('explanation');
          expect(question).not.toHaveProperty('correct_index');
        }
        const id = randomUUID();
        const result = await request.post('/api/v1/exam/submit', {
          data: {
            submission_id: id,
            section: 'listening',
            mode: 'practice',
            task_type: fixture.task,
            count: fixture.count,
            question_ids: fixture.ids,
            responses: fixture.ids.map((questionId) => ({
              question_id: questionId,
              answer: (answers[questionId].correct_index + 1) % 4,
              duration_seconds: 28,
            })),
          },
        });
        expect(result.status()).toBe(200);
        const route = `/history/practice/${id}`;
        expect((await request.get(route)).status()).toBe(200);
        // A matching archived question can use the revised note without duplicating old feedback.
        await page.route(`**/api/v1/history/practice/${id}`, async (intercept) => {
          const response = await intercept.fetch();
          const record = await response.json();
          for (const item of record.result.feedback) {
            item.feedback = item.explanation = '旧版简短解析';
          }
          await intercept.fulfill({ response, json: record });
        });
        await page.goto(route);
        await expect(page.locator('#result-view')).toBeVisible();
        const disclosures = page.locator('.review-explanations');
        await disclosures.first().locator('summary').press('Enter');
        const visibleIds =
          fixture.task === 'listen_choose_response' ? [fixture.ids[0]] : fixture.ids;
        for (const [index, questionId] of visibleIds.entries()) {
          const paragraph = disclosures.nth(index).locator('p');
          await expect(paragraph).toHaveCount(1);
          await expect(paragraph).toHaveText(answers[questionId].explanation);
          await expect(paragraph).toHaveCSS('white-space', 'pre-line');
          await expect(paragraph).toContainText('下次：');
          await paragraph.scrollIntoViewIfNeeded();
          await expect(paragraph).toBeInViewport();
        }
        await expect(page.locator('#feedback-list')).not.toContainText('旧版简短解析');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await disclosures.first().scrollIntoViewIfNeeded();
        await page.screenshot({
          path: testInfo.outputPath('listening-explanation.png'),
          fullPage: true,
        });
        await page.reload();
        await disclosures.first().locator('summary').press('Enter');
        await expect(disclosures.first().locator('p')).toHaveText(
          answers[fixture.ids[0]].explanation,
        );
        if (fixture.task === 'listen_choose_response') {
          await page.locator('[data-review-index="1"]').click();
          await expect(disclosures.first().locator('p')).toHaveText(
            answers[fixture.ids[1]].explanation,
          );
          await page.locator('[data-review-index="0"]').press('Enter');
          await expect(disclosures.first().locator('p')).toHaveText(answers.L367.explanation);
        }
        await page.setViewportSize({ width: 1280, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        expect(errors).toEqual([]);
      });
    }
  });
}
