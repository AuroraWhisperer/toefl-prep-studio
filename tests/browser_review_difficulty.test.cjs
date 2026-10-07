const { test, expect } = require('@playwright/test');
const { randomUUID } = require('node:crypto');
const writing = require('../question_bank/writing/questions.json').questions;

test('review uses archived difficulty and labels missing or unknown levels without guessing', async ({
  page,
  request,
}) => {
  const id = randomUUID();
  const questions = writing.filter((q) => q.task_type === 'build_sentence').slice(0, 10);
  const response = await request.post('/api/v1/exam/submit', {
    data: {
      submission_id: id,
      section: 'writing',
      mode: 'practice',
      task_type: 'build_sentence',
      count: 10,
      question_ids: questions.map((q) => q.id),
      responses: [],
    },
  });
  expect(response.status()).toBe(200);
  const savedLevel = questions[0].difficulty === 'hard' ? 'easy' : 'hard';
  await page.route(`**/api/v1/history/practice/${id}`, async (route) => {
    const response = await route.fetch();
    const record = await response.json();
    record.questions[0].difficulty = savedLevel;
    delete record.questions[1].difficulty;
    record.questions[2].difficulty = 'unrated';
    await route.fulfill({ response, json: record });
  });
  const url = `/history/practice/${id}`;
  expect((await request.get(url)).status()).toBe(200);
  await page.goto(url);
  await expect(page.locator('.review-difficulty')).toHaveText(
    `难度：${savedLevel === 'easy' ? 'Easy' : 'Hard'}`,
  );
  for (const index of [1, 2]) {
    await page.locator(`[data-review-index="${index}"]`).press('Enter');
    await expect(page.locator('.review-difficulty')).toHaveText('难度：待分级');
  }
});

test('mock review explicitly marks all ungraded items as awaiting difficulty classification', async ({
  page,
  request,
}) => {
  const id = randomUUID();
  await page.route(`**/api/v1/history/mock/${id}`, (route) =>
    route.fulfill({
      json: {
        id,
        result: {
          paper: { title: 'Mock review fixture', source_url: 'https://www.ets.org/' },
          objective_correct: 0,
          objective_total: 2,
          pending_review: 2,
          notice: 'Test fixture',
          review: ['阅读', '听力', '写作', '口语'].map((phase_title, index) => ({
            phase_title,
            number: index + 1,
            correct: index < 2 ? false : null,
            answer: '',
            reference: 'Reference',
            pages: [],
          })),
        },
      },
    }),
  );
  const url = `/history/mock/${id}`;
  expect((await request.get(url)).status()).toBe(200);
  await page.goto(url);
  const items = page.locator('.mock-review-list > details');
  await expect(items).toHaveCount(4);
  await expect(page.locator('.mock-review-list .review-difficulty')).toHaveText(
    Array(4).fill('难度：待分级'),
  );
  await items.first().locator('summary').press('Enter');
  await expect(items.first().locator('.review-difficulty')).toBeVisible();
});
