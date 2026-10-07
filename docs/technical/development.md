# 开发与验证

[项目总览](../../README.md) · [当前架构](architecture.md) · [接口说明](api.md)

以下命令均在项目根目录的 PowerShell 中执行。

## 环境与启动

运行应用需要 Python 3.10 或更新版本。前端由 FastAPI 直接提供，无需 Node.js 或构建步骤；开发时运行浏览器测试和前端格式化需要 Node.js 20 或更新版本。

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe scripts/launch.py
```

启动器会检查健康接口和首页，再打开 [本地工作台](http://127.0.0.1:38761/)；已有应用服务就绪时直接复用。首次安装依赖需要联网。上面的命令行启动保留终端日志，适合开发和排错。

页面入口及 `/frontend/` 下的资源统一返回 `Cache-Control: no-store`，前端资源地址不加手动版本号；即使请求携带旧缓存校验信息，也返回当前文件。修改 HTML、CSS 或 JavaScript 后，普通刷新或重新打开页面即可加载新内容；已打开的页面不会在作答途中自动刷新。Python 后端和进程内缓存的题库更新仍需退出服务后重新启动。首次启用此缓存策略时也需重启服务，并在原页面强制刷新一次（`Ctrl + F5`）以清除旧策略留下的缓存。

日常双击根目录的 `TOEFL Prep Studio.cmd`：环境检查或首次安装结束后，脚本用 `pythonw.exe` 启动 `scripts/launch_tray.py` 并关闭终端。托盘显示绿色书本图标，点击打开页面，右键菜单提供「打开练习页面」「查看运行日志」「退出服务」。退出时最多等待 5 秒让当前服务请求完成，再移除图标；关闭网页不会停止服务。图标可能收在 Windows 右下角的「^」菜单中。

托盘启动器在创建界面前启用 Windows [Per Monitor v2 DPI 感知](https://learn.microsoft.com/en-us/windows/win32/hidpi/dpi-awareness-context)，让原生菜单按所在屏幕的缩放比例绘制，避免 125%／150% 缩放时被系统拉伸而发糊；旧版 Windows 回退到系统 DPI 感知。更新已运行的启动器后，结束练习并从托盘「退出服务」，再重新启动即可生效。

环境安装完成后，如需桌面快捷方式完全不闪现命令窗口，将快捷方式目标设为项目中 `.venv\Scripts\pythonw.exe` 的完整路径，参数为 `scripts\launch_tray.py` 的完整路径（路径含空格时分别加双引号），起始位置设为项目目录。直接使用快捷方式不会安装缺失的依赖，更新依赖后先运行一次 `.cmd`。

托盘启动器以本机会话和端口为单位限制单实例，重复启动只打开页面，启动尚未完成时最多等待 30 秒。已有命令行服务仍由原终端管理，不会被托盘启动器接管或关闭。首次从旧版本切换时，先结束练习并关闭原服务终端，再重新启动。

托盘日志保存在数据根目录下的 `logs/service.log`（默认 `artifacts/logs/service.log`），使用 UTF-8，不含终端颜色转义符。运行日志和启动失败日志共用轮转规则：达到约 2 MiB 时轮转，保留当前文件及 `service.log.1`～`.3` 三份备份，总量通常约 8 MiB；继续写入会自动替换最旧备份，无需定期手动清理。单条异常日志特别长时可能短暂超过轮转阈值。轮转只处理这些日志文件，不影响答题历史或录音。启动失败会弹出错误及日志位置。若依赖缺失，重新运行 `.cmd`；进一步排错可使用上面的 `scripts/launch.py` 命令。不要为测试停止正在使用的服务。

只启动服务、不自动打开浏览器：

```powershell
.\.venv\Scripts\python.exe -m backend.app
```

运行依赖见 [requirements.txt](../../requirements.txt)，开发依赖见 [requirements-dev.txt](../../requirements-dev.txt) 和 [package.json](../../package.json)。原创题库已生成，日常运行不需要生成题库。ETS 模考材料不随公开源码分发，属于可选的[本地导入](../../question_bank/README.md#模考导入与隔离)；未导入也能启动并使用原创练习与综合测验。

## 配置与数据

| 配置 | 默认值 | 用途 |
| --- | --- | --- |
| 应用地址 | `127.0.0.1:38761` | 启动器与应用入口绑定的本机地址 |
| `TOEFL_DATA_DIR` | 项目下的 `artifacts/` | 历史、录音及会话的数据根目录；启动服务前设置 |
| `TOEFL_TEST_PORT` | `8765` | 浏览器测试的独立服务端口 |

手动验证会写入答题记录时，应先将 `TOEFL_DATA_DIR` 指向独立测试目录，再启动测试服务。数据位置与保存边界见[存储与归档](architecture.md#存储与归档)；不要将个人历史、录音或正在使用的服务用于清理、重置或故障注入测试。

接口日志包含请求时间；交卷日志记录科目、题型、模式、回答数量与评分耗时，不记录答案正文。成功的静态资源请求会被过滤，失败请求与语音合成回退原因仍会记录。

## 测试

首次准备开发依赖：

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
npm ci
npx playwright install chromium
```

