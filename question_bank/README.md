# 题库目录与维护

当前共 2,115 个计分小题：阅读 795、听力 705、写作 450、口语 165。原有 705 题的 ID、题面和答案保留；12 个题型各扩充到三倍，新增 1,410 题及逐题解析。专项随机抽取完整材料，逐篇保留实际题数，每份至少含适中或困难内容。

以上统计仅含原创**练习**。ETS 五套**模拟**另存于 `mock/`，每套 97 题；不会进入上述科目抽题池。**测验**复用已审阅原创题库随机组卷，提供五套难度方案，并非额外新增题目；完整材料、路由和重复边界见[自适应测验规范](../specs/adaptive-tests.md)。不读取 ETS 模考题库，不修改原题、答案或审阅指纹。

## 文件分工

| 路径 | 内容 | 维护方式 |
|---|---|---|
| `sources/receptive_items.py` | 最初 50 道阅读与 47 道听力的材料、问题和答案 | 编辑原创源稿 |
| `sources/expanded_reading.py` | 新增阅读材料与问题 | 编辑原创源稿 |
| `sources/daily_life_long.py` | 5 篇长日常材料、15 题及逐题审阅依据 | 编辑原创源稿并复核指纹 |
| `sources/practice_structure.py` | 12 题型的完整任务单位、可选题量及官方依据 | 结构配置的单一来源 |
| `sources/expanded_listening.py` | 新增听力脚本与问题 | 编辑原创源稿 |
| `sources/base_productive.py` | 初始写作、口语任务 | 编辑原创源稿 |
| `sources/expanded_productive.py` | 新增写作、口语及参考表达 | 编辑原创源稿 |
| `sources/writing_samples.py` | 初始邮件、讨论的 20 篇参考范文 | 私有参考，非官方满分范文 |
| `sources/sentence_answers.py` | 50 道造句的对话语境、固定词／空位、可选干扰词与可接受词序 | 与造句词库一起审阅；见[官方格式依据](../docs/question-bank/sentence-format.md) |
| `sources/cloze_explanations.json` | 150 个补词空格的逐空学习解析 | 与完整段落、目标词和缺失字母一起审阅 |
| `sources/productive_explanations.json` | 150 道写作与 55 道口语的逐题学习解析 | 独立于参考范文、可接受词序与评分输入，生成时使用 |
| `sources/mock_explanations/ets-test-*.json` | 五套模考 485 题的本地学习解析 | 非 ETS 官方解析；只在整套完成后读取，复核题面、答案与版本指纹 |
| `sources/review_notes.json` | 每题难度、考点、词汇、理由、答案证据与指纹 | 私有维护记录 |
| `sources/expansion_2026_09/*.json` | 12 题型新增 1,410 题的完整材料、私有答案、教学解析、参考表达与审阅依据 | 编辑原创源稿；[扩充源稿约定](sources/expansion_2026_09/README.md) |
| `sources/timing.py` | 12 题型每份时间、可变题数材料时间、依据和来源 | 时间配置的单一来源 |
| `reading/`、`listening/`、`writing/`、`speaking/` | 供后端读取的题目 JSON | 生成产物，不直接编辑 |
| `answers/` | 答案键、评分要点和参考范文 JSON | 私有生成产物 |
| `manifest.json` | 数量、选题单位、时间、分级分布及来源 | 生成产物 |
| `mock/ets-test-*.json` | 五套 ETS 纸卷的独立阶段、题面与脚本 | 由模考导入器生成 |
| `mock/pages/` | 阅读和写作原 PDF 题面 PNG | 唯一静态公开的模考资源目录 |
| `answers/mock/` | 五套模考的私有答案键 | 整套结束后才由复盘接口返回 |

生成入口仍为 [`scripts/build_question_bank.py`](../scripts/build_question_bank.py)；内容指纹校验和目录输出在 [`scripts/question_bank_review.py`](../scripts/question_bank_review.py)。`scripts/` 保留工具，题目内容集中在 `sources/`。

## 内容导航

- [英文出题指南](../docs/question-bank/generation-guidelines.md)：生成和修订前必读，区分官方要求、样题观察和本地训练目标。
- [2026-09-27 质量修订](../docs/question-bank/quality-revision-2026-09-27.md)：本轮问题、实际修改范围、前后指标和验证结果。

- [项目运行与验证](../README.md)、[产品约定](../PRODUCT.md)、[设计约定](../DESIGN.md)：分别维护启动与接口、产品规则和界面约定；本文件负责题库维护流程。
- [专项练习规格](../specs/exam_aligned_practice_design.md)：完整材料组抽取、计时和提交校验。
- [逐题清单](../docs/question-bank/catalogue.csv)：2,115 行，含题号、源文件、难度、考点、词汇证据、答案依据及计时单位，可用表格软件筛选。
- [审阅报告](../docs/question-bank/audit.md)：分级统计、内容修订和质量边界。
- [时间与来源](../docs/question-bank/timing-and-sources.md)：官方限时、第三方建议、项目估时及计算口径。
- [造句题格式](../docs/question-bank/sentence-format.md)、[题面布局依据](../docs/ui-task-layouts.md)：题型格式与本地交互取舍。
- [模考隔离报告](../docs/question-bank/mock-isolation.md)：官方试卷来源、导入审计与练习隔离边界。

