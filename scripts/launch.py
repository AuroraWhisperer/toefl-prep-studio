"""Start the local workbench and open it only after the server is ready."""

from __future__ import annotations

import json
import sys
import threading
import webbrowser
from pathlib import Path
from urllib.request import ProxyHandler, build_opener


ROOT = Path(__file__).resolve().parents[1]
URL = "http://127.0.0.1:38761/"


def workbench_is_ready() -> bool:
    # Loopback traffic should not depend on the user's HTTP proxy settings.
    opener = build_opener(ProxyHandler({}))
    try:
        with opener.open(f"{URL}api/v1/health", timeout=1) as response:
            health = json.load(response)
        if health != {"status": "ok", "service": "toefl-practice"}:
            return False
        with opener.open(URL, timeout=1) as response:
            return response.status == 200 and b"TOEFL 26 / Practice Workbench" in response.read()
    except (OSError, ValueError):
        return False


def open_workbench() -> None:
    print(f"练习地址：{URL}", flush=True)
    if not webbrowser.open(URL, new=2):
        print("未能自动打开浏览器，请复制上面的地址到浏览器。", flush=True)


def main() -> None:
    if workbench_is_ready():
        print("练习服务已经运行，正在打开页面。", flush=True)
        open_workbench()
        return

    import uvicorn

    sys.path.insert(0, str(ROOT))
    from backend.logging_config import server_log_config

    server = uvicorn.Server(
        uvicorn.Config(
            "backend.app:app", host="127.0.0.1", port=38761, log_config=server_log_config()
        )
    )
    stopped = threading.Event()

    def open_when_ready() -> None:
        while not stopped.wait(0.1):
            if server.started and workbench_is_ready():
                open_workbench()
                return

    browser_thread = threading.Thread(target=open_when_ready, daemon=True)
    browser_thread.start()
    try:
        server.run()
    finally:
        stopped.set()
        browser_thread.join(timeout=3)


if __name__ == "__main__":
    main()
