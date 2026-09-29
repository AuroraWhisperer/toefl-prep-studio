(() => {
  'use strict';

  const SECTION_LABELS = {
    reading: 'Reading',
    listening: 'Listening',
    speaking: 'Speaking',
    writing: 'Writing',
  };
  const SECTION_NAMES = { reading: '阅读', listening: '听力', writing: '写作', speaking: '口语' };
  const SECTION_DESCRIPTIONS = {
    reading: '补全单词，读懂日常文本与学术篇章。',
    listening: '从简短应答到学术讲座，抓住关键信息。',
    writing: '组织句子，写好邮件，参与学术讨论。',
    speaking: '听后复述与模拟访谈，把想法说清楚。',
  };
  const SECTION_ICONS = {
    reading:
      '<path d="M3 6h8c3 0 5 2 5 4v18c0-3-2-5-6-5H3V6Zm26 0h-8c-3 0-5 2-5 4v18c0-3 2-5 6-5h7V6Z"/>',
    listening:
      '<path d="M5 19v-4a11 11 0 0 1 22 0v4"/><rect x="4" y="16" width="6" height="11" rx="3"/><rect x="22" y="16" width="6" height="11" rx="3"/>',
    writing:
      '<path d="m20 5 7 7M6 20 22 4a2 2 0 0 1 3 0l3 3a2 2 0 0 1 0 3L12 26l-8 2 2-8Zm0 0 6 6M17 28h11"/>',
    speaking:
      '<rect x="11" y="3" width="10" height="17" rx="5"/><path d="M7 15v2a9 9 0 0 0 18 0v-2m-9 11v4m-5 0h10"/>',
  };
  const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

  const TASK_LABELS = {
    complete_words: 'Complete the Words',
    read_daily_life: 'Read in Daily Life',
    read_academic_passage: 'Read an Academic Passage',
    listen_choose_response: 'Listen and Choose a Response',
    listen_conversation: 'Listen to a Conversation',
    listen_announcement: 'Listen to an Announcement',
    listen_academic_talk: 'Listen to an Academic Talk',
    listen_repeat: 'Listen and Repeat',
    take_interview: 'Take an Interview',
    build_sentence: 'Build a Sentence',
    write_email: 'Write an Email',
    academic_discussion: 'Write for an Academic Discussion',
  };

  const dom = {
    landing: document.querySelector('#landing-view'),
    exam: document.querySelector('#exam-view'),
    result: document.querySelector('#result-view'),
    setup: document.querySelector('#setup-view'),
    testSetup: document.querySelector('#test-setup'),
    setupTabs: document.querySelector('#setup-tabs'),
    setupContent: document.querySelector('#setup-content'),
    sectionGrid: document.querySelector('#section-grid'),
    examTitle: document.querySelector('#exam-title'),
    timer: document.querySelector('#timer-value'),
    timerLabel: document.querySelector('#timer-label'),
    answeredCount: document.querySelector('#answered-count'),
    questionRail: document.querySelector('.question-rail'),
    questionIndex: document.querySelector('#question-index'),
    questionNumber: document.querySelector('#question-number'),
    questionType: document.querySelector('#question-type'),
    difficulty: document.querySelector('#difficulty-tag'),
    questionContent: document.querySelector('#question-content'),
    previous: document.querySelector('#previous-question'),
    next: document.querySelector('#next-question'),
    submit: document.querySelector('#submit-exam'),
    saveState: document.querySelector('#save-state'),
    toast: document.querySelector('#toast'),
  };

  const state = {
    meta: null,
    section: null,
    mode: 'exam',
    taskType: null,
    count: null,
    timerMode: 'countdown',
    practiceStartedAt: 0,
    setupSection: 'reading',
    setupTask: 'complete_words',
    setupCount: 1,
    setupTimer: 'countup',
    questions: [],
    currentIndex: 0,
    answers: {},
    sentenceOrders: {},
    durations: {},
    remaining: 0,
    timerId: null,
    deadlineTimer: null,
    questionStartedAt: 0,
    audioRequest: null,
    audioCache: null,
    promptAccents: new Map(),
    recordings: {},
    practiceId: 0,
    practicePath: null,
    loading: false,
    leaving: false,
    deadline: null,
    submitting: false,
    submission: null,
    historyReview: false,
    testSession: null,
    testSubmission: null,
  };
  const setupSelections = new Map();
  const pendingRecordingArchives = new Map();

  let testSaveTimer = null;
  let testRecordingChain = Promise.resolve();
  const adaptiveTest = createAdaptiveTest({
    api,
    escapeHtml,
    onSession: showTestSession,
    onHome: showLanding,
    showView: appViews.show,
  });

  const sentenceBuilder = createSentenceBuilder({ escapeHtml });
  let disposeSentenceControls = null;
  const practiceReview = createPracticeReview({
    root: dom.result,
    sectionLabels: SECTION_LABELS,
    taskLabels: TASK_LABELS,
    format: { escapeHtml, formatTime, formatAnswer },
    content: { materialMarkup, clozeMarkup, audioMarkup },
    onSelectMaterial: stopAudio,
    onPlayAudio: playAudio,
  });
  const practiceRecorder = createPracticeRecorder({
    isCurrent: ({ questionId, practiceId }) =>
      state.practiceId === practiceId && currentQuestion()?.id === questionId,
    onRecording: ({ questionId, practiceId, blob }) => {
      if (practiceId !== state.practiceId) return;
      if (state.recordings[questionId]) URL.revokeObjectURL(state.recordings[questionId]);
      const url = URL.createObjectURL(blob);
      state.recordings[questionId] = url;
      updateAnsweredUi();
      if (state.testSession)
        saveTestRecordings().catch((error) => {
          dom.saveState.textContent = error.message;
        });
      if (currentQuestion()?.id === questionId && !dom.exam.hidden) {
        const playback = dom.questionContent.querySelector('[data-recording-playback]');
        if (playback) {
          playback.src = url;
          playback.hidden = false;
        }
      }
    },
    onTranscript: ({ questionId, transcript }) => {
      const input = dom.questionContent.querySelector('#answer-input');
      if (!input) return;
      input.value = transcript;
      state.answers[questionId] = transcript;
      updateAnsweredUi();
      scheduleTestSave();
    },
    onStatus: (status) => {
      const button = dom.questionContent.querySelector('[data-record]');
      if (button) {
        button.disabled = status === 'requesting';
        button.classList.toggle('is-recording', status === 'recording');
        button.textContent = status === 'recording' ? '■ 停止录音' : '● 开始录音';
      }
      const message = dom.questionContent.querySelector('[data-recording-status]');
      if (message && status !== 'requesting')
        message.textContent =
          status === 'recording'
            ? '正在录音…说完后点击停止。'
            : state.testSession
              ? '录音与转写用于复盘；口语待人工复核。'
              : '录音用于练习；评分使用下方转写文字。';
    },
    onMessage: showToast,
    onManual: openTranscription,
  });

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.hidden = false;
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
      dom.toast.hidden = true;
    }, 3600);
  }

  function formatTime(seconds) {
    const minutes = Math.floor(Math.max(seconds, 0) / 60);
    const remainder = Math.max(seconds, 0) % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  }

  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return minutes ? `${minutes} 分钟${remainder ? ` ${remainder} 秒` : ''}` : `${remainder} 秒`;
  }

  function formatRange([minimum, maximum], format = String) {
    return minimum === maximum ? format(minimum) : `${format(minimum)}–${format(maximum)}`;
  }

  function selectionEstimate(config, count) {
    const sets = count / config.units_per_set;
    const questions = formatRange(config.items_per_set_range.map((value) => value * sets));
    const duration = formatRange(
      config.time_range_seconds.map((value) => value * sets),
      formatDuration,
    );
    return `<span class="selection-volume">${count} ${config.unit} · ${questions} 个小题</span><strong>本轮预计 ${duration}</strong>${config.group_sizes.length > 1 ? '<span>（抽题后确定）</span>' : ''}`;
  }

  function formatAnswer(value) {
    if (Array.isArray(value)) return value.join(' ');
    return value == null ? '' : String(value);
  }

  function isAnswered(id) {
    const value = state.answers[id];
    return (
      Boolean(state.testSession && state.recordings[id]) ||
      !(value == null || (typeof value === 'string' && !value.trim()))
    );
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    if (!response.ok) {
      let message = `请求失败（${response.status}）`;
      try {
        const body = await response.json();
        if (typeof body.detail === 'string') message = body.detail;
        else if (Array.isArray(body.detail))
          message = body.detail.map((item) => item.msg).join('；');
      } catch (_) {
        // Keep the status message when the server did not return JSON.
      }
      throw new Error(message);
    }
    return response.json();
  }

  async function init() {
    try {
      state.meta = await api('/api/v1/meta');
      renderLanding();
    } catch (error) {
      showToast(`题库加载失败：${error.message}`);
      dom.sectionGrid.innerHTML = `<p class="muted-copy">暂时无法加载题库，请确认 FastAPI 服务正在运行。</p>`;
    }
  }

  function renderLanding() {
    const sections = state.meta.sections;
    dom.sectionGrid.innerHTML = Object.entries(sections)
      .map(([key, info]) => {
        return `
        <article class="training-card section-card">
          <div>
            <div class="section-card-heading">
              <h2>${SECTION_NAMES[key]} <span>${SECTION_LABELS[key]}</span></h2>
              <svg class="card-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SECTION_ICONS[key]}</svg>
            </div>
            <p class="section-card-meta">${SECTION_DESCRIPTIONS[key]}</p>
          </div>
          <div class="section-actions">
            <button class="section-card-button" type="button" data-section="${key}" data-action="configure" aria-label="${SECTION_NAMES[key]}专项练习">专项练习</button>
            <button class="text-button" type="button" data-section="${key}" data-mode="exam" aria-label="${SECTION_NAMES[key]}整科练习，${info.exam_question_count} 题，${info.time_minutes} 分钟">整科练习 <span>${info.exam_question_count} 题 · ${info.time_minutes} 分钟</span></button>
          </div>
        </article>`;
      })
      .join('');
  }

  function initializeCardTilt() {
    const motion = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    );
    let activeCard = null;
    let bounds = null;
    let frame = 0;
    let x = 0;
    let y = 0;

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!activeCard) return;
      activeCard.classList.remove('is-tilting');
      activeCard.style.removeProperty('--tilt-x');
      activeCard.style.removeProperty('--tilt-y');
      activeCard = null;
      bounds = null;
    }

    // Delegate once so returning home or rerendering cards never adds listeners.
    dom.landing.addEventListener('pointermove', (event) => {
      if (!motion.matches || event.pointerType !== 'mouse') return;
      const card = event.target.closest('.training-card');
      if (!card) return reset();
      if (card !== activeCard) {
        reset();
        activeCard = card;
        // Measure before tilting; transformed bounds would feed back into the angle.
        bounds = card.getBoundingClientRect();
        card.classList.add('is-tilting');
      }
      x = Math.max(-0.5, Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5));
      y = Math.max(-0.5, Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5));
      if (frame) return;
      frame = requestAnimationFrame(() => {
        activeCard.style.setProperty('--tilt-x', `${(-y * 8).toFixed(2)}deg`);
        activeCard.style.setProperty('--tilt-y', `${(x * 8).toFixed(2)}deg`);
        frame = 0;
      });
    });
    dom.landing.addEventListener('pointerout', (event) => {
      if (activeCard && !activeCard.contains(event.relatedTarget)) reset();
    });
    dom.landing.addEventListener('pointercancel', reset);
    dom.landing.addEventListener('click', reset);
    dom.landing.addEventListener('keydown', reset);
    motion.addEventListener('change', reset);
    window.addEventListener('blur', reset);
    window.addEventListener('scroll', reset, { passive: true });
    window.addEventListener('resize', reset);
  }

  function configureSection(section, restore = false) {
    if (state.loading) return;
    setupSelections.set(state.setupSection, {
      setupTask: state.setupTask,
      setupCount: state.setupCount,
      setupTimer: state.setupTimer,
    });
    state.setupSection = section;
    state.setupTask = state.meta.sections[section].task_types[0];
    const config = state.meta.sections[section].practice_tasks[state.setupTask];
    state.setupCount = config.count_options[0];
    state.setupTimer = config.timer_modes[0];
    if (restore && setupSelections.has(section)) Object.assign(state, setupSelections.get(section));
    appViews.show(dom.setup, { path: `/practice/${section}` });
    renderSetup();
    appViews.focus(dom.setupContent.querySelector('#start-practice'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderSetup() {
    const section = state.setupSection;
    const info = state.meta.sections[section];
    const config = info.practice_tasks[state.setupTask];
    const timing = config.timing;
    dom.setupTabs.innerHTML = Object.keys(SECTION_NAMES)
      .map(
        (key) =>
          `<button type="button" role="tab" id="tab-${key}" aria-selected="${key === section}" aria-controls="setup-content" tabindex="${key === section ? 0 : -1}" data-setup-section="${key}">${SECTION_NAMES[key]} <span>${SECTION_LABELS[key]}</span></button>`,
      )
      .join('');
    dom.setupContent.setAttribute('aria-labelledby', `tab-${section}`);
    const radios = (name, values, selected, label) =>
      values
        .map(
          (value) =>
            `<label class="setting-choice"><input type="radio" name="${name}" value="${value}" ${value === selected ? 'checked' : ''}><span>${label(value)}</span></label>`,
        )
        .join('');
    dom.setupContent.innerHTML = `
      <header class="setup-heading"><h1>${SECTION_NAMES[section]}专项练习</h1><p>选择题型，安排这一轮的练习节奏。</p></header>
      <form id="practice-settings">
        <fieldset class="setup-task-options"><legend>题型</legend><div class="setting-options">${radios('task_type', info.task_types, state.setupTask, (type) => info.practice_tasks[type].label)}</div></fieldset>
        <div class="setup-options-row">
          <fieldset><legend>题量</legend><div class="setting-options">${radios('count', config.count_options, state.setupCount, (count) => `${count} ${config.unit}`)}</div></fieldset>
          <fieldset><legend>计时方式</legend><div class="setting-options">${radios('timer_mode', config.timer_modes, state.setupTimer, (mode) => (mode === 'countup' ? '正计时' : '倒计时'))}</div></fieldset>
        </div>
        ${['listening', 'speaking'].includes(section) ? `<details class="setup-audio-details"><summary>提示音与口音说明</summary>${PromptSpeech.infoHtml()}</details>` : ''}
        <div class="setup-start"><p id="selection-summary" aria-live="polite">${selectionEstimate(config, state.setupCount)}<span class="selection-timer">${state.setupTimer === 'countdown' ? '到时自动交卷' : '手动交卷'}</span></p><button class="primary-button" id="start-practice" type="submit">开始练习 <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg></button></div>
      </form>
      <details class="format-details"><summary>练习说明</summary><p>${config.description}</p><p>${config.exam_part} 多份为额外加练。</p><p>${timing.label}：${timing.detail}</p><p>${section === 'speaking' ? '口语录音按每题时长自动停止。录音保留在本页，反馈依据转写文字。' : '倒计时按整轮预算交卷，写作多题练习不分别强制切题。'}</p><p>题型依据：${config.structure_sources.map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a>`).join(' · ')}。</p><p>时间依据（${timing.verified_on}）：${timing.sources.map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a>`).join(' · ')}。</p></details>`;
  }

  async function startSection(
    section,
    mode = 'exam',
    taskType = null,
    count = null,
    timerMode = null,
  ) {
    if (state.loading || state.submitting) return;
    state.loading = true;
    state.testSession = null;
    state.testSubmission = null;
    dom.submit.textContent = '提交本部分';
    dom.sectionGrid.querySelectorAll('button').forEach((button) => {
      button.disabled = true;
    });
    dom.setup.querySelectorAll('button, input').forEach((control) => {
      control.disabled = true;
    });
    stopRecording();
    clearPromptAudio();
    stopTimer();
    try {
      const params = new URLSearchParams({ section, mode });
      if (taskType) params.set('task_type', taskType);
      if (count !== null) params.set('count', count);
      if (timerMode) params.set('timer_mode', timerMode);
      const payload = await api(`/api/v1/exam?${params}`);
      clearRecordings();
      state.practiceId += 1;
      const runId = crypto.randomUUID();
      state.practicePath =
        mode === 'practice' ? `/practice/${section}/run/${runId}` : `/exam/${section}/${runId}`;
      state.submission = null;
      state.historyReview = false;
      state.section = section;
      state.mode = mode;
      state.taskType = taskType;
      state.count = count;
      state.timerMode = payload.timer_mode;
      state.questions = payload.questions;
      state.promptAccents = new Map();
      state.audioCache = new PromptAudioCache(
        state.questions.map((question) => question.audio_text),
        state.promptAccents,
      );
      state.currentIndex = 0;
      state.answers = {};
      state.sentenceOrders = {};
      state.durations = {};
      state.remaining = payload.time_limit_seconds;
      state.practiceStartedAt = Date.now();
      state.deadline = state.timerMode === 'countdown' ? Date.now() + state.remaining * 1000 : null;
      state.questionStartedAt = Date.now();
      appViews.show(dom.exam, { path: state.practicePath });
      dom.submit.disabled = false;
      dom.next.disabled = false;
      dom.saveState.textContent = '';
      dom.examTitle.textContent = taskType
        ? TASK_LABELS[taskType]
        : `${SECTION_LABELS[section]} 整科练习`;
      renderQuestion();
      startTimer();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      showToast(`题目加载失败：${error.message}`);
    } finally {
      state.loading = false;
      dom.sectionGrid.querySelectorAll('button').forEach((button) => {
        button.disabled = false;
      });
      dom.setup.querySelectorAll('button, input').forEach((control) => {
        control.disabled = false;
      });
    }
  }

  function startTimer() {
    stopTimer();
    updateTimer();
    if (state.timerMode === 'countdown') {
      state.deadlineTimer = setTimeout(
        () => {
          state.remaining = 0;
          updateTimer();
          submitExam();
        },
        Math.max(0, state.deadline - Date.now()),
      );
      if (state.remaining <= 0) return;
    }
    state.timerId = window.setInterval(() => {
      if (state.timerMode === 'countdown')
        state.remaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
      updateTimer();
      if (state.timerMode === 'countdown' && state.remaining <= 0 && !state.leaving) {
        stopTimer();
        showToast('时间到，正在提交这一部分的答案。 ');
        submitExam();
      }
    }, 1000);
  }

  function testBody() {
    saveCurrentAnswer();
    return {
      responses: state.questions.map((q) => ({
        question_id: q.id,
        answer: state.answers[q.id] ?? null,
        duration_seconds: Math.round(state.durations[q.id] || 0),
      })),
      word_orders: state.sentenceOrders,
      item_index: state.currentIndex,
    };
  }

  function scheduleTestSave() {
    if (!state.testSession?.deadline || state.submitting || state.testSubmission || dom.exam.hidden)
      return;
    const body = testBody();
    adaptiveTest.keepDraft(body);
    clearTimeout(testSaveTimer);
    testSaveTimer = setTimeout(async () => {
      try {
        await adaptiveTest.save(body);
        dom.saveState.textContent = '进度已保存';
      } catch (error) {
        dom.saveState.textContent = `尚未同步：${error.message}。答案已暂存本机，可重试提交。`;
      }
    }, 700);
  }

  function showTestSession(payload) {
    state.testSubmission = null;
    state.practicePath = null;
    const path = `/tests/${payload.id}`;
    clearTimeout(testSaveTimer);
    stopTimer();
    stopRecording(true);
    clearPromptAudio();
    if (state.testSession?.id !== payload.id) {
      clearRecordings();
      state.practiceId += 1;
    }
    state.testSession = payload;
    state.mode = 'exam';
    state.taskType = null;
    state.count = null;
    state.historyReview = false;
    state.recordings = { ...payload.recordings, ...state.recordings };
    if (payload.status === 'completed') {
      state.section = 'all';
      state.questions = payload.questions;
      state.submission = { id: payload.id };
      renderResult(payload.result);
      appViews.show(dom.result, { path: `/history/test/${payload.id}`, replace: true });
      archiveRecordings();
      return;
    }
    state.section = payload.phase.section;
    state.questions = payload.phase.questions;
    state.answers = Object.fromEntries(payload.responses.map((r) => [r.question_id, r.answer]));
    state.durations = Object.fromEntries(
      payload.responses.map((r) => [r.question_id, r.duration_seconds || 0]),
    );
    state.sentenceOrders = payload.word_orders;
    state.currentIndex = payload.item_index;
    if (payload.deadline === null) {
      appViews.show(dom.testSetup, { path });
      return;
    }
    state.promptAccents = new Map();
    state.audioCache = new PromptAudioCache(
      state.questions.map((q) => q.audio_text),
      state.promptAccents,
    );
    state.timerMode = 'countdown';
    state.remaining = Math.max(0, Math.ceil(payload.deadline - payload.server_time));
    state.deadline = Date.now() + (payload.deadline - payload.server_time) * 1000;
    state.practiceStartedAt = Date.now();
    state.questionStartedAt = Date.now();
    appViews.show(dom.exam, { path });
    dom.submit.disabled = false;
    dom.submit.textContent = payload.phase_index === 8 ? '完成测验' : '提交本阶段';
    dom.next.disabled = false;
    dom.examTitle.textContent = `${payload.profile.title} · ${payload.phase.title} · ${payload.phase.level} 档`;
    dom.saveState.textContent = '进度自动保存；本阶段提交后锁定';
    renderQuestion();
    startTimer();
  }

  function saveTestRecordings() {
    const id = state.testSession.id;
    testRecordingChain = testRecordingChain
      .catch(() => {})
      .then(async () => {
        if (state.testSession?.id !== id) return;
        for (const [qid, url] of Object.entries(state.recordings)) {
          if (!url.startsWith('blob:')) continue;
          const blob = await (await fetch(url)).blob();
          const response = await fetch(`/api/v1/tests/sessions/${id}/recordings/${qid}`, {
            method: 'PUT',
            headers: { 'Content-Type': blob.type },
            body: blob,
          });
          if (!response.ok) throw new Error('录音尚未保存，请保留页面并重试');
          if (state.recordings[qid] === url) {
            state.recordings[qid] = `/api/v1/tests/sessions/${id}/recordings/${qid}`;
            if (currentQuestion()?.id === qid && !dom.exam.hidden) {
              const playback = dom.questionContent.querySelector('[data-recording-playback]');
              if (playback) playback.src = state.recordings[qid];
            }
          }
          URL.revokeObjectURL(url);
        }
      });
    return testRecordingChain;
  }

  function stopTimer() {
    clearTimeout(state.deadlineTimer);
    if (state.timerId) window.clearInterval(state.timerId);
    state.timerId = null;
  }

  function updateTimer() {
    dom.timerLabel.textContent = state.timerMode === 'countup' ? '已用' : '剩余';
    dom.timer.textContent = formatTime(
      state.timerMode === 'countup'
        ? Math.floor((Date.now() - state.practiceStartedAt) / 1000)
        : state.remaining,
    );
    dom.timer.classList.toggle(
      'is-urgent',
      state.timerMode === 'countdown' && state.remaining <= 60,
    );
  }

  function questionSteps() {
    return state.questions
      .map((_, index) => index)
      .filter((index) => {
        const question = state.questions[index];
        return (
          question.task_type !== 'complete_words' ||
          index === 0 ||
          state.questions[index - 1].group_id !== question.group_id
        );
      });
  }

  function stepAnswered(question) {
    return question.task_type === 'complete_words'
      ? state.questions
          .filter((q) => q.group_id === question.group_id)
          .every((q) => isAnswered(q.id))
      : isAnswered(question.id);
  }

  function renderQuestionIndex() {
    const answered = state.questions.filter((question) => isAnswered(question.id)).length;
    dom.answeredCount.textContent = `${answered} / ${state.questions.length} 已答`;
    dom.questionIndex.innerHTML = questionSteps()
      .map((index, step) => {
        const question = state.questions[index];
        const classes = [
          index === state.currentIndex ? 'is-current' : '',
          stepAnswered(question) ? 'is-done' : '',
        ]
          .filter(Boolean)
          .join(' ');
        const label =
          question.task_type === 'complete_words'
            ? `第 ${step + 1} 项，填词短文，10 空`
            : `第 ${step + 1} 项`;
        return `<button type="button" class="${classes}" data-question-index="${index}" aria-current="${index === state.currentIndex ? 'step' : 'false'}" aria-label="${label}">${String(step + 1).padStart(2, '0')}</button>`;
      })
      .join('');
  }

  function currentQuestion() {
    return state.questions[state.currentIndex];
  }

  function renderQuestion() {
    disposeSentenceControls?.();
    disposeSentenceControls = null;
    stopRecording(true);
    const frozen =
      Boolean(state.testSubmission) ||
      (state.timerMode === 'countdown' && state.deadline !== null && Date.now() >= state.deadline);
    dom.questionContent.inert = frozen;
    dom.questionIndex.inert = frozen;
    stopAudio();
    const question = currentQuestion();
    if (!question) return;
    state.audioCache?.prioritize(question.audio_text);
    const steps = questionSteps();
    dom.questionRail.hidden = steps.length === 1;
    dom.previous.hidden = steps.length === 1;
    dom.questionNumber.textContent =
      steps.length === 1 && question.task_type === 'complete_words'
        ? '10 空'
        : `${steps.indexOf(state.currentIndex) + 1} / ${steps.length}${question.task_type === 'complete_words' ? ' · 10 空' : ''}`;
    dom.questionType.textContent = TASK_LABELS[question.task_type] || question.task_type;
    dom.questionType.hidden = state.mode === 'practice';
    dom.difficulty.textContent = DIFFICULTY_LABELS[question.difficulty] || '待分级';
    dom.difficulty.title = state.meta.difficulty_note;
    dom.questionContent.innerHTML = questionMarkup(question);
    bindQuestionControls(question);
    renderQuestionIndex();
    dom.previous.disabled =
      question.task_type === 'complete_words'
        ? state.questions.findIndex((item) => item.group_id === question.group_id) === 0
        : state.currentIndex === 0;
    const isLast = state.currentIndex === steps[steps.length - 1];
    dom.next.hidden = isLast;
    dom.submit.hidden = false;
    state.questionStartedAt = Date.now();
    window.requestAnimationFrame(() => {
      const firstInput =
        question.response_type === 'recording_text'
          ? dom.questionContent.querySelector('[data-audio-text]')
          : dom.questionContent.querySelector(`[data-answer-id="${question.id}"]`) ||
            dom.questionContent.querySelector('textarea, input, button.choice-option');
      if (firstInput) firstInput.focus({ preventScroll: true });
    });
  }

  function materialMarkup(question) {
    const title = escapeHtml(question.passage_title || '');
    const body = escapeHtml(question.passage || '');
    if (question.task_type === 'read_daily_life') {
      const kind = question.document_type || 'notice';
      const labels = {
        agenda: 'AGENDA',
        flyer: 'CAMPUS EVENTS',
        email: 'EMAIL',
        messages: 'MESSAGES',
        menu: 'MENU',
        notice: 'NOTICE',
      };
      const lines = body
        .split('\n')
        .map((line) => {
          const match = kind === 'agenda' && line.match(/^(\d{1,2}:\d{2})\s+(.*)$/);
          return match
            ? `<div class="agenda-row"><time>${match[1]}</time><span>${match[2]}</span></div>`
            : `<p>${line}</p>`;
        })
        .join('');
      return `<article class="reading-document document-${kind}" lang="en"><div class="document-kind">${labels[kind]}</div><h3>${title}</h3><div class="document-body">${lines}</div></article>`;
    }
    const paragraphs = body
      .split(/\n\s*\n/)
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join('');
    return `<article class="academic-material" lang="en"><h3 class="passage-title">${title}</h3><div class="passage-copy" tabindex="0" role="region" aria-label="阅读文章">${paragraphs}</div></article>`;
  }

  function clozeMarkup(question, group, { feedback = null, reveal = false, answers = {} } = {}) {
    const passage = escapeHtml(question.passage).replace(/\{(R\d+)\}/g, (_, id) => {
      const index = group.findIndex((item) => item.id === id);
      const blank = group[index];
      const prefix = escapeHtml(blank.prefix);
      if (feedback) {
        const result = feedback.find((item) => item.question_id === id);
        const answer = reveal ? result.missing_letters : formatAnswer(result.answer);
        const letters = Array.from(
          answer.padEnd(blank.missing_length, '_'),
          (letter) =>
            `<span class="cloze-answer-letter">${letter === '_' ? '&nbsp;' : escapeHtml(letter)}</span>`,
        ).join('');
        return `<span class="cloze-word"><span>${prefix}</span><span class="cloze-answer cloze-letters ${reveal || result.correct ? 'is-correct' : 'is-incorrect'}">${letters}</span><sup>${index + 1}</sup></span>`;
      }
      const answer = answers[id] || '';
      const letters = Array.from(
        { length: blank.missing_length },
        (_, letterIndex) =>
          `<input data-answer-id="${id}" aria-label="第 ${index + 1} 空，${prefix} 后第 ${letterIndex + 1} 个字母，共 ${blank.missing_length} 个" type="text" value="${escapeHtml((answer[letterIndex] || '').replace('_', ''))}" maxlength="1" pattern="[A-Za-z]" autocomplete="off" spellcheck="false" autocapitalize="off">`,
      ).join('');
      return `<span class="cloze-word"><span>${prefix}</span><span class="cloze-letters">${letters}</span><sup>${index + 1}</sup></span>`;
    });
    return `<div class="cloze-passage" lang="en">${passage}</div>`;
  }

  function audioMarkup(question) {
    const text = escapeHtml(question.audio_text || '');
    const script = PromptSpeech.parseTurns(question.audio_text || '')
      .map(
        (turn) =>
          `<p lang="en">${turn.speaker ? `<strong>${escapeHtml(turn.speaker)}:</strong> ` : ''}${escapeHtml(turn.text)}</p>`,
      )
      .join('');
    return `
      <div class="audio-panel">
        <div class="audio-copy">
          <strong>听音频，再回答</strong>
          <span>练习辅助：可重播、查看脚本；非考场功能。</span>
        </div>
        <button class="audio-button" type="button" data-audio-text="${text}">▶ 播放提示音</button>
        <details class="script-details">
          <summary>查看练习脚本</summary>
          ${script}
        </details>
      </div>`;
  }

  function recordingMarkup(question, material) {
    const value = escapeHtml(formatAnswer(state.answers[question.id]));
    return `
      <div class="speaking-practice-layout">
        <div class="speaking-task">
          ${material}
          <div class="recording-panel">
            <div class="recording-actions">
              <button class="record-button" type="button" data-record>● 开始录音</button>
              <span class="recording-status" data-recording-status>录音上限 ${question.max_seconds} 秒</span>
            </div>
            <audio data-recording-playback controls ${state.recordings[question.id] ? `src="${state.recordings[question.id]}"` : 'hidden'} aria-label="回放你的录音"></audio>
          </div>
        </div>
        <details class="speaking-practice-aid" ${value ? 'open' : ''}>
          <summary>练习辅助：回答转写</summary>
          <label for="answer-input">回答转写</label>
          <p id="transcription-help" class="hint-copy">${state.testSession ? '转写与录音供交卷后复盘，口语待人工复核。' : '仅用于练习的文字反馈，不是考试作答区。'}无自动转写时可手动输入。</p>
          <textarea id="answer-input" class="essay-input" maxlength="5000" rows="5" aria-describedby="transcription-help" placeholder="录音后查看或补充你的回答转写。">${value}</textarea>
        </details>
      </div>`;
  }

  function practiceLayout(material, response) {
    return `<div class="practice-split-layout"><div class="practice-material">${material}</div><div class="practice-response">${response}</div></div>`;
  }

  function questionMarkup(question) {
    const prompt = escapeHtml(question.prompt);
    let markup = '';
    if (question.passage_title && !question.passage)
      markup += `<p class="passage-title">${escapeHtml(question.passage_title)}</p>`;
    if (question.audio_text) markup += audioMarkup(question);
    if (question.task_type === 'listen_repeat') {
      return recordingMarkup(
        question,
        `<p class="question-copy compact" lang="en">${prompt}</p>${markup}`,
      );
    }
    if (question.task_type === 'take_interview') {
      return recordingMarkup(
        question,
        `<p class="question-copy compact">请听面试问题，并录音回答。</p>${markup}`,
      );
    }
    if (question.response_type === 'choice') {
      const material = question.passage ? materialMarkup(question) : '';
      const introduction = markup;
      markup = `<p class="question-copy compact" lang="en">${prompt}</p><div class="choice-list" role="group" aria-label="选择一个答案">`;
      markup += question.options
        .map((option, index) => {
          const selected = state.answers[question.id] === index;
          return `<button type="button" class="choice-option ${selected ? 'is-selected' : ''}" aria-pressed="${selected}" data-choice="${index}"><span class="choice-letter">${String.fromCharCode(65 + index)}</span><span class="choice-copy">${escapeHtml(option)}</span><span class="choice-indicator" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 10 3 3 7-7"/></svg></span></button>`;
        })
        .join('');
      markup += '</div>';
      if (material)
        return `<div class="reading-question-layout">${material}<div class="reading-answer-panel">${markup}</div></div>`;
      return practiceLayout(introduction, markup);
    }
    if (question.task_type === 'complete_words') {
      markup += `<p class="cloze-instruction" lang="en">Fill in the missing letters in the paragraph.</p>${clozeMarkup(
        question,
        state.questions.filter((item) => item.group_id === question.group_id),
        { answers: state.answers },
      )}`;
      return markup;
    }
    if (question.task_type === 'build_sentence') {
      const material = `${markup}<p class="sentence-instruction" lang="en">${escapeHtml(question.instruction || 'Make an appropriate sentence.')}</p><p class="question-copy compact" lang="en">${prompt}</p>`;
      return `<section class="sentence-builder" aria-label="造句作答">${material}<div data-sentence-workspace>${sentenceBuilder.markup(question, state.sentenceOrders[question.id])}</div></section>`;
    }
    if (question.response_type === 'essay') {
      const limit = question.word_limit || {};
      const wordAdvice =
        question.task_type === 'write_email'
          ? `练习目标 ${limit.recommended_min} 词；官方未设最低字数`
          : `ETS 建议有效回应至少 ${limit.min} 词`;
      const response = `<div class="writing-response-header"><label for="answer-input">你的回答</label><span class="word-count" data-word-count>0 words</span></div><textarea id="answer-input" maxlength="5000" class="essay-input" rows="9" placeholder="在这里写下你的回答。"></textarea><div class="writing-meta"><span class="word-count">${wordAdvice} · 官方任务限时 ${Math.round(question.max_seconds / 60)} 分钟</span></div>`;
      // The original discussion bank stores these three parts in one prompt.
      const discussion =
        question.task_type === 'academic_discussion' &&
        question.prompt.match(
          /^(Professor:[^\n]+)\n(Student A:[^\n]+\nStudent B:[^\n]+)\n\s*\n([\s\S]+)$/,
        );
      if (discussion) {
        const material = `${markup}<p class="question-copy compact" lang="en">${escapeHtml(discussion[1])}</p><p class="discussion-instruction" lang="en">${escapeHtml(discussion[3])}</p>`;
        const posts = `<div class="discussion-posts" aria-label="同学的讨论观点" lang="en">${discussion[2]
          .split('\n')
          .map((post) => `<p>${escapeHtml(post)}</p>`)
          .join('')}</div>`;
        return practiceLayout(material, `${posts}${response}`);
      }
      return practiceLayout(`${markup}<p class="question-copy compact">${prompt}</p>`, response);
    }
    return `<p class="question-copy">${prompt}</p>`;
  }

  function bindSentenceControls(question) {
    const workspace = dom.questionContent.querySelector('[data-sentence-workspace]');
    if (!workspace) return;
    disposeSentenceControls = sentenceBuilder.mount(workspace, {
      question,
      initialOrder: state.sentenceOrders[question.id],
      onChange: ({ order, answer }) => {
        state.sentenceOrders[question.id] = order;
        state.answers[question.id] = answer;
        updateAnsweredUi();
        scheduleTestSave();
      },
    });
  }

  function saveClozeAnswer(letters) {
    const inputs = [...letters.querySelectorAll('input')];
    // Underscores preserve skipped positions when the API trims surrounding whitespace.
    state.answers[inputs[0].dataset.answerId] = inputs
      .map((input) => input.value || '_')
      .join('')
      .replace(/_+$/, '');
  }

  function bindQuestionControls(question) {
    dom.questionContent.querySelectorAll('.cloze-letters').forEach((letters) => {
      const inputs = [...letters.querySelectorAll('input')];
      const save = () => {
        saveClozeAnswer(letters);
        updateAnsweredUi();
        scheduleTestSave();
      };
      inputs.forEach((input, index) => {
        input.addEventListener('focus', () => input.select());
        const enterLetter = (event) => {
          if (event.isComposing) return;
          input.value = input.value.replace(/[^a-z]/gi, '').slice(0, 1);
          save();
          if (input.value) inputs[index + 1]?.focus();
        };
        input.addEventListener('input', enterLetter);
        input.addEventListener('compositionend', enterLetter);
        input.addEventListener('paste', (event) => {
          event.preventDefault();
          const text = event.clipboardData
            .getData('text')
            .replace(/[^a-z]/gi, '')
            .slice(0, inputs.length - index);
          if (!text) return;
          [...text].forEach((letter, offset) => {
            inputs[index + offset].value = letter;
          });
          save();
          inputs[Math.min(index + text.length, inputs.length - 1)].focus();
        });
        input.addEventListener('keydown', (event) => {
          if (event.isComposing) return;
          if (event.key === 'Backspace' && !input.value && index > 0) {
            event.preventDefault();
            inputs[index - 1].value = '';
            inputs[index - 1].focus();
            save();
          } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            const next = inputs[index + (event.key === 'ArrowLeft' ? -1 : 1)];
            if (next) {
              event.preventDefault();
              next.focus();
            }
          }
        });
      });
    });
    const input = dom.questionContent.querySelector('#answer-input');
    if (input) {
      input.value = formatAnswer(state.answers[question.id]);
      input.addEventListener('input', () => {
        state.answers[question.id] = input.value;
        updateAnsweredUi();
        updateWordCount(input);
        scheduleTestSave();
      });
      updateWordCount(input);
    }
    dom.questionContent.querySelectorAll('[data-choice]').forEach((button) => {
      button.addEventListener('click', () => {
        state.answers[question.id] = Number(button.dataset.choice);
        dom.questionContent.querySelectorAll('[data-choice]').forEach((item) => {
          item.classList.remove('is-selected');
          item.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('is-selected');
        button.setAttribute('aria-pressed', 'true');
        updateAnsweredUi();
        scheduleTestSave();
      });
    });
    bindSentenceControls(question);
    const audioButton = dom.questionContent.querySelector('[data-audio-text]');
    if (audioButton)
      audioButton.addEventListener('click', () =>
        playAudio(audioButton.dataset.audioText, audioButton),
      );
    const recordButton = dom.questionContent.querySelector('[data-record]');
    if (recordButton) recordButton.addEventListener('click', () => toggleRecording(question));
  }

  function updateWordCount(input) {
    const counter = dom.questionContent.querySelector('[data-word-count]');
    if (!counter) return;
    const count = (input.value.trim().match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []).length;
    counter.textContent = `${count} words`;
  }

  function updateAnsweredUi() {
    const answered = state.questions.filter((question) => isAnswered(question.id)).length;
    dom.answeredCount.textContent = `${answered} / ${state.questions.length} 已答`;
    dom.questionIndex.querySelectorAll('button').forEach((button) => {
      button.classList.toggle(
        'is-done',
        stepAnswered(state.questions[Number(button.dataset.questionIndex)]),
      );
    });
    dom.saveState.textContent = '';
  }

  function saveCurrentAnswer() {
    const question = currentQuestion();
    if (!question) return;
    const input = dom.questionContent.querySelector('#answer-input');
    if (input) state.answers[question.id] = input.value.trim();
    dom.questionContent.querySelectorAll('.cloze-letters').forEach(saveClozeAnswer);
    const now = state.timerMode === 'countdown' ? Math.min(Date.now(), state.deadline) : Date.now();
    if (!state.submitting)
      state.durations[question.id] = Math.min(
        3600,
        (state.durations[question.id] || 0) + Math.max(0, (now - state.questionStartedAt) / 1000),
      );
    state.questionStartedAt = now;
    updateAnsweredUi();
  }

  function goToQuestion(index) {
    if (state.submitting || state.testSubmission) return;
    saveCurrentAnswer();
    if (index < 0 || index >= state.questions.length) return;
    state.currentIndex = index;
    renderQuestion();
    scheduleTestSave();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function moveQuestion(direction) {
    const steps = questionSteps();
    const index = steps[steps.indexOf(state.currentIndex) + direction];
    if (index !== undefined) goToQuestion(index);
  }

  async function submitExam() {
    if (state.submitting || state.leaving || !state.section) return;
    saveCurrentAnswer();
    state.submitting = true;
    clearTimeout(testSaveTimer);
    dom.questionContent.inert = true;
    dom.questionIndex.inert = true;
    stopTimer();
    const recordingStopped = stopRecording();
    stopAudio();
    dom.submit.disabled = true;
    dom.next.disabled = true;
    dom.saveState.textContent = '正在保存并评分…';
    try {
      await recordingStopped;
      saveCurrentAnswer();
      if (state.testSession) {
        clearTimeout(testSaveTimer);
        await saveTestRecordings();
        state.testSubmission ||= structuredClone(testBody());
        adaptiveTest.keepDraft(state.testSubmission);
        await adaptiveTest.submit(state.testSubmission);
        state.submitting = false;
        return;
      }
      const responses = state.questions.map((question) => ({
        question_id: question.id,
        answer: state.answers[question.id] ?? null,
        duration_seconds: Math.round(state.durations[question.id] || 0),
      }));
      const selection =
        state.mode === 'practice'
          ? { count: state.count, question_ids: state.questions.map((q) => q.id) }
          : {};
      const answerKey = JSON.stringify(
        responses.map(({ question_id, answer }) => ({ question_id, answer })),
      );
      if (state.submission?.answerKey !== answerKey) {
        const id = crypto.randomUUID();
        state.submission = {
          id,
          answerKey,
          body: JSON.stringify({
            submission_id: id,
            responses,
            section: state.section,
            mode: state.mode,
            task_type: state.taskType,
            ...selection,
          }),
        };
      }
      const result = await api('/api/v1/exam/submit', {
        method: 'POST',
        body: state.submission.body,
      });
      clearPromptAudio();
      renderResult(result);
      state.practicePath = null;
      appViews.show(dom.result, {
        path: `/history/practice/${state.submission.id}`,
        replace: true,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      await archiveRecordings();
    } catch (error) {
      showToast(`提交失败：${error.message}`);
      if (error.status === 422) state.testSubmission = null;
      dom.submit.disabled = false;
      dom.next.disabled = Boolean(state.testSubmission);
      state.submitting = false;
      const expired = state.timerMode === 'countdown' && Date.now() >= state.deadline;
      dom.questionContent.inert = expired || Boolean(state.testSubmission);
      dom.questionIndex.inert = expired || Boolean(state.testSubmission);
      if (state.timerMode === 'countup' || state.remaining > 0) startTimer();
      dom.saveState.textContent = '提交失败，答案仍保留。请点击提交重试。';
      return;
    }
    state.submitting = false;
  }

  async function archiveRecordings() {
    const submissionId = state.submission.id;
    const category = state.section === 'all' ? 'test' : 'practice';
    const archiveKey = `${category}/${submissionId}`;
    const recordings = state.recordings;
    const status = document.querySelector('#recording-archive-status');
    const retry = document.querySelector('#retry-recording-archive');
    retry.disabled = true;
    const uploads = Object.entries(state.recordings).filter(([, url]) => url.startsWith('blob:'));
    if (uploads.length) pendingRecordingArchives.set(archiveKey, Object.fromEntries(uploads));
    if (uploads.length) {
      status.hidden = false;
      status.querySelector('span').textContent = '正在归档口语录音，请稍候…';
    }
    const results = await Promise.allSettled(
      uploads.map(async ([id, url]) => {
        const blob = await (await fetch(url)).blob();
        const savedUrl = `/api/v1/history/${category}/${submissionId}/recordings/${id}`;
        const response = await fetch(savedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': blob.type },
          body: blob,
        });
        if (!response.ok) throw new Error('录音保存失败');
        if (recordings[id] === url) recordings[id] = savedUrl;
        if (state.recordings[id] === url) state.recordings[id] = savedUrl;
        delete pendingRecordingArchives.get(archiveKey)?.[id];
        if (!Object.keys(pendingRecordingArchives.get(archiveKey) || {}).length)
          pendingRecordingArchives.delete(archiveKey);
        document.querySelectorAll('audio').forEach((audio) => {
          if (audio.getAttribute('src') === url) audio.src = savedUrl;
        });
        URL.revokeObjectURL(url);
      }),
    );
    if (state.submission?.id !== submissionId || dom.result.hidden) return;
    const failed = results.filter((result) => result.status === 'rejected').length;
    showRecordingArchiveStatus(failed);
  }

  function showRecordingArchiveStatus(failed) {
    const status = document.querySelector('#recording-archive-status');
    status.hidden = failed === 0;
    if (failed)
      status.querySelector('span').textContent =
        `文字答案已归档；${failed} 段录音尚未保存，可在本页或历史复盘中重试。关闭或刷新页面会丢失待上传录音。`;
    document.querySelector('#retry-recording-archive').disabled = false;
  }

  function renderResult(result) {
    dom.toast.hidden = true;
    window.clearTimeout(showToast.timeoutId);
    practiceReview.show({
      result,
      questions: state.questions,
      section: state.section,
      recordings: state.recordings,
      historyReview: state.historyReview,
      tasks:
        state.section === 'all'
          ? Object.assign({}, ...Object.values(state.meta.sections).map((s) => s.practice_tasks))
          : state.meta.sections[state.section].practice_tasks,
    });
  }

  function stopAudio() {
    if (state.audioRequest) state.audioRequest.abort();
    state.audioRequest = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    document
      .querySelectorAll('.question-content audio, .feedback-list audio')
      .forEach((audio) => audio.pause());
    document.querySelectorAll('[data-audio-text]').forEach((button) => {
      button.disabled = false;
      button.textContent = '▶ 播放提示音';
    });
  }

  function clearPromptAudio() {
    stopAudio();
    state.audioCache?.dispose();
    state.audioCache = null;
  }

  async function playAudio(text, button) {
    if (!text) return;
    stopAudio();
    const request = new AbortController();
    state.audioRequest = request;
    const original = button.textContent;
    button.disabled = true;
    button.textContent = '加载音频…';
    try {
      state.audioCache ??= new PromptAudioCache([], state.promptAccents);
      await PromptSpeech.play(state.audioCache, text, {
        signal: request.signal,
        onStart: () => {
          button.textContent = '播放中…';
        },
      });
    } catch (error) {
      if (!request.signal.aborted) showToast(error.message);
    } finally {
      if (!request.signal.aborted) {
        button.disabled = false;
        button.textContent = original;
        state.audioRequest = null;
      }
    }
  }

  async function toggleRecording(question) {
    if (practiceRecorder.isRecording()) {
      stopRecording();
      return;
    }
    stopAudio();
    await practiceRecorder.start({
      questionId: question.id,
      practiceId: state.practiceId,
      maxSeconds: question.max_seconds,
    });
  }

  function openTranscription() {
    const aid = dom.questionContent.querySelector('.speaking-practice-aid');
    if (aid) aid.open = true;
    dom.questionContent.querySelector('#answer-input')?.focus({ preventScroll: true });
  }

  function stopRecording(cancelTranscript = false) {
    return practiceRecorder.stop({ cancelTranscript });
  }

  function clearRecordings() {
    Object.values(state.recordings)
      .filter(
        (url) =>
          url.startsWith('blob:') &&
          ![...pendingRecordingArchives.values()].some((clips) =>
            Object.values(clips).includes(url),
          ),
      )
      .forEach((url) => URL.revokeObjectURL(url));
    state.recordings = {};
  }

  function showLanding() {
    if (state.submitting) return;
    clearTimeout(testSaveTimer);
    state.testSession = null;
    stopTimer();
    stopRecording(true);
    clearPromptAudio();
    appViews.show(dom.landing);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function returnFromExam() {
    appViews.navigate(
      state.testSession || state.mode !== 'practice' ? '/' : `/practice/${state.section}`,
    );
  }

  dom.sectionGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-section]');
    if (!button) return;
    if (button.dataset.action === 'configure') configureSection(button.dataset.section);
    else startSection(button.dataset.section, button.dataset.mode, button.dataset.taskType || null);
  });
  dom.setupTabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-setup-section]');
    if (button) {
      configureSection(button.dataset.setupSection);
      document.querySelector(`#tab-${state.setupSection}`).focus();
    }
  });
  dom.setupTabs.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || state.loading) return;
    event.preventDefault();
    const sections = Object.keys(SECTION_NAMES);
    const current = sections.indexOf(state.setupSection);
    const index =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? 3
          : (current + (event.key === 'ArrowRight' ? 1 : 3)) % 4;
    configureSection(sections[index]);
    document.querySelector(`#tab-${state.setupSection}`).focus();
  });
  dom.setupContent.addEventListener('change', (event) => {
    const input = event.target;
    if (input.name === 'task_type') {
      state.setupTask = input.value;
      const config = state.meta.sections[state.setupSection].practice_tasks[state.setupTask];
      if (!config.count_options.includes(state.setupCount))
        state.setupCount = config.count_options[0];
      if (!config.timer_modes.includes(state.setupTimer)) state.setupTimer = config.timer_modes[0];
    } else if (input.name === 'count') state.setupCount = Number(input.value);
    else if (input.name === 'timer_mode') state.setupTimer = input.value;
    else return;
    renderSetup();
    dom.setupContent.querySelector(`input[name="${input.name}"][value="${input.value}"]`)?.focus();
  });
  dom.setupContent.addEventListener('submit', (event) => {
    event.preventDefault();
    startSection(
      state.setupSection,
      'practice',
      state.setupTask,
      state.setupCount,
      state.setupTimer,
    );
  });
  dom.questionIndex.addEventListener('click', (event) => {
    const button = event.target.closest('[data-question-index]');
    if (button) goToQuestion(Number(button.dataset.questionIndex));
  });
  dom.previous.addEventListener('click', () => moveQuestion(-1));
  dom.next.addEventListener('click', () => moveQuestion(1));
  dom.submit.addEventListener('click', submitExam);
  document.querySelector('#back-home').addEventListener('click', returnFromExam);
  document.querySelector('#result-home').addEventListener('click', () => {
    if (state.historyReview) window.dispatchEvent(new Event('open-history'));
    else showLanding();
  });
  document.querySelector('#retry-recording-archive').addEventListener('click', archiveRecordings);
  window.addEventListener('history-cleared', () => {
    for (const clips of pendingRecordingArchives.values()) {
      for (const [id, url] of Object.entries(clips)) {
        URL.revokeObjectURL(url);
        if (state.recordings[id] === url) delete state.recordings[id];
      }
    }
    pendingRecordingArchives.clear();
  });
  window.addEventListener('history-opened', () => {
    state.practicePath = null;
    state.practiceId += 1;
    clearTimeout(testSaveTimer);
    state.testSession = null;
    stopTimer();
    clearPromptAudio();
    clearRecordings();
  });
  window.addEventListener('open-history-practice', (event) => {
    const record = event.detail;
    state.practicePath = null;
    state.practiceId += 1;
    state.testSession = null;
    clearPromptAudio();
    clearRecordings();
    state.section = record.section;
    state.mode = record.mode;
    state.taskType = record.task_type;
    state.questions = record.questions;
    const pending =
      pendingRecordingArchives.get(
        `${record.section === 'all' ? 'test' : 'practice'}/${record.id}`,
      ) || {};
    state.recordings = { ...record.recordings, ...pending };
    state.submission = { id: record.id };
    state.historyReview = true;
    const feedback = record.result.feedback.map((item) => {
      const explanation = record.learning_explanations?.[item.question_id];
      if (!explanation) return item;
      const repeatedExplanation = (item.feedback || '').trim() === (item.explanation || '').trim();
      return { ...item, explanation, feedback: repeatedExplanation ? explanation : item.feedback };
    });
    renderResult({ ...record.result, feedback });
    showRecordingArchiveStatus(Object.keys(pending).length);
    appViews.show(dom.result, {
      path: `/history/${record.section === 'all' ? 'test' : 'practice'}/${record.id}`,
    });
    appViews.focus(document.querySelector('#result-home'));
  });
  window.addEventListener('open-practice', (event) => {
    if (state.meta?.sections[event.detail]) configureSection(event.detail);
  });
  document.querySelector('#setup-home').addEventListener('click', showLanding);
  window.addEventListener('pagehide', clearPromptAudio);
  window.addEventListener('beforeunload', (event) => {
    if (
      practiceRecorder.isPending() ||
      pendingRecordingArchives.size ||
      Object.values(state.recordings).some((url) => url.startsWith('blob:'))
    ) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && !dom.exam.hidden) {
      state.audioCache = new PromptAudioCache(
        state.questions.map((question) => question.audio_text),
        state.promptAccents,
      );
      state.audioCache.prioritize(currentQuestion()?.audio_text);
    }
  });

  appViews.register(/^\/$/, showLanding);
  appViews.register(/^\/practice\/(reading|listening|writing|speaking)$/, ([, section]) =>
    configureSection(section, true),
  );
  appViews.register(
    /^\/(?:practice\/(reading|listening|writing|speaking)\/run|exam\/(reading|listening|writing|speaking))\/[^/]+$/,
    ([path, section]) => {
      if (state.practicePath !== path) {
        if (section) configureSection(section, true);
        else showLanding();
        showToast('未提交的练习仅保留在当前页面，请重新开始一轮练习。');
        return;
      }
      appViews.show(dom.exam, { path });
      state.questionStartedAt = Date.now();
      state.audioCache = new PromptAudioCache(
        state.questions.map((q) => q.audio_text),
        state.promptAccents,
      );
      if (state.timerMode === 'countdown')
        state.remaining = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
      renderQuestion();
      startTimer();
      if (state.timerMode === 'countdown' && state.remaining <= 0) submitExam();
    },
  );
  appViews.register(/^\/tests$/, () => adaptiveTest.open());
  appViews.register(/^\/tests\/([^/]+)$/, ([, id]) => adaptiveTest.resume(id));
  appViews.beforeNavigate(async () => {
    if (state.loading || state.submitting || adaptiveTest.isBusy()) return false;
    if (!dom.exam.hidden) {
      state.leaving = true;
      clearTimeout(testSaveTimer);
      try {
        saveCurrentAnswer();
        const stopped = stopRecording();
        if (state.testSession) {
          await stopped;
          await saveTestRecordings();
          const body = state.testSubmission || testBody();
          adaptiveTest.keepDraft(body);
          await adaptiveTest.save(body);
        }
      } catch (error) {
        showToast(`保存未完成：${error.message}，请重试`);
        return false;
      } finally {
        state.leaving = false;
      }
      stopTimer();
    }
    if (!dom.exam.hidden || !dom.result.hidden) {
      clearPromptAudio();
      document.querySelectorAll('audio').forEach((audio) => audio.pause());
    }
    return true;
  });
  window.addEventListener('navigation-error', (event) => showToast(event.detail));

  initializeCardTilt();
  Promise.all([
    init(),
    new Promise((resolve) =>
      document.addEventListener('DOMContentLoaded', resolve, { once: true }),
    ),
  ]).then(() => appViews.start());
})();
