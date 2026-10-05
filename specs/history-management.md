# History management

## Scope and acceptance

- The archive keeps the desktop-wide layout and provides two actions under 记录管理.
- 重置概率 preserves every record and recording; prior submissions stop contributing to repeat penalties. New successful submissions accrue penalties again. This restores original sampling weights, not guaranteed equal probabilities across difficulty constraints.
- 全部清空 removes all archived practice/test submissions and completed mock sessions, including their recordings, irrespective of the current tab or date filter. Active and abandoned mock sessions, question banks, and unrelated files remain untouched.
- Both actions require confirmation. Cancel sends no request; pending actions cannot be submitted twice; errors remain visible and retryable.
- After successful 全部清空, discard pending browser recordings belonging to deleted archives and revoke their Blob URLs. Probability reset, failed clearing and unrelated active recordings retain their existing state.

## Implementation and security

- Extend the existing history module and page, with no new dependency or duplicate sampler.
- `POST /api/v1/history/reset` accepts a validated `scope` (`probability` or `all`) and required `confirm: true`. Reject mismatched browser Origin headers. The application remains local-only, without new account/authentication infrastructure.
- Store an atomic snapshot of excluded submission IDs in `practice-history/.repeat-reset`, outside the archive's `*.json` enumeration. Read it under the existing lock. This persists across restarts, preserves submission-ID idempotency, and avoids clock-based reset boundaries.
- Practice archives, mock/test session JSON and the reset marker share `archive_io.write_archive`: write UTF-8 JSON to a sibling temporary file, then atomically replace the destination. Retry replacement only on `PermissionError`, up to four attempts with 20/40/60 ms waits. Failed serialization, writes or exhausted retries preserve the previous destination; temporary cleanup is best effort and must not mask the original outcome. Callers retain directory creation, locks and index invalidation after success. Recording writes keep their separate lifecycle.
- Full clearing uses both existing storage locks, validates UUID filenames and resolved paths before deletion, and removes only selected record files and their associated recording directories. Filesystem failures report possible partial clearing rather than falsely claiming success.

## Verification

1. Regression tests verify reset preserves review/recordings and old retries, while new submissions count normally.
2. Isolated storage tests verify all categories clear, completed mock recordings disappear, active/abandoned sessions and unrelated files survive, and invalid or cross-origin requests do not mutate state.
3. Browser tests verify both confirmations, cancellation, pending/error states, refreshed lists, keyboard focus, and desktop layout at 100%, 125%, and 150% display scaling.
4. Review the scoped diff and rendered archive; do not call either action against the owner's running service.
5. Inject malformed JSON, invalid encoding, incomplete structures and reset markers only in isolated storage. Verify identifiable errors, unchanged bytes, recovery retries, and no private answer content in logs.
6. Verify index invalidation after additions, replacements, successful writes, deletion, root changes and reset; failed submissions and repeated submission IDs must not add counts.

## Archive diagnostics and recovery

- Invalid JSON, invalid UTF-8, mismatched record IDs, or missing/incorrectly typed fields required by the current operation return HTTP 409. The message identifies the data directory and filename; logs contain the path, not decoded answer inputs or validation dumps.
- Full practice/test archives require feedback with a question ID and textual reference answer for each saved question, exactly once. Incomplete or duplicate feedback is rejected before listing or review; validation preserves the original record bytes and legacy scores.
- Filesystem read failures return HTTP 503 with a different message. A failed scan never returns a partial list or fabricated zero counts. Existing missing-record 404 and invalid-request 422 behavior remains separate.
- Material counting still supports older minimal records containing an ID and question/material references; full review requires the scored snapshot. IDs explicitly excluded by 重置概率 remain excluded before counting. Explicit `repeat_decay=0` bypasses history counts as before, but does not repair the archives.
- Mock listing reads stored snapshots without advancing unfinished-session timers. Both mock review routes and history use the same completed-review business functions; incomplete mocks never expose answer keys.

For recovery, preserve the reported file and its recording directory before any manual action. Save backups outside the live archive directories so copied JSON files do not become duplicate records. Do not use 全部清空 as a repair shortcut. At a safe time, stop your own service, restore only the affected file from a trusted backup, preserving newer records and media, then restart and reload the archive. Include `.repeat-reset` in backups when restoring probability history. If no trusted copy exists, keep the damaged original for manual diagnosis; the application does not fabricate missing answers.

## Rebuildable read indexes

- JSON files, recording directories and default data roots do not change. Indexes are process-local and discarded on restart; no database, persistent index file, or second counter truth source is added.
- Practice list indexes retain summaries; material indexes retain one set of material IDs per submission. Mock indexes retain validated session snapshots for paginated review. Each read still scans file metadata, and changed/new files are validated again. Deleted or explicitly excluded IDs drop out.
- Signatures use modification/creation timestamps, byte size, file identity and mode; successful atomic writes explicitly invalidate their entries. Failed writes cannot update an index. Restoring external copies with preserved metadata requires a service restart as described above, rather than assuming metadata detects arbitrary manual edits.
- First access after restart remains a full JSON scan. Warm reads avoid reparsing unchanged files but are not constant-time. Keep this trade-off explicit; measured scales, startup costs and the decision to defer SQLite are recorded in the [architecture implementation evidence](../docs/architecture-implementation-2026-09-27.md).