运行回归：

```powershell
.\.venv\Scripts\python.exe -m pytest -q
npm run test:browser
```

按改动范围运行相关文件即可，例如综合测验：

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_adaptive_test.py -q
npx playwright test tests/browser_adaptive_test.test.cjs
```

修改 JavaScript 后，对每个改动文件执行 `node --check <文件路径>`。纯文档修改核对命令、路径与链接即可，不要求运行应用测试。

没有本地 ETS 材料时，依赖官方卷的回归会明确跳过；缺失资源和原创功能的测试继续运行。逐题解析和可接受答案的专门测试还需本地审阅补充文件，PDF 导入器不会生成这些文件。跳过不代表官方卷流程已验证；完整模考验收应在有权使用且资源齐全的本地安装上执行。

浏览器测试由 [playwright.config.cjs](../../playwright.config.cjs) 启动独立服务和浏览器上下文，数据写入 `artifacts/qa/browser-data/<UUID>/`，结束后由测试清理。截图和失败诊断保存在 `artifacts/qa/browser-tests/`。人工验证使用 `artifacts/qa/<任务名>-YYYY-MM-DD/`；已结束且不再需要的开发产物移入 `tmp/`，同时更新本机 README 索引和路径引用。不主动创建源码备份，详见 [artifacts 目录说明](artifacts.md)。测试不复用已运行服务；默认端口被占用时改用其他空闲端口：

```powershell
$env:TOEFL_TEST_PORT = '8766'
npm run test:browser
```

UI 改动还需检查具体路由的 HTTP 响应、桌面键鼠交互、窗口调整及 125%／150% 显示缩放。音频自动化测试使用本地测试音频，不能验证实际麦克风或在线语音服务质量。

## 格式化

Prettier 管理前端、浏览器测试与 Node 配置；Ruff 管理 Python 后端、脚本和测试，版本固定在开发依赖中。

```powershell
npm run format:check
.\.venv\Scripts\python.exe -m ruff format --check backend scripts tests
```

需要格式化时运行 `npm run format` 和 `.\.venv\Scripts\python.exe -m ruff format backend scripts tests`。这些命令不处理题库正文、生成数据、历史记录或录音；行为变更仍须通过相应回归测试。

## 题库维护

先阅读[出题指南](../question-bank/generation-guidelines.md)和[题库维护流程](../../question_bank/README.md)，编辑源稿并完成内容审阅后再生成：

```powershell
.\.venv\Scripts\python.exe scripts/build_question_bank.py
```

生成器校验内容审阅、题量、答案对应关系和审阅覆盖，校验失败时保留已有生成文件。题号应保持稳定，不能直接修补生成 JSON 或刷新未经审阅内容的指纹。生成并验证后，重启本地服务以载入新题库；模考 PDF 导入与隔离审计命令见[模考导入流程](../../question_bank/README.md#模考导入与隔离)。
