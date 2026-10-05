# 接口说明

[项目总览](../../README.md) · [当前架构](architecture.md) · [开发与验证](development.md)

服务地址为 `http://127.0.0.1:38761`，以下主要接口均以 `/api/v1` 为前缀。完整字段、类型和约束以运行中的 [Swagger 文档](http://127.0.0.1:38761/docs)及请求模型为准。

## 练习

| 方法与路径 | 用途 |
| --- | --- |
| `GET /api/v1/health` | 服务健康状态 |
| `GET /api/v1/meta` | 科目、题量、题型配置、时间依据与难度分布 |
| `GET /api/v1/exam` | 读取专项随机题组、固定整科题组或题库 |
| `POST /api/v1/exam/submit` | 校验并评分，保存答题记录，返回本轮答案与解析 |

取题参数：

| 参数 | 规则 |
| --- | --- |
| `section` | `reading`、`listening`、`writing`、`speaking` 或 `all`；专项必须指定一个科目 |
| `mode` | `practice` 专项、`exam` 固定题组、`bank` 题库；默认 `exam` |
| `task_type` | 题型标识；可用值见 `/api/v1/meta`，专项必填 |
| `count` | 专项的抽取数量；使用该题型 `practice_tasks.count_options` 中的值，不等于小题数 |
| `timer_mode` | 专项可选 `countup` 或 `countdown`，以题型支持范围为准；口语仅倒计时 |
| `repeat_decay` | 专项避重强度，默认 `1`，范围 `0..3`，`0` 关闭降权；页面不提供此设置 |

例如：

```http
GET /api/v1/exam?section=reading&mode=exam
GET /api/v1/exam?section=reading&mode=practice&task_type=complete_words&count=2&timer_mode=countup
GET /api/v1/exam?section=writing&mode=bank&task_type=write_email
```

第二个请求抽取两篇完整填词材料、共 20 个小题，返回本轮 `question_ids` 和 `estimated_time_seconds=240`。专项时间按实际材料计算，正计时和倒计时共用同一预算。

材料提交 `n` 次后的相对抽取权重为 `1 / (1 + n) ** repeat_decay`；完整材料、同轮不重复及难度约束仍优先，权重不是固定中选概率。完整规则见[产品约定](../../PRODUCT.md#capabilities-and-constraints)。

提交主体包含 `section`、`mode`、`task_type` 和 `responses`；每条回答包含 `question_id`、`answer` 及可选的 `duration_seconds`。专项还必须提交 `count` 和取题返回的完整 `question_ids`，服务端按该题组核对，可自动判分的题目漏答计零。

邮件、讨论和访谈的反馈为 `manual_review: true`、`correct: null`、`earned: 0`、`possible: 0`；两个零表示不参与计分，而非判为零分。这些题保留在 `answered` / `total` 中，文字反馈仅提供字数与重复措辞提示，不使用范文关键词判定质量。只有开放题的科目 `percentage` 为 `null`；混合科目的百分比只统计可自动核对部分。含人工复核题的科目不返回数字 `band6` / `legacy_score`，该次提交的 `overall_band6` / `legacy_total` 也为 `null`。复述仍按转写文字比对。

原创题号为 `R`、`L`、`S` 或 `W` 加 2–4 位数字（例如 `R01`、`R1000`）；通过格式校验后仍须属于当前题库与所提交题组。`responses` 和 `question_ids` 各最多 5,745 项，专项另按完整材料和可选题量校验。

客户端应生成并复用 `submission_id`（UUID）：相同 ID 和内容的重试返回已归档结果，不重复归档或用新版评分替换旧结果；同一 ID 改交其他内容返回 `409`。历史摘要的 `manual_review_count` 表示待人工复核题数，旧记录按原始反馈统计，不追溯改分。提交模型见 [models.py](../../backend/models.py)，题型校验及评分见 [exam_service.py](../../backend/exam_service.py)。

## 模考与综合测验

| 方法与路径 | 用途 |
| --- | --- |
| `GET /api/v1/resources` | 练习科目、ETS 模考与综合测验资源目录 |
| `POST /api/v1/mock/sessions` | 以 `{"paper_id":"ets-test-1"}` 创建模考，可选 `ets-test-1` 至 `ets-test-5` |
| `GET /api/v1/mock/sessions/{session_id}` | 恢复模考进度 |
| `POST /api/v1/mock/sessions/{session_id}` | 提交模考阶段事件 |
| `GET /api/v1/mock/sessions/{session_id}/result` | 读取已完成模考的复盘结果 |
| `GET /api/v1/tests/catalog` | 综合测验的五套方案与起始档位 |
| `POST /api/v1/tests/sessions` | 以 `{"level":5}` 创建综合测验，档位范围 `1..10` |
| `GET /api/v1/tests/sessions/{session_id}` | 恢复综合测验进度 |
| `POST /api/v1/tests/sessions/{session_id}` | 提交综合测验阶段事件 |

`GET /api/v1/resources` 的 `mock` 数组仅列出本地题目及对应答案键均已导入的卷；没有材料时返回空数组，其他分类正常返回。创建或读取尚未导入的卷返回 `404`，不会创建空会话。可选学习解析或造句补充答案缺失时，完成结果仍可读取，并在 `notice` 中说明评分与解析限制；已有补充文件不会被重建或覆盖。

两类事件均携带 `phase_index` 和 `action`，具体字段由各模块的 `EventRequest` 定义：

- [模考](../../backend/mock_exam.py)：`begin`、`save`、`respond`、`next`、`advance`、`navigate`、`abandon`，由当前阶段决定允许的操作；听力和口语逐题向前。
- [综合测验](../../backend/adaptive_test.py)：`begin`、`save`、`submit`；阶段内保存当前题号、答案与造句词块顺序，提交后锁定该阶段。

说明页不计时，开始后由服务端维护截止时间。未完成时只返回当前可作答题面，不返回私有答案。综合测验结束后写入 `test` 分类历史；其组卷与路由规则见[测验规格](../../specs/adaptive-tests.md)。

文字答案在截止后有固定 **5 秒最终快照传输窗口**（不含结束时刻）：综合测验仅接受当前阶段的 `submit`，模考阅读／写作仅接受 `advance`，听力仅接受当前题的 `next`。普通 `save` 等编辑事件到时即返回 `409`。前端在原截止时间冻结作答并携带最终答案提交；服务端读取在窗口内暂不推进，最终提交或窗口结束后才结算。窗口外不再接受修改，返回 `409`；综合测验已保存的相同提交可幂等重试，不同内容会明确拒绝。此规则不依赖客户端提供的时间戳，也不改变阶段截止时间或开放下一阶段答题。模考口语沿用原有到期推进及 10 秒录音上传窗口。

## 历史与录音

| 方法与路径 | 用途 |
| --- | --- |
| `GET /api/v1/history` | 按分类、日期和页码查询 |
| `GET /api/v1/history/{category}/{record_id}` | 读取原题、答案、反馈与录音入口 |
| `POST /api/v1/history/reset` | 确认后重置抽题权重或清空已归档记录 |

`category` 为 `practice`、`mock` 或 `test`，默认 `practice`。分页参数 `page` 从 1 开始，`page_size` 默认 10、最大 50；`start_at` 为包含的起点，`end_at` 为不包含的终点，均须携带时区。

重置请求必须使用以下主体之一：

```json
{"scope":"probability","confirm":true}
```

```json
{"scope":"all","confirm":true}
```

`probability` 保留历史与录音，排除既有提交的降权影响；`all` 永久删除所有分类的已归档记录与录音，不受列表筛选条件限制。具体范围见[存储与归档](architecture.md#存储与归档)。

录音以音频字节作为请求体，以下路径均支持 `PUT` 保存和 `GET` 回放：

- `/api/v1/history/{category}/{record_id}/recordings/{question_id}`：`category` 仅限 `practice`、`test`。
- `/api/v1/mock/sessions/{session_id}/recordings/{question_id}`：模考录音。
- `/api/v1/tests/sessions/{session_id}/recordings/{question_id}`：综合测验录音。

支持 `audio/webm`、`audio/ogg`、`audio/mp4`，单条录音不超过 5 MB，必须属于对应会话的口语题。上传失败应保留页面中的录音并重试。

## 语音合成

`POST /api/v1/tts` 接收 `text` 和可选 `voice`。文本去除多余空白后须非空，输入最多 5,000 字符；默认音色是 `en-US-AriaNeural`，允许值见 [TTSRequest](../../backend/models.py)。不支持的音色归一为默认音色。

成功返回 `audio/mpeg` 字节，带 `Cache-Control: no-store`；失败或超过 20 秒返回 JSON `{"url":null,"text":"…","fallback":true}`，由前端尝试浏览器语音。客户端断开会取消合成。音频不持久保存为 URL，缓存与回退规则见[音频与录音](architecture.md#音频与录音)。

## 错误处理

参数、题型或题组无效通常返回 `422`；资源不存在返回 `404`；阶段冲突或提交 ID 冲突返回 `409`；录音过大或格式不支持分别返回 `413`、`415`。客户端应展示响应中的 `detail` 并保留可重试的答案或录音。归档读取与内容损坏的诊断及恢复方法见[历史管理规范](../../specs/history-management.md#archive-diagnostics-and-recovery)。
