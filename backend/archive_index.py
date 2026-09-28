"""Rebuildable process-local projections; callers hold their storage module's lock."""
import os
from pathlib import Path

try:
    from .archive_io import unreadable_archive
except ImportError:
    from archive_io import unreadable_archive


class ArchiveIndex:
    def __init__(self):
        self.clear()

    def clear(self):
        self.directory = None
        self.entries = {}

    def invalidate(self, path):
        if path.parent.resolve() == self.directory:
            self.entries.pop(path.name, None)

    def read(self, directory, project, ignored_ids=()):
        directory = Path(directory).resolve()
        if self.directory != directory:
            self.clear()
            self.directory = directory
        try:
            scan = os.scandir(directory)
        except FileNotFoundError:
            self.entries = {}
            return {}
        except OSError:
            raise unreadable_archive(directory) from None
        current = {}
        path = directory
        try:
            with scan:
                for entry in scan:
                    if not entry.name.endswith('.json') or entry.name[:-5] in ignored_ids:
                        continue
                    path = Path(entry.path)
                    stat = entry.stat()
                    signature = (stat.st_mtime_ns, stat.st_ctime_ns, stat.st_size, stat.st_ino, stat.st_mode)
                    cached = self.entries.get(entry.name)
                    if cached is None or cached[0] != signature:
                        self.entries.pop(entry.name, None)
                        cached = (signature, project(path))
                    current[entry.name] = cached
        except OSError:
            raise unreadable_archive(path) from None
        # Commit only after a complete scan. Missing or explicitly ignored IDs drop out.
        self.entries = current
        return {name: value for name, (_, value) in current.items()}
