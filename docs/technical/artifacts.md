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
├─ backups/                     其他进行中任务新建的源码副本
└─ qa/                          当前验证输出
   ├─ browser-data/<UUID>/       正在使用的隔离测试数据
   ├─ browser-tests/             最近一轮浏览器测试输出
   └─ <用途>-YYYY-MM-DD/         进行中的人工验证资料

tmp/
├─ README.md                     临时与待清理文件索引
└─ artifacts-2026-09-28/
   ├─ README.md                  本次移入内容及原位置
   ├─ qa/                       已完成任务的截图、日志和旧测试数据
   ├─ backups/                  旧源码快照
   ├─ release-verification/     已完成的发布验证副本及恢复材料
   └─ ets-derived/              PDF 提取文本、截图和网页副本
```

前三个运行目录及 `TOEFL_DATA_DIR` 的含义保持不变。个人记录和录音由应用管理，不按日期或文件大小当作开发垃圾清理。`ets-reference/test-1.pdf` 至 `test-5.pdf` 仍是[模考导入器](../../question_bank/README.md#模考导入与隔离)的输入；当前题库和原卷题面图片仍在 `question_bank/`。

## 命名与使用

- 手工创建的任务目录使用 `<用途>-YYYY-MM-DD`；修复阶段使用 `before-fix/`、`after-fix/` 等明确名称。文件名不重复上层已说明的任务与日期。
- 保留会话 UUID、题号、Playwright 自动生成的测试目录、导入器要求的 PDF 名称，以及旧快照中的源码文件名。
- 浏览器测试继续使用 `artifacts/qa/browser-data/<UUID>/` 和 `artifacts/qa/browser-tests/`；测试自身只清理本轮数据，下次测试会替换输出。目录不存在时由测试创建。
- 已结束且不再需要的开发产物移入 `tmp/`，同时更新所在目录的 README、文档链接及当前路径索引。进行中的任务保留原位；不主动新建源码备份。
- `tmp/` 中的旧脚本与源码副本不作为当前生成或测试入口。移动只整理位置，不释放磁盘空间。

## 本次迁移与索引

后续清理将 15 份已完成的实施计划、旧项目清理记录，以及 `.pytest_cache`、`.ruff_cache` 和项目源码目录中的 `__pycache__` 直接移入 `tmp/`，未另建分类目录。缓存可自动生成；`docs/superpowers/plans/2026-09-28-browser-history.md` 及 `artifacts/` 中仍在使用的导航、学习流程验证资料保留原位。

2026-09-28 移入 `tmp/artifacts-2026-09-28/` 的旧文件共 1,774 个，约 203 MiB；移动前后内容校验一致。进行中的学习流程检查、当前浏览器输出及其数据未迁移。迁移后其他任务新建的 `backups/browser-history-2026-09-28/` 也保留原位。具体内容与原位置见[本机迁移索引](../../tmp/artifacts-2026-09-28/README.md)。

发布验证副本已移入 `release-verification/`。`.public-checkout/.venv` 仍是指向主项目环境的目录联接；移动没有复制环境，后续清理不要沿联接进入主环境。发布候选信息随目录保留，Git 中的发布分支未变。

[名称变更对照](../../tmp/artifacts-2026-09-28/qa/artifacts-naming-2026-09-28/renamed-paths.md)和[文件路径索引](../../tmp/artifacts-2026-09-28/qa/artifacts-naming-2026-09-28/path-index.json)指向现位置；原始日志、迁移操作记录和校验报告保留执行时的信息。这些本机文件不随 Git 分发。
