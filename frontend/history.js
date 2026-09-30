(() => {
  'use strict';
  const view = document.querySelector('#history-view');
  const landing = document.querySelector('#landing-view');
  const list = document.querySelector('#history-list');
  const panel = document.querySelector('#history-panel');
  const count = document.querySelector('#history-count');
  const tabs = document.querySelector('#history-tabs');
  const form = document.querySelector('#history-filters');
  const from = document.querySelector('#history-from');
  const to = document.querySelector('#history-to');
  const filterError = document.querySelector('#history-filter-error');
  const pagination = document.querySelector('#history-pagination');
  const previous = document.querySelector('#history-prev');
  const next = document.querySelector('#history-next');
  const pageLabel = document.querySelector('#history-page');
  const management = document.querySelector('#history-management');
  const managementStatus = document.querySelector('#history-management-status');
  const names = { practice: '单项训练', mock: '模拟考', test: '测验' };
  const mark = document.querySelector('.archive-mark').outerHTML;
  let category = 'practice',
    page = 1,
    startDate = '',
    endDate = '',
    requestId = 0,
    controller;
  let managing = false;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

  async function api(path, signal, options = {}) {
    const response = await fetch(path, { ...options, signal });
    const data = await response.json();
    if (!response.ok)
      throw new Error(typeof data.detail === 'string' ? data.detail : '读取失败，请稍后重试。');
    return data;
  }

  function open() {
    appViews.show(view);
    document.querySelectorAll('audio').forEach((audio) => audio.pause());
    window.dispatchEvent(new Event('history-opened'));
    window.scrollTo({ top: 0, behavior: 'instant' });
    appViews.focus(document.querySelector('#history-title'));
    load();
  }

  function close() {
    appViews.show(landing, {
      leave() {
        management.open = false;
        requestId += 1;
        controller?.abort();
      },
      enter() {
        document.querySelector('#open-history').focus({ preventScroll: true });
      },
    });
  }

  function empty(filtered) {
    const heading = filtered ? '这段时间没有记录' : `还没有${names[category]}记录`;
    const message = filtered
      ? '试试扩大日期范围，或清除日期查看全部记录。'
      : category === 'test'
        ? '完成首页的综合测验后，可以在这里回看四科答案、反馈与录音。'
        : category === 'mock'
          ? '完成并提交整套模考试卷后，可以在这里回看答案与录音。'
          : '完成任一科的专项或整科练习并提交，答案与反馈就会保存在这里。';
    list.innerHTML = `<div class="history-empty">${mark}<h2>${heading}</h2><p>${message}</p>${filtered ? '<button class="text-button" data-history-clear type="button">查看全部日期 →</button>' : category !== 'test' ? '<button class="text-button" data-history-home type="button">返回首页开始练习 →</button>' : ''}</div>`;
  }

  function row(record) {
    const date = new Date(record.completed_at * 1000);
    const day = date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const time = date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const score =
      record.possible === 0 && record.manual_review_count > 0
        ? '待人工复核'
        : `${record.earned} / ${record.possible}`;
    return `<article class="history-row"><div class="history-row-copy"><h2>${esc(record.title)}</h2><p>${esc(record.subtitle)} · 已答 ${record.answered} / ${record.total} 题</p></div><time datetime="${date.toISOString()}">${day}<span>${time}</span></time><div class="history-row-score">${esc(score)}<small>${esc(record.score_label)}</small></div><button class="text-button" type="button" data-history-id="${esc(record.id)}" aria-label="复盘 ${esc(record.title)} ${day} ${time}">查看复盘 →</button></article>`;
  }

  async function load() {
    const current = ++requestId;
    controller?.abort();
    controller = new AbortController();
    panel.setAttribute('aria-busy', 'true');
    pagination.hidden = true;
    count.textContent = '正在读取记录…';
    list.replaceChildren();
    const params = new URLSearchParams({ category, page, page_size: 10 });
    if (startDate) params.set('start_at', new Date(`${startDate}T00:00:00`).toISOString());
    if (endDate) {
      const end = new Date(`${endDate}T00:00:00`);
      end.setDate(end.getDate() + 1);
      params.set('end_at', end.toISOString());
    }
    try {
      const data = await api(`/api/v1/history?${params}`, controller.signal);
      if (current !== requestId) return;
      page = data.page;
      count.textContent = `${data.total} 条记录`;
      if (data.items.length) list.innerHTML = data.items.map(row).join('');
      else empty(Boolean(startDate || endDate));
      pagination.hidden = data.pages <= 1;
      previous.disabled = page <= 1;
      next.disabled = page >= data.pages;
      pageLabel.textContent = `${page} / ${data.pages} 页`;
    } catch (error) {
      if (current !== requestId || error.name === 'AbortError') return;
      count.textContent = '记录未能加载';
      list.innerHTML = `<div class="history-empty" role="alert"><h2>暂时无法读取学习档案</h2><p>${esc(error.message)}</p><button class="secondary-button" data-history-retry type="button">重新加载</button></div>`;
    } finally {
      if (current === requestId) panel.setAttribute('aria-busy', 'false');
    }
  }

  function selectCategory(button, reload = true) {
    category = button.dataset.historyCategory;
    page = 1;
    tabs.querySelectorAll('button').forEach((tab) => {
      tab.setAttribute('aria-selected', String(tab === button));
      tab.tabIndex = tab === button ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', button.id);
    if (reload) load();
  }

  function clearDates() {
    from.value = to.value = startDate = endDate = '';
    filterError.hidden = true;
    page = 1;
    load();
  }

  document.querySelector('#open-history').addEventListener('click', open);
  document.querySelector('#history-home').addEventListener('click', close);
  window.addEventListener('open-history', open);
  tabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-history-category]');
    if (button) selectCategory(button);
  });
  tabs.addEventListener('keydown', (event) => {
    const buttons = [...tabs.querySelectorAll('button')];
    const index = buttons.indexOf(document.activeElement);
    if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const target =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? 2
          : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
    buttons[target].focus();
    selectCategory(buttons[target]);
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (from.value && to.value && from.value > to.value) {
      filterError.textContent = '起始日期不能晚于截止日期。';
      filterError.hidden = false;
      from.focus();
      return;
    }
    filterError.hidden = true;
    startDate = from.value;
    endDate = to.value;
    page = 1;
    load();
  });
  document.querySelector('#history-clear').addEventListener('click', clearDates);
  management.querySelector('summary').addEventListener('click', (event) => {
    if (managing) event.preventDefault();
  });
  view.addEventListener('click', (event) => {
    if (!management.contains(event.target)) management.open = false;
  });
  management.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      management.open = false;
      management.querySelector('summary').focus();
    }
  });
  management.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-history-reset]');
    if (!button || managing) return;
    const scope = button.dataset.historyReset;
    const message =
      scope === 'probability'
        ? '重置抽题概率？\n已提交题目将不再因过去的练习而降低抽中权重。答题记录和录音全部保留，新提交的练习会重新累计。'
        : '清空全部答题记录并重置抽题概率？\n这会永久删除所有分类（不限当前筛选）的已归档记录、答案及录音，无法恢复。进行中或已放弃的模考不受影响。';
    management.open = false;
    management.querySelector('summary').focus();
    if (!window.confirm(message)) return;
    managing = true;
    management.setAttribute('aria-busy', 'true');
    management.querySelectorAll('button').forEach((action) => {
      action.disabled = true;
    });
    managementStatus.dataset.state = 'pending';
    managementStatus.textContent =
      scope === 'probability' ? '正在重置抽题概率…' : '正在清空记录与概率…';
    managementStatus.hidden = false;
    if (scope === 'all') {
      requestId += 1;
      controller?.abort();
    }
    try {
      await api('/api/v1/history/reset', undefined, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope, confirm: true }),
      });
      managementStatus.dataset.state = 'success';
      managementStatus.textContent =
        scope === 'probability'
          ? '抽题概率已重置，答题记录与录音已保留。'
          : '全部答题记录与已归档录音已清空，抽题概率已重置。';
      if (scope === 'all') {
        window.dispatchEvent(new Event('history-cleared'));
        from.value = to.value = startDate = endDate = '';
        filterError.hidden = true;
        page = 1;
      }
    } catch (error) {
      managementStatus.dataset.state = 'error';
      managementStatus.textContent = `操作未完成：${error.message} 可从记录管理中重试。`;
    } finally {
      managing = false;
      management.setAttribute('aria-busy', 'false');
      management.querySelectorAll('button').forEach((action) => {
        action.disabled = false;
      });
      if (scope === 'all' && !view.hidden) load();
    }
  });
  previous.addEventListener('click', () => {
    page -= 1;
    load();
  });
  next.addEventListener('click', () => {
    page += 1;
    load();
  });

  function showRecord(record, selectedCategory) {
    window.dispatchEvent(
      new CustomEvent(selectedCategory === 'mock' ? 'open-history-mock' : 'open-history-practice', {
        detail: record,
      }),
    );
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  appViews.register(/^\/history$/, open);
  appViews.register(
    /^\/history\/(practice|mock|test)\/([^/]+)$/,
    async ([, selectedCategory, id]) => {
      const record = await api(`/api/v1/history/${selectedCategory}/${id}`);
      if (category !== selectedCategory)
        selectCategory(tabs.querySelector(`[data-history-category="${selectedCategory}"]`), false);
      showRecord(record, selectedCategory);
    },
  );
  appViews.beforeNavigate(() => {
    if (view.hidden) return true;
    if (managing) return false;
    management.open = false;
    requestId += 1;
    controller?.abort();
    return true;
  });

  list.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-history-clear')) return clearDates();
    if (button.hasAttribute('data-history-home')) return close();
    if (button.hasAttribute('data-history-retry')) return load();
    const id = button.dataset.historyId;
    if (!id) return;
    const current = requestId;
    const selectedCategory = category;
    button.disabled = true;
    button.textContent = '正在打开…';
    try {
      const record = await api(`/api/v1/history/${selectedCategory}/${id}`, controller.signal);
      if (current !== requestId || view.hidden) return;
      showRecord(record, selectedCategory);
    } catch (error) {
      if (current !== requestId || error.name === 'AbortError') return;
      filterError.textContent = `复盘打开失败：${error.message}`;
      filterError.hidden = false;
    } finally {
      button.disabled = false;
      button.textContent = '查看复盘 →';
    }
  });
})();
