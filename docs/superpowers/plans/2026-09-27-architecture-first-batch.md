# Architecture First Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按[架构审查](../../architecture-review-2026-09-27.md)实施阶段 0–1：建立可恢复基线，修正文档事实、导航和正文归属。

**Architecture:** 保留现有 FastAPI + 原生前端本地单体、目录、默认数据路径和测试配置。本批只改文档，不把有条件的代码重构合并进来。

**Tech Stack:** Markdown；Python 标准库用于本地备份、SHA-256 校验和链接检查。

**Status:** 2026-09-27，阶段 0–1 完成；后续条件性改动未纳入本批。

## Global Constraints

- 第一轮不调整目录结构，只纠正文档中的过时描述、明确正文归属并补齐导航链接。
- 保留 `specs/` 和 `docs/superpowers/plans/` 的现有位置。
- 保留测试布局、发现规则和清理配置。
- 历史计划中的旧平台描述不应覆盖现行桌面约定；保留历史语境，不改写旧执行结果。
- 不修改父级 Git 仓库，不启动、停止或重启用户服务，不迁移或清理原始历史与媒体。

## Task 1: 保护与恢复点

**Files:** 只读取项目现有文件；恢复点保存在项目外的 `C:/Users/Tom/Desktop/toefl_shadowing_trainer-backups/20260927-110918-stage0/`。

**Interfaces:** 输入为现有项目、默认 `artifacts/practice-history/`、`artifacts/mock-sessions/` 和旧 `audio/`；输出为 `project-snapshot.zip`、逐文件 `manifest.json` 和 `RESTORE.txt`。

- [x] 确认 `git rev-parse --show-toplevel` 返回 `C:/Users/Tom`，`git ls-files -- .` 为空；本项目没有可用的已跟踪代码恢复点，不执行 init、add、commit 或父仓库修改。
- [x] 使用白名单备份正式数据目录，排除测试产物、`.venv`、`node_modules`、Git 和缓存；覆盖代码、配置、文档和题库。
- [x] 对 202 个文件逐一核对归档内 SHA-256；向独立临时目录恢复 39 个历史及音频文件（34 个非 JSON 文件），重新读取并核对哈希，随后清理仅由本次创建的临时恢复目录。
- [x] 备份完成时再次核对所有源文件，确认没有变化。压缩包大小为 7,453,708 字节。

当前进程、用户和机器级 `TOEFL_DATA_DIR` 均未设置。此恢复点覆盖默认数据根；无法据此断言另一个正在运行的进程未单独指定外部数据根，也未验证真实音频播放质量。首次包含全部 artifacts 的备份因测试临时文件在校验期间消失而未通过；已仅删除本次生成的未验证压缩包及其空目录，不作为恢复点。

## Task 2: 文档事实与导航

**Files:** 修改 [README](../../../README.md)、[题库 README](../../../question_bank/README.md)、[PRODUCT](../../../PRODUCT.md) 和[审查状态](../../architecture-review-2026-09-27.md)；新增本实施记录。

**Interfaces:** 以 `backend/app.py` 的 `/frontend`、`/mock-pages` 挂载及 TTS 返回为事实来源；以 PRODUCT、DESIGN、专项规格和题库 README 为各自正文所有者。

- [x] 根 README 增加项目、产品、设计、专项规格、题库维护、架构审查与历史计划导航。
- [x] 两份 README 修正公开目录范围，明确 `/audio` 未挂载、提示音不持久写入，以及用户录音仍经专用接口保存和回放。
- [x] 根 README 将冗长卡片布局、答题页和复盘版式转为权威文档链接；PRODUCT 将过时的 mobile 表述改为桌面窄窗口回退，不修改实际界面。
- [x] 更新审查状态并链接本批执行记录；旧规格和历史计划保留原位置及历史正文。
- [x] 验证修改文档的本地链接和锚点、命令引用路径，并与恢复点比较完整文件清单与差异。

## 验证与回退

本批只改文档：核对相对链接、标题锚点、文档中的脚本路径及现有测试命令定义，不运行题库生成器、pytest 或浏览器套件，也不声称验证了应用行为、真实麦克风或在线语音质量。

- 本地链接检查通过：63 个本地链接、7 个 Markdown 标题锚点无缺失；外部来源未重新访问，不更新原审查访问日期。
- 两份 README 的 6 个 PowerShell 代码块所引用的 10 个文件均存在；另核对启动脚本、启动器、后端入口与 Playwright 配置路径，`package.json` 的 `test:browser` 仍为 `playwright test`。这里只核对命令定义与路径，不声称执行了这些命令。
- 对 `backend/app.py` 做 AST 检查，静态挂载确为 `/frontend` 与 `/mock-pages`；按实现核对 TTS 返回音频字节、首页返回入口及默认历史／模考数据位置。
- 已与恢复点逐文件比对并审阅文档差异；本批写入仅为四份旧文档与本实施记录。机器可读检查结果和统一差异保存在恢复点旁的 `documentation-verification.json`、`documentation-command-checks.json` 与 `documentation-changes.diff`。

源文件对比同时发现不属于本批的并行变更：`backend/history.py`、新增 `specs/history-management.md` 和新增正式练习归档；全部保留，不回写或清理。恢复点只代表创建时点，不能覆盖之后产生的数据或并行工作。

回退先将压缩包解压到新的空目录并按 manifest 核对，不覆盖运行中的项目或数据。只比较并恢复本批修改的四份旧文档；完全撤销时另移除本批新增的实施记录。保留并发的用户修改；无须恢复代码、题库、历史或录音。

## 后续边界

首批完成后，优先单独处理审查 H：仅用隔离临时归档复现损坏／不完整 JSON 对历史列表及抽题的影响，再制定可定位诊断与恢复策略。该故障注入和代码修复不属于本批。测试搬迁、前后端抽取和索引／数据库均仍需满足审查中的触发条件，不能以本批完成视为已获验证。
