"""Measure JSON archive scans using synthetic records in an owned temporary root."""
from __future__ import annotations

import argparse
import json
import platform
import statistics
import sys
import tempfile
import time
from pathlib import Path
from unittest.mock import patch
from uuid import UUID

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend import history, mock_exam
from backend.exam_service import score_submission
from backend.question_store import store


def measure(operation, directories, repeats):
    durations, read_counts = [], []
    read_text = Path.read_text
    for _ in range(repeats):
        reads = 0

        def counted(path, *args, **kwargs):
            nonlocal reads
            if path.parent in directories:
                reads += 1
            return read_text(path, *args, **kwargs)

        with patch.object(Path, 'read_text', counted):
            started = time.perf_counter()
            operation()
            durations.append(round((time.perf_counter() - started) * 1000, 2))
        read_counts.append(reads)
    return {'milliseconds': durations, 'median_ms': statistics.median(durations), 'archive_reads': read_counts}


def benchmark(counts, repeats):
    result = score_submission(store, [], section='reading', mode='exam')
    practice = {
        'id': '', 'fingerprint': 'synthetic-benchmark', 'category': 'practice',
        'completed_at': 1700000000, 'section': 'reading', 'mode': 'exam', 'task_type': None,
        'questions': store.questions_for('reading', 'exam'), 'result': result, 'recordings': {},
    }
    mock = {
        'id': '', 'paper_id': 'ets-test-1', 'status': 'completed', 'phase_index': 9,
        'item_index': 0, 'started_at': 1700000000, 'completed_at': 1700000100,
        'phase_state': 'directions', 'deadline': None, 'response_deadline': None,
        'answers': {}, 'recordings': {}, 'word_orders': {}, 'heard_groups': [],
    }
    measurements = []
    with tempfile.TemporaryDirectory(prefix='toefl-archive-benchmark-') as temporary:
        root = Path(temporary)
        practice_dir, mock_dir = root / 'practice-history', root / 'mock-sessions'
        practice_dir.mkdir()
        mock_dir.mkdir()
        with patch.object(history, 'HISTORY_DIR', practice_dir), patch.object(mock_exam, 'SESSION_DIR', mock_dir):
            written, size = 0, 0
            for count in sorted(set(counts)):
                for index in range(written, count):
                    record_id = str(UUID(int=index + 1))
                    for template, directory in [(practice, practice_dir), (mock, mock_dir)]:
                        text = json.dumps({**template, 'id': record_id, 'completed_at': 1700000100 + index}, ensure_ascii=False)
                        (directory / f'{record_id}.json').write_text(text, encoding='utf-8')
                        size += len(text.encode('utf-8'))
                written = count
                history._SUMMARY_INDEX.clear()
                history._MATERIAL_INDEX.clear()
                mock_exam._ARCHIVE_INDEX.clear()
                operations = {
                    'practice_list': lambda: history.list_history(category='practice', page=1, page_size=10),
                    'weighted_draw': lambda: store.practice_questions(
                        'reading', 'complete_words', 1, submission_counts=history.submitted_material_counts(), repeat_decay=1),
                    'completed_mock_list': lambda: history.list_history(category='mock', page=1, page_size=10),
                }
                sample = {'records_per_category': count, 'total_bytes': size}
                for name, operation in operations.items():
                    sample[name] = measure(operation, {practice_dir, mock_dir}, repeats)
                measurements.append(sample)
                print(json.dumps(sample), flush=True)
    assert not root.exists(), 'Benchmark temporary data must be removed'
    return {
        'python': platform.python_version(), 'platform': platform.platform(),
        'dataset': 'Synthetic 50-question Reading submissions and blank completed 97-question mocks; no user data',
        'method': 'In-process wall time including instrumented archive read counts; first sample rebuilds indexes, later samples are warm; filesystem caches are not flushed',
        'repeats': repeats, 'temporary_data_removed': True, 'measurements': measurements,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--counts', type=int, nargs='+', default=[100, 1000, 10000])
    parser.add_argument('--repeats', type=int, default=3)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if args.repeats < 1 or any(count < 1 for count in args.counts):
        parser.error('counts and repeats must be positive')
    report = benchmark(args.counts, args.repeats)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
