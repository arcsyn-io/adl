import { commitTransaction, createHistory, redo, undo, validateCommandRevision, type CommandHistory, type CommandResult, type WorkspaceCommand, type WorkspaceTransaction } from "@adl/workspace";

export interface SourceState { readonly text: string; readonly validText: string; readonly validRevision: number; readonly status: "valid" | "invalid"; readonly diagnostics: readonly string[] }
export interface WorkspaceSnapshot { readonly revision: number; readonly name: string; readonly adl: SourceState; readonly adls: SourceState; readonly placements: Readonly<Record<string, unknown>>; readonly conversation: readonly string[] }
type Listener = (snapshot: WorkspaceSnapshot) => void;

export class WorkspaceController {
  #snapshot: WorkspaceSnapshot; #history: CommandHistory<WorkspaceSnapshot> = createHistory(); readonly #listeners = new Set<Listener>();
  constructor(snapshot: WorkspaceSnapshot) { this.#snapshot = snapshot; }
  getSnapshot(): WorkspaceSnapshot { return this.#snapshot; }
  subscribe(listener: Listener): () => void { this.#listeners.add(listener); return () => this.#listeners.delete(listener); }
  #publish(): void { for (const listener of this.#listeners) listener(this.#snapshot); }
  dispatch(command: WorkspaceCommand): CommandResult { const stale = validateCommandRevision(command, this.#snapshot.revision); if (stale) return stale; const before = this.#snapshot; let after = before;
    if (command.type === "workspace.rename") { const name = (command.payload as { name: string }).name; if (name !== before.name) after = { ...before, name, revision: before.revision + 1 }; }
    else if (command.type === "source.replace-adl" || command.type === "source.replace-adls") { const key = command.type.endsWith("adl") ? "adl" : "adls"; const text = (command.payload as { text: string }).text; if (text !== before[key].text) after = { ...before, revision: before.revision + 1, [key]: { text, validText: text, validRevision: before.revision + 1, status: "valid", diagnostics: [] } }; }
    else if (command.type === "workspace.reset") after = { ...before, revision: before.revision + 1, name: "Untitled diagram", adl: { text: "", validText: "", validRevision: before.revision + 1, status: "valid", diagnostics: [] }, adls: { text: "", validText: "", validRevision: before.revision + 1, status: "valid", diagnostics: [] }, placements: {}, conversation: [] };
    if (after === before) return { ok: true, revision: before.revision, changed: false };
    const transaction: WorkspaceTransaction<WorkspaceSnapshot> = { id: command.id, origin: command.origin, description: command.type, before, after, createdAt: Date.now() }; this.#history = commitTransaction(this.#history, transaction); this.#snapshot = after; this.#publish(); return { ok: true, revision: after.revision, changed: true, transactionId: transaction.id }; }
  undo(): CommandResult { const result = undo(this.#history); if (!result) return { ok: true, revision: this.#snapshot.revision, changed: false }; this.#history = result.history; this.#snapshot = result.snapshot; this.#publish(); return { ok: true, revision: this.#snapshot.revision, changed: true }; }
  redo(): CommandResult { const result = redo(this.#history); if (!result) return { ok: true, revision: this.#snapshot.revision, changed: false }; this.#history = result.history; this.#snapshot = result.snapshot; this.#publish(); return { ok: true, revision: this.#snapshot.revision, changed: true }; }
  get history(): { canUndo: boolean; canRedo: boolean } { return { canUndo: this.#history.past.length > 0, canRedo: this.#history.future.length > 0 }; }
}
