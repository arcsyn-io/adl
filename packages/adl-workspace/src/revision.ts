export type ChangeOrigin = "text" | "canvas" | "restore";
export interface SelectionState { readonly text?: readonly [number, number]; readonly entityIds: readonly string[] }
export interface WorkspaceRevision<Model> { readonly revision: number; readonly source: string; readonly model: Model; readonly origin: ChangeOrigin; readonly selection: SelectionState }
export interface LastValidSnapshot<Model> { readonly revision: number; readonly source: string; readonly model: Model }
export interface Conflict { readonly code: "STALE_REVISION" | "INVALID_SOURCE" | "SERIALIZATION_FAILED"; readonly expectedRevision: number; readonly receivedRevision: number; readonly message: string }
export interface WorkspaceState<Model> { readonly revision: WorkspaceRevision<Model>; readonly lastValid: LastValidSnapshot<Model>; readonly invalidSource?: string; readonly conflict?: Conflict }
export type WorkspaceResult<Model> = { readonly ok: true; readonly state: WorkspaceState<Model> } | { readonly ok: false; readonly state: WorkspaceState<Model>; readonly error: Conflict };
