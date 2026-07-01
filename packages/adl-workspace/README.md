# @adl/workspace

Synchronizes ADL text and semantic canvas commands through explicit revisions. Invalid text remains available while consumers render `lastValid`; stale changes return a conflict instead of overwriting work.

Use `createWorkspace`, then apply `synchronizeText` or `synchronizeCanvas` with a deterministic codec. Selection is retained by semantic identity. This package owns no coordinates, storage, React state, or network access.
