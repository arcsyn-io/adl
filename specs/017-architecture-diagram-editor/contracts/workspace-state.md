# Contract: Workspace State, Commands and Synchronization

## Purpose

Define the boundary between UI adapters and the deterministic workspace controller. React components and browser APIs consume this contract; they do not parse, serialize, route or mutate domain state directly.

## Controller surface

```ts
interface WorkspaceController {
  getSnapshot(): WorkspaceViewSnapshot
  subscribe(listener: (snapshot: WorkspaceViewSnapshot) => void): () => void
  dispatch(command: WorkspaceCommand): Promise<CommandResult>
  undo(): CommandResult
  redo(): CommandResult
  beginGesture(gesture: GestureStart): GestureResult
  previewGesture(update: GestureUpdate): GestureResult
  commitGesture(): Promise<CommandResult>
  cancelGesture(): void
}
```

## Command envelope

Every command MUST contain:

```ts
interface CommandEnvelope<TType, TPayload> {
  id: string
  type: TType
  baseRevision: number
  origin: "canvas" | "adl" | "adls" | "assistant" | "workspace"
  payload: TPayload
}
```

Commands based on an obsolete revision return `STALE_REVISION` and never partially mutate state.

## Command set

| Type | Payload | Canonical effect |
|------|---------|------------------|
| `semantic.add-element` | element definition + optional initial placement | Serialize updated semantic model to ADL; reconcile placement |
| `semantic.update-element` | id + semantic fields | Serialize ADL; preserve identity/placement |
| `semantic.remove-elements` | ids | Serialize ADL; remove dependent relations/placements; reconcile selection |
| `semantic.duplicate-elements` | ids + offset | Generate unique ids, serialize ADL, add placements |
| `semantic.add-relation` | id, source, target, type, label | Validate endpoints; serialize ADL; route relation |
| `semantic.update-relation` | id + label/type/endpoints | Serialize ADL; reroute |
| `semantic.reverse-relation` | id | Swap source/target; serialize ADL; reroute |
| `semantic.remove-relation` | id | Serialize ADL; remove route/selection |
| `visual.move-elements` | final boxes for ids | Update placement/ADLS geometry; never write coordinates to ADL |
| `visual.resize-entity` | id + final box | Update placement/ADLS geometry |
| `visual.update-style` | selector + supported style patch | Serialize ADLS and resolve styles |
| `source.replace-adl` | text + edit session key | Validate; update ADL and derived model only when valid |
| `source.replace-adls` | text + edit session key | Validate; update ADLS and resolved styles only when valid |
| `assistant.apply-proposal` | validated proposal | Replace ADL atomically and append applied summary |
| `workspace.rename` | name | Update name only |
| `workspace.reset` | empty document template | Clear content/history/conversation; retain preferences |

## Result union

```ts
type CommandResult =
  | { ok: true; revision: number; transactionId?: string; changed: boolean }
  | {
      ok: false
      code:
        | "STALE_REVISION"
        | "INVALID_ADL"
        | "INVALID_ADLS"
        | "UNREPRESENTABLE_CHANGE"
        | "INVALID_SELECTION"
        | "INVALID_CONNECTION"
        | "SERIALIZATION_FAILED"
      message: string
      diagnostics?: Diagnostic[]
      currentRevision: number
    }
```

Expected input errors MUST use the result union rather than throw. Throws are reserved for programmer errors and unavailable runtime dependencies.

## Derived view snapshot

```ts
interface WorkspaceViewSnapshot {
  revision: number
  name: string
  adl: SourceView
  adls: SourceView
  scene: DiagramScene
  placements: Readonly<Record<string, Placement>>
  routes: Readonly<Record<string, OrthogonalRoute>>
  selection: SelectionState
  viewport: ViewportState
  conversation: ConversationState
  preferences: WorkspacePreferences
  history: { canUndo: boolean; canRedo: boolean; nextUndoLabel?: string; nextRedoLabel?: string }
  save: SaveStatus
}
```

`DiagramModel`, resolved styles and parser AST MUST NOT be duplicated in the UI store. They may remain private cached derivations in the controller.

## Transaction rules

1. A successful command that changes persisted state increments revision exactly once.
2. A no-op returns `changed: false`, does not increment revision and does not create history.
3. New commands after undo clear the redo branch.
4. Pointer movement and resize previews never create history; commit creates one transaction.
5. Source edits with the same `edit session key` coalesce while the debounce window remains open.
6. Assistance applies proposal + conversation summary in one transaction.
7. Selection changes, pan and zoom do not enter semantic undo history.
8. Undo/redo restores correlated ADL, ADLS and placements before recomputing scene/routes.

## Synchronization guarantees

- Valid ADL is parsed, compiled and serialized through existing language packages.
- Invalid ADL remains visible in the editor but does not replace the last valid scene.
- Valid ADLS is parsed/resolved independently and can affect layout/rendering.
- Invalid ADLS remains visible but does not replace last valid resolved styles.
- Canvas semantic commands serialize back to ADL.
- Canvas geometry commands update placement and writable ADLS geometry only.
- Selection is retained by semantic identity when the identity still exists.

## Canvas adapter boundary

The canvas adapter receives only:

- scene entities;
- placement boxes and orthogonal routes;
- selection and viewport;
- preferences for grid/snap/guides;
- callbacks that dispatch command envelopes or gesture events.

The adapter MUST map library-specific node, edge, handle and viewport types internally. Those types MUST NOT appear in package contracts or persisted data.
