# 托福语法与搭配学习页

从首页右上角「语法与搭配」进入 `/foundations`。入口与「2026 新托福指南」并列，保留原有七张练习卡片的位置和尺寸。

## 内容与使用

现有 **24 个主题、400 个知识点、453 组双语例句**。2026-10-08 根据使用者反馈，将原来的 112 条通用基础笔记重整为面向托福的语法与搭配库，移除词性介绍、基础陈述句、a/an、基础否定句等入门条目。内容着重覆盖补词、组句、阅读听力理解，以及邮件、学术讨论和访谈所需的常用表达。

| 分组 | 主题 | 知识点 |
| --- | --- | ---: |
| 托福语法 | 句子重组与长句骨架；名词性从句与间接问句；定语从句与压缩修饰；时态、被动与主谓一致；非谓语与动词结构；条件、假设与情态；比较、数量与限定范围；连接词与篇章逻辑 | 132 |
| 核心搭配 | 动词搭配：关系与论证；动词搭配：对象与动作；形容词的固定搭配；名词后的固定结构；研究、证据与方法；因果、影响与变化；观点、评价与论证；时间、期限与进度；易混词与固定句式 | 156 |
| 托福场景 | 课程、作业与学术事务；校园服务与活动安排；邮件请求与问题处理；听力对话与访谈表达；环境、生态与自然过程；科技、媒体与信息；教育、工作与社会 | 112 |

每条包括常用结构、「读懂」「解析」「下次」三段中文说明，以及自编英文例句和中文译文。说明强调语境、结构、容易混淆的含义和具体检查方法，保留合理的英美用法差异。重点例如间接问句中的语序、介词 to 后的 -ing、result from/in 的因果方向、account for 的解释／占比含义、部分否定与证据强度、延期请求及课程事务。

可按需要进入相应主题：组句优先查从句与非谓语；补词查词语后接结构；阅读听力查因果、限定范围与学术话题；口语写作查邮件、访谈和论证表达。内容按用途组织，不要求从头顺序读完。

搜索范围为当前分类的分组、主题名、适用场景说明，以及条目标题、结构、说明和例句；英文忽略大小写，多段关键词必须同时出现。可以输入中文（如「延期」「百分点」）、英文搭配（如 `account for`）或任务语境（如「听力回应」）。选择「全部内容」可查全库；无结果时可缩短关键词或「重置筛选」。

分类、搜索与展开状态在当前页面的前进、后退和返回首页后保留；刷新从全部内容重新开始。知识点使用原生折叠控件，支持 Tab、Enter 和 Space。增加到 24 个主题后沿用可滚动的分类侧栏，不改变首页或增加另一套导航。

## 选材依据与内容边界

2026-10-08 查阅以下公开资料。ETS 资料用于核对任务与语言使用情境，通用语法资料用于核对部分规则；**不能据此声称全部 400 条都在官方样题出现，或具有某个出题频次**。这里的托福适用性属于本地教学选材判断，不是 ETS 官方考点清单、统计排名或覆盖保证。

- [ETS 2026 Test Blueprint and Specifications](https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-test-specifications-2026.pdf)：补词结合词汇、语序与上下文；组句重建句子结构；其他任务覆盖日常、校园及学术沟通。写作和访谈强调准确表达、连贯性与恰当展开。
- [ETS Teacher Resources Practice Test 1](https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-1.pdf)：组句部分提供间接问句、疑问词加不定式和关系从句等实例；邮件、讲座及访谈提供推荐、解释、工作与生活等语言使用场景。这里只据此判断选材方向，不复制官方题目作学习例句。
- [British Council：Verbs and prepositions](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/verbs-prepositions)：动词与介词作为整体学习，以及常见后接关系。
- [British Council：Conditionals](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/conditionals-zero-first-second)：真实条件与非真实假设的基本形式和意义，初版已核对。

中文讲解和双语例句均为本地编写，外部机构没有审阅或认可整库。学术主题例句用来示范语言，不是专业知识结论的独立证据。页面不提供新题、评分、学习进度或记忆效果评估；正文随应用保存在本机，阅读不调用在线服务，外部参考链接需要联网。

## 实现与维护

- [foundations-data.js](../frontend/foundations-data.js) 是唯一维护的内容来源。主题含 `id`、`title`、`group`、`description`、`topics`；条目含 `id`、`title`、`pattern`、`read`、`explain`、`next`、`examples`。例句保存为 `[英文, 中文]`。保留仍适用的原有 ID，删除已移除入门条目，避免重复拼装同义笔记凑数。
- [foundations.js](../frontend/foundations.js) 使用文本节点渲染，在首次打开时初始化一次；从数据生成分组，控制当前分类与全文匹配，通过现有 `appViews` 导航，不创建练习请求或写入历史。
- [foundations.css](../frontend/foundations.css) 继续使用纸色、墨色、灰绿令牌，管理小入口、分类侧栏与折叠列表；本次扩充不改动样式和首页布局。
- [index.html](../frontend/index.html) 保存入口、页面说明与参考链接；[backend/app.py](../backend/app.py) 为 `/foundations` 返回现有前端入口。

此内容与题库、答案、审阅指纹独立。修订笔记不运行题库生成器，也不改历史解析。增加或移除笔记时核对唯一 ID、例句与所引线索、实际用法和中英含义；同步更新数量断言及本文。数量用于回归核对，不作为必须凑齐的分类配额。

后端新增路径需要服务重新启动才能直接访问。开发验证保留用户已运行的服务；若旧进程对 `/foundations` 返回 404，可先在首页刷新后点击「语法与搭配」加载最新前端内容，结束练习后再从托盘退出并用原启动器启动。纯前端修改遵循[开发指南](technical/development.md)的刷新规则。

## 验证

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_page_routes.py -q
$env:TOEFL_TEST_PORT = '38780'
npx playwright test tests/browser_foundations.test.cjs tests/browser_exam_guide.test.cjs tests/browser_landing.test.cjs tests/browser_view_navigation.test.cjs tests/browser_url_navigation.test.cjs --output artifacts/qa/foundations-expansion-2026-10-08/browser
node --check frontend/foundations.js
node --check frontend/foundations-data.js
```

端口占用时换用空闲 `TOEFL_TEST_PORT`，不停止用户服务。浏览器测试自动使用隔离的数据目录并清理自己启动的服务。

2026-10-08 扩充后的 50 项浏览器回归（含 9 项学习页测试）与 23 项路由测试通过。覆盖 400 条笔记及 453 组例句的结构完整性、唯一 ID／标题／结构、入门条目移除、全部分类、中英搜索与场景搜索、空结果恢复、键盘与历史导航、元数据失败时仍可读取，以及帮助入口不发起试题或写请求。

桌面检查在 2560×1440、2048×1040（125%）、1707×840（150%）和 1280×720 下比较七张首页卡片的几何位置，并检查阅读页溢出和窗口缩窄后的交互。缩放使用对应 CSS 视口与设备像素比，未更改 Windows 设置。自动化可以验证结构和交互，不能证明全部英语用法无遗漏或保证学习成效。截图与复核记录见[本机验证目录](../tmp/cleanup-2026-10-09/artifacts/qa/foundations-expansion-2026-10-08/README.md)。
