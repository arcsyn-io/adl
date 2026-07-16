# Contract: Top Text Toolbar

## Purpose

Define the boundary between the top bar UI and deterministic workspace/style commands. The toolbar presents state and dispatches intents; it does not parse ADL, serialize ADLS or mutate diagram data directly.

## Toolbar derivation

```ts
interface TextToolbarState {
  readonly selectionRevision: number
  readonly targets: readonly EditableTextTarget[]
  readonly values: {
    readonly fontFamily: ToolbarValue<readonly string[]>
    readonly fontSize: ToolbarValue<number>
    readonly textPaint: ToolbarValue<string>
    readonly textAlign: ToolbarValue<"left" | "center" | "right">
    readonly fontWeight: ToolbarValue<"normal" | "bold">
    readonly fontStyle: ToolbarValue<"normal" | "italic">
    readonly textDecoration: ToolbarValue<"none" | "underline">
  }
  readonly actions: {
    readonly copy: SelectionActionAvailability
    readonly remove: SelectionActionAvailability
  }
}

type ToolbarValue<T> =
  | { readonly kind: "empty" }
  | { readonly kind: "single"; readonly value: T }
  | { readonly kind: "mixed" }
  | { readonly kind: "unavailable"; readonly reason: string }
```

`TextToolbarState` MUST be derived from the workspace snapshot and current selection. It MUST NOT be stored as canonical state.

## Editable targets

```ts
interface EditableTextTarget {
  readonly kind: "element-text" | "relation-label"
  readonly entityId: string
  readonly currentTextStyle: TextStyle
  readonly canPersistStyle: boolean
  readonly readOnlyReason?: string
}
```

## Style command

```ts
interface ApplyTextStyleCommand {
  readonly id: string
  readonly type: "visual.apply-text-style"
  readonly baseRevision: number
  readonly origin: "canvas" | "workspace"
  readonly payload: {
    readonly targetIds: readonly string[]
    readonly patch: TextStylePatch
    readonly coalesceKey?: string
  }
}

interface TextStylePatch {
  readonly fontFamily?: readonly string[]
  readonly fontSize?: number
  readonly textPaint?: string
  readonly textAlign?: "left" | "center" | "right"
  readonly fontWeight?: "normal" | "bold"
  readonly fontStyle?: "normal" | "italic"
  readonly textDecoration?: "none" | "underline"
}
```

Rules:

1. `targetIds` MUST reference currently selected editable text targets.
2. `patch` MUST contain at least one property.
3. The command MUST update the writable style source by exact ID selectors or an equivalent existing style patch mechanism.
4. The command MUST NOT write visual properties to semantic `.adl`.
5. The command MUST preserve unrelated declarations, comments and rules when the update mechanism supports text-preserving patches.
6. Stale `baseRevision` MUST return `STALE_REVISION` without partial changes.

## Font options

```ts
interface FreeFontOption {
  readonly id: string
  readonly label: string
  readonly fontFamily: readonly string[]
  readonly genericFallback: "sans-serif" | "serif" | "monospace"
  readonly licenseName: string
  readonly licenseSource: string
}
```

The toolbar MUST expose only configured `FreeFontOption` values. Free-form font entry is outside this contract.

## Selection actions

The toolbar MUST dispatch existing workspace/canvas commands for:

- copy selected items;
- remove selected items.

It MUST NOT implement separate copy/remove semantics. The same result codes, dependent relation handling, ID generation and undo/redo behavior used by canvas shortcuts and context menus apply.

## Result codes

Expected failures MUST use structured results:

```ts
type TextToolbarFailureCode =
  | "INVALID_SELECTION"
  | "INVALID_TEXT_STYLE"
  | "READ_ONLY_STYLE_SOURCE"
  | "STALE_REVISION"
  | "UNREPRESENTABLE_CHANGE"
```

Errors explain the problem and keep the previous snapshot active.

## Accessibility contract

Each visible control MUST provide:

- accessible name;
- current value or mixed state;
- disabled state and reason when unavailable;
- keyboard activation;
- visible focus;
- no shortcut interception while focus is inside text editing controls.
