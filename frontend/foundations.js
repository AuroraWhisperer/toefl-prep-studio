(() => {
  'use strict';

  const view = document.querySelector('#foundations-view');
  const chapters = window.foundationChapters;
  const query = document.querySelector('#foundations-query');
  const chapterNav = document.querySelector('#foundations-chapters');
  const topicList = document.querySelector('#foundations-topics');
  const reset = document.querySelector('#foundations-reset');
  const title = document.querySelector('#foundations-category-title');
  const description = document.querySelector('#foundations-category-description');
  const allDescription = description.textContent;
  let selected = 'all';
  let initialized = false;
  let wasVisible = false;
  const entries = [];

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function explanation(label, text) {
    const line = element('p');
    line.append(element('strong', `${label}：`), text);
    return line;
  }

  function chapterButton(id, name, count) {
    const button = element('button');
    button.type = 'button';
    button.dataset.chapter = id;
    button.setAttribute('aria-pressed', String(selected === id));
    button.setAttribute('aria-controls', 'foundations-topics');
    const total = element('small', String(count));
    total.setAttribute('aria-hidden', 'true');
    button.append(element('span', name), total);
    return button;
  }

  function initialize() {
    chapterNav.append(
      chapterButton(
        'all',
        '全部内容',
        chapters.reduce((n, c) => n + c.topics.length, 0),
      ),
    );
    for (const group of new Set(chapters.map((chapter) => chapter.group))) {
      chapterNav.append(element('h2', group));
      chapters
        .filter((chapter) => chapter.group === group)
        .forEach((chapter) => {
          chapterNav.append(chapterButton(chapter.id, chapter.title, chapter.topics.length));
        });
    }
    chapters.forEach((chapter) =>
      chapter.topics.forEach((topic) => {
        const details = element('details', '', 'foundation-topic');
        details.id = `foundation-${topic.id}`;
        const summary = element('summary');
        summary.append(
          element('strong', topic.title),
          element('span', topic.pattern, 'foundation-pattern'),
        );
        const body = element('div', '', 'foundation-body');
        const examples = element('div', '', 'foundation-examples');
        topic.examples.forEach(([english, chinese]) => {
          const figure = element('figure');
          const sentence = element('p', english);
          sentence.lang = 'en';
          figure.append(sentence, element('figcaption', chinese));
          examples.append(figure);
        });
        body.append(
          explanation('读懂', topic.read),
          explanation('解析', topic.explain),
          examples,
          explanation('下次', topic.next),
        );
        details.append(summary, body);
        topicList.append(details);
        entries.push({
          node: details,
          chapter: chapter.id,
          search: [
            chapter.group,
            chapter.title,
            chapter.description,
            topic.title,
            topic.pattern,
            topic.read,
            topic.explain,
            topic.next,
            ...topic.examples.flat(),
          ]
            .join(' ')
            .toLowerCase(),
        });
      }),
    );
    entries[0].node.open = true;
    initialized = true;
  }

  function filter() {
    const terms = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const entry of entries) {
      const matches =
        (selected === 'all' || selected === entry.chapter) &&
        terms.every((term) => entry.search.includes(term));
      entry.node.hidden = !matches;
      if (matches) count++;
    }
    const chapter = chapters.find((item) => item.id === selected);
    title.textContent = chapter?.title || '全部内容';
    description.textContent = chapter?.description || allDescription;
    document.querySelector('#foundations-count').textContent =
      `${count} 个知识点${terms.length ? '符合搜索' : '可查阅'}`;
    document.querySelector('#foundations-empty').hidden = count !== 0;
    reset.hidden = selected === 'all' && query.value === '';
    chapterNav.querySelectorAll('button').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.chapter === selected));
    });
  }

  function showFoundations() {
    if (!initialized) initialize();
    filter();
    window.appViews.show(view, { path: '/foundations' });
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.appViews.focus(document.querySelector('#foundations-title'));
  }

  chapterNav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-chapter]');
    if (!button) return;
    selected = button.dataset.chapter;
    filter();
    document
      .querySelector('.foundations-content')
      .scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  query.addEventListener('input', filter);
  reset.addEventListener('click', () => {
    selected = 'all';
    query.value = '';
    filter();
    query.focus();
  });
  document
    .querySelector('#open-foundations')
    .addEventListener('click', () => window.appViews.navigate('/foundations'));
  document
    .querySelector('#foundations-home')
    .addEventListener('click', () => window.appViews.navigate('/'));
  window.addEventListener('view-shown', (event) => {
    if (wasVisible && event.detail.view.id === 'landing-view') {
      window.appViews.focus(document.querySelector('#open-foundations'));
    }
    wasVisible = event.detail.view === view;
  });
  window.appViews.register(/^\/foundations$/, showFoundations);
})();
