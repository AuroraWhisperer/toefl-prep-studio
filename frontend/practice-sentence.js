(() => {
  "use strict";

  function createSentenceBuilder({ escapeHtml }) {
    function sentenceParts(question) {
      // An already-running server may still have the previous word-only bank cached.
      return question.template_parts || ["", ...Array(question.word_bank.length - 1).fill(" "), "."];
    }

    function markup(question, savedOrder, selectedSlot = null) {
      const parts = sentenceParts(question);
      const order = savedOrder || Array(parts.length - 1).fill(null);
      const line = parts.map((part, i) => {
        const fixed = `<span class="sentence-fixed">${escapeHtml(part)}</span>`;
        if (i === order.length) return fixed;
        const token = order[i];
        let word = token === null ? "" : question.word_bank[token];
        if (i === 0 && !part.trim()) word = word.charAt(0).toUpperCase() + word.slice(1);
        return fixed + `<button type="button" class="sentence-slot ${token === null ? "is-empty" : ""}" data-sentence-slot="${i}" ${token === null ? "" : `draggable="true" data-sentence-token="${token}"`} aria-pressed="${selectedSlot === i}" aria-label="空格 ${i + 1}${token === null ? "，选择填入位置" : `：${escapeHtml(word)}，点击撤回词块`}">${word ? escapeHtml(word) : "&nbsp;"}</button>`;
      }).join("");
      return `<div class="word-bank-panel"><div class="word-bank" lang="en" role="group" aria-label="可用词块">${question.word_bank.map((word, i) => `<button type="button" class="word-chip" data-word="${i}" data-sentence-token="${i}" draggable="${!order.includes(i)}" ${order.includes(i) ? "disabled" : ""}>${escapeHtml(word)}</button>`).join("")}</div></div><div class="sentence-line" lang="en" role="group" aria-label="句子空位">${line}</div><p class="hint-copy">点击或拖动词块填空；点击已填词块可撤回。固定词不可改动，可能有多余词块。</p><button type="button" class="clear-button" data-clear-sentence>清空已选词块</button><span class="sentence-status" role="status" aria-live="polite">已填 ${order.filter(i => i !== null).length} / ${order.length} 空</span>`;
    }

    /** Bind one rendered workspace; dispose before replacing or rebinding it. */
    function mount(workspace, { question, initialOrder, onChange }) {
      const parts = sentenceParts(question);
      const order = initialOrder ? [...initialOrder] : Array(parts.length - 1).fill(null);
      const controller = new AbortController();
      const options = { signal: controller.signal };
      let selectedSlot = null;
      const render = (focus) => {
        workspace.innerHTML = markup(question, order, selectedSlot);
        if (focus) workspace.querySelector(focus)?.focus({ preventScroll: true });
      };
      const save = (focus) => {
        const sentence = order.some(i => i !== null) ? parts.map((part, i) => part + (i < order.length ? (order[i] === null ? "____" : question.word_bank[order[i]]) : "")).join("").trim() : "";
        onChange({ order: [...order], answer: sentence.charAt(0).toUpperCase() + sentence.slice(1) });
        render(focus);
      };
      const place = (token, slot) => {
        if (!Number.isInteger(token) || token < 0 || token >= question.word_bank.length || slot < 0) return;
        const previous = order.indexOf(token);
        if (previous !== -1) order[previous] = order[slot];
        order[slot] = token;
        selectedSlot = null;
        save(`[data-sentence-slot="${slot}"]`);
      };
      workspace.addEventListener("click", (event) => {
        const slotButton = event.target.closest("[data-sentence-slot]");
        const wordButton = event.target.closest("[data-word]");
        if (slotButton) {
          const slot = Number(slotButton.dataset.sentenceSlot);
          const token = order[slot];
          selectedSlot = slot;
          if (token !== null) {
            order[slot] = null;
            save(`[data-word="${token}"]`);
          } else render(`[data-sentence-slot="${slot}"]`);
        } else if (wordButton && !wordButton.disabled) {
          place(Number(wordButton.dataset.word), selectedSlot ?? order.indexOf(null));
        } else if (event.target.closest("[data-clear-sentence]")) {
          order.fill(null);
          selectedSlot = null;
          save("[data-clear-sentence]");
        }
      }, options);
      workspace.addEventListener("dragstart", (event) => {
        const tile = event.target.closest("[data-sentence-token]");
        if (!tile || tile.disabled) return;
        event.dataTransfer.setData("text/plain", tile.dataset.sentenceToken);
        event.dataTransfer.effectAllowed = "move";
      }, options);
      workspace.addEventListener("dragover", (event) => {
        if (event.target.closest("[data-sentence-slot]")) event.preventDefault();
      }, options);
      workspace.addEventListener("drop", (event) => {
        const slot = event.target.closest("[data-sentence-slot]");
        if (!slot) return;
        event.preventDefault();
        const token = event.dataTransfer.getData("text/plain");
        if (/^\d+$/.test(token)) place(Number(token), Number(slot.dataset.sentenceSlot));
      }, options);
      return () => controller.abort();
    }

    return { markup, mount };
  }

  window.createSentenceBuilder = createSentenceBuilder;
})();
