# artifacts 目录说明

[开发与验证](development.md) · [存储与归档](architecture.md#存储与归档)

`artifacts/` 保存个人运行数据、原始参考 PDF 和当前开发输出；已停用的开发产物集中到 `tmp/`。两个目录均由 Git 忽略，本机 README 提供导航。

## 目录约定

```text
artifacts/
├─ README.md                     本机总索引
├─ practice-history/             个人练习与综合测验归档、录音
├─ mock-sessions/                个人模考进度、归档及录音
├─ test-sessions/                综合测验进度，使用时自动创建
├─ ets-reference/                七份原始 PDF 与资料索引
└─ qa/                          当前验证输出，任务开始时按需创建
   ├─ browser-data/<UUID>/       正在使用的隔离测试数据
   ├─ browser-tests/             最近一轮浏览器测试输出
   └─ <用途>-YYYY-MM-DD/         进行中的人工验证资料

tmp/
├─ README.md                     临时与待清理文件索引
└─ cleanup-2026-09-29/
   ├─ README.md                  本次移入内容及原位置
   ├─ artifacts/qa/             已完成任务的报告、截图、日志和隔离测试数据
   ├─ artifacts/backups/        旧源码快照
   ├─ docs/superpowers/plans/   已完成的导航与学习流程实施计划
   ├─ .pytest_cache/           pytest 缓存
   ├─ .ruff_cache/             Ruff 缓存
   └─ <原源码目录>/__pycache__/ Python 字节码缓存，保留原目录层级
```

前三个运行目录及 `TOEFL_DATA_DIR` 的含义保持不变。个人记录和录音由应用管理，不按日期或文件大小当作开发垃圾清理。`ets-reference/test-1.pdf` 至 `test-5.pdf` 仍是[模考导入器](../../question_bank/README.md#模考导入与隔离)的输入；当前题库和原卷题面图片仍在 `question_bank/`。

## 命名与使用

- 手工创建的任务目录使用 `<用途>-YYYY-MM-DD`；修复阶段使用 `before-fix/`、`after-fix/` 等明确名称。文件名不重复上层已说明的任务与日期。
- 保留会话 UUID、题号、Playwright 自动生成的测试目录、导入器要求的 PDF 名称，以及旧快照中的源码文件名。
- 浏览器测试继续使用 `artifacts/qa/browser-data/<UUID>/` 和 `artifacts/qa/browser-tests/`；测试自身只清理本轮数据，下次测试会替换输出。目录不存在时由测试创建。
- 已结束且不再需要的开发产物移入 `tmp/`，同时更新所在目录的 README、文档链接及当前路径索引。进行中的任务保留原位；不主动新建源码备份。
- `tmp/` 中的旧脚本与源码副本不作为当前生成或测试入口。移动只整理位置，不释放磁盘空间。

## 本次迁移与索引

2026-09-29 确认相关验证任务结束、没有相关测试进程后，将现有 `artifacts/qa/`、`artifacts/backups/`、两份已完成实施计划及项目源码缓存移入 `tmp/cleanup-2026-09-29/`，共 981 个文件，约 78.4 MiB。按原相对路径保存，移动后、更新导航前逐文件 SHA-256 核对一致。

本机迁移清单、文件校验及报告入口见 [tmp 索引](../../tmp/README.md)。归档中的脚本、命令、端口及源码行号记录执行时的环境，不作为当前生成或测试入口；日志、数据、源码副本保持原内容，导航链接按新位置更新。

个人历史、录音、题库、ETS 原始 PDF、依赖环境，以及仍被规范引用的架构决策和题库维护记录保留原位。pytest、Ruff 和 Python 缓存可能随以后运行重新生成；浏览器测试仍使用上述约定路径。

2026-09-28 的旧迁移目录在本次整理前已不在工作区；旧报告中的历史路径不表示这些文件仍存在。当前索引只链接本次实际保留的文件。这些本机归档不随 Git 分发。
