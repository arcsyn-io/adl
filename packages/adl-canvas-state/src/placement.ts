export interface Point { readonly x: number; readonly y: number }
export interface PinnedPlacement extends Point { readonly entityId: string; readonly pinned: boolean }
export interface MoveOperation { readonly entityId: string; readonly from: Point; readonly to: Point; readonly input: "pointer" | "keyboard" }
export interface ViewportState extends Point { readonly zoom: number }
export interface PlacementState { readonly revision: number; readonly placements: Readonly<Record<string, PinnedPlacement>>; readonly undo: readonly MoveOperation[]; readonly redo: readonly MoveOperation[]; readonly viewport: ViewportState }
export const emptyPlacementState = (): PlacementState => ({ revision: 0, placements: {}, undo: [], redo: [], viewport: { x: 0, y: 0, zoom: 1 } });
