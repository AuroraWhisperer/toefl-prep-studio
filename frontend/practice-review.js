(() => {
  'use strict';

  function createPracticeReview({
    root,
    sectionLabels,
    taskLabels,
    difficultyLabels = {},
    format,
    content,
    onSelectMaterial,
    onPlayAudio,
  }) {
    const { escapeHtml, formatTime, formatAnswer } = format;
    const { materialMarkup, clozeMarkup, audioMarkup } = content;
    const dom = {
      resultTitle: root.querySelector('#result-title'),
      resultSummary: root.querySelector('#result-summary'),
      feedbackList: root.querySelector('#feedback-list'),
      reviewIndex: root.querySelector('#review-index'),
    };
    const controller = new AbortController();
    const wideReview = window.matchMedia('(min-width: 1100px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let snapshot = null;
    let reviewGroups = [];
    let reviewPosition = 0;
    let revealCorrect = false;
    let explanationsOpen = false;
    let reviewAnswers = null;
    let scrollFrame = 0;
    let scrollTarget = 0;
    let scrollTimestamp = 0;

    function show(value) {
      snapshot = value;
      const { result } = snapshot;
      const scores = Object.values(result.sections);
      const earned = scores.reduce((sum, score) => sum + score.earned, 0);
      const possible = scores.reduce((sum, score) => sum + score.possible, 0);
      const sectionScore = result.sections[snapshot.section] || {
        earned,
        possible,
        percentage: possible ? Math.round((earned / possible) * 1000) / 10 : 0,
        answered: result.answered_questions,
        total: result.total_questions,
      };
      const manualCount = result.feedback.filter((item) => item.manual_review).length;
      root.querySelector('#result-home span').textContent = snapshot.historyReview
        ? '返回记录'
        : '返回科目';
      root.querySelector('#recording-archive-status').hidden = true;
      reviewPosition = 0;
      revealCorrect = false;
      explanationsOpen = false;
      const groups = new Map();
      snapshot.questions.forEach((question) => {
        const key = question.group_id || question.id;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(question);
      });
      reviewGroups = [...groups.values()];
      dom.resultTitle.textContent = `${result.adaptive ? result.adaptive.profile.title : sectionLabels[snapshot.section] || '四科综合'} ${snapshot.historyReview ? '历史复盘' : result.adaptive ? '测验结果' : '练习结果'}`;
      const cells = [
        {
          label: !sectionScore.possible
            ? '复核状态'
            : result.adaptive
              ? '客观题正确数'
              : manualCount
                ? '自动核对部分'
                : '得分',
          value: sectionScore.possible
            ? `${sectionScore.earned} / ${sectionScore.possible}（${sectionScore.percentage}%）`
            : '待人工复核',
        },
        { label: '已答', value: `${sectionScore.answered} / ${sectionScore.total}` },
        {
          label: '用时',
          value: formatTime(result.feedback.reduce((sum, item) => sum + item.duration_seconds, 0)),
        },
      ];
      dom.resultSummary.innerHTML = cells
        .map(
          (cell) =>
            `<div class="score-cell"><dt class="score-cell-label">${escapeHtml(cell.label)}</dt><dd class="score-cell-value">${escapeHtml(cell.value)}</dd></div>`,
        )
        .join('');
      root.querySelector('.test-review-note')?.remove();
      if (result.adaptive || manualCount) {
        const note = document.createElement('p');
        note.className = 'test-review-note';
        const routes = (result.adaptive?.routes || [])
          .map(
            (r) =>
              `${r.section === 'reading' ? '阅读' : '听力'}：模块 1 正确 ${r.correct}/${r.total}，${r.from_level} → ${r.to_level} 档`,
          )
          .join('；');
        note.textContent = result.adaptive
          ? `起始 ${result.adaptive.starting_level} / 10 · ${routes}\n${result.note}`
          : `${manualCount} 题待人工复核。${result.note}`;
        dom.resultSummary.after(note);
      }
      renderReview();
    }

    function renderReview() {
      stopReviewScroll();
      const group = reviewGroups[reviewPosition];
      const question = group[0];
      const feedback = group.map((q) =>
        snapshot.result.feedback.find((item) => item.question_id === q.id),
      );
      const seconds = feedback.reduce((sum, item) => sum + item.duration_seconds, 0);
      const isCloze = question.task_type === 'complete_words';
      dom.reviewIndex.hidden = reviewGroups.length === 1;
      dom.reviewIndex.innerHTML = reviewGroups
        .map((items, index) => {
          const hasResult = items.every(
            (item) => item.response_type === 'choice' || item.task_type === 'build_sentence',
          );
          const correct =
            hasResult &&
            items.every(
              (item) =>
                snapshot.result.feedback.find((entry) => entry.question_id === item.id).correct,
            );
          const status = hasResult ? (correct ? '全部正确' : '有错题或未作答') : '';
          const classes = [
            index === reviewPosition ? 'is-current' : '',
            hasResult ? (correct ? 'is-correct' : 'is-incorrect') : '',
          ]
            .filter(Boolean)
            .join(' ');
          const label = snapshot.tasks[items[0].task_type].label;
          return `<button type="button" data-review-index="${index}" aria-current="${index === reviewPosition ? 'step' : 'false'}" class="${classes}" aria-label="${index + 1} ${escapeHtml(label)}${status ? ` · ${status}` : ''}" title="${escapeHtml(items[0].passage_title || taskLabels[items[0].task_type])}${status ? ` · ${status}` : ''}">${index + 1}<span>${escapeHtml(label)}</span></button>`;
        })
        .join('');
      let answers;
      if (isCloze) {
        answers = `<table class="cloze-review-table"><thead><tr><th scope="col">空</th><th scope="col">我的答案</th><th scope="col">正确答案</th><th scope="col">难度</th></tr></thead><tbody>${feedback.map((item, index) => `<tr><th scope="row">${index + 1}</th><td class="${item.correct ? 'answer-correct' : 'answer-incorrect'}">${escapeHtml(formatAnswer(item.answer)) || '未答'}${item.answered ? `<span class="answer-status">${item.correct ? '正确' : '错误'}</span>` : ''}</td><td class="complete-word">${escapeHtml(group[index].prefix)}<strong>${escapeHtml(item.missing_letters)}</strong></td><td class="difficulty-tag review-difficulty">${escapeHtml(difficultyLabels[group[index].difficulty] || '待分级')}</td></tr>`).join('')}</tbody></table><details class="review-explanations"><summary>逐空解析</summary>${feedback.map((item, index) => `<p>${index + 1}. ${escapeHtml(item.explanation)}</p>`).join('')}</details>`;
      } else {
        answers = feedback
          .map((item, index) => {
            const isExample = ['write_email', 'academic_discussion', 'take_interview'].includes(
              item.task_type,
            );
            const referenceLabel = ['write_email', 'academic_discussion'].includes(item.task_type)
              ? '参考范文'
              : item.task_type === 'take_interview'
                ? '参考要点'
                : '参考答案';
            const recording = snapshot.recordings[item.question_id];
            const explanation = item.explanation === item.reference_answer ? '' : item.explanation;
            const explanations = [
              ...new Set([item.feedback, explanation].map((text) => (text || '').trim())),
            ].filter(Boolean);
            const answerMarkup =
              item.task_type === 'build_sentence'
                ? ''
                : `<p class="review-label">我的答案</p><p class="submitted-answer">${escapeHtml(displaySubmittedAnswer(item)) || '未作答'}</p>${recording ? `<audio controls src="${escapeHtml(recording)}" aria-label="回放第 ${index + 1} 题录音"></audio>` : ''}<p class="review-label">${referenceLabel}</p><p class="reference-answer${isExample ? ' is-example' : ''}" lang="en">${escapeHtml(item.reference_answer)}</p>`;
            return `<section class="review-answer"><div class="review-answer-head"><div class="review-answer-title"><h4>第 ${index + 1} 题</h4><span class="difficulty-tag review-difficulty">难度：${escapeHtml(difficultyLabels[group[index].difficulty] || '待分级')}</span></div><span class="${item.manual_review ? '' : item.correct ? 'answer-correct' : 'answer-incorrect'}">${item.manual_review ? '待人工复核' : `${item.earned} / ${item.possible} 分`}${item.answered ? '' : ' · 未作答'}</span></div>${answerMarkup}<details class="review-explanations"><summary>解析 · ${formatTime(item.duration_seconds)}</summary>${explanations.map((text) => `<p>${escapeHtml(text)}</p>`).join('')}</details></section>`;
          })
          .join('');
      }
      const answerHeading =
        reviewGroups.length > 1
          ? `<div class="review-pane-head"><h3>答案</h3><span>用时 ${formatTime(seconds)}</span></div>`
          : '';
      const materialHeading = isCloze
        ? `<div class="review-pane-head"><h3>${escapeHtml(question.passage_title)}</h3><label class="reveal-control"><input type="checkbox" role="switch" id="reveal-correct" ${revealCorrect ? 'checked' : ''}><span>显示正确答案</span></label></div>`
        : '';
      dom.feedbackList.innerHTML = `<div class="review-layout${isCloze ? ' is-cloze' : ''}"><section class="review-answers" aria-label="答案与解析"${isCloze ? ' tabindex="0"' : ''}>${answerHeading}${answers}</section><section class="review-material" aria-label="原题材料"${isCloze ? ' tabindex="0"' : ''}>${materialHeading}<div id="review-source-content">${reviewSourceMarkup(group, feedback)}</div></section></div>`;
      dom.feedbackList.querySelectorAll('.review-explanations').forEach((details) => {
        details.open = explanationsOpen;
      });
      reviewAnswers = isCloze ? dom.feedbackList.querySelector('.review-answers') : null;
    }

    function reviewSourceMarkup(group, feedback) {
      const question = group[0];
      if (question.task_type === 'complete_words') {
        const translation = snapshot.result.passage_translations?.[question.group_id];
        return (
          clozeMarkup(question, group, { feedback, reveal: revealCorrect }) +
          (translation
            ? `<section class="review-translation" lang="zh-CN" aria-label="中文参考译文"><h4>中文参考译文</h4><p>${escapeHtml(translation)}</p></section>`
            : '')
        );
      }
      let markup = question.passage ? materialMarkup(question) : '';
      const sharedAudio =
        question.audio_text && group.every((q) => q.audio_text === question.audio_text);
      if (sharedAudio)
        markup += audioMarkup(question, {
          translation: snapshot.result.audio_translations?.[question.id],
        }).replace('<details class="script-details">', '<details class="script-details" open>');
      markup += group
        .map((q, index) => {
          const item = feedback[index];
          const promptTag = ['write_email', 'academic_discussion'].includes(q.task_type)
            ? 'p'
            : 'h4';
          const frame =
            q.task_type === 'build_sentence'
              ? sentenceReviewMarkup(q, item)
              : q.template_parts
                ? `<div class="sentence-line">${q.template_parts.map((part, i) => escapeHtml(part) + (i < q.template_parts.length - 1 ? `<span class="review-sentence-slot" aria-label="空格 ${i + 1}">&nbsp;</span>` : '')).join('')}</div>`
                : '';
          return `<section class="review-original" lang="en">${q.audio_text && !sharedAudio ? audioMarkup(q).replace('<details class="script-details">', '<details class="script-details" open>') : ''}<${promptTag} class="review-prompt">${index + 1}. ${escapeHtml(q.prompt)}</${promptTag}>${frame}${q.word_bank ? `<div class="review-word-bank">${q.word_bank.map((word) => `<span>${escapeHtml(word)}</span>`).join('')}</div>` : ''}${q.options ? `<ol class="review-options">${q.options.map((option, optionIndex) => `<li class="${item.correct_index === optionIndex ? 'option-correct' : item.answer === optionIndex ? 'option-incorrect' : ''}"><span class="choice-letter">${String.fromCharCode(65 + optionIndex)}</span><div>${escapeHtml(option)}</div></li>`).join('')}</ol>` : ''}</section>`;
        })
        .join('');
      return markup;
    }

    function sentenceReviewMarkup(question, item) {
      const parts = question.template_parts || [
        '',
        ...Array(question.word_bank.length - 1).fill(' '),
        '.',
      ];
      const normalize = (text) =>
        (text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?|_{4}/g) || []).join(' ');
      const words = question.word_bank.map(normalize);
      const choices = [...new Set(words)].sort((a, b) => b.length - a.length).join('|');
      // Archives store the complete sentence, including ____ for each unfilled slot.
      const pattern = new RegExp(
        `^${parts
          .flatMap((part, index) => [
            normalize(part),
            index < parts.length - 1 ? `(${choices}|____)` : '',
          ])
          .filter(Boolean)
          .join(' ')}$`,
      );
      const submitted = item.answered
        ? normalize(formatAnswer(item.answer)).match(pattern)?.slice(1)
        : Array(parts.length - 1).fill('____');
      const reference = normalize(item.reference_answer).match(pattern)?.slice(1);
      const sentence = submitted
        ? `<div class="sentence-line review-submitted-sentence" role="group" aria-label="我的答案">${parts
            .map((part, index) => {
              const fixed = `<span class="sentence-fixed">${escapeHtml(part)}</span>`;
              if (index === submitted.length) return fixed;
              const value = submitted[index];
              const empty = value === '____';
              // The server may accept a different valid order from the displayed reference.
              const correct = !empty && (item.correct || value === reference?.[index]);
              const status = empty
                ? '未填'
                : correct
                  ? '位置正确'
                  : reference
                    ? '与正确答案的位置不同'
                    : '请对照正确答案';
              const resultClass = correct ? 'is-correct' : empty || reference ? 'is-incorrect' : '';
              let word = empty ? '未填' : question.word_bank[words.indexOf(value)];
              if (index === 0 && !part.trim()) word = word.charAt(0).toUpperCase() + word.slice(1);
              return `${fixed}<span class="review-sentence-slot ${resultClass}" title="${status}" aria-label="空格 ${index + 1}：${escapeHtml(word)}，${status}">${escapeHtml(word)}</span>`;
            })
            .join('')}</div>`
        : `<p class="submitted-answer" lang="en">${escapeHtml(displaySubmittedAnswer(item)) || '未作答'}</p>`;
      return `<p class="review-label">我的答案</p>${sentence}<p class="review-label">正确答案</p><p class="reference-answer" lang="en">${escapeHtml(item.reference_answer)}</p>`;
    }

    function displaySubmittedAnswer(item) {
      const question = snapshot.questions.find((q) => q.id === item.question_id);
      if (question?.response_type === 'choice' && Number.isInteger(item.answer)) {
        return `${String.fromCharCode(65 + item.answer)}. ${question.options[item.answer]}`;
      }
      return formatAnswer(item.answer);
    }

    function stopReviewScroll() {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    }

    function advanceReviewScroll(timestamp) {
      if (root.hidden || !root.isConnected || !wideReview.matches) {
        stopReviewScroll();
        return;
      }
      const distance = scrollTarget - reviewAnswers.scrollTop;
      if (Math.abs(distance) < 2 || reducedMotion.matches) {
        reviewAnswers.scrollTop = scrollTarget;
        scrollFrame = 0;
        return;
      }
      // Follow one accumulated destination without restarting on each wheel tick.
      const elapsed = Math.max(0, Math.min(timestamp - scrollTimestamp, 64));
      reviewAnswers.scrollTop += distance * (1 - Math.exp(-elapsed / 55));
      scrollTimestamp = timestamp;
      scrollFrame = requestAnimationFrame(advanceReviewScroll);
    }

    root.addEventListener('keydown', stopReviewScroll, { signal: controller.signal });
    root.addEventListener('pointerdown', stopReviewScroll, { signal: controller.signal });
    window.addEventListener('resize', stopReviewScroll, { signal: controller.signal });

    root.ownerDocument.addEventListener(
      'wheel',
      (event) => {
        if (
          root.hidden ||
          !root.isConnected ||
          !wideReview.matches ||
          !reviewAnswers ||
          event.defaultPrevented ||
          event.ctrlKey ||
          event.shiftKey ||
          !event.deltaY ||
          Math.abs(event.deltaX) > Math.abs(event.deltaY)
        )
          return;
        event.preventDefault();
        const unit =
          event.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? parseFloat(getComputedStyle(reviewAnswers).lineHeight)
            : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
              ? reviewAnswers.clientHeight
              : 1;
        const delta = event.deltaY * unit;
        const current = reviewAnswers.scrollTop;
        if (!scrollFrame || Math.sign(delta) !== Math.sign(scrollTarget - current)) {
          scrollTarget = current;
        }
        scrollTarget = Math.max(
          0,
          Math.min(scrollTarget + delta, reviewAnswers.scrollHeight - reviewAnswers.clientHeight),
        );
        if (reducedMotion.matches) {
          stopReviewScroll();
          reviewAnswers.scrollTop = scrollTarget;
        } else if (!scrollFrame && scrollTarget !== current) {
          scrollTimestamp = performance.now();
          scrollFrame = requestAnimationFrame(advanceReviewScroll);
        }
      },
      { passive: false, signal: controller.signal },
    );

    dom.reviewIndex.addEventListener(
      'click',
      (event) => {
        const button = event.target.closest('[data-review-index]');
        if (!button) return;
        onSelectMaterial();
        reviewPosition = Number(button.dataset.reviewIndex);
        revealCorrect = false;
        renderReview();
        dom.reviewIndex
          .querySelector(`[data-review-index="${reviewPosition}"]`)
          .focus({ preventScroll: true });
      },
      { signal: controller.signal },
    );
    dom.feedbackList.addEventListener(
      'change',
      (event) => {
        if (event.target.id !== 'reveal-correct') return;
        revealCorrect = event.target.checked;
        const group = reviewGroups[reviewPosition];
        const feedback = group.map((q) =>
          snapshot.result.feedback.find((item) => item.question_id === q.id),
        );
        root.querySelector('#review-source-content').innerHTML = reviewSourceMarkup(
          group,
          feedback,
        );
      },
      { signal: controller.signal },
    );
    dom.feedbackList.addEventListener(
      'click',
      (event) => {
        const summary = event.target.closest('.review-explanations > summary');
        if (summary) {
          event.preventDefault();
          // Update before navigation; native toggle events are queued asynchronously.
          explanationsOpen = !summary.parentElement.open;
          dom.feedbackList.querySelectorAll('.review-explanations').forEach((details) => {
            details.open = explanationsOpen;
          });
          return;
        }
        const button = event.target.closest('[data-audio-text]');
        if (button) onPlayAudio(button.dataset.audioText, button);
      },
      { signal: controller.signal },
    );

    return {
      show,
      dispose: () => {
        stopReviewScroll();
        controller.abort();
      },
    };
  }

  window.createPracticeReview = createPracticeReview;
})();
