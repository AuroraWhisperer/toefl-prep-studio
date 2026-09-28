(() => {
  "use strict";

  window.createAdaptiveTest = ({ api, escapeHtml: esc, onSession, onHome, showView }) => {
    const view = document.querySelector("#test-setup");
    const storageKey = "toefl-adaptive-session";
    const draftKey = "toefl-adaptive-draft";
    let catalog, level = 2, session = null, chain = Promise.resolve(), busy = false;

    function message(text) {
      const node = view.querySelector("#test-error");
      if (node) { node.hidden = !text; node.textContent = text; }
    }

    function profile() {
      return catalog.papers.find(p => p.starts.includes(level));
    }

    function renderSelection() {
      const selected = profile();
      view.innerHTML = `<header class="test-heading"><div><h1 id="test-title" tabindex="-1">选择测验难度</h1><p>五套组卷方案 · 四科 120 题 · 约 90 分钟</p></div><button type="button" class="text-button" data-test-home>返回首页</button></header>
        <div id="test-error" class="mock-error" role="alert" hidden></div>
        <div class="test-presets" role="group" aria-label="选择测验方案">${catalog.papers.map(p => `<button type="button" data-test-level="${p.level}" class="test-preset ${p.id === selected.id ? 'is-selected' : ''}" aria-pressed="${p.id === selected.id}"><span>${esc(p.label)}</span><strong>${esc(p.title)}</strong><span>默认 ${p.level} / 10</span></button>`).join("")}</div>
        <form id="test-start-form" class="test-start-form"><div><label for="test-level">起始难度</label><select id="test-level" name="level">${catalog.levels.map(n => `<option value="${n}" ${n === level ? 'selected' : ''}>${n} / 10</option>`).join("")}</select></div><p id="test-level-summary" aria-live="polite">${esc(selected.title)} · 自适应范围 ${selected.bounds[0]}–${selected.bounds[1]} 档</p><button class="primary-button" id="start-test" type="submit">开始测验 →</button></form>
        <p class="test-rule">难易混合，不是整卷同一难度。阅读和听力各自根据第一模块正确率调整：80% 起升 2 档，低于 50% 降 2 档，其余保持；始终限制在本卷范围内。</p>
        <p class="test-note">阅读 50 · 听力 47 · 写作 12 · 口语 11。使用已审阅原创题随机组卷，不同方案或重考可能有重复材料；1–10 档是选材倾向，不是 ETS 标定。写作、口语不自适应，也不换算官方成绩。</p>
        ${localStorage.getItem(storageKey) ? '<div class="test-resume"><span>上次测验已保存，继续后计时不重置。</span><button type="button" class="text-button" id="resume-test">继续上次测验 →</button></div>' : ''}`;
    }

    function present(payload) {
      session = payload;
      localStorage.setItem(storageKey, payload.id);
      onSession(payload);
      if (payload.status === "completed") {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(draftKey);
      } else if (payload.deadline === null) {
        const p = payload.phase;
        view.innerHTML = `<header class="test-heading"><div><h1 id="test-title" tabindex="-1">${esc(p.title)}</h1><p>${esc(payload.profile.title)} · 起始 ${payload.level} / 10</p></div><button type="button" class="text-button" data-test-home>保存并返回首页</button></header><div id="test-error" class="mock-error" role="alert" hidden></div><div class="test-directions"><p>阶段 ${payload.phase_index + 1} / ${payload.phase_count} · ${p.questions.length} 题 · ${p.seconds / 60} 分钟 · 当前选材 ${p.level} 档</p><p>${payload.phase_index === 1 || payload.phase_index === 3 ? '已根据本学科第一模块表现完成路由。' : '按所选试卷的起始难度组卷。'} 本阶段仍包含不同难度的题目。</p><p>开始后计时不会因刷新或离开重置。提交阶段后不可返回修改；整卷结束才显示答案与解析。漏答计错。</p><p class="test-note">本地训练：可使用重播、脚本及转写辅助。模块限时与路由为本地设置；听力限时包含播放，非正式考试流程。口语需允许麦克风，录音仅供复盘，不自动评估发音。</p><button type="button" class="primary-button" id="begin-test-phase">开始本阶段 →</button></div>`;
        view.querySelector("#test-title").focus({ preventScroll: true });
      }
    }

    async function guarded(action) {
      if (busy) return;
      busy = true;
      view.querySelectorAll("button, select").forEach(n => { n.disabled = true; });
      try { await action(); } catch (error) { message(error.message); }
      finally {
        busy = false;
        view.querySelectorAll("button, select").forEach(n => { n.disabled = false; });
      }
    }

    function send(action, body = {}) {
      const id = session.id;
      const phase_index = session.phase_index;
      const task = chain.catch(() => {}).then(() => api(`/api/v1/tests/sessions/${id}`, {
        method: "POST", body: JSON.stringify({ ...body, phase_index, action }),
      }));
      chain = task;
      return task.then(payload => {
        if (action !== "save" || payload.phase_index !== phase_index) present(payload);
        return payload;
      });
    }

    document.querySelector("#open-tests").addEventListener("click", () => guarded(async () => {
      showView(view);
      view.innerHTML = '<h1>选择测验难度</h1><p>正在加载…</p><div id="test-error" class="mock-error" role="alert" hidden></div><button type="button" class="text-button" data-test-home>返回首页</button>';
      catalog = await api("/api/v1/tests/catalog");
      renderSelection();
      view.querySelector("#test-title").focus();
    }));
    view.addEventListener("click", event => {
      const preset = event.target.closest("[data-test-level]");
      if (preset) {
        level = Number(preset.dataset.testLevel);
        renderSelection();
        view.querySelector(`[data-test-level="${level}"]`).focus();
      }
      if (event.target.closest("[data-test-home]")) onHome();
      if (event.target.closest("#begin-test-phase")) guarded(() => send("begin"));
      if (event.target.closest("#resume-test")) guarded(async () => {
        const id = localStorage.getItem(storageKey);
        let payload = await api(`/api/v1/tests/sessions/${id}`);
        session = payload;
        let draft;
        try { draft = JSON.parse(localStorage.getItem(draftKey)); } catch { /* A damaged local draft does not replace the server snapshot. */ }
        if (draft?.id === id && draft.phase_index === payload.phase_index && payload.deadline !== null && payload.status === "active") {
          payload = await send("save", draft.body);
        }
        present(payload);
      });
    });
    view.addEventListener("change", event => {
      if (event.target.id !== "test-level") return;
      level = Number(event.target.value);
      renderSelection();
      view.querySelector("#test-level").focus();
    });
    view.addEventListener("submit", event => {
      if (event.target.id !== "test-start-form") return;
      event.preventDefault();
      if (localStorage.getItem(storageKey) && !confirm("开始新测验将替换首页的恢复入口。未完成的旧测验不会计入答题记录。继续？")) return;
      guarded(async () => {
        const payload = await api("/api/v1/tests/sessions", { method: "POST", body: JSON.stringify({ level }) });
        localStorage.removeItem(draftKey);
        present(payload);
      });
    });

    return {
      save: body => send("save", body),
      submit: body => send("submit", body),
      keepDraft(body) {
        localStorage.setItem(draftKey, JSON.stringify({ id: session.id, phase_index: session.phase_index, body }));
      },
    };
  };
})();
