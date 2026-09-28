"""Keep test submissions out of the user's learning archive."""
import pytest


@pytest.fixture(autouse=True)
def isolated_history(tmp_path, monkeypatch):
    from backend import history, mock_exam, adaptive_test
    monkeypatch.setattr(history, 'HISTORY_DIR', tmp_path / 'practice-history')
    monkeypatch.setattr(mock_exam, 'SESSION_DIR', tmp_path / 'mock-sessions')
    monkeypatch.setattr(adaptive_test, 'SESSION_DIR', tmp_path / 'test-sessions')
