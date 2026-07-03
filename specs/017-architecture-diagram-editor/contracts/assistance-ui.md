# Contract: Assistance and UI State

## Assistance provider boundary

The feature uses the existing provider-neutral request/proposal model.

```ts
interface AssistanceProvider {
  readonly id: string
  propose(request: AssistanceRequest): Promise<unknown>
}

interface AssistanceRequest {
  id: string
  intent: string
  baseRevision: number
  disclosedContent: string
}

interface Proposal {
  requestId: string
  baseRevision: number
  source: string
  summary: string
}
```

## Simulated provider behavior

The local simulator MUST be deterministic and MUST NOT use network access. Initial supported intents:

| Intent match | Proposal effect | Summary |
|--------------|-----------------|---------|
| Add cache between API Gateway and Payments Service | Add cache element and replace direct relation with two valid relations | Cache added between gateway and payments service |
| Add/remove/rename a known element using an unambiguous command | Apply corresponding semantic command | Describe affected entity |
| Unsupported or ambiguous request | Return typed unsupported error | No source change |
| Explicit test failure command/fixture | Return provider failure | No source change |

All proposal source is untrusted until:

1. request id matches;
2. proposal base revision equals current revision;
3. ADL validates successfully;
4. the diff can be represented by the workspace transaction;
5. the user-initiated local command is still active.

## Assistance flow states

```ts
type AssistanceFlow =
  | { status: "idle" }
  | { status: "generating"; requestId: string; baseRevision: number }
  | { status: "applying"; requestId: string; proposal: Proposal }
  | { status: "failed"; requestId: string; code: AssistanceErrorCode; message: string }
```

Error codes:

- `EMPTY_INTENT`
- `UNSUPPORTED_INTENT`
- `PROVIDER_UNAVAILABLE`
- `INVALID_RESPONSE`
- `STALE_PROPOSAL`
- `INVALID_PROPOSAL_SOURCE`
- `APPLY_FAILED`

## Conversation event contract

| Event | Conversation effect | Workspace effect |
|-------|---------------------|------------------|
| `assistant.submit` | Append user message | Start generation at current revision |
| `assistant.generated` | Append assistant response | None until validated |
| `assistant.applied` | Mark response with applied summary | Commit one `assistant.apply-proposal` transaction |
| `assistant.failed` | Append/mark accessible error | No document change |
| `assistant.retry` | Keep prior failure and start new request | New request id/current revision |

Submitting while `generating` or `applying` returns a no-op with accessible status; it never creates duplicate requests.

## Keyboard contract

| Context | Shortcut | Action |
|---------|----------|--------|
| Assistant textarea | `Ctrl/Cmd + Enter` | Submit non-empty command |
| Workspace outside text editor | `Ctrl/Cmd + Z` | Undo |
| Workspace outside text editor | `Ctrl/Cmd + Shift + Z` | Redo |
| Workspace outside text editor | `Ctrl/Cmd + Y` | Redo where supported |
| Canvas selection | `Delete/Backspace` | Delete selected entities after applicable guard |
| Canvas selection | `Ctrl/Cmd + D` | Duplicate |
| Canvas | `Ctrl/Cmd + C` / `Ctrl/Cmd + V` | Copy/paste selection |
| Canvas focused entity | Arrow keys | Move; Shift increases step |
| Canvas focused entity/relation | Enter | Start label edit or open applicable action |
| Menus/drawer | Escape | Close and return focus to trigger |

Text editor native undo/redo applies to its draft while focused. After debounce/commit, the correlated source transaction enters global history. Global shortcuts MUST NOT steal native editor shortcuts.

## Responsive panel contract

### Desktop mode

- Trigger: enough width to retain at least 640 px of canvas beside a minimum 280 px panel.
- Panel width: clamped 280–520 px.
- Divider: keyboard and pointer operable; arrow keys resize in 16 px steps.
- Collapse: canvas expands; reopen restores `expandedWidth`.

### Overlay mode

- Trigger: side-by-side layout cannot retain the minimum canvas width.
- IA/ADL/ADLS use one drawer mounted over the canvas.
- Drawer width: up to 92% viewport; may be full-height below the fixed top bar.
- Opening drawer does not change persisted desktop width or canvas viewport.
- Focus enters drawer, stays within while modal, and returns to trigger on close.

## Theme contract

| Preference | Resolved theme |
|------------|----------------|
| `light` | Always light |
| `dark` | Always dark |
| `system` | Current device preference; update on change |

Theme tokens MUST cover:

- base/canvas/panel/elevated surfaces;
- primary/secondary/muted/error text;
- subtle/strong/focus borders;
- accent and accent contrast;
- grid major/minor lines;
- node/connection/guide colors;
- selected, focused, invalid and generating states;
- code editor tokens and tooltips.

## Required UI state matrix

| State | Observable contract |
|-------|---------------------|
| Loading restore | Canvas and destructive actions unavailable; progress announced |
| Loaded diagram | Canvas, sources and toolbar reflect same revision |
| Empty canvas | Helpful empty state; export PNG disabled with explanation |
| Element selected | Resize handles + element contextual toolbar + accessible selected state |
| Relation selected | Relation contextual toolbar + highlighted path + accessible selected state |
| IA generating | Progress indicator, disabled duplicate submit, polite announcement |
| IA error | Error text/icon, retry, no document mutation |
| ADL invalid | Inline/range diagnostics; last valid canvas retained |
| ADLS invalid | Inline/range diagnostics; last valid style retained |
| Panel collapsed | Reopen control accessible; canvas fills freed area |
| Mobile drawer open | Overlay/backdrop, focus containment, canvas state preserved |
| Export menu | Three format actions with disabled/error states |
| New confirmation | Explicit cancel/confirm; initial focus on safe cancel action |

## Accessibility contract

- Every toolbar control has an accessible name and tooltip.
- Toggle controls expose pressed state.
- Tabs expose selected state and control their panels.
- Canvas entities expose semantic identity, type, label and state from the scene graph.
- Selection uses stroke/handles or pattern plus color.
- Errors include text, location and icon/status semantics.
- Live regions announce generation completion/failure, save failure, undo/redo and export completion.
- Touch targets are at least 44 × 44 CSS pixels in compact/mobile mode; dense desktop controls may be smaller only when keyboard equivalent and tooltip are available.
