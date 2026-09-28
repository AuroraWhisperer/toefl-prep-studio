# TOEFL iBT 2026 练习与模考工作台

用于个人本地练习。FastAPI 后端 + 原生 HTML/CSS/JavaScript 前端，题目与答案独立存放。

## 文档导航

- [项目工作约定](AGENTS.md)：修改边界、桌面平台范围与验证要求。
- [产品约定](PRODUCT.md)：练习流程、能力与限制的正文；本 README 负责安装、启动、接口和验证。
- [设计约定](DESIGN.md)：布局、视觉与键鼠交互的正文；[题面依据](docs/ui-task-layouts.md)记录官方界面参考与本地取舍。
- [专项练习规格](specs/exam_aligned_practice_design.md)：完整材料抽取、计时与提交验证合同。
- [题库维护说明](question_bank/README.md)：源稿、生成、审阅和模考导入流程，以及内容报告导航。
- [架构审查](docs/architecture-review-2026-09-27.md)：分阶段改进范围、触发条件与回退边界。
- [实施记录](docs/superpowers/plans/)：各批次的决策与验证证据；历史计划保留当时语境，不覆盖现行产品和桌面平台约定。

## 题量与配比

| 科目 | 整科练习 | 练习题库 | 子题型（整科练习题数） | 练习时长 |
| --- | ---: | ---: | --- | ---: |
| Reading | 50 | 795 | Complete the Words 30；Read in Daily Life 10；Read an Academic Passage 10 | 30 分钟 |
| Listening | 47 | 705 | Choose a Response 17；Conversation 10；Announcement 8；Academic Talk 12 | 29 分钟 |
| Writing | 12 | 450 | Build a Sentence 10；Write an Email 1；Academic Discussion 1 | 23 分钟 |
| Speaking | 11 | 165 | Listen and Repeat 7；Take an Interview 4 | 8 分钟 |
| 合计 | 120 | 2,115 | 原有 705 题不变，12 个题型各扩充到三倍 | — |

