# Quickstart: Barra superior de edicao de texto

All commands run in Docker:

```sh
docker compose exec workspace bash -lc "pnpm test -- --run apps/web-editor/src/features/workspace/text-toolbar-state.test.ts"
docker compose exec workspace bash -lc "pnpm test -- --run apps/web-editor/src/features/visual-editor/commands.test.ts"
docker compose exec workspace bash -lc "pnpm test:e2e -- tests/e2e/text-toolbar.spec.ts"
```

## Red-Green workflow

1. Add failing unit tests for deriving `TextToolbarState` from no selection, single element, mixed multiselection and relation label selection.
2. Add failing command tests for `visual.apply-text-style`, including stale revision and read-only style source.
3. Add failing E2E for selecting an element and changing font, size, color, alignment, bold, italic and underline.
4. Implement the smallest state derivation and command path needed for the tests.
5. Add E2E for copy/remove from the top bar and keyboard focus isolation.
6. Refactor UI composition only after tests pass.

## Manual validation scenarios

1. Start the dev server:

```sh
docker compose up -d workspace
```

2. Open `http://localhost:5173/`.
3. Select one element and verify the text toolbar appears.
4. Change font to each available free option and confirm fallback remains readable.
5. Change font size, text color and alignment.
6. Toggle bold, italic and underline independently.
7. Undo and redo each change.
8. Select multiple elements with different styles and verify mixed state.
9. Apply one style to multiple elements and confirm one history entry.
10. Select a relation label and apply text style when supported.
11. Use copy and remove from the toolbar; verify paste/undo behavior.
12. Focus the ADL editor or inline text editor and confirm native shortcuts are not intercepted.
13. Resize to mobile width and verify grouped controls remain reachable.

## Final validation

Run existing project gates before closing implementation:

```sh
docker compose exec workspace bash -lc "pnpm lint"
docker compose exec workspace bash -lc "pnpm typecheck"
docker compose exec workspace bash -lc "pnpm test"
docker compose exec workspace bash -lc "pnpm build"
docker compose exec workspace bash -lc "pnpm test:e2e"
```

Record any preexisting failure with command, output summary and suspected owner.
