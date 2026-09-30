# 阅读与听力翻倍源稿

本目录保存 2026-09-30 新增的 1,500 道原创计分小题。相对于前一版，阅读和听力的每个题型分别翻倍；扩充时保留旧题、旧题号和旧审阅指纹。随后进行的 [9 月 30 日逐题修订](../../../docs/question-bank/receptive-repair-2026-09-30.md)仍保留题号，已复核的内容和对应审阅指纹按需更新；写作、口语及 ETS 模考不在本轮扩充和修订范围内。

| 源文件 | 新题号 | 新增完整材料 | 新增小题 |
| --- | --- | ---: | ---: |
| `complete_words.json` | R796–R1245 | 45 篇 × 10 空 | 450 |
| `read_daily_life.json` | R1246–R1440 | 90 篇，每篇 2 或 3 题 | 195 |
| `read_academic_passage.json` | R1441–R1590 | 30 篇 × 5 题 | 150 |
| `listen_choose_response.json` | L706–L960 | 255 个独立应答情境 | 255 |
| `listen_conversation.json` | L961–L1110 | 75 段 × 2 题 | 150 |
| `listen_announcement.json` | L1111–L1230 | 60 段 × 2 题 | 120 |
| `listen_academic_talk.json` | L1231–L1410 | 45 段 × 4 题 | 180 |

JSON 的顶层字段为 `section`、`task_type`、`items`。每题含公开 `question`、私有 `answer` 和逐题 `review`。解析采用 `读懂：`、`解析：`、`下次：` 三行；英文引文须来自实际材料、题干或选项。材料组与全部问题须一起核对，难度为本地判断，不是 ETS 或 CEFR 标定。

这里的 JSON 是权威源稿。修改后先审阅材料、答案、干扰项及解释，再将对应 `review` 与重新计算的 `content_sha256` 写入 `../review_notes.json`；只登记已审阅题，不刷新其他指纹。运行原入口 `./.venv/Scripts/python.exe scripts/build_question_bank.py` 生成公共题面、私有答案、manifest 和清单，不直接修改生成产物。此目录不能作为静态资源公开。

完整的[题库维护流程](../../README.md)、[出题指南](../../../docs/question-bank/generation-guidelines.md)和[本轮数量及验证报告](../../../docs/question-bank/receptive-expansion-2026-09-30.md)继续适用。临时编写工具不是运行依赖，分发与重建只需要这些源稿及现有生成器。

## 本轮替换的六篇学术阅读参考来源

以下来源用于核对科学机制和历史事实。文章、问题及三行中文解析均为本地原创，不是 ETS 原题或官方解析；题号保持不变。

- **R1441–R1445，细胞膜与选择性通透：** [NIH / NIGMS：The Marvels of Membranes](https://nigms.nih.gov/biobeat/2021/12/science-snippet-the-marvels-of-membranes)、[OpenStax Biology 2e：Passive Transport](https://openstax.org/books/biology-2e/pages/5-2-passive-transport)。
- **R1481–R1485，突变、自然选择与遗传漂变：** [NHGRI：Genetic Drift](https://www.genome.gov/genetics-glossary/Genetic-Drift)、[NHGRI：Mutation](https://www.genome.gov/genetics-glossary/Mutation)、[OpenStax Biology 2e：Population Evolution](https://openstax.org/books/biology-2e/pages/19-1-population-evolution)。
- **R1491–R1495，大陆漂移与板块构造：** [USGS：Historical Perspective](https://pubs.usgs.gov/gip/dynamic/historical.html)、[USGS：Developing the Theory](https://pubs.usgs.gov/gip/dynamic/developing.html)、[USGS：Plate Tectonics](https://www.usgs.gov/educational-resources/plate-tectonics)。
- **R1496–R1500，断层锁定与弹性回跳：** [USGS：What is an earthquake and what causes them to happen?](https://www.usgs.gov/faqs/what-earthquake-and-what-causes-them-happen)、[USGS：Reid's Elastic Rebound Theory](https://earthquake.usgs.gov/earthquakes/events/1906calif/18april/reid.php)、[USGS：Why do earthquakes occur?](https://earthquake.usgs.gov/research/eqproc/rockphysics/why.php)。
- **R1511–R1515，线圈与电磁铁：** [OpenStax College Physics 2e：Ferromagnets and Electromagnets](https://openstax.org/books/college-physics-2e/pages/22-2-ferromagnets-and-electromagnets)、[OpenStax University Physics Volume 2：Solenoids and Toroids](https://openstax.org/books/university-physics-volume-2/pages/12-6-solenoids-and-toroids)。
- **R1566–R1570，铁路与标准时间：** [NIST：World Time Scales](https://www.nist.gov/pml/time-and-frequency-division/popular-links/walk-through-time/walk-through-time-world-time-scales)、[Library of Congress：The Day of Two Noons](https://guides.loc.gov/this-month-in-business-history/november/day-of-two-noons)、[Smithsonian：Time Zones](https://americanhistory.si.edu/ontime/synchronizing/zones.html)。

## 本轮替换的两篇学术听力参考来源

- **L1331–L1334，洋脊、岩石年龄与扩张：** [NOAA Ocean Exploration：What is a mid-ocean ridge?](https://oceanexplorer.noaa.gov/ocean-fact/mid-ocean-ridge/)。问题区分同一时期的平均速度与此刻速度。
- **L1395–L1398，线圈、磁场变化与发电机：** [OpenStax College Physics 2e：Induced Emf and Magnetic Flux](https://openstax.org/books/college-physics-2e/pages/23-1-induced-emf-and-magnetic-flux)。闭合电路、磁铁静止与运动的对比及机械能输入均在讲座内说明。

两组沿用题号及每组四题，脚本和题目为本地原创；另一个批次的渗透讲座见[旧扩充源稿说明](../expansion_2026_09/README.md)。
