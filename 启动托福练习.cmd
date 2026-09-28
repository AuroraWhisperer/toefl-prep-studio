@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title TOEFL 练习服务 - 关闭此窗口即可停止
set PYTHONUTF8=1

if exist ".venv\Scripts\python.exe" goto dependencies
echo 首次启动：正在创建 Python 环境……
py -3 -m venv .venv 2>nul
if not errorlevel 1 goto dependencies
python -m venv .venv
if errorlevel 1 goto failed

:dependencies
".venv\Scripts\python.exe" -c "import fastapi, uvicorn, edge_tts" >nul 2>&1
if not errorlevel 1 goto launch
echo 首次启动：正在安装依赖，请保持联网……
".venv\Scripts\python.exe" -m pip install -r requirements.txt
if errorlevel 1 goto failed

:launch
echo 正在启动托福练习，准备好后会自动打开浏览器。
echo 练习时请保留此窗口，可以最小化；关闭此窗口即停止服务。
echo.
".venv\Scripts\python.exe" scripts\launch.py
if errorlevel 1 goto failed
exit /b 0

:failed
echo.
echo 启动失败，请查看上面的错误信息。
echo 若未安装 Python，请先安装 Python 3.10 或更新版本。
echo 若提示端口被占用，请关闭占用 38761 端口的程序后重试。
pause
exit /b 1
