# 阅读听力遗漏复查与口语写作审阅

审阅日期：2026-09-30。结论：仍有需要处理的问题，不能把上一轮的测试通过或审阅完成理解为所有题目均无问题。本轮是审阅报告，没有修订题目、答案、评分实现或审阅指纹。

后续已按用户要求完成修订，并补完全部写作题的逐篇核查，见[口语写作逐题复核与遗漏修订](productive-repair-2026-09-30.md)。下文保留首次审阅时的发现和范围，不作为当前未修清单。

先读取了对话《审查阅读听力内容质量》和[上一轮修订报告](receptive-repair-2026-09-30.md)，再对照当前源稿、生成题库和实际判分函数。上一轮明确只改阅读、听力；口语和写作沿用原内容。旧报告链接的逐题台账目录目前不在本机，因此本轮结论以当前文件和重新运行的检查为依据。

## 需要优先处理的问题

### 1. R125：仍漏收合法的英式拼写

完整语境是地标容易辨认：`Familiar landmarks become useful when they are easy to recognize ...`。题面固定 `reco`，要求补五个字母；`gnise` 恰好组成 `recognise`，同样符合词义、词性和长度。[Oxford 词典](https://www.oxfordlearnersdictionaries.com/definition/english/recognize)明确列出该英式拼写。

当前[答案库](../../question_bank/answers/reading.json)只收 `recognize`、`gnize`。调用真实 `score_one`，输入 `gnise` 得 **0/1**。这是本次确认的阅读遗漏，和上一轮已补收的 `recognisable`、`minimise` 属于同类问题。

建议沿用生成器已有的变体机制收录完整词和缺失部分，并同步修订 [R125 的解析源](../../question_bank/sources/cloze_explanations.json)。应复核整组 R121–R130 后更新有关审阅记录，不能只改生成答案。

### 2. W33、W61、W70：符合当前题面限制的词序仍被判错

下列句子均能用现有词块填满所有空位，保留固定文本、没有拆分或重复使用词块，且回应当前对话。已复用 `tests/test_sentence_frames.py` 的组装检查，再调用真实判分函数；三题均得 **0/1**。

| 题号 | 被拒绝的合理答案 | 漏项 |
| --- | --- | --- |
| W33 | The experiment failed but the results raised an interesting question. | 使用 `but`，留下 `although`，仍表达失败却有收获。 |
| W61 | She suggested that before choosing a venue we discuss the budget. | 时间短语放在 `that` 从句的开头，仍是先讨论预算再选场地。 |
| W70 | We again tested the uncertain measurement rather than repeat the whole experiment. | `again` 放 `tested` 前，同时把整块对照短语放句尾。 |

W33 的[现有解析](../../question_bank/sources/productive_explanations.json)已经承认 `but` 句语法成立、只是未被自动判分接受，因此这是**已说明但尚未解决的限制**。W70 则更容易误导：解析分别允许上述两处调整，答案清单却漏收它们的组合。

建议在[造句答案源](../../question_bank/sources/sentence_answers.py)逐条补收已复核的词序，并让解析与实际判分一致。不能据这三个例子宣称其余所有合法词序已经穷尽，也不宜把所有词块排列自动当作正确答案。

### 3. S03：解析把漏掉 can 与过去时混为一谈

原句是 `You can reserve a study room through the student portal.`。[解析源](../../question_bank/sources/productive_explanations.json)写的是“can 不能漏成已经预订”。

这里 `can` 表示可以办理；删掉它并不会把 `reserve` 变成“已经预订”。应说明漏掉的是许可或可行性含义，同时要求复述保留原词，而不应教给初学者错误的时态对应。[Cambridge 的 can 用法](https://dictionary.cambridge.org/grammar/british-grammar/can?q=can)也将许可、能力与过去时间区分。

可改为下面的三行；这是建议稿，尚未写入题库：

> 读懂：你可以通过学生门户网站预订自习室；can reserve 是“可以预订”，不是说已经订好了。
> 解析：can 说明可以这样办理，a study room 是预订对象，through the student portal 说明办理渠道。漏掉 can 会丢失“可以”的意思，并不会自动变成过去时；复述时还要保留 room 前的 a 和 portal 前的 the。
> 下次：听到“可以做什么”，按“can＋动作／办理对象／办理渠道”记三块，再按原词复述；最后核对 can、a、the 是否保留。

### 4. W450：评分关键词偏向参考范文的具体方案

题目允许选择短期海外访问或一学期线上合作，要求说明理由。范文支持线上合作，本身能回应任务；但[私有评分键](../../question_bank/sources/expansion_2026_09/academic_discussion.json)的三个关键词是 `online projects`、`shared equipment`、`time zone`，后两项是范文自行提出的办法，并非题目必答要求。

本轮写了一段 **129 词**的反方示例：优先海外访问、按经济需要选择参与者、与当地学生共同调查平价餐饮、回校分享，并回应学生 B 的参与机会问题。真实判分给它 **3/5**，原因是没有命中这三个字符串；当前参考范文为 **5/5**。完整示例和返回值见本机证据。

这不是对示例应得官方满分的断言，而是证明当前两分“内容分”与是否使用范文细节绑定。项目已经说明这是关键词启发式；这一已知边界仍会影响普通练习的数字反馈，不能用该分数判断反方观点或同义表达错误。

后续处理应把任务完成度与范文措辞分开。仅给反方再加几个关键词，仍不能验证论证质量；若继续使用现有启发式，需要明确数字只代表机械检查，并以人工复核确认开放题质量。此项涉及评分约定，不能靠改参考范文或悄悄调整答案掩盖。

## 可以改进但不属于错答案的问题

- **W435 的中文不够清楚。** [解析源](../../question_bank/sources/expansion_2026_09/academic_discussion.json)把 `a garden with many separate beds` 写成“分床花园”。这里的 `beds` 是种植畦，可写成“分成多块种植区的花园”。文中的阅读棚与花园是假设比较，不能据此断言所有花园都更费维护；当前解析已保留这层限定。
- **L300、L750、L1111 的干扰项仍偏弱。** L300 问代管包裹，却有“快递员穿蓝夹克”；L750 请求帮拉拉链，错项全在聊天气、面料、退货；L1111 询问施工期间的入口，却有“从窗户进”。这些题的正确答案清楚，简单题本身也有价值；但可把部分错项改成同一任务中的时间、地点或动作误解，提高训练价值，不必硬调为困难题。

## 本轮实际检查范围

所有人工审阅均为题面与答案的对照审阅，不宣称盲答。以下不同层次不能混称为“3,615 题全量语言精审”。

| 范围 | 实际核查 |
| --- | --- |
| 全库 3,615 题 | 运行既有回归，验证源稿与生成题库一致、审阅指纹、解析三行格式、公开与私有字段边界、既有答案可组装等。 |
| 阅读补词 90 组、900 空 | 读完整还原文章，对照固定词首、缺字母数量和标准词；解析重点追查 R125 等具体疑点，未逐条重新精审 900 条解析。 |
| 阅读选择 32 题 | 3 份日常材料共 7 题、5 篇学术文章共 25 题，逐组核对题面、选项、答案与解析。 |
| 听力选择 36 题 | 听答 12 题、对话 3 组 6 题、公告 3 组 6 题、讲座 3 组 12 题，对照完整脚本和解析。 |
| 口语 165 题 | 105 条复述、60 条访谈的文本、参考内容和解析。复述参考与原句吻合；除 S03 的讲解问题外，本轮未发现其他明确的文本错误。未逐条试听。 |
| 造句 150 题 | 核对全部对话语境、固定文本、词块及接受清单；对疑似漏收的词序作组装和判分复现，解析按疑点追查。 |
| 邮件 15 题、讨论 15 题 | 跨初始题、扩充题抽查完整题干、范文和解析。所抽范文均回应题目要求；发现 W435 的中文表达问题及 W450 的关键词评分偏差。其余 270 道开放写作题没有在本轮逐篇语言精审。 |

邮件样本：W11、W26、W75、W82、W89、W96、W110、W251、W265、W279、W293、W307、W321、W335、W350。

讨论样本：W18、W25、W115、W122、W129、W136、W150、W351、W365、W379、W393、W407、W421、W435、W450。

旧的 20 道访谈提供参考要点，新增 40 道提供完整示例；界面标签是“参考要点”，因此不能把前 20 题没有完整示例直接说成答案缺失。它们的中文解析均给出相应组织办法。

[ETS 口语说明](https://www.ets.org/toefl/test-takers/ibt/about/content/speaking.html)与[ETS 写作说明](https://www.ets.org/toefl/test-takers/ibt/about/content/writing.html)核对了当前任务类型：复述、访谈，以及造句、邮件、学术讨论。未发现任务类型混用；这不证明所有细题材穷尽，也不证明难度与 ETS 等值。

## 验证与复现证据

相关回归 **61 passed**，另有两条现有依赖弃用警告。调用判分函数的反例另行记录，未改测试来让问题通过。

```powershell
.\.venv\Scripts\python.exe -m pytest -q tests/test_content_quality.py tests/test_bank_audit.py tests/test_sentence_frames.py tests/test_expansion_cloze.py tests/test_learning_explanations.py tests/test_subjective_scoring.py -p no:cacheprovider
```

本次实际运行额外指定了本轮 QA 目录作为 `--basetemp`；既有测试夹具隔离个人历史和会话。未启动或重启服务，没有写入个人答题历史。本轮没有界面改动，也未做音频、麦克风或浏览器视觉验证。

完成后的[本机证据目录](../../tmp/content-recheck-2026-09-30/README.md)保存 `pytest.log`、`evidence.json` 和隔离测试数据。JSON 包含抽查题号、判分反例和所查四科题面/答案文件的 SHA-256，方便后续修复时区分版本。没有刷新任何内容审阅指纹。