从首页选择「专项练习」「整科练习」或「综合测验 → 选择难度开始」；完整 ETS 模考与原创题库分离。综合测验提供五套随机组卷方案和 1–10 档起始难度，详见[自适应测验设计](specs/adaptive-tests.md)。首页卡片布局和键鼠交互统一见[设计约定](DESIGN.md#surface)。

专项先选择题型、题量和计时方式，再随机抽取完整材料组；同一轮不重复抽取。原有题号和内容保留，本轮追加 R266–R795、L236–L705、W151–W450、S56–S165；每题配有独立教学解析，产出任务另有参考表达。整科阅读的 10 道日常题来自两篇短材料和两篇长材料；整科写作仍使用最初 10 道排序题、第一道邮件和第一道讨论题。

## 答题记录

- **单项训练**：阅读、听力、写作、口语的专项或整科练习提交成功后，保存当次原题、答案、反馈及用时；刷新后仍可复盘。同一次提交的网络重试不会重复归档。
- **模拟考**：显示已有的已完成整卷会话，复用原来的答案与录音复盘；进行中或放弃的会话不计入历史。
- **测验**：五套方案默认难度为 2／4／5／7／10 档，每轮 120 题；阅读、听力分别在模块间自适应，整卷完成后归档到本分类。保存实际抽取的题面、路由及录音，仅汇总客观题正确数，开放写作与口语待人工复核。已有四科综合提交接口的 `section=all, mode=exam` 结果仍归入该类。
- 三类均按完成时间**最新在前**，每页 10 条；日期按浏览器本地时区筛选，包含截止日期全天。切换分类保留日期，返回复盘列表保留页码。
- 页面右上角「记录管理」提供两个需确认的操作：「重置概率」保留所有记录与录音，仅清除旧提交产生的抽题降权，新提交会重新累计；「全部清空」永久删除所有分类的已归档记录与录音并重置概率，不受当前分类或日期筛选限制，不删除进行中或已放弃的模考。
- 单项／整科练习记录及已提交口语录音默认保存在本机 `artifacts/practice-history/`，模考保留 `artifacts/mock-sessions/`。录音上传失败会显示重试入口，离开或刷新前应完成保存。启用归档前未保存的普通练习无法补回，已有完成模考可直接读取。
- `TOEFL_DATA_DIR` 可指定数据根目录。浏览器测试使用独立临时目录并在结束时清理；默认 8765 端口被占用时，可设置 `TOEFL_TEST_PORT` 使用其他端口，无需停止日常练习服务。
- 归档损坏或当前操作所需字段不完整时，页面显示可定位的文件标识并停止相应读取，不把历史当成空列表，也不静默将重复计数归零。文件读取失败与内容损坏分别提示；安全恢复及内存索引说明见[历史管理规范](specs/history-management.md#archive-diagnostics-and-recovery)。

接口为 `GET /api/v1/history`、`GET /api/v1/history/{category}/{id}`；单项／测验录音通过对应的 `/recordings/{question_id}` PUT 保存、GET 回放。`POST /api/v1/history/reset` 必须提交 JSON `{"scope":"probability","confirm":true}`（重置概率）或 `{"scope":"all","confirm":true}`（全部清空）。日期接口使用含时区的 `start_at`（含）和 `end_at`（不含）。仅供本机个人使用，不提供多人账户隔离或云同步。

## 资源库与完整模考

- **练习**：2,115 道原创题，沿用专项和整科练习功能；不混入官方模考试卷。
- **模拟**：ETS 官方 2026 Practice Test 1–5，共五套，每套 97 题；阅读 40、听力 34、写作 12、口语 11。
- **测验**：独立的原创题库组卷流程，可选择难度、保存并返回和恢复进度。它不是官方考试或 ETS 自适应算法；不同方案与重考允许重复材料，完整蓝图、路由范围和限制见[测验规范](specs/adaptive-tests.md)。真正的官方考试接入仍未启用，资源接口的 `real_exam.enabled` 保持 `false`。

测验接口：`GET /api/v1/tests/catalog`、`POST /api/v1/tests/sessions`（`{"level":1..10}`）、`GET /api/v1/tests/sessions/{id}`、`POST /api/v1/tests/sessions/{id}`（`begin`／`save`／`submit`）。阶段提交前只返回当前题面，不返回答案键。会话保存在 `TOEFL_DATA_DIR/test-sessions/`；完成后复用测验历史及录音存储。开始阶段后服务端计时，刷新不重置；上传中的录音离开前请等待保存。新增验证：`python -m pytest tests/test_adaptive_test.py -q`、`npx playwright test tests/browser_adaptive_test.test.cjs`。

模考按设备检查→阅读双模块→听力双模块→造句→邮件→学术讨论→复述→访谈→复盘顺序进行，不设置休息阶段。每阶段先显示 Directions，确认开始才计时，说明页不占用作答时间。ETS 公布的 30 / 29 / 23 / 8 分钟是科目基准，不是本固定卷的硬性总限时（核对日期 2026-09-26）。阅读每模块 15 分钟、造句 6 分钟和听力每题 20 秒仍是明确标注的模拟设置；邮件 7 分钟、讨论 10 分钟、访谈每问 45 秒有官方依据。复述每句 8–12 秒符合 ETS 公布范围，具体逐句分配属于本卷设置。听力、口语不再以估算的模块／科目总时长强制截断。

原创写作造句练习也使用横线填词：固定词可以没有或位于句首／句中／句尾，有些题多给一个词块，并非每题都要用完。支持点击、键盘、拖动、撤回和切题保留；不再自由改写词库。依据及维护方式见[造句题官方格式核对](docs/question-bank/sentence-format.md)。更新题库后，已运行的本地服务需重启再刷新页面。

阅读改为文章内填词和逐题材料／选项界面；造句使用可点击、拖动和撤回的词块，固定词不可改写，单个词块不可重复使用。阅读与造句任务内可回看，检查并确认提交后锁定。邮件、讨论使用原题文字与编辑区。原 PDF 仅在复盘保留。听力使用试卷脚本合成语音（服务不可用时使用浏览器语音），口语需麦克风；听说逐题向前。答案、词块顺序、导航位置和已经播放的材料组保存在服务端，刷新不重置已开始的模块／单题截止时间。单题超时由服务端锁定，迟到答案被拒绝。录音到时停止后有 10 秒上传宽限，不能延长作答或覆盖已保存录音。关闭页面后无法播放后续音频或继续录音；未上传的录音不能通过刷新恢复。

整卷结束才释放答案与录音复盘：84 道客观题显示参考正确数，2 篇写作与 11 道口语待人工复核，不换算官方分数。此功能是**官方公开练习卷的固定卷机考练习**，不是 ETS 自适应系统、原声录音或官方界面的逐像素复刻。

会话与模考录音保存在本机 `artifacts/mock-sessions/`（Git 忽略），仅本地个人使用；不要把开发服务器暴露到公网。专项练习录音在提交后按前述归档规则保存。接口为 `GET /api/v1/resources`、`POST /api/v1/mock/sessions`、`GET/POST /api/v1/mock/sessions/{id}` 以及相应的 `/recordings/{question_id}`、`/result`。

来源、导入与内容隔离检查见[模考审计说明](docs/question-bank/mock-isolation.md)。

下表中的「份」对应一个完整任务或官方样题中的一个题型部分；多份表示额外加练。题型数量依据 ETS 规格文档和官方 Practice Test 1，统一维护于 `question_bank/sources/practice_structure.py`。日常阅读随机抽取完整材料，短材料自带 2 题、长材料自带 3 题，不强制固定成 2＋3。

| 科目 | 题型 | 一份完整练习 | 可选份数 | 题库小题 |
| --- | --- | --- | --- | ---: |
| 阅读 | 填词 Complete the Words | 1 篇、10 空 | 1 / 2 | 450 |
| 阅读 | 日常生活 Read in Daily Life | 随机 2 篇、4–6 题 | 1 / 2 | 195 |
| 阅读 | 学术文章 Read an Academic Passage | 1 篇、5 题 | 1 / 2 | 150 |
| 听力 | 听答题 | 8 题（官方样题 Module 1） | 1 / 2 | 255 |
| 听力 | 短对话 | 2 段、4 题（官方样题 Module 1） | 1 / 2 | 150 |
| 听力 | 校园公告 | 1 段、2 题 | 1 / 2 | 120 |
| 听力 | 学术讲座 | 1 段、4 题 | 1 / 2 | 180 |
| 写作 | 造句题 | 10 题 | 1 / 2 | 150 |
| 写作 | 写邮件 | 1 封 | 1 / 2 / 3 | 150 |
| 写作 | 学术讨论 | 1 篇回应 | 1 / 2 / 3 | 150 |
| 口语 | 复述题 | 同一场景的 7 句 | 1 / 2 / 3 | 105 |
| 口语 | 模拟面试 | 同一访谈的 4 问 | 1 / 2 / 3 | 60 |

阅读、听力、写作可选正计时或倒计时；口语使用倒计时。设置页显示每份的对应任务、题数、预计时间及依据；正计时也显示预算。日常阅读两篇显示 4–6 题、预计 4–6 分钟，四篇显示 8–12 题、预计 8–12 分钟；抽题后按实际材料计算准确题数和时间，短篇 120 秒、长篇 180 秒。倒计时按整轮预算交卷，多题写作不会分别强制切题。设置页与答题页的布局约定见[设计约定](DESIGN.md#surface)。

题库按简单、适中、困难三个层级记录，每种题型都有三个层级；最新数量见生成的[内容审阅报告](docs/question-bank/audit.md)。每份专项至少包含适中或困难内容，不允许整份全简单；不要求混入简单题，因此允许全适中或全困难的完整材料组合。部分题型尚无全困难材料组，不能保证每个题型都能抽到全困难。级别依据词汇、句法、信息整合与表达要求划分，是本项目的相对内容分级。逐题证据见[审阅清单](docs/question-bank/catalogue.csv)。

时间来源以 ETS 官方任务说明和当前考试结构为准，阅读节奏等参考 TST Prep；未有可靠逐题限时的部分明确标注「练习估时」。12 题型完整时间表、官方与建议的区别见[时间与来源](docs/question-bank/timing-and-sources.md)。

填词和按材料组复盘的规则见[产品约定](PRODUCT.md#capabilities-and-constraints)；材料／问题双栏及桌面窄窗口回退见[设计约定](DESIGN.md#surface)。本项目不以手机为目标平台。

## 一键启动（Windows）

双击项目里的 **`启动托福练习.cmd`**，或桌面上的 **「托福练习」** 快捷方式。启动器会准备 Python 环境，等服务和首页就绪后自动打开默认浏览器。已有服务运行时只打开页面，不再启动第二个服务。首次缺少依赖时需要联网安装；电脑需已有 Python 3.10 或更新版本。

练习时保留「TOEFL 练习服务」窗口即可，可以最小化；关闭该窗口会停止服务。只关闭网页不会停止服务。启动失败时窗口会保留错误信息，按提示处理后重新双击。

直接最大化浏览器窗口即可练习，需要隐藏标签栏和地址栏时可按 **F11** 进入／退出浏览器全屏。

布局以 **2560×1440 电脑屏幕**为目标，同时考虑 Windows 125%／150% 缩放。大屏下加宽答题与复盘两栏、提高字号；长题目可滚动，底部切题／提交按钮保持可达。

### 手动启动（PowerShell）

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe backend/app.py
```

浏览器访问 [本地工作台](http://127.0.0.1:38761)。服务只绑定本机地址。也可从项目根目录运行：

```powershell
.\.venv\Scripts\python.exe -m backend.app
```

以上启动方式使用统一的控制台日志：接口请求带时间，交卷记录科目、题型、模式、收到的回答条数、已答/总题数和评分耗时，不记录答案正文。成功的静态资源请求不再刷屏，失败请求仍保留。语音合成回退会显示具体异常原因。

答题内容和录音保留在当前页面；刷新页面或重新开始会清空。模拟计时到零后自动提交；网络失败时答案保留，可手动重试。主动提交可以包含未答题，漏答按零分计算。

## 音频与口语

- 听力／口语练习、复盘和完整模考按材料随机分配提示音：北美（美式）约 80%、英国约 10%、澳大利亚约 10%；每种口音内男女声约各半，独立随机。美式使用 Aria（女，`en-US-AriaNeural`）／Guy（男，`en-US-GuyNeural`）；英式使用 Sonia（女，`en-GB-SoniaNeural`）／Ryan（男，`en-GB-RyanNeural`）；澳式使用 Natasha（女，`en-AU-NatashaNeural`）／William（男，`en-AU-WilliamMultilingualNeural`）。保持默认语速与音高，保留口音和音色区别；不提供新西兰或手动单音色选项。不支持的请求（含新西兰）归一为默认美式音色。
- 80/10/10 与男女各半是训练概率，不是 ETS 官方考试分布；每段独立抽取，少量题目不保证精确比例或所有音色都出现。口音、男女声与题型无关，不修改现有抽题、题目脚本、计时或个人录音回放。同一页面内，本轮相同材料、重播、复盘及浏览器历史恢复保留同一音色；开始新一轮重新抽取，整页刷新后的模考恢复会重新分配。
- 提示音优先使用 edge-tts，需要联网；失败后只使用同地区、同名目标说话人的浏览器音色，避免无法确认性别的系统默认音色将男声替换为女声或反之。备用音色是否可用取决于设备安装情况；等待音色列表加载后仍无匹配音色时停止播放，提示启用对应音色或联网后重新开始本轮，不会静默切换口音或性别；也可展开练习脚本。普通练习、复盘和完整模考使用同一规则。
- 双人对话按脚本中的角色标记逐轮配音，不朗读角色名称。同一角色始终使用同一音色，两位角色使用同口音的不同男女声；明确的 Man／Woman 标签遵循其性别，Student／Adviser 等未标明性别的角色沿用本轮随机分配并使用互补音色。普通句末换人至少留 400 毫秒，问句后 600 毫秒，省略号后 800 毫秒；句内标点仍由语音引擎处理。在线音频和浏览器备用语音使用相同分段与停顿，切题或退出会取消后续发言；模考题目旁白不并入最后一位角色的台词。
- 练习及复盘脚本每次发言独立成段，角色名称加粗，正文使用整个脚本区域宽度；不改写题目原文。普通独白保持原有段落显示。
- 这些是练习用合成音色，并非 ETS 考试原声。[Updated TOEFL iBT Test Overview](https://www.ets.org/pdfs/toefl/toefl-ibt-test-overview.pdf)（版权 2026，含新版四类听力题型）列出北美、英国和澳大利亚；[现行 ETS 听力页面](https://www.ets.org/toefl/test-takers/ibt/about/content/listening.html)另列出新西兰，本应用按用户要求不纳入。上述资料未指定这六款 TTS 音色或口音／男女声比例，不保证与考试配音完全相同。[微软音色资料](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)和当前 edge-tts 音色目录用于核对所选音色（2026-09-26 核查）。
- 抽题后自动预加载本轮听力和口语提示音，同时最多准备两段（对话按发言分段），切题时优先准备当前材料。开始播放对话前先准备完整段落序列，避免中途等待合成造成不规则断续；同一材料及重播共用已下载音频。预加载不自动播放，仍点击「播放提示音」。第一段或尚未准备好的音频仍可能需要等待网络合成。
- 提示音仅在本轮浏览器内存中缓存，不再写入磁盘。交卷成功、返回首页、刷新或关闭页面时取消未完成请求并释放缓存；交卷失败保留音频供继续答题。复盘时按点击重新准备所需音频，离开复盘时释放。关闭服务会释放服务进程中的临时音频。
- 口语使用浏览器麦克风录音，可回放。复述录音按题目建议时长自动停止，访谈上限 45 秒。
- 浏览器支持语音识别时会尝试转写；不可用时需手动输入或修正文字。浏览器的语音服务可能依赖网络。
- 专项／整科练习提交会等待录音收尾，包括刚点击停止但音频尚未收齐的情况；提交成功后上传至本机应用服务并归档。未提交或上传失败的录音仍仅存在于当前页面内存。练习评分使用文字，不测发音、语调或流利度；完整模考录音的本地保存规则见前文。
- 无需安装 Whisper 或下载模型即可使用本版。

## 目录

```text
frontend/                  页面、样式和交互
backend/                   API、请求校验、题库读取与评分
question_bank/sources/     原创材料、参考范文、分级记录和时间配置
question_bank/<科目>/      供后端读取的题目 JSON（不静态公开）
question_bank/answers/     私有答案与参考要点 JSON
question_bank/manifest.json 题量、题型、时间与来源
scripts/build_question_bank.py 题库生成入口
scripts/question_bank_review.py 审阅校验与清单生成
docs/question-bank/        内容报告、2,115 行逐题清单与时间来源
tests/test_exam_api.py     HTTP 和题库回归测试
tests/test_task_practice.py 专项选题、评分与扩充题库完整性测试
tests/test_bank_audit.py   内容审阅、填词、造句与估时回归测试
tests/browser_practice_helpers.cjs 浏览器专项练习验证助手
tests/browser_practice.test.cjs 可直接运行的浏览器回归测试
tmp/                       已退役的一次性工具及其历史输入／输出，供人工删除
```

源稿对应关系和更新流程见[题库维护说明](question_bank/README.md)。题目内容放在 `question_bank/sources/`；生成脚本、生成数据和维护文档分别存放。

静态资源仅挂载 `frontend/`（`/frontend`）和模考原卷题面图片 `question_bank/mock/pages/`（`/mock-pages`），首页 `/` 返回前端入口。整个题库、答案键、源稿、审阅记录及用户归档目录均不作为静态目录公开；取题 API 不含答案键，练习交卷后返回本轮题目的参考答案和解析，模考答案仅在整套结束后由复盘接口返回。

TTS 音频由 `POST /api/v1/tts` 直接返回音频字节，不持久写入 `audio/`，也不挂载 `/audio`。历史与模考录音通过各自的录音接口保存和回放，不等同于临时提示音；数据位置见[答题记录](#答题记录)。旧版 `audio/` 文件本轮不清理；后续清理前须确认用途、备份并验证恢复，不能连带删除历史与录音。

## 接口

- `GET /api/v1/meta`：题型、题量、各题型练习配置、时间依据及难度分布。
- `GET /api/v1/exam?section=reading&mode=exam`：固定单科模拟卷。
- `GET /api/v1/exam?section=reading&mode=practice&task_type=complete_words&count=2&timer_mode=countup`：随机选择两篇填词材料，共 20 个小题，返回本轮 `question_ids` 与 `estimated_time_seconds`（此例 240 秒）。预计时间不因正／倒计时模式变化。
- 专项取题可加 `repeat_decay`（默认 `1`，范围 `0..3`）：材料提交 `n` 次后的相对抽取权重为 `1 / (1 + n) ** repeat_decay`。默认未做／做过 1／2／4 次的权重分别为 `1`／`0.5`／`0.333`／`0.2`，不是固定中选概率；设为 `0` 关闭降权，设为 `2` 加强避重。页面不提供衰减强度设置。「重置概率」将旧提交 ID 的快照保存在数据目录下的 `practice-history/.repeat-reset`，重启后仍生效；旧记录保留用于复盘，但不再参与降权。统计仅累计重置后的新提交；完整规则见 [产品约定](PRODUCT.md#capabilities-and-constraints)。难度约束仍优先，重置不保证所有题目的最终中选概率相同，也不保证完全不遇到旧题。
- `GET /api/v1/exam?section=writing&mode=bank&task_type=write_email`：读取全部 150 道邮件题，保留原题库接口。
- `POST /api/v1/exam/submit`：提交 `{section, mode, task_type, responses: [{question_id, answer, duration_seconds}]}`；`practice` 模式还必须提交 `count` 和取题时的 `question_ids`。服务端验证题型、题量、完整材料组及重复／无关 ID，并按传入的本轮题目评分，不重新随机抽题。漏答计零，重试应复用同一组选题。
- `POST /api/v1/tts`：接收 `text` 和可选 `voice`；成功返回 `audio/mpeg` 音频字节（`Cache-Control: no-store`），不再返回持久音频 URL。失败或超过 20 秒返回 JSON `{url: null, text, fallback: true}`；客户端断开会取消合成。
- `GET /api/v1/health`：运行状态。交互式 API 文档位于 `/docs`。

## 生成与测试

```powershell
.\.venv\Scripts\python.exe scripts/build_question_bank.py
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest -q
node --check frontend/app.js
```

修改生成源后重新运行生成器，并重启本地服务以载入新题库。

生成器在所有科目的内容审阅、题量、答案对应关系和审阅 ID 覆盖校验通过后才写出题库；上述校验失败时保留已有生成文件。

浏览器回归使用 Node.js 20 或更新版本及项目内的 Playwright 开发依赖。首次准备和运行：

```powershell
npm ci
npx playwright install chromium
npm run test:browser
```

测试自动在 `127.0.0.1:8765` 启动独立服务，使用独立浏览器上下文，结束后自动关闭；该端口已被占用时会报错，不复用已有服务。覆盖全部 12 题型、填词字母输入、正/倒计时及交卷失败重试，并验证提示音预加载、材料复用、快速切题、退出清理和语音回退。音频回归使用本地测试音频，不依赖联网 TTS。失败诊断保存在 `artifacts/browser-tests/`。

回归测试覆盖 12 种题型的完整材料抽取、难度约束、日常阅读全部允许题数组合、实际材料计时及原题重试评分；测试不代表已验证实际麦克风设备或联网语音服务的质量。

## 题型来源与限制

依据 ETS [阅读题型](https://www.ets.org/toefl/test-takers/ibt/about/content/reading.html)、[听力题型](https://www.ets.org/toefl/test-takers/ibt/about/content/listening.html)、[写作题型](https://www.ets.org/toefl/test-takers/ibt/about/content/writing.html)、[口语题型](https://www.ets.org/toefl/test-takers/ibt/about/content/speaking.html)及 [2026 规格文档](https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-test-specifications-2026.pdf) 编写，核对日期为 2026-09-26。

当前阅读包含 Complete the Words、Read in Daily Life、Read an Academic Passage 三种任务。本应用分别实现段落内补字母、日常应用文本选择题和约 200 词学术短文选择题，练习语境、主旨、细节、目的、推断、词义及篇章关系。日常生活材料配 2 或 3 题，题数是材料固有结构；专项随机抽完整篇目，允许两短、短长或两长组合，不把官方样题中的一种组合当作唯一规则。

规格中的阅读生活/学术题各为 5–15 题；听力回应 15–19、对话 10、公告 6–10、讲座 8–16。本项目采用范围内的一套固定配比。正式考试为自适应测量，实际数量与时长可能变化，本项目不复制其模块路由、加试题或官方评分算法。

题目均为原创练习，包含语境补词、主旨、细节、推断、目的、词义和篇章结构等考点，但没有经过 ETS 难度等值标定。难度是基于材料与任务要求的内容分级，不能预测官方成绩。练习允许回看题目、重播和查看脚本，不等同于严格考场流程。

客观题按答案判断；句子排序忽略大小写和标点后匹配已审阅答案，并接受收录的合理替代词序，尚未覆盖全部合法表达。开放写作/访谈只根据文字长度、关键词和简单结构作启发式反馈，可能误判。重复词组占主导的回答会被限制为低分；通过长度和关键词检查的反馈不会据此断言语义、论证或语言质量合格。页面展示练习原始分与得分率，不将其当作官方 TOEFL 分数。API 中保留的 `band6`/`legacy_score` 等兼容字段只是线性练习估算，不用于成绩预测。内容修订和后续出题规则见[质量修订记录](docs/question-bank/quality-revision-2026-09-27.md)与[英文指南](docs/question-bank/generation-guidelines.md)。
