const { test, expect } = require('@playwright/test');

async function openFoundations(page, request) {
  expect((await request.get('/foundations')).status()).toBe(200);
  await page.goto('/foundations');
  await expect(page.locator('#foundations-title')).toBeVisible();
}

test('learning help supports keyboard, history and refresh without starting a round', async ({
  page,
  request,
}) => {
  const errors = [];
  const studyRequests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (request.method() !== 'GET' || request.url().includes('/api/v1/exam?')) {
      studyRequests.push(`${request.method()} ${request.url()}`);
    }
  });
  expect((await request.get('/')).status()).toBe(200);
  await page.goto('/');
  const entry = page.getByRole('button', { name: '语法与搭配', exact: true });
  await expect(entry).toHaveCount(1);
  await entry.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/foundations$/);
  await expect(page.locator('#foundations-title')).toBeFocused();
  await expect(page.locator('.app-shell > section:not([hidden])')).toHaveCount(1);
  await expect(page.locator('.app-shell > section:not([hidden])')).toHaveAttribute(
    'id',
    'foundations-view',
  );
  await page.locator('#foundations-query').fill('because of');
  const topic = page.locator('#foundation-because-because-of');
  await topic.locator('summary').focus();
  await page.keyboard.press('Space');
  await expect(topic).toHaveAttribute('open', '');
  await expect(topic).toContainText('because of 后接名词');
  await page.goBack();
  await expect(entry).toBeFocused();
  await page.goForward();
  await expect(page.locator('#foundations-query')).toHaveValue('because of');
  await expect(topic).toHaveAttribute('open', '');
  expect((await request.get('/foundations')).status()).toBe(200);
  await page.reload();
  await expect(page.locator('#foundations-query')).toHaveValue('');
  await page.getByRole('button', { name: '返回练习首页', exact: true }).click();
  await expect(entry).toBeFocused();
  await entry.click();
  await expect(page.locator('#foundations-topics > details')).toHaveCount(400);
  await page.locator('#foundations-home').click();
  await page.locator('#open-exam-guide').click();
  await expect(page.locator('#exam-guide')).toBeVisible();
  expect(studyRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test('Chinese and English search, chapter filters and empty-state recovery work together', async ({
  page,
  request,
}) => {
  await openFoundations(page, request);
  const search = page.getByRole('searchbox', { name: '查找知识点' });
  await search.fill('  DEPEND   ON  ');
  await expect(page.locator('#foundation-depend-focus')).toBeVisible();
  await expect(page.locator('#foundation-main-clause')).toBeHidden();
  await search.fill('申请');
  await expect(page.locator('#foundation-apply-ask')).toBeVisible();
  await expect(page.locator('#foundation-deadlines')).toBeVisible();
  await page.getByRole('button', { name: '课程、作业与学术事务', exact: true }).click();
  await expect(page.locator('#foundation-apply-ask')).toBeHidden();
  await expect(page.locator('#foundation-deadlines')).toBeVisible();
  await expect(page.locator('#foundations-category-title')).toHaveText('课程、作业与学术事务');
  await search.fill('no-matching-topic-123');
  await expect(page.locator('#foundations-empty')).toBeVisible();
  await expect(page.locator('#foundations-count')).toHaveText('0 个知识点符合搜索');
  await page.getByRole('button', { name: '重置筛选', exact: true }).click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  await expect(page.getByRole('button', { name: '全部内容', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('#foundations-count')).toHaveText('400 个知识点可查阅');
  await expect(page.locator('#foundations-empty')).toBeHidden();
  await search.fill('<img src=x onerror=alert(1)>');
  await expect(page.locator('#foundations-empty')).toBeVisible();
  await expect(page.locator('#foundations-topics img')).toHaveCount(0);
});

test('chapters contain complete bilingual notes, unique entries and useful distinctions', async ({
  page,
  request,
}) => {
  await openFoundations(page, request);
  const chapters = await page.evaluate(() => window.foundationChapters);
  expect(chapters).toHaveLength(24);
  const topics = chapters.flatMap((chapter) => chapter.topics);
  expect(topics).toHaveLength(400);
  expect(topics.reduce((count, topic) => count + topic.examples.length, 0)).toBe(453);
  expect(new Set(topics.map((topic) => topic.id)).size).toBe(topics.length);
  expect(new Set(topics.map((topic) => topic.title)).size).toBe(topics.length);
  expect(new Set(topics.map((topic) => topic.pattern)).size).toBe(topics.length);
  for (const removedId of ['word-forms', 'basic-order', 'a-an', 'present-simple']) {
    expect(topics.find((topic) => topic.id === removedId)).toBeUndefined();
  }
  expect(await page.locator('#foundations-chapters h2').allTextContents()).toEqual([
    '托福语法',
    '核心搭配',
    '托福场景',
  ]);
  for (const chapter of chapters) {
    expect(chapter.topics.length).toBeGreaterThanOrEqual(8);
    for (const topic of chapter.topics) {
      for (const key of ['title', 'pattern', 'read', 'explain', 'next']) {
        expect(topic[key].trim().length).toBeGreaterThan(0);
      }
      expect(topic.examples.length).toBeGreaterThan(0);
      for (const [english, chinese] of topic.examples) {
        expect(english).toMatch(/[A-Za-z]/);
        expect(chinese).toMatch(/[\u4e00-\u9fff]/);
      }
    }
  }
  for (const chapter of chapters) {
    await page.getByRole('button', { name: chapter.title, exact: true }).click();
    await expect(page.locator('.foundation-topic:not([hidden])')).toHaveCount(
      chapter.topics.length,
    );
    const first = page.locator(`#foundation-${chapter.topics[0].id}`);
    if ((await first.getAttribute('open')) === null) {
      await first.locator('summary').click();
    }
    await expect(first.locator('.foundation-body > p')).toHaveCount(3);
    await expect(first.locator('.foundation-body > p > strong')).toHaveText([
      '读懂：',
      '解析：',
      '下次：',
    ]);
    await expect(first.locator('[lang="en"]').first()).toBeVisible();
  }
  expect(topics.find((topic) => topic.id === 'similar-different').explain).toContain('变体');
  expect(topics.find((topic) => topic.id === 'obligation').explain).toContain('禁止');
  expect(topics.find((topic) => topic.id === 'used-to').explain).toContain('用途');
  await expect(page.getByRole('link', { name: 'ETS 公开样题', exact: true })).toHaveAttribute(
    'href',
    'https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-1.pdf',
  );
  for (const link of await page.locator('.foundations-sources a').all()) {
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
});

test('expanded TOEFL content can be found by usage, phrase and task context', async ({
  page,
  request,
}) => {
  await openFoundations(page, request);
  const search = page.locator('#foundations-query');
  for (const [term, id] of [
    ['account for', 'account-for'],
    ['百分点', 'percentage-points'],
    ['extension until', 'extension-until'],
    ['habitat fragmentation', 'habitat-loss'],
    ['would rather', 'would-rather-clause'],
    ['digital divide', 'digital-divide'],
  ]) {
    await search.fill(term);
    const topic = page.locator(`#foundation-${id}`);
    await expect(topic).toBeVisible();
    await topic.locator('summary').click();
    await expect(topic.locator('.foundation-body')).toBeVisible();
    await expect(topic.locator('.foundation-examples figcaption')).toBeVisible();
  }
  await search.fill('听力回应');
  await expect(page.locator('.foundation-topic:not([hidden])')).toHaveCount(16);
  await expect(page.locator('#foundation-why-dont')).toBeVisible();
  await expect(page.locator('#foundation-account-for')).toBeHidden();
});

test('learning content is available when practice metadata fails', async ({ page, request }) => {
  await page.route('**/api/v1/meta', (route) =>
    route.fulfill({ status: 503, json: { detail: 'Unavailable' } }),
  );
  await openFoundations(page, request);
  await expect(page.locator('#foundations-count')).toHaveText('400 个知识点可查阅');
  await page.locator('#foundations-query').fill('look forward to');
  await page.locator('#foundation-prepositional-to summary').click();
  await expect(page.locator('#foundation-prepositional-to .foundation-body')).toContainText(
    '这里 to 是介词',
  );
});

for (const [width, height, scale] of [
  [2560, 1440, 1],
  [2048, 1040, 1.25],
  [1707, 840, 1.5],
  [1280, 720, 1],
]) {
  test.describe(`foundations at ${width}x${height}, scale ${scale}`, () => {
    test.use({ viewport: { width, height }, deviceScaleFactor: scale });
    test('homepage geometry is preserved and the reference fits the desktop', async ({
      page,
      request,
    }, testInfo) => {
      expect((await request.get('/')).status()).toBe(200);
      await page.goto('/');
      await expect(page.locator('#section-grid .section-card')).toHaveCount(4);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('#open-foundations')).toBeInViewport({ ratio: 1 });
      await expect(page.locator('#open-exam-guide')).toBeInViewport({ ratio: 1 });
      const geometry = await page.evaluate(() => {
        const cards = () =>
          [...document.querySelectorAll('#landing-view .training-card')].map((node) =>
            node.getBoundingClientRect().toJSON(),
          );
        const after = cards();
        const nav = document.querySelector('.learning-links');
        const entry = document.querySelector('#open-foundations');
        const guide = document.querySelector('#open-exam-guide');
        nav.before(guide);
        nav.remove();
        const before = cards();
        guide.before(nav);
        nav.append(entry, guide);
        return { before, after };
      });
      expect(geometry.after).toEqual(geometry.before);
      for (const card of geometry.after) expect(card.bottom).toBeLessThanOrEqual(height);
      await page.screenshot({ path: testInfo.outputPath('homepage.png') });
      await page.locator('#open-foundations').click();
      await expect(page.locator('#foundation-main-clause .foundation-body')).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath('foundations.png') });
      await page.getByRole('button', { name: '非谓语与动词结构', exact: true }).click();
      await page.locator('#foundation-prepositional-to summary').click();
      await expect(page.locator('#foundation-prepositional-to .foundation-body')).toBeVisible();
      await page.screenshot({
        path: testInfo.outputPath('collocation-detail.png'),
        fullPage: true,
      });
      const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
      expect(await fits()).toBe(true);
      await page.setViewportSize({ width: 1000, height: 740 });
      expect(await fits()).toBe(true);
      await page.getByRole('button', { name: '时间、期限与进度', exact: true }).focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#foundation-by-until')).toBeVisible();
    });
  });
}
