"""Run the local Windows service from the notification area, without a console."""

from __future__ import annotations

import ctypes
import logging
import os
import sys
import threading
import time
from contextlib import contextmanager
from ctypes import wintypes
from pathlib import Path
from urllib.parse import urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts import launch

TITLE = 'TOEFL Prep Studio'


def enable_high_dpi() -> None:
    # Set the process default before pystray creates its windows on another thread.
    user32 = ctypes.WinDLL('user32', use_last_error=True)
    try:
        set_context = user32.SetProcessDpiAwarenessContext
    except AttributeError:
        user32.SetProcessDPIAware()
        return
    set_context.argtypes = [wintypes.HANDLE]
    set_context.restype = wintypes.BOOL
    if not set_context(-4):  # DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2
        # Older Windows supports system scaling; an existing manifest setting stays intact.
        user32.SetProcessDPIAware()


def show_error(message: str) -> None:
    ctypes.windll.user32.MessageBoxW(None, message, TITLE, 0x10)


def open_page() -> None:
    try:
        if launch.open_workbench():
            return
    except OSError:
        logging.getLogger('toefl_trainer').exception('Could not open the browser')
    show_error(f'未能自动打开浏览器，请手动打开：\n{launch.URL}')


@contextmanager
def single_instance():
    # Keep the handle open for the service lifetime, including its startup period.
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel.CreateMutexW.argtypes = [wintypes.LPVOID, wintypes.BOOL, wintypes.LPCWSTR]
    kernel.CreateMutexW.restype = wintypes.HANDLE
    kernel.CloseHandle.argtypes = [wintypes.HANDLE]
    kernel.CloseHandle.restype = wintypes.BOOL
    name = f'Local\\TOEFLPrepStudio-{urlsplit(launch.URL).port}'
    handle = kernel.CreateMutexW(None, False, name)
    if not handle:
        raise ctypes.WinError(ctypes.get_last_error())
    first = ctypes.get_last_error() != 183  # ERROR_ALREADY_EXISTS
    try:
        yield first
    finally:
        kernel.CloseHandle(handle)


def create_tray_image():
    from PIL import Image

    with Image.open(launch.ROOT / 'docs' / 'assets' / 'tray-icon.ico') as image:
        return image.convert('RGBA')


def run_tray(server, log_file: Path) -> None:
    import pystray

    ready = threading.Event()
    visible = threading.Event()
    exiting = threading.Event()
    server.config.timeout_graceful_shutdown = 5

    def open_ready_page():
        if ready.is_set():
            open_page()

    def stop_service():
        exiting.set()
        ready.clear()
        icon.title = f'{TITLE} · 正在退出'
        icon.update_menu()
        server.should_exit = True

    def show_log():
        try:
            os.startfile(log_file)
        except OSError as error:
            show_error(f'无法打开日志：{error}\n{log_file}')

    icon = pystray.Icon(
        TITLE,
        create_tray_image(),
        f'{TITLE} · 正在启动',
        pystray.Menu(
            pystray.MenuItem(
                '打开练习页面', open_ready_page, default=True, enabled=lambda item: ready.is_set()
            ),
            pystray.MenuItem('查看运行日志', show_log),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem('退出服务', stop_service),
        ),
    )

    def show_icon(tray):
        tray.visible = True
        visible.set()

    def on_ready():
        if not exiting.is_set():
            ready.set()
            icon.title = f'{TITLE} · 服务运行中'
            icon.update_menu()
            open_page()

    # Windows supports its native tray loop on a separate thread. Uvicorn stays
    # on the main thread so its normal shutdown and signal handling still work.
    icon.run_detached(setup=show_icon)
    try:
        if not visible.wait(5):
            raise RuntimeError('未能显示系统托盘图标。')
        launch.run_server(server, on_ready)
    finally:
        icon.stop()


def main() -> int:
    data_dir = Path(os.environ.get('TOEFL_DATA_DIR', launch.ROOT / 'artifacts'))
    log_file = data_dir / 'logs' / 'service.log'
    try:
        enable_high_dpi()
        with single_instance() as first:
            if not first:
                deadline = time.monotonic() + 30
                while not launch.workbench_is_ready():
                    if time.monotonic() >= deadline:
                        raise RuntimeError('另一个启动器尚未就绪，请稍后重试。')
                    time.sleep(0.2)
                open_page()
            elif launch.workbench_is_ready():
                # An existing console service belongs to its original launcher.
                open_page()
            else:
                log_file.parent.mkdir(parents=True, exist_ok=True)
                server = launch.create_server(log_file)
                run_tray(server, log_file)
        return 0
    except (Exception, SystemExit) as error:  # noqa: BLE001 - Surface GUI entry point failures.
        # Also record failures that occur before Uvicorn configures its logger.
        try:
            from backend.logging_config import log_service_failure

            log_service_failure(log_file)
        except OSError:
            pass  # The dialog still reports failures when storage is unavailable.
        show_error(
            f'本地服务启动失败或意外停止：{error}\n\n'
            f'请查看运行日志：\n{log_file}\n\n'
            '也可运行 TOEFL Prep Studio.cmd 检查依赖，'
            '或在终端运行 scripts/launch.py 查看详细错误。'
        )
        return 1


if __name__ == '__main__':
    sys.exit(main())
