import io
import json
import subprocess
import sys
from contextlib import contextmanager, nullcontext
from pathlib import Path
from textwrap import dedent
from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from backend.logging_config import server_log_config
from scripts import launch


@pytest.mark.parametrize(
    'health, homepage, ready',
    [
        ({'status': 'ok', 'service': 'toefl-practice'}, b'TOEFL 26 / Practice Workbench', True),
        ({'status': 'ok'}, b'TOEFL 26 / Practice Workbench', False),
        ({'status': 'ok', 'service': 'toefl-practice'}, b'Another application', False),
    ],
)
def test_readiness_requires_our_health_and_homepage(monkeypatch, health, homepage, ready):
    responses = [io.BytesIO(json.dumps(health).encode()), io.BytesIO(homepage)]
    responses[1].status = 200
    opener = Mock()
    opener.open.side_effect = responses
    monkeypatch.setattr(launch, 'build_opener', lambda *args: opener)
    assert launch.workbench_is_ready() is ready


def configured_file_handler(log_file):
    from logging.config import DictConfigurator

    config = server_log_config(log_file)
    configurator = DictConfigurator(config)
    for name, value in config['formatters'].items():
        configurator.config['formatters'][name] = configurator.configure_formatter(value)
    return configurator.configure_handler(configurator.config['handlers']['file'])


def test_file_logging_works_without_a_console(tmp_path, monkeypatch):
    from logging import INFO, LogRecord

    monkeypatch.setattr(sys, 'stdout', None)
    monkeypatch.setattr(sys, 'stderr', None)
    handler = configured_file_handler(tmp_path / 'service.log')
    try:
        handler.handle(LogRecord('uvicorn', INFO, '', 0, '服务已就绪', (), None))
    finally:
        handler.close()
    text = (tmp_path / 'service.log').read_text(encoding='utf-8')
    assert '服务已就绪' in text
    assert '\x1b[' not in text
    assert server_log_config()['loggers']['uvicorn.access']['filters'] == ['static_access']


def test_service_log_rotation_removes_old_backups(tmp_path):
    from logging import INFO, LogRecord

    handler = configured_file_handler(tmp_path / 'service.log')
    try:
        for index in range(16):
            handler.handle(
                LogRecord('uvicorn', INFO, '', 0, f'entry-{index:02d} ' + 'x' * 700_000, (), None)
            )
    finally:
        handler.close()
    files = sorted(tmp_path.glob('service.log*'))
    assert [path.name for path in files] == [
        'service.log',
        'service.log.1',
        'service.log.2',
        'service.log.3',
    ]
    assert all(path.stat().st_size <= 2 * 1024 * 1024 for path in files)
    assert 'entry-15' in files[0].read_text(encoding='utf-8')
    assert all('entry-00' not in path.read_text(encoding='utf-8') for path in files)


@pytest.fixture
def tray(monkeypatch):
    if sys.platform != 'win32':
        pytest.skip('Windows tray launcher')
    from scripts import launch_tray

    monkeypatch.setattr(launch_tray, 'open_page', Mock())
    monkeypatch.setattr(launch_tray, 'show_error', Mock())
    # Process DPI awareness cannot be undone; exercise the real API in a child process.
    monkeypatch.setattr(launch_tray, 'enable_high_dpi', Mock())
    return launch_tray


@pytest.mark.skipif(sys.platform != 'win32', reason='Windows DPI awareness')
def test_tray_initializes_per_monitor_dpi_before_startup(tmp_path, monkeypatch):
    monkeypatch.setenv('TOEFL_DATA_DIR', str(tmp_path))
    result = subprocess.run(
        [
            sys.executable,
            '-c',
            dedent('''
            import ctypes
            import threading
            from contextlib import nullcontext
            from scripts import launch_tray

            user32 = ctypes.WinDLL('user32')
            user32.GetThreadDpiAwarenessContext.restype = ctypes.c_void_p
            user32.AreDpiAwarenessContextsEqual.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
            def is_per_monitor_v2():
                return bool(user32.AreDpiAwarenessContextsEqual(
                    user32.GetThreadDpiAwarenessContext(), -4))

            launch_tray.single_instance = lambda: nullcontext(True)
            launch_tray.launch.workbench_is_ready = is_per_monitor_v2
            launch_tray.launch.create_server = lambda *args: None
            launch_tray.run_tray = lambda *args: None
            launch_tray.open_page = lambda: None
            assert launch_tray.main() == 0
            assert is_per_monitor_v2(), 'The main thread is not Per Monitor v2 aware'
            inherited = []
            thread = threading.Thread(target=lambda: inherited.append(is_per_monitor_v2()))
            thread.start()
            thread.join()
            assert inherited == [True], 'The tray thread did not inherit DPI awareness'
        '''),
        ],
        cwd=Path(__file__).resolve().parents[1],
        capture_output=True,
        text=True,
        timeout=15,
        check=False,
    )
    assert result.returncode == 0, result.stderr


def test_existing_service_opens_without_creating_a_server(tray, monkeypatch):
    monkeypatch.setattr(launch, 'workbench_is_ready', lambda: True)
    create = Mock()
    monkeypatch.setattr(launch, 'create_server', create)
    assert tray.main() == 0
    tray.open_page.assert_called_once_with()
    create.assert_not_called()


