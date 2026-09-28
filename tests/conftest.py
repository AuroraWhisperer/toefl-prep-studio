"""Keep test submissions out of the user's learning archive."""

from pathlib import Path

import pytest


@pytest.fixture
def local_mock_bank():
    """Run official-paper regressions only when all five local imports exist."""
    bank = Path(__file__).resolve().parents[1] / 'question_bank'
    required = [
        bank / folder / f'ets-test-{number}.json'
        for folder in ('mock', 'answers/mock')
        for number in range(1, 6)
    ]
    if not all(path.is_file() for path in required):
        pytest.skip('ETS materials are local-only; import all five papers to run this test.')
    return bank


@pytest.fixture
def local_mock_supplements(local_mock_bank):
    required = [local_mock_bank / 'answers/mock/sentence-variants.json'] + [
        local_mock_bank / 'sources/mock_explanations' / f'ets-test-{number}.json'
        for number in range(1, 6)
    ]
    if not all(path.is_file() for path in required):
        pytest.skip('This regression needs locally reviewed mock explanations and answer variants.')


@pytest.fixture(autouse=True)
def isolated_history(tmp_path, monkeypatch):
    from backend import history, mock_exam, adaptive_test

    monkeypatch.setattr(history, 'HISTORY_DIR', tmp_path / 'practice-history')
    monkeypatch.setattr(mock_exam, 'SESSION_DIR', tmp_path / 'mock-sessions')
    monkeypatch.setattr(adaptive_test, 'SESSION_DIR', tmp_path / 'test-sessions')
