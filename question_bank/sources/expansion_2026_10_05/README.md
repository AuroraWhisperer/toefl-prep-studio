# 2026-10-05 补词与口语扩充源稿

本目录是本轮新增 2,130 小题的权威维护来源。题面、答案、三行中文解析、参考表达和审阅依据均为本地原创；官方资料只用于核对题型与能力要求。

| 源文件 | 新增范围 | 完整材料 | 扩充后该题型总量 |
| --- | --- | --- | --- |
| `complete_words.json` | R1591–R3390 | cloze_91–270，180 篇 × 10 空 | 270 篇、2,700 空 |
| `listen_repeat.json` | S166–S375 | listen_repeat_16–45，30 组 × 7 句 | 45 组、315 句 |
| `take_interview.json` | S376–S495 | take_interview_16–45，30 组 × 4 问 | 45 组、180 问 |

每个文件保留 `section`、`task_type` 和 `items`；每条记录由 `question`、`answer`、`review` 组成。生成器按题号追加，题面仅输出公开字段，答案单独写入 `question_bank/answers/`。本目录及审阅记录不由应用静态公开。

出题与分级遵循 [AGENTS 摘要](../../../AGENTS.md#question-design-principles)和[详细出题指南](../../../docs/question-bank/generation-guidelines.md)：各档保留语法与搭配，根据实际提示量判断难度，接受符合固定字母与长度的合理变体。复述按意群、句法和 8/10/12 秒窗口审阅；访谈每问 45 秒，范文只是可能回答，继续待人工复核。

修改时同时审阅题面、答案、解析和分级。材料变化须检查整组；只为实际复核的条目更新本文件 `review` 与 `../review_notes.json` 中的对应记录和指纹。不要修改生成文件代替源稿，也不要刷新旧题指纹来通过检查。

生成与验证入口：

```powershell
.\.venv\Scripts\python.exe scripts/build_question_bank.py
.\.venv\Scripts\python.exe -m pytest -q
npm run test:browser
```

命令均从项目根目录运行。详细数量、审计与边界见[扩充报告](../../../docs/question-bank/cloze-speaking-expansion-2026-10-05.md)；事实与格式依据见[来源记录](../../../docs/question-bank/cloze-speaking-expansion-sources-2026-10-05.md)。临时草稿与准备脚本仅是本机编辑资料，后续维护以本目录 JSON 为准。
