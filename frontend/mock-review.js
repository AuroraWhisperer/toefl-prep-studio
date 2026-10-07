(() => {
  'use strict';

  window.mockReviewMarkup = (result, escapeHtml) => {
    function reviewItemMarkup(item) {
      const outcome =
        item.correct === null ? '待人工复核' : item.correct ? '正确' : '未答 / 待订正';
      const answer = item.answer || (item.recording_url ? '已保存录音' : '未作答');
      return `<details>
        <summary>${escapeHtml(item.phase_title)} · 第 ${item.number} 题 — ${outcome}</summary>
        <p class="difficulty-tag review-difficulty">难度：待分级</p>
        <p>你的回答：${escapeHtml(answer)}</p>
        ${item.reference ? `<p>参考答案：${escapeHtml(item.reference)}</p>` : ''}
        ${item.accepted_alternatives?.length ? `<p>题面词块可接受答案（原卷参考键存在差异）：${item.accepted_alternatives.map(escapeHtml).join(' / ')}</p>` : ''}
        ${item.audio_text ? `<p>原始音频脚本：${escapeHtml(item.audio_text)}</p>` : ''}
        ${item.prompt ? `<p>${escapeHtml(item.prompt)}</p>` : ''}
        ${item.options ? `<p>${item.options.map((option, index) => `${'ABCD'[index]}. ${escapeHtml(option)}`).join('<br>')}</p>` : ''}
        ${
          item.explanation
            ? `<details class="mock-learning-notes">
                <summary>学习解析（本地编写，非 ETS 官方解析）</summary>
                <p class="mock-explanation">${escapeHtml(item.explanation)}</p>
              </details>`
            : ''
        }
        ${item.recording_url ? `<audio controls preload="none" src="${escapeHtml(item.recording_url)}"></audio>` : ''}
        ${
          item.pages.length
            ? `<details><summary>查看原卷题面</summary>${item.pages
                .map(
                  (page) =>
                    `<img loading="lazy" src="${escapeHtml(page.url)}" alt="原卷第 ${page.page} 页">`,
                )
                .join('')}</details>`
            : ''
        }
      </details>`;
    }

    return `<div class="mock-heading">
        <button class="text-button home-button" data-mock-home type="button">← 返回首页</button>
        <h1>${escapeHtml(result.paper.title)} · 模考复盘</h1>
      </div>
      <div class="mock-review-summary">
        <div><strong>${result.objective_correct} / ${result.objective_total}</strong>客观题参考正确数</div>
        <div><strong>${result.pending_review}</strong>写作与口语任务待复核</div>
      </div>
      <p class="library-note">${escapeHtml(result.notice)}</p>
      <p><a href="${escapeHtml(result.paper.source_url)}" target="_blank" rel="noopener noreferrer">核对 ETS 原卷与答案</a></p>
      <div class="mock-review-list">${result.review.map(reviewItemMarkup).join('')}</div>`;
  };
})();
