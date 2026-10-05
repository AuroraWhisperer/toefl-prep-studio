const { test, expect } = require('@playwright/test');
const { openSettings, start } = require('./browser_practice_helpers.cjs');
const { questions } = require('../question_bank/reading/questions.json');

const wetlandQuestions = questions.filter((q) => q.group_id === 'read_academic_passage_3');

async function useQuestions(page, items) {
  await page.route('**/api/v1/exam?**', async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    await route.fulfill({ response, json: { ...data, questions: items, total: items.length } });
  });
}

async function expectTargetInPassage(page) {
  await expect
    .poll(() =>
      page.locator('.vocabulary-highlight').evaluate((mark) => {
        const word = mark.getBoundingClientRect();
        const passage = mark.closest('.passage-copy').getBoundingClientRect();
        return word.top >= passage.top && word.bottom <= passage.bottom;
      }),
    )
    .toBe(true);
}

test.beforeEach(async ({ page, request }) => {
  expect((await request.get('/practice/reading')).status()).toBe(200);
  await page.goto('/practice/reading');
});

for (const viewport of [
  { width: 2560, height: 1440, scale: 1 },
  { width: 2048, height: 1152, scale: 1.25 },
  { width: 1707, height: 960, scale: 1.5 },
]) {
  test.describe(`${viewport.width}px vocabulary question`, () => {
    test.use({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.scale,
    });

    test('locates the target paragraph on entry and preserves manual scrolling while answering', async ({
      page,
    }, testInfo) => {
      await useQuestions(page, wetlandQuestions);
      await openSettings(page, 'reading', 'read_academic_passage', 1);
      await start(page);
      await expect(page.locator('.question-sheet')).toHaveCSS('opacity', '1');
      await expect(page.locator('.vocabulary-highlight')).toHaveCount(0);
      await page.locator('[data-question-index="3"]').click();
      const mark = page.locator('mark.vocabulary-highlight');
      await expect(mark).toHaveText('premature');
      await expect(page.locator('.passage-copy > p').nth(2).locator('mark')).toHaveCount(1);
      await expectTargetInPassage(page);
      const options = page.locator('#question-content .choice-option');
      await expect(options.first()).toBeFocused();
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await page.screenshot({
        path: testInfo.outputPath('vocabulary.png'),
        fullPage: true,
        animations: 'disabled',
        scale: 'css',
      });

      await page.keyboard.press('Tab');
      await page.keyboard.press('Space');
      await expect(options.nth(1)).toHaveAttribute('aria-pressed', 'true');
      const passage = page.locator('.passage-copy');
      await passage.press('Home');
      await expect.poll(() => passage.evaluate((element) => element.scrollTop)).toBe(0);
      await options.nth(2).click();
      await expect(options.nth(2)).toHaveAttribute('aria-pressed', 'true');
      expect(await passage.evaluate((element) => element.scrollTop)).toBe(0);
      await expect(mark).toHaveCount(1);

      await page.locator('#next-question').click();
      await expect(mark).toHaveCount(0);
      await page.locator('#previous-question').click();
      await expect(mark).toHaveText('premature');
      await expectTargetInPassage(page);
      await expect(options.nth(2)).toHaveAttribute('aria-pressed', 'true');
      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(mark).toHaveText('premature');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.setViewportSize({ width: 1000, height: 800 });
      await expect(mark).toHaveText('premature');
      await expect(passage).toHaveCSS('overflow-y', 'visible');
    });
  });
}

test('existing word and phrase questions highlight original text in the referenced paragraph', async ({
  page,
}) => {
  const vocabulary = questions.filter(
    (q) =>
      q.response_type === 'choice' && q.skills.some((s) => ['vocabulary', '语境词义'].includes(s)),
  );
  await useQuestions(page, vocabulary);
  await openSettings(page, 'reading', 'read_academic_passage', 1);
  await start(page);
  for (const [index, question] of vocabulary.entries()) {
    await page.locator(`[data-question-index="${index}"]`).click();
    const term = question.prompt.match(/['"]([^'"]+)['"]/)[1];
    const mark = page.locator('mark.vocabulary-highlight');
    await expect(mark, question.id).toHaveText(new RegExp(`^${term}$`, 'i'));
    const paragraphs = page.locator('.passage-copy > p, .document-body > p');
    expect((await paragraphs.allTextContents()).join('\n\n').replace(/\s+/g, ' ')).toBe(
      question.passage.replace(/\s+/g, ' '),
    );
    if (question.task_type === 'read_academic_passage') await expectTargetInPassage(page);
  }
});

test('a target near the end of a tall paragraph remains inside the passage viewport', async ({
  page,
}) => {
  const target = wetlandQuestions[3];
  const passage = `${'The researchers continued to observe water levels over several seasons. '.repeat(45)}They avoided premature claims.`;
  await useQuestions(page, [{ ...target, passage }]);
  await openSettings(page, 'reading', 'read_academic_passage', 1);
  await start(page);
  await expect(page.locator('mark.vocabulary-highlight')).toHaveText('premature');
  await expectTargetInPassage(page);
  expect(
    await page.locator('.passage-copy').evaluate((element) => element.scrollTop),
  ).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('paragraph references, whole words and escaped text do not highlight unrelated content', async ({
  page,
}) => {
  const target = wetlandQuestions[3];
  const passage = [
    'A stable pattern also appears here. An unstable result differs.',
    '<em>Stable</em> & reliable describes this result.',
    'The stable pattern appears again at the end.',
  ].join('\n\n');
  const items = [
    {
      ...target,
      id: 'vocabulary-second',
      prompt: 'The word “stable” in paragraph 2 is closest in meaning to',
      passage,
    },
    {
      ...target,
      id: 'vocabulary-final',
      prompt: "The word 'stable' in the final paragraph is closest in meaning to",
      passage,
    },
    {
      ...target,
      id: 'vocabulary-missing',
      prompt: "The word 'missing' most nearly means",
      passage,
    },
    {
      ...target,
      id: 'vocabulary-substring',
      prompt: "The word 'stable' most nearly means",
      passage: 'An unstable result differs.',
    },
    {
      ...target,
      id: 'detail-quote',
      skills: ['detail'],
      prompt: "Why does the author mention 'stable'?",
      passage,
    },
  ];
  await useQuestions(page, items);
  await openSettings(page, 'reading', 'read_academic_passage', 1);
  await start(page);
  const paragraphs = page.locator('.passage-copy > p');
  await expect(paragraphs.nth(1).locator('mark')).toHaveText('Stable');
  await expect(page.locator('.passage-copy em')).toHaveCount(0);
  await expect(paragraphs.nth(1)).toHaveText('<em>Stable</em> & reliable describes this result.');
  await page.locator('#next-question').click();
  await expect(paragraphs.nth(2).locator('mark')).toHaveText('stable');
  for (let index = 2; index < items.length; index++) {
    await page.locator('#next-question').click();
    await expect(page.locator('.vocabulary-highlight')).toHaveCount(0);
  }
});