上述清单和源稿含答案证据，供本地维护使用。应用仅静态公开 `/frontend` 对应的前端文件和 `/mock-pages` 对应的 `question_bank/mock/pages/` 原卷题面图片；不会挂载整个题库、答案、源稿或审阅记录目录。`audio/` 不静态公开，TTS 接口直接返回临时音频字节；提示音与用户录音的区别见[项目资源说明](../README.md#目录)。练习题面接口只返回题面、难度与考点，交卷后才返回本轮参考答案。

## 模考导入与隔离

将 ETS Practice Test 1–5 下载为 `artifacts/ets-reference/test-1.pdf` 至 `test-5.pdf`，使用开发依赖 PyMuPDF 执行：

```powershell
./.venv/Scripts/python.exe scripts/import_mock_tests.py
./.venv/Scripts/python.exe scripts/audit_mock_isolation.py
./.venv/Scripts/python.exe -m pytest tests/test_mock_exam.py -q
npx playwright test tests/browser_mock.test.cjs
```

导入器保存来源 URL 和 PDF SHA-256，原始 PDF 和运行会话不进入版本控制。已生成的 JSON 和题面 PNG 可直接运行，不要求运行时安装 PyMuPDF 或在线下载试卷。审计方法及边界见[模考隔离报告](../docs/question-bank/mock-isolation.md)。

## 解析写作约定

- 所有原创题及模考学习解析分为三行：`读懂：`用简单中文解释题目所问及关键英文；`解析：`把依据与答案连起来，说明具体误读或漏项；`下次：`给出适用于此类题的实际判断步骤。英语基础薄弱的学习者不应还要先翻译整段解析才能理解。
- 选择题解释正项为什么成立、干扰项错在哪里，不假定用户一定选了某个错误选项。补词题说明局部意思、搭配或结构及缺失字母；造句题讲清词块顺序与容易错放的部分。复述给出句意、记忆分块与漏词检查；写作和访谈给出对应任务的组织思路，不把某个范文立场当成唯一正确观点。
- 区分字面信息、言外之意、转折、否定和范围限制。不使用「符合语境」「仔细阅读」等空泛结论代替解释；英文术语须有中文说明，引号内的证据必须能在材料、选项或重建的完整补词段落中找到。不要编造用户犯过的错误，也不要把文字比对说成发音、流利度或官方评分。
- 生成器会打乱部分选项，解析应指向选项内容，不写死 A/B/C/D；插句题的 Position 标签指原文位置，不受此限制。只改解析也须逐题审阅材料、题干、选项和答案，再更新对应审阅证据与指纹；不能批量刷新未审阅内容。
- 原创题的解析只在提交后返回；模考须整套完成。模考解析明确标为本地编写，并记录源卷 SHA-256、审阅日期和题面／答案／造句可接受变体／解析正文的内容指纹。官方题面、参考键与本地教学说明分别维护。修改解析后须重新审阅，再用 `scripts.question_bank_review.mock_explanation_fingerprint` 更新该卷指纹；`tests/test_learning_explanations.py` 检查版本和覆盖范围。
- 解析更新不覆写已有答题记录。历史详情另行返回与当时题面、参考答案一致的新版学习解析，界面用它辅助复盘；原答卷、成绩、原始反馈与录音保持不变。若题面或参考答案已改变，则保留该题原解析，避免用新题解释旧答卷。

## 修改一道题的流程

1. 用题号在清单中定位源稿。材料组修改会影响组内多题，应一起检查题干、选项、正确答案和解释。不要改变旧题号来规避复核。
2. 按上下文、词汇、句法、推理和表达任务确定难度，更新 `review_notes.json` 对应条目的 `difficulty`、`skills`、`vocabulary`、`rationale`、`answer_evidence`、`reviewed_on`。词汇证据必须在材料或相应答案中出现。
3. 重新审阅后，用生成器相应的 `build_reading()` / `build_listening()` / `build_writing()` / `build_speaking()` 获得题面和答案；调用 `scripts.question_bank_review.content_fingerprint(question, answers[question['id']])`，只更新已经审阅题目的 `content_sha256`。指纹覆盖题面和答案，排除生成的难度与考点字段；不要批量刷新未审阅内容的指纹。
4. 在项目根目录生成并验证：

   ```powershell
   ./.venv/Scripts/python.exe scripts/build_question_bank.py
   ./.venv/Scripts/python.exe -m pytest -q
   node --check frontend/app.js
   ```

5. 检查新的清单和统计。生成器会拒绝内容与审阅指纹不一致的题目。重启自己运行的本地服务后，检查练习题面和交卷后的答案显示。

填词的隔词挖空、完整首句、10 空及 70–100 词规则，造句答案词库一致性，全部题号、公开／私有数据边界和 12 题型估时均有回归测试。测试验证结构和约束；新的语言内容仍需内容审阅，不能只凭测试通过认定题目质量。
