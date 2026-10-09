(() => {
  'use strict';

  window.createPracticeMaterials = ({ escapeHtml, formatAnswer }) => {
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

    function audioMarkup(question, { translation = '' } = {}) {
      const isResponse = question.task_type === 'listen_choose_response';
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
          ${isResponse ? '' : '<span>练习辅助：可重播、查看脚本；非考场功能。</span>'}
        </div>
        <button class="audio-button" type="button" data-audio-text="${text}">▶ 播放提示音</button>
        <details class="script-details">
          <summary>${isResponse ? '查看原文' : '查看练习脚本'}</summary>
          ${script}
          ${translation ? `<p class="audio-translation" lang="zh-CN" aria-label="中文译文">${escapeHtml(translation)}</p>` : ''}
        </details>
      </div>`;
    }

    return { materialMarkup, clozeMarkup, audioMarkup };
  };
})();
