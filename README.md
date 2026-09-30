<div align="center">

<img src="docs/assets/readme-mark.svg" width="64" height="64" alt="">

<h1>TOEFL Prep Studio</h1>

<p><strong>TOEFL iBT 2026 · 本地练习、模考与复盘</strong></p>
<p>英文题目，中文解析。把四科练习和每一轮的复盘，放在自己的电脑上。</p>

<p>
  <a href="docs/technical/development.md"><img src="https://img.shields.io/badge/Python-3.10%2B-28675D?style=flat-square&amp;labelColor=303B37" alt="Python 3.10+"></a>
  <img src="https://img.shields.io/badge/Windows-Desktop-28675D?style=flat-square&amp;labelColor=303B37" alt="Windows 桌面浏览器">
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/License-Noncommercial-28675D?style=flat-square&amp;labelColor=303B37" alt="源码可见 · 非商业许可"></a>
</p>

<p><strong>简体中文</strong> · <a href="README.en.md">English</a></p>

<p>
  <a href="#快速开始">快速开始</a> ·
  <a href="#练习与复盘">练习与复盘</a> ·
  <a href="#题库覆盖">题库覆盖</a> ·
  <a href="#题型预览">题型预览</a> ·
  <a href="#使用须知">使用须知</a> ·
  <a href="#文档导航">文档导航</a> ·
  <a href="https://github.com/AuroraWhisperer/toefl-prep-studio/releases">版本管理（v1.1.0）</a>
</p>

</div>

**v1.1.0 更新：** 阅读与听力各题型题量翻倍，原创题库增至 3,615 题；修订题目与解析，开放写作及访谈改为待人工复核，并改善复盘文字排版。详见[更新说明](docs/releases/v1.1.0.md)。

## 快速开始

准备好 **Windows、Python 3.10+ 和桌面浏览器**。下载源码并解压后，双击根目录的 **[TOEFL Prep Studio.cmd](<TOEFL Prep Studio.cmd>)**。

