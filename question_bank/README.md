# 题库目录与维护

当前共 5,745 个练习小题：阅读 3,390、听力 1,410、写作 450、口语 495。在 3,615 题难度与设计修订完成后，本轮新增 180 篇补词、30 组复述和 30 组访谈，共 2,130 小题；三类材料分别达到 270／45／45 组，为扩充前的三倍。原有题面、答案和审阅记录保持一致。难度按实际作答要求及可见提示确定，各档保留语法、搭配和语境，不为比例虚标。专项随机抽取完整材料，逐篇保留实际题数，每份至少含适中或困难内容。

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
| `sources/cloze_translations.json` | 全部 270 篇原创补词的中文参考译文与完整英文 | 私有学习补充，交卷后由后端直接读取；维护规则见下文 |
| `sources/productive_explanations.json` | 150 道写作与 55 道口语的逐题学习解析 | 独立于参考范文、可接受词序与评分输入，生成时使用 |
| `sources/mock_explanations/ets-test-*.json` | 五套模考 485 题的本地学习解析 | 本地可选补充，不随源码分发；非 ETS 官方解析；只在整套完成后读取，复核题面、答案与版本指纹 |
| `sources/review_notes.json` | 每题难度、考点、词汇、理由、答案证据与指纹 | 私有维护记录 |
| `sources/expansion_2026_09/*.json` | 12 题型新增 1,410 题的完整材料、私有答案、教学解析、参考表达与审阅依据 | 编辑原创源稿；[扩充源稿约定](sources/expansion_2026_09/README.md) |
| `sources/expansion_2026_09_30/*.json` | 阅读与听力 7 题型新增 1,500 题的完整材料、私有答案、教学解析与审阅依据 | 编辑原创源稿；[本轮源稿约定](sources/expansion_2026_09_30/README.md) |
| `sources/expansion_2026_10_05/*.json` | 补词与两种口语新增 2,130 题的完整材料、私有答案、解析与审阅依据 | 编辑原创源稿；[本轮源稿约定](sources/expansion_2026_10_05/README.md) |
| `sources/timing.py` | 12 题型每份时间、可变题数材料时间、依据和来源 | 时间配置的单一来源 |
| `reading/`、`listening/`、`writing/`、`speaking/` | 供后端读取的题目 JSON | 生成产物，不直接编辑 |
| `answers/` | 答案键、评分要点和参考范文 JSON | 私有生成产物 |
| `manifest.json` | 数量、选题单位、时间、分级分布及来源 | 生成产物 |
| `mock/ets-test-*.json` | 五套 ETS 纸卷的独立阶段、题面与脚本 | 本地导入生成，Git 忽略 |
| `mock/pages/` | 阅读和写作原 PDF 题面 PNG | 本地导入生成，Git 忽略；仅在本机存在时挂载 |
| `answers/mock/` | 五套模考的私有答案键与可选补充答案 | 本地保留，Git 忽略；整套结束后才由复盘接口返回 |

生成入口仍为 [`scripts/build_question_bank.py`](../scripts/build_question_bank.py)；内容指纹校验和目录输出在 [`scripts/question_bank_review.py`](../scripts/question_bank_review.py)。`scripts/` 保留工具，题目内容集中在 `sources/`。

## 内容导航

