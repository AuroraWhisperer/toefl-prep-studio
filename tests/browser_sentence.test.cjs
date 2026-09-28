const { test, expect } = require('@playwright/test');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { openSettings, start, submit } = require('./browser_practice_helpers.cjs');

const root = path.resolve(__dirname, '..');
const bank = JSON.parse(
  readFileSync(path.join(root, 'question_bank/writing/questions.json'), 'utf8'),
).questions;
const keys = JSON.parse(
  readFileSync(path.join(root, 'question_bank/answers/writing.json'), 'utf8'),
);
const questions = ['W01', 'W04', 'W05', 'W07', 'W39', 'W31', 'W38', 'W51', 'W56', 'W70'].map((id) =>
  bank.find((q) => q.id === id),
);
const words = (text) => (text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || []).join(' ');

// Private keys remain in the test process, never in a browser payload.
function correctOrder(question) {
  const target = words(keys[question.id].accepted[0]).split(' ');
  function visit(slot, offset, order) {
    const fixed = words(question.template_parts[slot]).split(' ').filter(Boolean);
    if (target.slice(offset, offset + fixed.length).join(' ') !== fixed.join(' ')) return null;
    offset += fixed.length;
    if (slot === question.template_parts.length - 1) return offset === target.length ? order : null;
    for (let i = 0; i < question.word_bank.length; i++) {
      const group = words(question.word_bank[i]).split(' ');
      if (
        order.includes(i) ||
        target.slice(offset, offset + group.length).join(' ') !== group.join(' ')
      )
        continue;
      const result = visit(slot + 1, offset + group.length, [...order, i]);
      if (result) return result;
    }
    return null;
  }
  return visit(0, 0, []);
}

test.beforeEach(async ({ page, request }) => {
  expect((await request.get('/')).status()).toBe(200);
  await page.route('**/api/v1/exam?**', async (route) => {
    const response = await route.fetch();
    const payload = await response.json();
    await route.fulfill({ response, json: { ...payload, questions } });
  });
  await page.goto('/');
  await openSettings(page, 'writing', 'build_sentence', 10);
  await start(page);
});

test('blanks support keyboard, targeted insertion, drag swaps, undo and navigation', async ({
  page,
}) => {
  const slots = page.locator('.sentence-slot');
  await expect(page.locator('#answer-input')).toHaveCount(0);
  await expect(slots).toHaveCount(4);
  expect((await slots.allTextContents()).every((value) => !value.trim())).toBe(true);
  await expect(slots.first()).toHaveCSS('border-top-width', '0px');
  await expect(slots.first()).toHaveCSS('border-bottom-style', 'solid');
  await slots.nth(2).focus();
  await page.keyboard.press('Enter');
  await page.locator('[data-word]').nth(0).focus();
  await page.keyboard.press('Space');
  await expect(slots.nth(2)).not.toHaveClass(/is-empty/);
  await expect(page.locator('[data-word]').nth(0)).toBeDisabled();
  await page.locator('[data-word]').nth(1).dragTo(slots.nth(0));
  await slots.nth(2).dragTo(slots.nth(0));
  await expect(slots.nth(0)).toHaveAttribute('data-sentence-token', '0');
  await expect(slots.nth(2)).toHaveAttribute('data-sentence-token', '1');
  await slots.nth(0).click();
  await expect(page.locator('[data-word]').nth(0)).toBeEnabled();
  await expect(page.locator('.sentence-status')).toHaveText('已填 1 / 4 空');
  await page.locator('#next-question').click();
  await page.locator('#previous-question').click();
  await expect(slots.nth(2)).toHaveAttribute('data-sentence-token', '1');
  await page.locator('[data-clear-sentence]').click();
  await expect(page.locator('.sentence-slot:not(.is-empty)')).toHaveCount(0);
  await expect(page.locator('[data-word]:disabled')).toHaveCount(0);
  await expect(page.locator('#answered-count')).toContainText('0');
  for (const token of correctOrder(questions[0]))
    await page.locator('[data-word]').nth(token).click();
  await expect(page.locator('[data-word]:enabled')).toHaveCount(0);
  const scored = await submit(page);
  expect(scored.answered_questions).toBe(1);
  expect(scored.feedback[0].correct).toBe(true);
  await expect(page.locator('.review-sentence-slot')).toHaveCount(4);
});

