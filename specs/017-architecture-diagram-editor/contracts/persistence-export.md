# Contract: Persistence and Export

## Local persistence boundary

```ts
interface WorkspaceRepository {
  restore(id: "current"): Promise<RestoreResult>
  save(id: "current", envelope: PersistedWorkspaceEnvelope): Promise<SaveStatus>
  clear(id: "current"): Promise<void>
}

interface StorageAdapter {
  get(key: string): string | null | Promise<string | null>
  set(key: string, value: string): void | Promise<void>
  remove(key: string): void | Promise<void>
}
```

The package owns validation/version policy. The web application owns the browser storage adapter.

## Persisted format

Top-level discriminated format:

```json
{
  "format": "adl-workspace-v2",
  "revision": 42,
  "document": {
    "name": "Payments Flow",
    "adl": { "text": "...", "validText": "...", "validRevision": 42 },
    "adls": { "text": "...", "validText": "...", "validRevision": 42 }
  },
  "visual": {
    "version": 2,
    "documentRevision": 42,
    "placements": {},
    "viewport": { "x": 0, "y": 0, "zoom": 1 }
  },
  "conversation": { "version": 1, "messages": [] },
  "preferences": {
    "version": 1,
    "theme": "system",
    "panel": { "collapsed": false, "expandedWidth": 356, "mode": "assistant" },
    "canvas": { "gridVisible": true, "snapEnabled": true, "guidesEnabled": true, "gridSize": 24 }
  },
  "savedAt": "2026-07-02T00:00:00.000Z"
}
```

## Save rules

1. Autosave starts 500 ms after the most recent persistible change.
2. A newer revision supersedes a pending older save; completion of the older save MUST NOT mark the newer revision saved.
3. The repository stores the correlated envelope in one adapter write.
4. `SaveStatus` is `idle | pending | saved | failed` and includes the relevant revision.
5. Save failure keeps the workspace usable and exposes a retry action.
6. History stacks and active interaction drafts are not persisted.
7. Generation is normalized to idle during persistence; an interrupted request is restored as a system message, not resumed.

## Restore result

```ts
type RestoreResult =
  | { status: "empty" }
  | { status: "restored"; envelope: PersistedWorkspaceEnvelope; warnings: RestoreWarning[] }
  | { status: "recovered"; document?: PersistedDocument; preferences?: WorkspacePreferences; warnings: RestoreWarning[] }
```

Warnings use stable codes:

- `CORRUPTED_RECORD`
- `UNSUPPORTED_FORMAT`
- `INCOMPATIBLE_VISUAL_STATE`
- `INCOMPATIBLE_CONVERSATION`
- `INCOMPATIBLE_PREFERENCES`
- `STORAGE_UNAVAILABLE`

Recovery priority is source document, then preferences, then visual state. Invalid optional envelopes MUST NOT discard a valid ADL source.

## Export service boundary

```ts
interface ExportService {
  create(request: ExportRequest): Promise<ExportResult>
}

type ExportResult =
  | { ok: true; artifact: ExportArtifact }
  | { ok: false; code: "STALE_REVISION" | "EMPTY_EXPORT" | "SERIALIZATION_FAILED" | "RASTERIZATION_FAILED" | "DOWNLOAD_FAILED"; message: string }
```

## Export formats

### ADL

- Input: current valid semantic model/source revision.
- Output MIME: `text/x-adl`.
- Filename: normalized diagram name + `.adl`.
- Content: current canonical ADL source.

### ADLS

- Input: current valid stylesheet source revision.
- Output MIME: `text/x-adls`.
- Filename: normalized diagram name + `.adls`.
- Content: current canonical ADLS source.

### PNG

- Input: export scene for an exact workspace revision.
- Output MIME: `image/png`.
- Filename: normalized diagram name + `.png`.
- Bounds: union of all element/group shapes, routed connection points, labels and configured padding.
- Excluded layers: grid, selection outline, resize/connect handles, guides, context menu, toolbar, panel and top bar.
- Empty diagram: return `EMPTY_EXPORT` rather than a transparent zero-size image.
- Raster scale: default 2x, capped by a documented maximum pixel area to avoid browser memory exhaustion.

## Filename normalization

1. Trim whitespace.
2. Normalize diacritics.
3. Convert to lowercase.
4. Replace non-alphanumeric runs with one hyphen.
5. Remove leading/trailing hyphens.
6. Use `diagram` when empty.
7. Append the requested extension exactly once.

Examples:

| Name | Format | Filename |
|------|--------|----------|
| `Payments Flow` | ADL | `payments-flow.adl` |
| `Arquitetura – Produção` | PNG | `arquitetura-producao.png` |
| `   ` | ADLS | `diagram.adls` |

## Browser download adapter

The browser adapter accepts an `ExportArtifact`, creates a temporary object URL when needed, initiates one download, then revokes the URL. It MUST NOT own serialization, scene calculation or filename policy.
