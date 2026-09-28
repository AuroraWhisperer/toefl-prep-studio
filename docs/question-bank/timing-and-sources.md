# 题型时间与资料依据

核对日期：2026-09-26。时间配置的唯一维护入口是 [`question_bank/sources/timing.py`](../../question_bank/sources/timing.py)，完整任务单位在 [`practice_structure.py`](../../question_bank/sources/practice_structure.py) 中维护。生成后写入 `question_bank/manifest.json`，设置页、抽题接口和答题页使用同一份配置。

## 正式考试与本应用的计时口径

ETS 当前[考试结构页面](https://www.ets.org/toefl/test-takers/ibt/about/content.html)列出的基准为：阅读 50 题、约 30 分钟；听力 47 题、约 29 分钟；写作 12 题、约 23 分钟；口语 11 题、约 8 分钟。说明时间不计入该表；自适应考试实际题量和时间可能变化。本应用保留这四个总预算作为固定模拟卷时间。

阅读按模块计时，没有每篇文章的官方独立倒计时。专项练习以完整任务为一份，多份是额外加练。日常阅读随机抽完整材料，按实际的 2 题短篇或 3 题长篇逐篇累加预算；其余题型按完整份数相加。正计时只记录实际用时，倒计时在整轮预算用完后提交；多道邮件或讨论练习不会分别强制切题。单位建议不按简单、适中、困难自动加减。

## 12 种题型的预计时间

| 题型 | 一个练习单位 | 默认预计 | 参考范围 | 依据 |
|---|---|---:|---:|---|
| Complete the Words 填词 | 1 篇，10 空 | 2 分钟 | 1–2 分钟 | TST Prep 阅读节奏建议 |
| Read in Daily Life 日常阅读 | 随机 2 篇，4–6 题 | 抽题后确定 | 4–6 分钟 | 短篇 2 分钟、长篇 3 分钟，逐篇相加 |
| Read an Academic Passage 学术阅读 | 1 篇，5 题 | 5 分钟 | 4–5 分钟 | TST Prep 阅读节奏建议 |
| Listen and Choose a Response 听答 | 8 题 | 2 分 40 秒 | 2 分钟–3 分 20 秒 | 官方样题 Module 1 的短回应部分；本题库估时 |
| Listen to a Conversation 对话 | 2 段，4 题 | 3 分 20 秒 | 3–4 分钟 | 官方样题 Module 1 的对话部分；本题库估时 |
| Listen to an Announcement 公告 | 1 组，2 题 | 1 分 30 秒 | 1 分 15 秒–1 分 45 秒 | 本题库估时，含播放一次公告 |
| Listen to an Academic Talk 讲座 | 1 组，4 题 | 3 分钟 | 2 分 30 秒–3 分 30 秒 | 本题库估时，含播放一次讲座 |
| Build a Sentence 造句 | 10 题 | 6 分钟 | 5–6 分钟 | TST Prep 的 10 题 6 分钟；5 分钟为本地练习节奏下界 |
| Write an Email 邮件 | 1 题 | 7 分钟 | 7 分钟 | ETS 官方任务限时，含读题与写作 |
| Write for an Academic Discussion 讨论 | 1 题 | 10 分钟 | 10 分钟 | ETS 官方任务限时，含阅读与写作 |
| Listen and Repeat 复述 | 1 组，7 句 | 3 分钟 | 2–3 分钟 | 整组练习估时，含听句和录音 |
| Take an Interview 访谈 | 1 组，4 问 | 5 分钟 | 4–5 分钟 | 整组练习估时；官方每问作答 45 秒 |

阅读默认值取建议区间上限，留出定位与检查时间。TST Prep 对日常阅读短材料建议 1–2 分钟、3 题长材料建议 2–3 分钟；本项目分别取 120 秒和 180 秒。两篇可能是 2＋2、2＋3、3＋3，共 4／5／6 题、预计 4／5／6 分钟；四篇共 8–12 题、预计 8–12 分钟。页面在抽题前显示范围，抽题后显示实际值。相关建议见 [TST Prep 阅读文章的 Tip 3](https://tstprep.com/articles/toefl/ten-awesome-tips-for-the-reading-section-of-the-toefl-test/)。

每篇带多少题是作者为完整材料设置的结构，不能为了凑目标总数截掉问题。官方依据见 [ETS 题型概览](https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-test-at-a-glance.pdf)的 Read in Daily Life 说明：根据材料长度配 2 或 3 题。[官方 Practice Test 1](https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-1.pdf)的 2＋3 仅是一种示例组合，专项不固定此配比。

## 听力估时如何确定

听力预算是本应用的分配，并非 ETS 公布的逐题限时。按每组只播放一次计算；回听、查看脚本和网络生成音频的等待时间可能让实际练习更久。

当前脚本统计如下。为检查预算是否容得下材料，使用 **150 词／分钟这一项目估算假设**；这不是官方语速，也不是实际音频时长测量。

| 题型 | 脚本词数范围 | 最长脚本的粗估播放时间 | 默认预算扣除该时间后 |
|---|---:|---:|---:|
| 短回应 | 4–17 | 约 7 秒 | 约 13 秒选择答案 |
| 对话 | 54–104 | 约 42 秒 | 约 58 秒完成 2 题 |
| 公告 | 69–79 | 约 32 秒 | 约 58 秒完成 2 题 |
| 学术讲座 | 141–174 | 约 70 秒 | 约 110 秒完成 4 题 |

固定听力卷为 17 道回应、5 组对话、4 组公告和 3 组讲座：`17×20 + 5×100 + 4×90 + 3×180 = 1740 秒`，与 29 分钟总预算一致。合成语音的停顿、声线及语速会影响实际播放时长，不能据此认定已还原正式考试听觉难度。

## 写作和口语的细节

- 邮件 7 分钟由 [ETS 官方练习 Test 1](https://www.cn.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-1.pdf)的任务说明确认（印刷页码 28，PDF 第 29 页）。其邮件说明没有给出最低字数；应用中的 100 词是展开内容的练习目标。
- 讨论 10 分钟及有效回答至少 100 词的建议，见 [ETS 写作教学材料](https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-lesson-plan-writing.pdf)和官方练习任务说明。教学材料里的课堂活动时长不用于考试计时。
- [TST Prep 2026 造句练习](https://media.tstprep.com/freebies/2026/toefl-writing-100-questions-freebie-2026.pdf)使用 10 题 6 分钟；本应用取平均每题 36 秒。它不是官方逐题强制时限。固定写作卷 `10×36 + 420 + 600 = 1380 秒`，共 23 分钟。
- 访谈每问 45 秒、共 4 问，题型依据见 [ETS 题型概览](https://www.ets.org/pdfs/toefl/toefl-ibt-test-overview.pdf)。应用没有另设准备阶段；每组 5 分钟还计入听题与切题，属于练习预算。
- [TST Prep 复述指南](https://media.tstprep.com/2026-courses/slides/speaking-course/04.03-toefl-speaking-2026-listen-and-repeat-task-guide.pdf)给出约 8–12 秒的作答范围。本应用沿用每组 `8、8、10、10、12、12、12 秒`的录音上限，**该逐句序列是项目练习规则，未核实为 ETS 官方固定序列**。听句和切题也占用时间，所以整组另留 3 分钟。

固定口语卷的整组预算为 `3 + 5 = 8 分钟`。固定阅读卷的 10 道日常题采用两短、两长，各材料预计合计仍为 26 分钟；整科提供 30 分钟。差额用于检查和切换，不表示所有考场模块可自由转移剩余时间。固定卷是保留的一份练习形式，与随机专项的抽题逻辑不同。

## 难度与完整材料

每份至少包含一道适中或困难题，不强制混入简单题。抽题以完整材料为单位，保留复述句序和同主题访谈，不靠拆题凑数。单份写邮件或讨论因此不会抽取简单题；题库收录数量仍包含全部已编写题目。全困难组合被允许，但部分题型尚无全困难的完整材料组。难度标签不改变计时预算，也不代表 ETS 难度标定。

## 版本冲突与使用边界

部分概览、纸质练习和备考网页采用不同模块组合，可能列出 35–48 题、约 27 分钟等总量。本项目以核对当日的 ETS 当前考试结构页面决定固定卷总预算，以官方具体任务说明确认邮件、讨论和访谈限时；备考资料仅提供专项节奏参考。不能用不同来源的题数和时长拼成一套所谓官方固定流程。

内容考点依据 [ETS 2026 规格文档](https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-test-specifications-2026.pdf)：日常和学术信息理解、主旨、细节、推断、词义、篇章关系，以及相应的书面和口头表达。难度分级方法、修订范围与限制见 [内容审阅报告](audit.md)。本项目题目均为原创练习，未复制这些来源的题面或答案。
