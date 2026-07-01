import type { Conflict, SelectionState, WorkspaceResult, WorkspaceState } from "./revision.js";

export interface WorkspaceCodec<Model, Change> { parse(source: string): { ok: true; model: Model } | { ok: false; message: string }; serialize(model: Model): string; apply(model: Model, change: Change): Model }
export const createWorkspace = <Model>(source: string, model: Model, selection: SelectionState = { entityIds: [] }): WorkspaceState<Model> => ({ revision: { revision: 0, source, model, origin: "restore", selection }, lastValid: { revision: 0, source, model } });
const stale = <Model>(state: WorkspaceState<Model>, received: number): WorkspaceResult<Model> => { const error: Conflict = { code: "STALE_REVISION", expectedRevision: state.revision.revision, receivedRevision: received, message: "The change is based on a stale workspace revision." }; return { ok: false, state: { ...state, conflict: error }, error }; };
export function synchronizeText<Model, Change>(state: WorkspaceState<Model>, source: string, baseRevision: number, codec: WorkspaceCodec<Model, Change>): WorkspaceResult<Model> {
  if (baseRevision !== state.revision.revision) return stale(state, baseRevision);
  const parsed = codec.parse(source);
  if (!parsed.ok) { const error: Conflict = { code: "INVALID_SOURCE", expectedRevision: baseRevision, receivedRevision: baseRevision, message: parsed.message }; return { ok: false, state: { ...state, invalidSource: source, conflict: error }, error }; }
  const revision = baseRevision + 1;
  return { ok: true, state: { revision: { revision, source, model: parsed.model, origin: "text", selection: state.revision.selection }, lastValid: { revision, source, model: parsed.model } } };
}
export function synchronizeCanvas<Model, Change>(state: WorkspaceState<Model>, change: Change, baseRevision: number, codec: WorkspaceCodec<Model, Change>): WorkspaceResult<Model> {
  if (baseRevision !== state.revision.revision || state.invalidSource !== undefined) return stale(state, baseRevision);
  try { const model = codec.apply(state.revision.model, change); const source = codec.serialize(model); const revision = baseRevision + 1; return { ok: true, state: { revision: { revision, source, model, origin: "canvas", selection: state.revision.selection }, lastValid: { revision, source, model } } }; }
  catch (cause) { const error: Conflict = { code: "SERIALIZATION_FAILED", expectedRevision: baseRevision, receivedRevision: baseRevision, message: cause instanceof Error ? cause.message : "Canvas change could not be serialized." }; return { ok: false, state: { ...state, conflict: error }, error }; }
}
