(() => {
  'use strict';
  const labels = { reading: '阅读', listening: '听力', writing: '写作', speaking: '口语' };
  const order = Object.keys(labels);
  const view = document.querySelector('#mock-view');
  const landing = document.querySelector('#landing-view');
  const library = document.querySelector('#library-content');
  const papers = document.querySelector('#mock-papers');
  const mockToggle = document.querySelector('#open-mocks');
  const resumeNotice = document.querySelector('#mock-resume');
  const storageKey = 'toefl-mock-session';
  let resources,
    selectedPaper,
    session,
    draft = {};
  let timer,
    deadlineTimer,
    saveTimer,
    clockOffset = 0,
    busy = false,
    draftOrders = {},
    selectedSlot = 0;
  let soundReady = false,
    micReady = false,
    stream,
    recorder,
    recordingStopped;
  let cache,
    playing = false,
    responseDeadline = null,
    ready = false,
    pendingRecording;
  let generation = 0,
    requestChain = Promise.resolve();
  let promptAccents = new Map();
  const esc = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const clock = (seconds) =>
    `${String(Math.floor(Math.max(0, seconds) / 60)).padStart(2, '0')}:${String(Math.max(0, seconds) % 60).padStart(2, '0')}`;
  const now = () => Date.now() / 1000 + clockOffset;
  const currentItem = () =>
    session?.phase?.items[
      ['listening', 'speaking'].includes(session.phase.section) ? 0 : session.item_index
    ];

  async function api(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const error = new Error(
        typeof payload.detail === 'string'
          ? payload.detail
          : `请求失败 (${response.status})，请重试`,
      );
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  function error(message) {
    let node = document.querySelector('#mock-error');
    if (!node) {
      node = document.createElement('div');
      node.id = 'mock-error';
      node.className = 'mock-error';
      node.setAttribute('role', 'alert');
      (view.hidden ? library : view).prepend(node);
    }
    node.textContent = message;
  }

  function status(message) {
    const node = document.querySelector('#mock-save');
    if (node) node.textContent = message;
  }

  function showView(
    path = session ? `/mocks/sessions/${session.id}` : `/mocks/${selectedPaper.id}`,
  ) {
    appViews.show(view, { path });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function cleanup() {
    generation += 1;
    clearInterval(timer);
    clearTimeout(deadlineTimer);
    clearTimeout(saveTimer);
    cache?.dispose();
    cache = null;
    window.speechSynthesis?.cancel();
    const active = recorder;
    recorder = null;
    pendingRecording = null;
    recordingStopped = null;
    if (active?.state === 'recording') active.stop();
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    playing = false;
    view.querySelectorAll('audio').forEach((audio) => audio.pause());
  }

  function home() {
    cleanup();
    session = null;
    appViews.show(landing);
    renderLibrary();
    appViews.focus(document.querySelector('#open-mocks'));
  }

  function renderLibrary() {
    if (!resources) return;
    library.innerHTML = resources.mock.length
      ? resources.mock
          .map(
            (p) =>
              `<div class="resource-row"><div><h3>${esc(p.title)}</h3><p>阅读 40 · 听力 34 · 写作 12 · 口语 11 ／ 科目基准合计约 90 分钟</p></div><div class="resource-actions"><a href="${esc(p.source_url)}" target="_blank" rel="noopener noreferrer">ETS 原卷（含答案）</a><button class="text-button" data-paper="${p.id}" type="button">开始模考 →</button></div></div>`,
          )
          .join('') +
        '<p class="library-note">2026 新版机考练习 · 固定双模块 · 合成语音 · 非官方自适应考试</p>'
      : '<div class="resource-empty"><h3>尚未导入模考试卷</h3><p>请按项目说明在本机导入有权使用的 ETS 练习卷。导入后重启服务即可选择试卷；四科原创练习和综合测验可直接使用。</p></div>';
    resumeNotice.innerHTML = localStorage.getItem(storageKey)
      ? '<div class="resume-row"><span>有已保存的模考记录，已开始的单题或模块计时不会重置。</span><button id="resume-mock" class="text-button" type="button">恢复记录 →</button></div>'
      : '';
  }

  async function loadResources() {
    try {
      resources = await api('/api/v1/resources');
      renderLibrary();
    } catch (e) {
      library.innerHTML = `<div class="resource-empty">资源加载失败：${esc(e.message)} <button id="retry-resources" class="text-button" type="button">重新加载</button></div>`;
    }
  }

  function showIntro(paperId) {
    selectedPaper = resources.mock.find((p) => p.id === paperId);
    if (!selectedPaper) throw new Error('本机尚未导入这套模考试卷，请从首页选择可用试卷。');
    session = null;
    promptAccents = new Map();
    soundReady = false;
    micReady = false;
    showView();
    view.innerHTML = `<div class="mock-intro">
      <div class="mock-heading"><button class="text-button home-button" data-mock-home type="button">← 返回首页</button><h1>${esc(selectedPaper.title)}</h1></div>
      <p>四科连续完成，交卷后统一复盘。请准备耳机、麦克风和草稿纸。</p>
      <ol class="mock-flow">${order.map((s, i) => `<li><strong>${i + 1}. ${labels[s]}</strong><span>${selectedPaper.section_counts[s]} 题 · ${[30, 29, 23, 8][i]} 分钟基准</span></li>`).join('')}</ol>
      <details class="mock-disclaimer" open><summary>开始前，请了解机考练习的还原范围</summary><p>${esc(resources.limitations)}</p><p>阅读可在同一模块内回看。说明页不计时，开始后的单题或模块截止时间由服务器锁定。关闭页面无法播放后续音频或继续录音；重新打开可恢复已保存进度。</p><a href="${esc(resources.flow_source)}" target="_blank" rel="noopener noreferrer">ETS 考试流程依据 · ${resources.checked_on} 核对</a></details>
      ${PromptSpeech.infoHtml()}
      <div class="mock-device-row"><button id="mock-sound-check" class="secondary-button" type="button">测试声音</button><span id="mock-sound-state" role="status">播放一段英语示范</span><button id="mock-mic-check" class="secondary-button" type="button">授权麦克风</button><span id="mock-mic-state" role="status">用于最后的口语部分</span></div>
      <label class="mock-check"><input id="mock-consent" type="checkbox">我已了解规则，确认能听清示范音频，准备开始连续模考。</label>
      <button id="begin-mock" class="primary-button" type="button" disabled>进入阅读说明 →</button>
    </div>`;
  }

  function updateStart() {
    const button = document.querySelector('#begin-mock');
    if (button)
      button.disabled = !(
        soundReady &&
        micReady &&
        document.querySelector('#mock-consent').checked
      );
  }

  async function microphone() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
      throw new Error('浏览器不支持录音，请使用支持麦克风的浏览器和 localhost 地址');
    if (!stream?.active) {
      const version = generation;
      const requested = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (version !== generation) {
        requested.getTracks().forEach((track) => track.stop());
        throw new Error('已离开模考页面，麦克风请求已取消。');
      }
      stream = requested;
    }
    return stream;
  }

  async function say(...texts) {
    const version = generation;
    cache?.dispose();
    cache = new PromptAudioCache(texts, promptAccents);
    return (await PromptSpeech.play(cache, texts)) && version === generation;
  }

  function hydrate(value) {
    session = value;
    draft = { ...value.answers };
    draftOrders = structuredClone(value.word_orders || {});
    clockOffset = value.server_time - Date.now() / 1000;
    localStorage.setItem(storageKey, value.id);
  }

  async function resume(id = localStorage.getItem(storageKey)) {
    try {
      if (!id) return;
      hydrate(await api(`/api/v1/mock/sessions/${id}`));
      showView();
      if (session.status === 'completed') return await showResult();
      if (session.status === 'abandoned') {
        localStorage.removeItem(storageKey);
        return home();
      }
      renderPhase();
    } catch (e) {
      if (e.status === 404) {
        if (localStorage.getItem(storageKey) === id) localStorage.removeItem(storageKey);
        renderLibrary();
      }
      throw e;
    }
  }

  const textHtml = (text) =>
    String(text)
      .split(/\n\s*\n/)
      .map((p) => `<p>${esc(p)}</p>`)
      .join('');
  const screens = () =>
    session.phase.items
      .map((item, index) => ({ item, index }))
      .filter(({ item, index }) => item.kind !== 'letters' || index === 0);

  function directionsHtml() {
    const phase = session.phase,
      kind = phase.items[0].kind;
    let rules, timing;
    if (phase.section === 'reading') {
      rules =
        'Fill in missing letters and answer questions about written texts. You may move back and forth within this module. After submitting a module, you cannot return to it.';
      timing = `${phase.seconds / 60} 分钟／模块（固定练习卷分配，并非已核实的官方模块限时）`;
    } else if (phase.section === 'listening') {
      rules =
        'Listen carefully. Each recording plays once. Answer each question when the recording finishes. You may move forward, but you cannot return to a previous question.';
      timing = '每题作答 20 秒（本地模拟设置）；播放时不扣单题作答时间。无额外模块总倒计时。';
    } else if (phase.section === 'speaking') {
      rules =
        phase.title === 'Listen and Repeat'
          ? 'Listen to each sentence and repeat it once. Recording starts automatically after the audio. No preparation time is provided.'
          : 'Listen to the interviewer and answer each question. Recording starts automatically after the question. No preparation time is provided.';
      timing =
        phase.title === 'Listen and Repeat'
          ? '每句录音 8–12 秒；范围依据 ETS，逐句分配为本卷设置。'
          : '每题录音 45 秒；依据 ETS 公开规则。';
    } else {
      rules =
        kind === 'sentence'
          ? 'Move the word groups into the blanks to build a grammatical sentence. Some questions have an extra word group. Fixed words cannot be changed. You may review questions before submitting this task.'
          : 'Read the task carefully and type your response. The task timer includes reading, planning, writing, and checking your response.';
      timing = `${phase.seconds / 60} 分钟${kind === 'sentence' ? '（固定卷造句模拟限时）' : '（ETS 公开任务限时）'}`;
    }
    return `<section class="mock-directions" aria-labelledby="mock-directions-title"><h3 id="mock-directions-title">Directions</h3><p lang="en">${rules}</p><p class="mock-timing-note">${timing}</p><p class="mock-status">本说明页不计入作答时间。已开始的模块或单题计时不会因刷新而重置；关闭页面后，后续音频须恢复页面才能播放。</p><button id="begin-phase" class="primary-button" type="button">开始本阶段 →</button></section>`;
  }

  function sentenceHtml(item) {
    const order = draftOrders[item.id] || Array(item.template_parts.length - 1).fill(null);
    const slots = item.template_parts
      .map(
        (part, i) =>
          esc(part) +
          (i < order.length
            ? `<button type="button" class="mock-word-slot ${order[i] === null ? 'is-empty' : ''}" data-slot="${i}" ${order[i] === null ? '' : `draggable="true" data-token="${order[i]}"`} aria-label="空格 ${i + 1}${order[i] === null ? '，选择填入位置' : '，点击撤回词块'}" aria-pressed="${selectedSlot === i}">${order[i] === null ? '&nbsp;' : esc(item.word_tokens[order[i]])}</button>`
            : ''),
      )
      .join('');
    return `<h3 lang="en">${esc(item.prompt)}</h3><p class="mock-status">点击或拖动词块填入空格；点击已填词块可撤回。保留题目给出的固定词，可能有多余词块。</p><div class="mock-sentence-line" lang="en">${slots}</div><div class="mock-word-bank" aria-label="可用词块">${item.word_tokens.map((word, i) => `<button type="button" class="mock-word-tile" data-word="${i}" data-token="${i}" draggable="${!order.includes(i)}" ${order.includes(i) ? 'disabled' : ''}>${esc(word)}</button>`).join('')}</div><button type="button" class="text-button" id="clear-mock-sentence">清空已选词块</button>${draft[item.id] && !draftOrders[item.id] ? `<p class="mock-status">旧版已保存答案：${esc(draft[item.id])}。重新排列词块后才会替换。</p>` : ''}`;
  }

  function questionHtml() {
    const phase = session.phase,
      item = currentItem();
    if (item.kind === 'letters') {
      return `<article class="mock-reading-cloze"><h3>Complete the Words</h3><p class="mock-status">Fill in the missing letters in the paragraph. Questions 1–10.</p><p class="mock-cloze-text" lang="en">${phase.cloze_parts.map((part, i) => esc(part) + (i < 10 ? `<input type="text" class="mock-letter-input" data-answer="${phase.items[i].id}" aria-label="第 ${i + 1} 题缺失字母" maxlength="${phase.items[i].blank_length}" style="width:${phase.items[i].blank_length + 1.2}ch" value="${esc(draft[phase.items[i].id] || '')}" autocomplete="off" spellcheck="false">` : '')).join('')}</p></article>`;
    }
    if (phase.section === 'reading') {
      return `<div class="mock-native-workspace"><article class="mock-material" lang="en"><h3>${esc(item.material_heading)}</h3>${textHtml(item.material)}</article><section class="mock-native-answer"><h3 lang="en">${esc(item.prompt)}</h3>${item.options.map((option, i) => `<label class="mock-choice"><input type="radio" name="${item.id}" data-answer="${item.id}" value="${'ABCD'[i]}" ${draft[item.id] === 'ABCD'[i] ? 'checked' : ''}><span>${'ABCD'[i]}. ${esc(option)}</span></label>`).join('')}</section></div>`;
    }
    if (item.kind === 'sentence')
      return `<article class="mock-sentence" id="mock-sentence">${sentenceHtml(item)}</article>`;
    return `<div class="mock-native-workspace"><article class="mock-material" lang="en">${textHtml(item.prompt)}</article><section class="mock-answers mock-essay">${essayAnswerHtml(item)}</section></div>`;
  }

  function showReview() {
    const unanswered = session.phase.items.filter((q) =>
      q.kind === 'sentence' && draftOrders[q.id]
        ? draftOrders[q.id].some((i) => i === null)
        : !draft[q.id]?.trim(),
    ).length;
    document.querySelector('#mock-review-count').textContent =
      `本阶段还有 ${unanswered} 题未完成。提交后不能返回。`;
    document.querySelector('#mock-review-grid').innerHTML = screens()
      .map(
        ({ item, index }) =>
          `<button type="button" class="secondary-button" data-review-item="${index}">${item.kind === 'letters' ? '1–10' : item.number}${(item.kind === 'letters' ? session.phase.items.slice(0, 10) : [item]).every((q) => (draftOrders[q.id] ? draftOrders[q.id].every((v) => v !== null) : draft[q.id]?.trim())) ? ' · 已答' : ' · 未完成'}</button>`,
      )
      .join('');
    document.querySelector('#mock-submit-dialog').showModal();
  }

  function scheduleSave() {
    status('正在保存…');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(
      () =>
        act('save').catch((e) => {
          if (e.status === 409 && answerTimeEnded()) next(true);
          else if (e.status === 409) sync().catch((e) => error(e.message));
          else error(e.message);
        }),
      300,
    );
  }

  function placeWord(token, slot = selectedSlot) {
    if (busy || answerTimeEnded()) return;
    const item = currentItem();
    const order = (draftOrders[item.id] ||= Array(item.template_parts.length - 1).fill(null));
    if (
      slot < 0 ||
      slot >= order.length ||
      !Number.isInteger(token) ||
      token < 0 ||
      token >= item.word_tokens.length
    )
      return;
    const previous = order.indexOf(token);
    if (previous >= 0) order[previous] = order[slot];
    order[slot] = token;
    selectedSlot = Math.max(0, order.indexOf(null));
    document.querySelector('#mock-sentence').innerHTML = sentenceHtml(item);
    scheduleSave();
  }

  async function navigateItem(index) {
    if (busy) return;
    busy = true;
    clearTimeout(saveTimer);
    freezeAnswers(true);
    try {
      await act('navigate', { item_index: index });
      draft = { ...session.answers };
      draftOrders = structuredClone(session.word_orders || {});
      renderPhase();
    } catch (e) {
      if (e.status === 409 && answerTimeEnded()) {
        busy = false;
        await next(true);
      } else if (e.status === 409) await sync();
      else error(e.message);
    } finally {
      busy = false;
      freezeAnswers(answerTimeEnded());
    }
  }

  function essayAnswerHtml(item) {
    const value = draft[item.id] || '';
    return `<fieldset><legend>你的回答</legend><textarea data-answer="${item.id}" aria-label="${esc(session.phase.title)} 回答" maxlength="10000" spellcheck="false">${esc(value)}</textarea><p class="mock-status" id="mock-words">${value.trim().split(/\s+/).filter(Boolean).length} words</p></fieldset>`;
  }

  function renderPhase() {
    clearInterval(timer);
    clearTimeout(deadlineTimer);
    generation += 1;
    playing = false;
    ready = false;
    responseDeadline = null;
    if (session.status === 'completed') {
      showResult().catch((e) => error(e.message));
      return;
    }
    selectedSlot = 0;
    pendingRecording = null;
    recordingStopped = null;
    const phase = session.phase,
      forward = ['listening', 'speaking'].includes(phase.section);
    if (session.phase_state === 'directions') {
      view.innerHTML = `<div class="mock-heading"><button id="quit-mock" class="text-button home-button" type="button">结束本次</button><h2>${esc(phase.title)}</h2><span class="mock-status">说明 · 未开始计时</span></div>${directionsHtml()}`;
      return;
    }
    const positions = forward ? [] : screens(),
      position = positions.findIndex((s) => s.index === session.item_index);
    view.innerHTML = `<div class="mock-heading"><button id="quit-mock" class="text-button home-button" type="button">结束本次</button><h2>${esc(phase.title)}</h2><div class="mock-clock"><span>本阶段剩余</span><strong id="mock-clock"></strong></div></div>
      <ol class="mock-progress">${order.map((s) => `<li ${phase.section === s ? 'aria-current="step"' : ''}>${labels[s]}</li>`).join('')}<li>${esc(session.paper.title)}</li></ol>
      ${forward ? renderForward() : `<p class="mock-status">Question ${currentItem().kind === 'letters' ? '1–10' : currentItem().number} / ${phase.items.length}</p>${questionHtml()}`}
      <div class="mock-nav"><span id="mock-save" class="mock-status" role="status">答案自动保存</span><div class="mock-nav-actions">${!forward ? `<button id="mock-prev" class="secondary-button" type="button" ${position <= 0 ? 'disabled' : ''}>← 上一题</button><button id="mock-submit" class="secondary-button" type="button">检查并提交</button>` : ''}<button id="mock-next" class="primary-button" type="button" ${forward ? 'disabled' : ''}>${!forward && position === positions.length - 1 ? '检查并提交' : '下一题 →'}</button></div></div>
      ${!forward ? '<dialog id="mock-submit-dialog" aria-labelledby="mock-review-title"><h3 id="mock-review-title">检查本阶段</h3><p id="mock-review-count"></p><div id="mock-review-grid"></div><div class="mock-nav-actions"><button id="cancel-mock-submit" class="secondary-button" type="button">继续作答</button><button id="confirm-mock-submit" class="primary-button" type="button">确认提交本阶段</button></div></dialog>' : ''}`;
    timer = setInterval(tick, 250);
    armDeadline();
    tick();
    if (forward) {
      if (session.response_deadline) {
        responseDeadline = session.response_deadline;
        if (
          phase.section === 'speaking' &&
          responseDeadline > now() &&
          !session.recordings[currentItem().id]
        ) {
          microphone()
            .then(() => {
              startRecording();
              enableResponse();
            })
            .catch((e) => audioError(e));
        } else enableResponse();
      } else playCurrent().catch((e) => audioError(e));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function renderForward() {
    const phase = session.phase,
      item = currentItem(),
      speaking = phase.section === 'speaking';
    return `<article class="mock-question"><p class="mock-status">第 ${session.item_index + 1} / ${phase.item_count} 题 · 不可回看${speaking ? ' · 无准备时间' : ' · 音频仅播放一次'}</p>
      <div id="mock-audio-status" class="mock-audio-status" role="status">正在准备音频…</div><button id="mock-play" class="secondary-button" type="button">播放音频</button>
      <strong id="mock-response-clock" class="mock-response-clock"></strong><progress id="mock-response-progress" aria-label="作答剩余时间" hidden></progress>
      ${speaking ? '<h3>请听音频提示，随后立即回答。</h3><p id="mock-record-state" class="mock-status" role="status">音频结束后自动录音，到时自动保存并进入下一题。</p>' : `<div id="mock-listening-answers" hidden><h3>${esc(item.prompt)}</h3>${item.options.map((option, i) => `<label class="mock-choice"><input type="radio" name="${item.id}" data-answer="${item.id}" value="${'ABCD'[i]}" ${draft[item.id] === 'ABCD'[i] ? 'checked' : ''} disabled><span>${'ABCD'[i]}. ${esc(option)}</span></label>`).join('')}</div>`}
    </article>`;
  }

  function audioError(e) {
    playing = false;
    const button = document.querySelector('#mock-play');
    if (!button) return;
    button.disabled = false;
    button.hidden = false;
    button.textContent = '重试播放';
    document.querySelector('#mock-audio-status').textContent =
      '音频未完成；请点击重试。阶段计时继续。';
    error(e.message);
  }

  async function playCurrent() {
    if (playing || ready || !session?.phase) return;
    playing = true;
    const item = currentItem(),
      version = generation;
    const button = document.querySelector('#mock-play');
    button.disabled = true;
    document.querySelector('#mock-audio-status').textContent = '正在播放，请仔细听…';
    if (session.phase.section === 'speaking') await microphone();
    const alreadyHeard = session.heard_groups?.includes(item.audio_group);
    const prompt =
      session.phase.section === 'listening' && item.prompt !== 'Choose the best response.'
        ? item.prompt
        : '';
    const text = alreadyHeard ? '' : item.audio_text;
    if ((text || prompt) && !(await say(text, prompt))) return;
    if (version !== generation) return;
    playing = false;
    await act('respond');
    if (version !== generation) return;
    if (session.phase.section === 'speaking') startRecording();
    responseDeadline = session.response_deadline;
    enableResponse();
  }

  function enableResponse() {
    ready = true;
    document.querySelector('#mock-play').hidden = true;
    document.querySelector('#mock-audio-status').textContent = '音频播放结束，请作答。';
    const answers = document.querySelector('#mock-listening-answers');
    if (answers) {
      answers.hidden = false;
      answers.querySelectorAll('input').forEach((input) => (input.disabled = false));
    }
    document.querySelector('#mock-next').disabled = false;
    armDeadline();
  }

  function startRecording() {
    const chunks = [];
    const active = (recorder = new MediaRecorder(stream));
    active.ondataavailable = (event) => {
      if (recorder === active && event.data.size) chunks.push(event.data);
    };
    recordingStopped = new Promise((resolve) => {
      active.onstop = () => {
        // An exit can invalidate this recorder before its final events arrive.
        if (recorder === active)
          pendingRecording = new Blob(chunks, { type: active.mimeType || 'audio/webm' });
        active.ondataavailable = null;
        active.onstop = null;
        chunks.length = 0;
        resolve();
      };
    });
    active.start();
    const node = document.querySelector('#mock-record-state');
    node.textContent = '正在录音，请回答。';
    node.classList.add('mock-recording');
  }

  async function uploadRecording() {
    if (recorder?.state === 'recording') recorder.stop();
    if (recordingStopped) await recordingStopped;
    if (pendingRecording) {
      status('正在保存录音…');
      await api(`/api/v1/mock/sessions/${session.id}/recordings/${currentItem().id}`, {
        method: 'PUT',
        headers: { 'Content-Type': pendingRecording.type },
        body: pendingRecording,
      });
      pendingRecording = null;
      recorder = null;
      recordingStopped = null;
    }
  }

  function act(action, extra = {}) {
    const phase = session.phase;
    const allowed = new Set(phase.items.map((q) => q.id));
    const payload = {
      phase_index: session.phase_index,
      item_index: session.item_index,
      action,
      answers: ['begin', 'respond'].includes(action)
        ? {}
        : Object.fromEntries(
            Object.entries(draft).filter(
              ([key]) =>
                allowed.has(key) && phase.items.find((q) => q.id === key)?.kind !== 'sentence',
            ),
          ),
      word_orders: ['begin', 'respond'].includes(action)
        ? {}
        : Object.fromEntries(Object.entries(draftOrders).filter(([key]) => allowed.has(key))),
      ...extra,
    };
    const id = session.id;
    const requestBody = JSON.stringify(payload);
    const operation = async () => {
      const value = await api(`/api/v1/mock/sessions/${id}`, {
        method: 'POST',
        body: requestBody,
      });
      if (session?.id !== id) return;
      session = value;
      clockOffset = value.server_time - Date.now() / 1000;
      status('已保存');
      return value;
    };
    const task = requestChain.then(operation);
    requestChain = task.catch(() => {});
    return task;
  }

  async function next(automatic = false) {
    if (busy || !session?.phase) return;
    const forward = ['listening', 'speaking'].includes(session.phase.section);
    const speaking = session.phase.section === 'speaking';
    if (forward && !ready && !automatic) return;
    if (!forward && !automatic) return showReview();
    busy = true;
    clearTimeout(saveTimer);
    freezeAnswers(true);
    document.querySelector('#mock-next').disabled = true;
    try {
      try {
        if (speaking) await uploadRecording();
        await act(forward ? 'next' : 'advance');
      } catch (e) {
        const recordingExpired =
          speaking &&
          e.status === 422 &&
          answerTimeEnded() &&
          e.message === '录音不属于当前口语题目';
        if (e.status !== 409 && !recordingExpired) throw e;
        await sync(recordingExpired);
        if (!speaking) error(`本次提交未确认保存：${e.message}。已显示服务端保存的进度。`);
        return;
      }
      draft = { ...session.answers };
      draftOrders = structuredClone(session.word_orders || {});
      renderPhase();
    } catch (e) {
      error(e.message);
      status('保存失败；请重试，答案仍留在当前页面');
    } finally {
      busy = false;
      if (!answerTimeEnded()) freezeAnswers(false);
      const button = document.querySelector('#mock-next');
      if (button)
        button.disabled = ['listening', 'speaking'].includes(session.phase?.section) && !ready;
    }
  }

  async function sync(recordingExpired = false) {
    clearTimeout(saveTimer);
    if (
      !recordingExpired &&
      session?.phase?.section === 'speaking' &&
      ((session.deadline !== null && now() >= session.deadline) ||
        (responseDeadline !== null && now() >= responseDeadline))
    ) {
      try {
        await uploadRecording();
      } catch (e) {
        if (![409, 422].includes(e.status)) throw e;
        recordingExpired = true;
      }
    }
    await requestChain;
    const value = await api(`/api/v1/mock/sessions/${session.id}`);
    hydrate(value);
    cache?.dispose();
    window.speechSynthesis?.cancel();
    if (recorder?.state === 'recording') recorder.stop();
    if (recordingStopped) await recordingStopped;
    renderPhase();
    if (recordingExpired)
      error('上一阶段录音未能在上传窗口内保存；考试计时不暂停，请继续当前阶段。');
  }

  function answerTimeEnded() {
    return [session?.deadline, session?.response_deadline].some(
      (deadline) => deadline != null && now() >= deadline,
    );
  }

  function armDeadline() {
    clearTimeout(deadlineTimer);
    const deadlines = [session?.deadline, session?.response_deadline].filter(
      (value) => value != null,
    );
    if (deadlines.length)
      deadlineTimer = setTimeout(tick, Math.max(0, (Math.min(...deadlines) - now()) * 1000));
  }

  function freezeAnswers(frozen) {
    view
      .querySelectorAll(
        '.mock-question, .mock-native-workspace, .mock-reading-cloze, .mock-sentence',
      )
      .forEach((node) => {
        node.inert = frozen;
      });
  }

  function tick() {
    if (!session?.phase || view.hidden) return;
    if (answerTimeEnded()) freezeAnswers(true);
    const remaining = session.deadline === null ? null : Math.ceil(session.deadline - now());
    const node = document.querySelector('#mock-clock');
    if (node) {
      node.textContent = remaining === null ? '逐题计时' : clock(remaining);
      node.previousElementSibling.textContent =
        remaining === null ? '音频结束后开始作答计时' : '本阶段剩余';
    }
    if (remaining !== null && remaining <= 0 && !busy) {
      next(true);
      return;
    }
    if (responseDeadline && ready) {
      const seconds = Math.ceil(responseDeadline - now());
      const responseClock = document.querySelector('#mock-response-clock');
      if (responseClock) responseClock.textContent = `作答剩余 ${Math.max(0, seconds)} 秒`;
      const progress = document.querySelector('#mock-response-progress');
      if (progress) {
        progress.hidden = false;
        progress.max = currentItem().response_seconds || 20;
        progress.value = Math.max(0, seconds);
      }
      if (seconds <= 0 && !busy) {
        responseDeadline = null;
        next(true);
      }
    }
  }

  async function showResult() {
    cleanup();
    const version = generation;
    try {
      const result = await api(`/api/v1/mock/sessions/${session.id}/result`);
      if (version === generation) renderResult(result);
    } catch (e) {
      if (version === generation) throw e;
    }
  }

  function renderResult(result) {
    view.innerHTML = window.mockReviewMarkup(result, esc);
  }

  function setPicker(open) {
    papers.hidden = !open;
    mockToggle.setAttribute('aria-expanded', String(!papers.hidden));
    mockToggle.textContent = papers.hidden ? '选择模考试卷 →' : '收起模考试卷 ↑';
    if (!papers.hidden) library.scrollIntoView({ block: 'nearest' });
  }
  mockToggle.addEventListener('click', () => {
    setPicker(papers.hidden);
    appViews.setPath(papers.hidden ? '/' : '/mocks');
  });
  window.addEventListener('view-shown', (event) => {
    if (event.detail.view === landing) setPicker(event.detail.path === '/mocks');
  });
  landing.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.paper) showIntro(target.dataset.paper);
    else if (target.id === 'resume-mock')
      appViews.navigate(`/mocks/sessions/${localStorage.getItem(storageKey)}`);
    else if (target.id === 'retry-resources') loadResources();
  });
  view.addEventListener('input', (event) => {
    if (event.target.id === 'mock-consent') return updateStart();
    const id = event.target.dataset.answer;
    if (!id || busy || answerTimeEnded()) return;
    draft[id] = event.target.value;
    status('正在保存…');
    const words = document.querySelector('#mock-words');
    if (words)
      words.textContent = `${event.target.value.trim().split(/\s+/).filter(Boolean).length} words`;
    scheduleSave();
  });
  view.addEventListener('click', async (event) => {
    const target = event.target.closest('button');
    if (!target || target.disabled) return;
    if (
      (target.hasAttribute('data-word') ||
        target.hasAttribute('data-slot') ||
        target.id === 'clear-mock-sentence') &&
      (busy || answerTimeEnded())
    )
      return;
    try {
      if (target.hasAttribute('data-mock-home')) home();
      else if (target.id === 'mock-sound-check') {
        document.querySelector('#mock-error')?.remove();
        target.disabled = true;
        document.querySelector('#mock-sound-state').textContent = '正在播放示范…';
        try {
          const completed = await say(
            'Welcome to your TOEFL practice test. Please check that you can hear this message clearly.',
          );
          if (!completed) return;
          soundReady = true;
          target.disabled = false;
          document.querySelector('#mock-sound-state').textContent = '示范已播放，请确认能听清';
          updateStart();
        } catch (e) {
          const soundState = document.querySelector('#mock-sound-state');
          if (soundState) soundState.textContent = '声音测试未完成，请重试';
          throw e;
        }
      } else if (target.id === 'mock-mic-check') {
        await microphone();
        micReady = true;
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
        document.querySelector('#mock-mic-state').textContent = '麦克风已授权';
        updateStart();
      } else if (target.id === 'begin-mock') {
        if (
          localStorage.getItem(storageKey) &&
          !window.confirm('开始新模考会替换首页的恢复入口。确定开始吗？')
        )
          return;
        target.disabled = true;
        busy = true;
        try {
          hydrate(
            await api('/api/v1/mock/sessions', {
              method: 'POST',
              body: JSON.stringify({ paper_id: selectedPaper.id }),
            }),
          );
          showView();
          renderPhase();
        } finally {
          busy = false;
        }
      } else if (target.id === 'begin-phase') {
        if (busy) return;
        busy = true;
        target.disabled = true;
        try {
          await act('begin');
          renderPhase();
        } finally {
          busy = false;
        }
      } else if (
        target.id === 'mock-next' &&
        !['listening', 'speaking'].includes(session.phase.section)
      ) {
        const steps = screens(),
          index = steps.findIndex((s) => s.index === session.item_index);
        if (index === steps.length - 1) showReview();
        else await navigateItem(steps[index + 1].index);
      } else if (target.id === 'mock-prev') {
        const steps = screens(),
          index = steps.findIndex((s) => s.index === session.item_index);
        if (index > 0) await navigateItem(steps[index - 1].index);
      } else if (target.id === 'mock-submit') showReview();
      else if (target.id === 'cancel-mock-submit')
        document.querySelector('#mock-submit-dialog').close();
      else if (target.id === 'confirm-mock-submit') {
        document.querySelector('#mock-submit-dialog').close();
        await next(true);
      } else if (target.hasAttribute('data-review-item')) {
        document.querySelector('#mock-submit-dialog').close();
        await navigateItem(Number(target.dataset.reviewItem));
      } else if (target.hasAttribute('data-word')) placeWord(Number(target.dataset.word));
      else if (target.hasAttribute('data-slot')) {
        const item = currentItem(),
          order = (draftOrders[item.id] ||= Array(item.template_parts.length - 1).fill(null));
        selectedSlot = Number(target.dataset.slot);
        const changed = order[selectedSlot] !== null;
        order[selectedSlot] = null;
        document.querySelector('#mock-sentence').innerHTML = sentenceHtml(item);
        if (changed) scheduleSave();
        document.querySelector(`[data-slot="${selectedSlot}"]`).focus();
      } else if (target.id === 'clear-mock-sentence') {
        const item = currentItem();
        draftOrders[item.id] = Array(item.template_parts.length - 1).fill(null);
        selectedSlot = 0;
        document.querySelector('#mock-sentence').innerHTML = sentenceHtml(item);
        scheduleSave();
      } else if (target.id === 'mock-next') await next();
      else if (target.id === 'mock-play') await playCurrent();
      else if (target.id === 'quit-mock') {
        if (!window.confirm('确定结束并放弃本次模考？关闭此确认框可继续考试。')) return;
        clearTimeout(saveTimer);
        await act('abandon');
        localStorage.removeItem(storageKey);
        home();
      }
    } catch (e) {
      if (target.id === 'mock-play') audioError(e);
      else {
        error(e.message);
        target.disabled = false;
      }
    }
  });
  view.addEventListener('dragstart', (event) => {
    const token = event.target.closest('[data-token]');
    if (token && !token.disabled) event.dataTransfer.setData('text/plain', token.dataset.token);
  });
  view.addEventListener('dragover', (event) => {
    if (event.target.closest('[data-slot]')) event.preventDefault();
  });
  view.addEventListener('drop', (event) => {
    const slot = event.target.closest('[data-slot]');
    if (!slot) return;
    event.preventDefault();
    const token = event.dataTransfer.getData('text/plain');
    if (/^[0-9]+$/.test(token)) placeWord(Number(token), Number(slot.dataset.slot));
  });
  window.addEventListener('beforeunload', (event) => {
    if (session?.status === 'active' && !view.hidden) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  window.addEventListener('pagehide', cleanup);
  window.addEventListener('history-opened', cleanup);
  window.addEventListener('open-history-mock', (event) => {
    cleanup();
    session = null;
    renderResult(event.detail.result);
    showView(`/history/mock/${event.detail.id}`);
    const back = view.querySelector('[data-mock-home]');
    back.removeAttribute('data-mock-home');
    back.textContent = '← 返回记录';
    back.addEventListener('click', () => window.dispatchEvent(new Event('open-history')));
    appViews.focus(back);
  });
  const resourcesReady = loadResources();
  appViews.register(/^\/mocks$/, async () => {
    await resourcesReady;
    appViews.show(landing, { path: '/mocks' });
    renderLibrary();
    appViews.focus(mockToggle);
  });
  appViews.register(/^\/mocks\/(ets-test-[1-5])$/, async ([, paper]) => {
    await resourcesReady;
    showIntro(paper);
  });
  appViews.register(/^\/mocks\/sessions\/([^/]+)$/, ([, id]) => resume(id));
  appViews.beforeNavigate(async () => {
    if (view.hidden) return true;
    if (busy) return false;
    busy = true;
    clearTimeout(saveTimer);
    try {
      if (playing) {
        generation += 1;
        cache?.dispose();
        window.speechSynthesis?.cancel();
        audioError(new Error('已停止播放，请点击重试。'));
      }
      if (session?.status === 'active' && session.phase_state !== 'directions') {
        await uploadRecording();
        await requestChain;
        if (
          !['listening', 'speaking'].includes(session.phase.section) ||
          session.response_deadline
        ) {
          await act('save');
        }
      }
      view.querySelector('dialog[open]')?.close();
      cleanup();
      session = null;
      return true;
    } catch (e) {
      error(`保存未完成：${e.message}，请重试`);
      return false;
    } finally {
      busy = false;
    }
  });
})();