test('fixed text is immutable and surplus or repeated tiles retain their identity', async ({
  page,
}) => {
  for (let index = 0; index < 5; index++) {
    const question = questions[index];
    const order = correctOrder(question);
    expect(order).not.toBeNull();
    await expect(page.locator('.sentence-fixed')).toHaveText(question.template_parts);
    await expect(
      page.locator('.sentence-fixed input, .sentence-fixed button, [contenteditable]'),
    ).toHaveCount(0);
    for (const token of order) await page.locator('[data-word]').nth(token).click();
    await expect(page.locator('[data-word]:enabled')).toHaveCount(
      question.word_bank.length - order.length,
    );
    if (question.word_bank.length > order.length) {
      const before = await page.locator('.sentence-line').innerText();
      await page.locator('[data-word]:enabled').click();
      expect(await page.locator('.sentence-line').innerText()).toBe(before);
    }
    if (question.id === 'W39') {
      const repeats = question.word_bank
        .map((word, i) => (word === 'I' ? i : null))
        .filter((i) => i !== null);
      expect(repeats).toHaveLength(2);
      for (const token of repeats)
        await expect(page.locator('[data-word]').nth(token)).toBeDisabled();
    }
    if (index < 4) await page.locator('#next-question').click();
  }
  const scored = await submit(page);
  expect(scored.answered_questions).toBe(5);
  expect(scored.feedback.slice(0, 5).every((item) => item.correct)).toBe(true);
});

test('clearing fixed-text sentences does not submit the fixed words as an answer', async ({
  page,
}) => {
  await page.locator('#next-question').click();
  await page.locator('[data-word]').first().click();
  await page.locator('[data-clear-sentence]').click();
  const scored = await submit(page);
  expect(scored.answered_questions).toBe(0);
  expect(scored.feedback.every((item) => !item.correct)).toBe(true);
});

test('previously cached word-only questions still render and submit safely', async ({ page }) => {
  const legacy = {
    ...questions[0],
    word_bank: ['the', 'research', 'team', 'published', 'its', 'results', 'online'],
  };
  delete legacy.template_parts;
  delete legacy.instruction;
  await page.route('**/api/v1/exam?**', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      json: { ...(await response.json()), questions: [legacy, ...questions.slice(1)] },
    });
  });
  await openSettings(page, 'writing', 'build_sentence', 10);
  await start(page);
  await expect(page.locator('.sentence-instruction')).toHaveText('Make an appropriate sentence.');
  await expect(page.locator('.sentence-slot')).toHaveCount(7);
  for (let i = 0; i < legacy.word_bank.length; i++)
    await page.locator('[data-word]').nth(i).click();
  const scored = await submit(page);
  expect(scored.feedback[0].correct).toBe(true);
});

test('sentence components isolate their state and dispose bindings before remounting', async ({
  page,
}) => {
  expect(await page.evaluate(() => typeof window.createSentenceBuilder)).toBe('function');
  const result = await page.evaluate(() => {
    const escapeHtml = (value) =>
      String(value ?? '').replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
    const builder = window.createSentenceBuilder({ escapeHtml });
    const question = {
      template_parts: ['<b>Fixed</b> ', ' ', '.'],
      word_bank: ['<img src=x>', 'words'],
    };
    const initialOrder = [null, null];
    const edits = [];
    const first = document.createElement('div');
    const second = document.createElement('div');
    first.innerHTML = builder.markup(question, initialOrder);
    second.innerHTML = builder.markup(question, initialOrder);
    const disposeFirst = builder.mount(first, {
      question,
      initialOrder,
      onChange: (edit) => edits.push(edit),
    });
    const secondEdits = [];
    const disposeSecond = builder.mount(second, {
      question,
      initialOrder,
      onChange: (edit) => secondEdits.push(edit),
    });
    first.querySelector('[data-word="0"]').click();
    const independent = second.querySelectorAll('.sentence-slot:not(.is-empty)').length === 0;
    disposeFirst();
    first.querySelector('[data-word="1"]').click();
    const countAfterDispose = edits.length;
    const disposeRemounted = builder.mount(first, {
      question,
      initialOrder: edits[0].order,
      onChange: (edit) => edits.push(edit),
    });
    first.querySelector('[data-word="1"]').click();
    disposeRemounted();
    disposeSecond();
    return {
      initialOrder,
      independent,
      countAfterDispose,
      edits,
      secondEdits,
      injectedElements: first.querySelectorAll('img, b').length,
      fixedText: first.querySelector('.sentence-fixed').textContent,
    };
  });
  expect(result.initialOrder).toEqual([null, null]);
  expect(result.independent).toBe(true);
  expect(result.countAfterDispose).toBe(1);
  expect(result.secondEdits).toEqual([]);
  expect(result.edits).toEqual([
    { order: [0, null], answer: '<b>Fixed</b> <img src=x> ____.' },
    { order: [0, 1], answer: '<b>Fixed</b> <img src=x> words.' },
  ]);
  expect(result.injectedElements).toBe(0);
  expect(result.fixedText).toBe('<b>Fixed</b> ');
});