首次启动会创建 Python 环境、安装依赖，服务就绪后自动打开 [本地工作台](http://127.0.0.1:38761/)。如果服务已经在运行，启动器会直接打开页面。日常使用无需 Node.js，也不用构建前端。

<details>
<summary><strong>习惯用命令行？在 PowerShell 中启动</strong></summary>

在项目根目录执行：

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe scripts/launch.py
```

以后只需运行最后一行。环境配置和启动排查见[开发指南](docs/technical/development.md)。

</details>

> **第一次使用：** 先选一科，开始专项练习或整科练习。仓库自带原创题库，综合测验也可直接使用；ETS 模考需要另行[导入有权使用的试卷](question_bank/README.md#模考导入与隔离)，公开源码不包含官方材料。

练习时请保留服务窗口，可以最小化；关闭它会停止服务，只关闭网页不会。首次安装需要联网，录音时需要允许浏览器使用麦克风。

## 练习与复盘

想补某一类题，就做专项；想练时间分配，就做整科。需要连贯完成四科时，可以选择模考或综合测验。

<table>
  <thead>
    <tr>
      <th width="180" align="center" valign="middle">模式</th>
      <th width="260" align="center" valign="middle">适合什么时候用</th>
      <th width="560" align="center" valign="middle">怎么练</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center" valign="middle"><strong>专项练习</strong></td>
      <td align="center" valign="middle">集中练一种题型</td>
      <td align="center" valign="middle">自选题量和计时方式，随机抽取完整文章、对话或访谈材料。</td>
    </tr>
    <tr>
      <td align="center" valign="middle"><strong>整科练习</strong></td>
      <td align="center" valign="middle">熟悉单科节奏</td>
      <td align="center" valign="middle">按科目限时完成固定题组，交卷后一起复盘。</td>
    </tr>
    <tr>
      <td align="center" valign="middle"><strong>模拟考</strong></td>
      <td align="center" valign="middle">按公开试卷走完整流程</td>
      <td align="center" valign="middle">本地导入 ETS Practice Test 1–5 后使用，每套 97 题。</td>
    </tr>
    <tr>
      <td align="center" valign="middle"><strong>综合测验</strong></td>
      <td align="center" valign="middle">按难度练习四科</td>
      <td align="center" valign="middle">从原创题库组成 120 题；可选五套方案、1–10 档起始难度，阅读和听力在模块间调整选材。</td>
    </tr>
  </tbody>
</table>

做完题，可以对着原材料看自己的作答、参考答案和解析。解析按 **「读懂 → 解析 → 下次」** 展开：先看懂关键线索，再弄清答案依据，最后留下一条下次能用的方法。

答卷、用时、反馈和已上传的录音会保存在本机。回到历史记录，按类别或日期找到上一轮练习，就能继续看解析、回听录音；模考和综合测验也能恢复已保存的进度。

<details>
<summary><strong>抽题、计时和听说练习的细节</strong></summary>

- **抽题：** 专项练习保留完整材料，同一轮不重复；已经提交过的材料，之后被抽中的概率会降低。
- **计时：** 阅读、听力和写作专项支持正计时与倒计时，口语使用倒计时。
- **作答：** 阅读补词直接填在原文里；造句可以点击、拖动和撤回词块。
- **听说：** 合成提示音支持多种英语口音和对话角色配音；口语支持麦克风录音、回放与文字转写。

</details>

## 题库覆盖

原创练习库有 **3,615 道练习小题，覆盖 12 种题型**。阅读和听力的各题型均在上一版基础上翻倍；随后对全部 3,000 道阅读、听力题逐题复核，修订题材、答案、干扰项和解析，按实际作答要求分级，不强制各档占比。见[扩充明细](docs/question-bank/receptive-expansion-2026-09-30.md)和[逐题修订报告](docs/question-bank/receptive-repair-2026-09-30.md)。下面的「整科题数」指一次固定整科练习的题量。

| 科目 | 原创题数 | 整科题数 | 题型 |
| :--- | ---: | ---: | :--- |
| **阅读** | **1,590** | 50 | 补词 · 日常生活阅读 · 学术文章 |
| **听力** | **1,410** | 47 | 应答 · 对话 · 公告 · 学术讲座 |
| **写作** | **450** | 12 | 造句 · 邮件 · 学术讨论 |
| **口语** | **165** | 11 | 听后复述 · 模拟访谈 |

ETS 模考试卷独立存放，不参与原创练习抽题。题面与答案键分开保存，评分在服务端完成。来源、审阅和生成流程见[题库维护文档](question_bank/README.md)。

## 题型预览

以下是原创练习题的实际界面，按科目展开查看，点击图片可放大。截图只保留题目、必要材料和作答控件；口语图展开了练习脚本，便于预览题目内容。

<details open>
<summary><strong>阅读 · 3 种题型</strong></summary>

<p align="center"><strong>补词 · Complete the Words</strong></p>
<p align="center">
  <a href="docs/assets/questions/reading-complete-words.png"><img src="docs/assets/questions/reading-complete-words.png" width="760" alt="补词题：在英文段落中补全十处单词的缺失字母"></a>
</p>

<p align="center"><strong>日常生活阅读 · Read in Daily Life</strong></p>
<p align="center">
  <a href="docs/assets/questions/reading-daily-life.png"><img src="docs/assets/questions/reading-daily-life.png" width="760" alt="日常生活阅读：午餐菜单、套餐规则及一道四选一问题"></a>
</p>

<p align="center"><strong>学术文章 · Read an Academic Passage</strong></p>
<p align="center">
  <a href="docs/assets/questions/reading-academic-passage.png"><img src="docs/assets/questions/reading-academic-passage.png" width="760" alt="学术阅读：声音地图文章与文章主旨题的四个选项"></a>
</p>

</details>

<details>
<summary><strong>听力 · 4 种题型</strong></summary>

<p align="center"><strong>应答 · Choose a Response</strong></p>
<p align="center">
  <a href="docs/assets/questions/listening-choose-response.png"><img src="docs/assets/questions/listening-choose-response.png" width="680" alt="听力应答题：选择最合适回应的题干与四个选项"></a>
</p>

<p align="center"><strong>对话 · Conversation</strong></p>
<p align="center">
  <a href="docs/assets/questions/listening-conversation.png"><img src="docs/assets/questions/listening-conversation.png" width="680" alt="听力对话题：判断谈话双方正在处理的问题"></a>
</p>

<p align="center"><strong>公告 · Announcement</strong></p>
<p align="center">
  <a href="docs/assets/questions/listening-announcement.png"><img src="docs/assets/questions/listening-announcement.png" width="680" alt="听力公告题：从四个时间选项中选择市场的开放时间"></a>
</p>

<p align="center"><strong>学术讲座 · Academic Talk</strong></p>
<p align="center">
  <a href="docs/assets/questions/listening-academic-talk.png"><img src="docs/assets/questions/listening-academic-talk.png" width="680" alt="听力学术讲座题：关于纸张保存的主旨题与四个选项"></a>
</p>

</details>

<details>
<summary><strong>写作 · 3 种题型</strong></summary>

<p align="center"><strong>造句 · Build a Sentence</strong></p>
<p align="center">
  <a href="docs/assets/questions/writing-build-sentence.png"><img src="docs/assets/questions/writing-build-sentence.png" width="680" alt="造句题：情境问题、可选词块与带固定文字的句子空位"></a>
</p>

<p align="center"><strong>邮件 · Write an Email</strong></p>
<p align="center">
  <a href="docs/assets/questions/writing-email.png"><img src="docs/assets/questions/writing-email.png" width="640" alt="邮件写作题：向应用开发者报告反馈不一致的问题，包含三项写作要求、收件人与主题"></a>
</p>

<p align="center"><strong>学术讨论 · Write for an Academic Discussion</strong></p>
<p align="center">
  <a href="docs/assets/questions/writing-academic-discussion.png"><img src="docs/assets/questions/writing-academic-discussion.png" width="760" alt="学术讨论写作题：教授提出项目评分问题，并给出两位学生的不同观点"></a>
</p>

</details>

<details>
<summary><strong>口语 · 2 种题型</strong></summary>

<p align="center"><strong>听后复述 · Listen and Repeat</strong></p>
<p align="center">
  <a href="docs/assets/questions/speaking-listen-repeat.png"><img src="docs/assets/questions/speaking-listen-repeat.png" width="680" alt="听后复述题：服装间位置的练习脚本、播放提示音与录音按钮"></a>
</p>

<p align="center"><strong>模拟访谈 · Take an Interview</strong></p>
<p align="center">
  <a href="docs/assets/questions/speaking-interview.png"><img src="docs/assets/questions/speaking-interview.png" width="680" alt="模拟访谈题：关于学习工具的访谈问题、播放提示音与录音按钮"></a>
</p>

</details>

## 使用须知

界面以中文为主，面向 **2560×1440 桌面屏幕及 125%／150% Windows 显示缩放**，建议最大化浏览器窗口。

<details>
<summary><strong>离开页面或刷新后，进度还在吗？</strong></summary>

普通练习在提交成功后归档。同一标签页内使用浏览器返回、前进，可以保留当前轮次；**刷新会丢失未提交内容**，并回到设置或首页。

模考和综合测验可以恢复已保存进度，但已经开始的计时不会因离开或刷新而暂停、重置。答案与复盘只在整卷结束后开放。

各页面有独立路径，例如 `/practice/reading`、`/history`、`/tests`。已归档复盘和已保存的考试会话可以直接打开；路径与恢复边界见[导航说明](docs/technical/architecture.md#页面路径与浏览器导航)。

</details>

<details>
<summary><strong>记录和录音存在哪里？</strong></summary>

默认保存在本机 `artifacts/` 下，也可以在启动前通过 `TOEFL_DATA_DIR` 指定位置。数据目录与恢复方式见[存储说明](docs/technical/architecture.md#存储与归档)。

如果录音上传失败，请在离开页面前重试保存。

</details>

<details>
<summary><strong>听力和口语需要联网吗？</strong></summary>

提示音优先通过联网语音服务生成，失败时尝试匹配的浏览器音色；模考音频由试卷脚本合成，因此本地运行不等于完全离线。

语音识别取决于浏览器支持。转写有误时可以手动修改，也可以直接输入文字。

</details>

<details>
<summary><strong>这里的分数该怎么看？</strong></summary>

普通练习只汇总可自动核对题目的原始分；邮件、讨论与访谈标记为“待人工复核”，保留字数和重复措辞提示，不按范文关键词给分。复述仍仅比对转写文字。模考和综合测验只汇总客观题正确数，开放写作和口语需要人工复核。旧记录保留提交当时的分数与反馈。

这些结果用于日常练习，**不能预测官方成绩，也不评估发音、语调或流利度**。难度分级、模块路由及部分限时是本地训练设置；模考学习解析由本项目编写，并非 ETS 官方解析。

</details>

## 文档导航

需要了解某个功能或准备改代码时，从对应文档继续：

<table>
  <thead>
    <tr>
      <th width="300" align="left">文档</th>
      <th width="700" align="left">可以查到什么</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><a href="docs/technical/development.md"><strong>开发指南</strong></a></td><td>环境配置、启动排查、测试与格式化</td></tr>
    <tr><td><a href="PRODUCT.md"><strong>产品规范</strong></a></td><td>功能行为、练习规则与能力边界</td></tr>
    <tr><td><a href="DESIGN.md"><strong>设计规范</strong></a></td><td>视觉语言、页面布局与键鼠交互</td></tr>
    <tr><td><a href="docs/technical/architecture.md"><strong>系统架构</strong></a></td><td>技术栈、模块职责、数据流与存储</td></tr>
    <tr><td><a href="docs/technical/api.md"><strong>API 参考</strong></a></td><td>练习、考试、历史记录与语音接口</td></tr>
    <tr><td><a href="question_bank/README.md"><strong>题库维护</strong></a></td><td>内容来源、审阅、生成与模考导入</td></tr>
    <tr><td><a href="AGENTS.md"><strong>开发约定</strong></a></td><td>改动范围、数据保护与验证要求</td></tr>
  </tbody>
</table>

## 重要说明

### 非商业使用，商用须另行取得书面授权

原创代码和内容采用[非商业许可](LICENSE.md)：**源码可见，不是标准开源许可**。

- **可以做什么：** 按许可条款用于非商业学习、研究、修改和分享。
- **哪些需要授权：** 售卖、收费部署、商业培训、企业业务使用及广告获利等商业用途。
- **分享时须保留：** 许可与版权说明，标注修改，并提供对应源码。

ETS 材料、字体、第三方依赖及个人数据**不在此许可授权范围内**。完整条款见 [LICENSE.md](LICENSE.md)；第三方权利见[第三方说明](THIRD_PARTY_NOTICES.md)，分发边界及已发布 Git 历史的处理要求见[分发说明](docs/distribution.md)。