def test_duplicate_launch_waits_and_does_not_create_another_tray(tray, monkeypatch):
    @contextmanager
    def occupied():
        yield False

    monkeypatch.setattr(tray, 'single_instance', occupied)
    monkeypatch.setattr(launch, 'workbench_is_ready', Mock(side_effect=[False, False, True]))
    monkeypatch.setattr(tray.time, 'sleep', lambda seconds: None)
    create = Mock()
    monkeypatch.setattr(launch, 'create_server', create)
    assert tray.main() == 0
    tray.open_page.assert_called_once_with()
    create.assert_not_called()


def test_duplicate_startup_timeout_reports_an_error(tray, monkeypatch, tmp_path):
    @contextmanager
    def occupied():
        yield False

    monkeypatch.setenv('TOEFL_DATA_DIR', str(tmp_path))
    monkeypatch.setattr(tray, 'single_instance', occupied)
    monkeypatch.setattr(launch, 'workbench_is_ready', lambda: False)
    monkeypatch.setattr(tray.time, 'monotonic', Mock(side_effect=[0, 31]))
    assert tray.main() == 1
    tray.open_page.assert_not_called()
    assert '尚未就绪' in tray.show_error.call_args.args[0]


def test_tray_waits_for_readiness_and_exit_stops_its_server(tray, monkeypatch, tmp_path):
    import pystray

    icons = []

    class FakeIcon:
        def __init__(self, name, image, title, menu):
            self.menu = menu
            self.stop = Mock()
            self.update_menu = Mock()
            icons.append(self)

        def run_detached(self, setup):
            setup(self)

    monkeypatch.setattr(pystray, 'Icon', FakeIcon)
    server = SimpleNamespace(should_exit=False, config=SimpleNamespace())

    def run_server(server, on_ready):
        icon = icons[0]
        assert not icon.menu.items[0].enabled
        icon.menu(icon)
        tray.open_page.assert_not_called()
        on_ready()
        assert icon.menu.items[0].enabled
        tray.open_page.assert_called_once_with()
        icon.menu.items[-1](icon)
        assert server.should_exit
        assert not icon.menu.items[0].enabled
        icon.menu(icon)
        tray.open_page.assert_called_once_with()

    monkeypatch.setattr(launch, 'run_server', run_server)
    tray.run_tray(server, tmp_path / 'service.log')
    icons[0].stop.assert_called_once_with()


def test_failed_server_start_removes_the_tray(tray, monkeypatch, tmp_path):
    import pystray

    icon = Mock()
    icon.run_detached.side_effect = lambda setup: setup(icon)
    monkeypatch.setattr(pystray, 'Icon', Mock(return_value=icon))
    monkeypatch.setattr(launch, 'run_server', Mock(side_effect=SystemExit(1)))
    server = SimpleNamespace(config=SimpleNamespace())
    with pytest.raises(SystemExit):
        tray.run_tray(server, tmp_path / 'service.log')
    icon.stop.assert_called_once_with()
    tray.open_page.assert_not_called()


def test_startup_failure_is_visible_without_a_terminal(tray, monkeypatch, tmp_path):
    monkeypatch.setenv('TOEFL_DATA_DIR', str(tmp_path))
    monkeypatch.setattr(tray, 'single_instance', lambda: nullcontext(True))
    monkeypatch.setattr(launch, 'workbench_is_ready', lambda: False)
    monkeypatch.setattr(launch, 'create_server', Mock(side_effect=OSError('Port occupied')))
    assert tray.main() == 1
    message = tray.show_error.call_args.args[0]
    assert 'Port occupied' in message
    assert str(tmp_path / 'logs' / 'service.log') in message
    assert 'Port occupied' in (tmp_path / 'logs' / 'service.log').read_text(encoding='utf-8')


@pytest.mark.parametrize('logging_configured', [False, True])
def test_startup_failure_rotates_a_full_log(tray, monkeypatch, tmp_path, logging_configured):
    import logging

    log_file = tmp_path / 'logs' / 'service.log'
    log_file.parent.mkdir()
    log_file.write_text('old log\n' + 'x' * (2 * 1024 * 1024), encoding='utf-8')
    logger = logging.getLogger('toefl_trainer')
    handler = configured_file_handler(log_file) if logging_configured else None
    monkeypatch.setattr(logger, 'handlers', [handler] if handler else [])
    monkeypatch.setattr(logger, 'level', logging.INFO)
    monkeypatch.setattr(logger, 'disabled', False)
    monkeypatch.setattr(logger, 'propagate', False)
    monkeypatch.setenv('TOEFL_DATA_DIR', str(tmp_path))
    monkeypatch.setattr(tray, 'single_instance', lambda: nullcontext(True))
    monkeypatch.setattr(launch, 'workbench_is_ready', lambda: False)
    monkeypatch.setattr(launch, 'create_server', Mock(side_effect=OSError('Port occupied')))
    try:
        assert tray.main() == 1
    finally:
        if handler:
            handler.close()
    assert log_file.with_name('service.log.1').exists()
    text = log_file.read_text(encoding='utf-8')
    assert 'old log' not in text
    assert text.count('OSError: Port occupied') == 1


def test_windows_single_instance_guard_releases(tray, monkeypatch):
    monkeypatch.setattr(launch, 'URL', 'http://127.0.0.1:48971/')
    with tray.single_instance() as first, tray.single_instance() as second:
        assert first
        assert not second
    with tray.single_instance() as restarted:
        assert restarted