- [出题原则摘要](../AGENTS.md#question-design-principles)：实际任务难度、词汇适配、各档语法覆盖、完整原创组和复核门槛。
- [2026-10-05 补词与口语三倍扩充](../docs/question-bank/cloze-speaking-expansion-2026-10-05.md)：新增 2,130 题、旧题一致性、分级与验证；附[事实及格式来源](../docs/question-bank/cloze-speaking-expansion-sources-2026-10-05.md)。

- [英文出题指南](../docs/question-bank/generation-guidelines.md)：生成和修订前必读，区分官方要求、样题观察和本地训练目标。
- [2026-10-05 难度、词汇与题目设计修订](../docs/question-bank/content-repair-2026-10-05.md)：全库 3,615 题复核、701 题修订、补词语法覆盖和其他题型设计修复，含资料依据与验证边界。
- [2026-09-27 质量修订](../docs/question-bank/quality-revision-2026-09-27.md)：本轮问题、实际修改范围、前后指标和验证结果。
- [2026-09-30 阅读与听力扩充](../docs/question-bank/receptive-expansion-2026-09-30.md)：逐型翻倍的题量、分级、来源和验证结果。
- [2026-09-30 阅读与听力逐题修订](../docs/question-bank/receptive-repair-2026-09-30.md)：3,000 题的复核范围、事实和答案修复、题材补充、教学解析及验证。
- [2026-09-30 遗漏复查与口语写作审阅](../docs/question-bank/content-recheck-2026-09-30.md)：首次复查发现及当时的实际覆盖范围；后续修订见下一项。
- [2026-09-30 口语写作逐题复核与遗漏修订](../docs/question-bank/productive-repair-2026-09-30.md)：补完全部 450 道写作的逐题审阅，修订 36 题，并取消邮件、讨论和访谈的关键词数值分。

- [开发与验证](../docs/technical/development.md)、[接口说明](../docs/technical/api.md)、[产品约定](../PRODUCT.md)、[设计约定](../DESIGN.md)：分别维护运行与测试、API、产品规则和界面约定；本文件负责题库维护流程。
- [专项练习规格](../specs/exam_aligned_practice_design.md)：完整材料组抽取、计时和提交校验。
- [逐题清单](../docs/question-bank/catalogue.csv)：5,745 行，含题号、源文件、难度、考点、词汇证据、答案依据及计时单位，可用表格软件筛选。
- [审阅报告](../docs/question-bank/audit.md)：分级统计、内容修订和质量边界。
- [时间与来源](../docs/question-bank/timing-and-sources.md)：官方限时、第三方建议、项目估时及计算口径。
- [造句题格式](../docs/question-bank/sentence-format.md)、[题面布局依据](../docs/ui-task-layouts.md)：题型格式与本地交互取舍。
- [模考隔离报告](../docs/question-bank/mock-isolation.md)：官方试卷来源、导入审计与练习隔离边界。

上述清单和源稿含答案证据，供本地维护使用。应用仅静态公开 `/frontend` 对应的前端文件和 `/mock-pages` 对应的 `question_bank/mock/pages/` 原卷题面图片；不会挂载整个题库、答案、源稿或审阅记录目录。`audio/` 不静态公开，TTS 接口直接返回临时音频字节；提示音与用户录音的区别见[音频与录音](../docs/technical/architecture.md#音频与录音)。练习题面接口只返回题面、难度与考点，交卷后才返回本轮参考答案。

## 模考导入与隔离

公开源码包含原创题库和导入工具，不包含 ETS 官方试卷、答案、图片或引用原题的本地解析。首次启动时模考列表可以为空，不影响原创练习与综合测验。

请先确认对材料的使用符合适用条款并取得必要授权，见[第三方材料说明](../THIRD_PARTY_NOTICES.md)。原卷链接：[Test 1](https://www.ets.org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-1.pdf)、[Test 2](https://www.ets.org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-2.pdf)、[Test 3](https://www.ets.org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-3.pdf)、[Test 4](https://www.ets.org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-4.pdf)、[Test 5](https://www.ets.org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-5.pdf)。

将有权使用的五份 PDF 保存为 `artifacts/ets-reference/test-1.pdf` 至 `test-5.pdf`，安装开发依赖后执行：

```powershell
./.venv/Scripts/python.exe -m pip install -r requirements-dev.txt
./.venv/Scripts/python.exe scripts/import_mock_tests.py
./.venv/Scripts/python.exe scripts/audit_mock_isolation.py
./.venv/Scripts/python.exe -m pytest tests/test_mock_exam.py -q
npx playwright test tests/browser_mock.test.cjs
```

导入器保存来源 URL 和 PDF SHA-256。每卷先完成解析、结构校验和全部图片编码，再写入该卷产物；解析或渲染失败时保留原有 JSON 和图片。PDF、导入 JSON、题面 PNG、补充答案、模考解析和运行会话均不进入当前版本控制；已经存在的本地文件会保留。导入后重启服务再刷新页面；运行时只读取 JSON 和 PNG，不要求安装 PyMuPDF 或在线下载试卷。资源目录仅列出题面和对应答案键都存在的卷。审计方法及边界见[模考隔离报告](../docs/question-bank/mock-isolation.md)。

PDF 导入器只生成题面、原卷答案和图片，不生成 `answers/mock/sentence-variants.json` 或 `sources/mock_explanations/` 的审阅补充。没有这些文件时仍能完成模考，复盘明确提示解析缺失、造句仅匹配原参考键及需人工复核的限制；不会编造解析或静默修正官方答案。已有的补充文件照常读取，不能为发布而删除或刷新其指纹。历史模考复盘依赖对应本地试卷，备份个人记录时应同时保留这些材料。

阅读 Q13–15 公告页按 PDF 几何位置提取，保证浮动标题属于材料；其余页面保留原文本顺序，避免破坏补词无障碍文本和跨页段落。仅重建结构化题面可运行 `scripts/import_mock_tests.py --structured-only`；该模式先核对 PDF 与已导入卷的 SHA-256，一致后才更新该卷题面，保留图片和答案键。PDF 已替换时会拒绝更新该卷，须完整导入并复核，避免新题面混用旧答案。重建后仍须复核受影响题目及本地解析指纹。

隔离审计报告的 `paper_count` 必须为 5 才覆盖全部官方卷；未导入时的零命中不代表已经完成隔离核对。依赖本地卷或审阅补充的测试会在文件缺失时明确跳过。

## 解析写作约定

- 所有原创题及模考学习解析分为三行：`读懂：`用简单中文解释题目所问及关键英文；`解析：`把依据与答案连起来，说明具体误读或漏项；`下次：`给出适用于此类题的实际判断步骤。英语基础薄弱的学习者不应还要先翻译整段解析才能理解。
- 选择题解释正项为什么成立、干扰项错在哪里，不假定用户一定选了某个错误选项。补词题说明局部意思、搭配或结构及缺失字母；造句题讲清词块顺序与容易错放的部分。复述给出句意、记忆分块与漏词检查；写作和访谈给出对应任务的组织思路，不把某个范文立场当成唯一正确观点。
- 区分字面信息、言外之意、转折、否定和范围限制。不使用「符合语境」「仔细阅读」等空泛结论代替解释；英文术语须有中文说明，引号内的证据必须能在材料、选项或重建的完整补词段落中找到。不要编造用户犯过的错误，也不要把文字比对说成发音、流利度或官方评分。
- 生成器会打乱部分选项，解析应指向选项内容，不写死 A/B/C/D；插句题的 Position 标签指原文位置，不受此限制。只改解析也须逐题审阅材料、题干、选项和答案，再更新对应审阅证据与指纹；不能批量刷新未审阅内容。
- 原创题的解析只在提交后返回；模考须整套完成。模考解析明确标为本地编写，并记录源卷 SHA-256、审阅日期和题面／答案／造句可接受变体／解析正文的内容指纹。官方题面、参考键与本地教学说明分别维护。修改解析后须重新审阅，再用 `scripts.question_bank_review.mock_explanation_fingerprint` 更新该卷指纹；`tests/test_learning_explanations.py` 检查版本和覆盖范围。
- 解析更新不覆写已有答题记录。历史详情另行返回与当时题面、参考答案一致的新版学习解析，界面用它辅助复盘；原答卷、成绩、原始反馈与录音保持不变。若题面或参考答案已改变，则保留该题原解析，避免用新题解释旧答卷。

## 补词整篇译文

`sources/cloze_translations.json` 按已有 `group_id` 保存完整英文 `source` 与中文 `translation`。这份补充直接由后端读取，不写入公开题目 JSON，也不参与评分或原题审阅指纹。修改译文后重启服务生效；无需重新生成未修改的题目。

2026-10-06 为全部 270 篇添加译文：使用 Google Translate 生成初稿，再逐篇对照重建的完整英文校对多义词、指代、否定、条件与时间关系。译文是本地学习参考，不是 ETS 官方翻译，也不作为答案依据。运行时无需调用翻译服务。

修订时先用每空参考词还原英文，再核对完整段落；不可只译挖空后的残句。只有英文全文与 `source` 一致才返回译文；旧历史用归档参考词还原，避免新题译文误配旧答卷。历史详情另行提供匹配译文，不覆写旧记录；新答卷保存当时的译文，后续有匹配的新译文时仅在界面叠加显示。

运行 `./.venv/Scripts/python.exe -m pytest tests/test_cloze_translations.py -q` 检查完整覆盖、英文对应、交卷前隔离、历史只读和综合测验结果；运行 `npx playwright test tests/browser_review.test.cjs` 验证材料切换、答案开关与桌面缩放。测试不能代替逐篇语义校对。

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

5. 检查新的清单和统计。生成器会在写入前拒绝内容与审阅指纹不一致、答案依据缺失或审阅日期缺失的题目；这些校验失败时保留已有题库与清单。重启自己运行的本地服务后，检查练习题面和交卷后的答案显示。

填词的隔词挖空、完整首句、10 空及 70–100 词规则，造句答案词库一致性，全部题号、公开／私有数据边界和 12 题型估时均有回归测试。测试验证结构和约束；新的语言内容仍需内容审阅，不能只凭测试通过认定题目质量。
