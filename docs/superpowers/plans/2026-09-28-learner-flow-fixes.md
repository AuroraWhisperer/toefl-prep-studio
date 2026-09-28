# Learner Flow Fixes Implementation Plan

**Goal:** 核实学习流程审查中的六项缺陷，以最小修改修复答案与录音丢失、计时和已答状态。

**Architecture:** 延用现有 FastAPI 会话、原生前端与录音组件。答案变化回调负责草稿；截止时冻结并提交最终快照，服务端为文字快照提供固定 5 秒传输窗口，窗口内不再接受普通编辑。录音等待本题识别结束，失败上传保留可重试内容。

**Tech Stack:** Python / FastAPI / pytest；原生 JavaScript / Playwright。

## Constraints

- 仅处理 REVIEW.md 的六项缺陷，不扩展到额外体验建议。
- 保留已有未提交修改、个人记录与运行服务；测试使用隔离目录和端口。
- 不更换栈、不重写题型、不改题库或评分规则。
- 口语普通练习仍按转写评分；综合测验录音可计为已答。

## Steps

- [x] 在现有 tests/test_adaptive_test.py、tests/test_mock_exam.py 中增加截止前后、传输窗口、重复提交及路由的回归；验证修改前失败，修改后通过。
- [x] 调整 backend/adaptive_test.py、backend/mock_exam.py 的截止与最终提交顺序，过期保存拒绝，最终快照仅在固定窗口内接收。保留模考口语既有录音上传窗口。
- [x] 调整 frontend/app.js、frontend/adaptive-test.js、frontend/mock-exam.js：每条真实作答路径保存草稿，冻结后提交，累计未取整时长，在 API 边界取整。
- [x] 调整 frontend/practice-recorder.js 与调用处：停止后等待最终转写及录音结束，离题时撤销旧转写，识别不回调时有有限等待。
- [x] 在已有浏览器测试中覆盖粘贴、退格、拖放后刷新，最后时刻修改，异步最终转写，失败录音在历史中重试与刷新保护，以及仅录音的综合测验进度。
- [x] 更新 PRODUCT.md、specs/adaptive-tests.md、docs/technical/api.md 的所属行为说明；运行相关回归、语法与桌面检查，复核局部差异。

## Verification

运行两个相关 pytest 文件，以及 browser_adaptive_test、browser_mock、browser_recorder、browser_history、browser_url_navigation 浏览器测试；使用 TOEFL_TEST_PORT=39803。对四个修改的 JavaScript 模块执行 node --check。

执行采用当前会话内逐项修复；用户已授权实施，不另加计划审批。
