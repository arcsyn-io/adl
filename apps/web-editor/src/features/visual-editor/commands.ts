export interface VisualElement { readonly id: string; readonly name: string; readonly type: string; readonly description?: string }
export interface VisualRelation { readonly id: string; readonly sourceId: string; readonly targetId: string; readonly name?: string }
export interface VisualGroup { readonly id: string; readonly name: string; readonly memberIds: readonly string[] }
export interface VisualModel { readonly elements: Readonly<Record<string, VisualElement>>; readonly relations: Readonly<Record<string, VisualRelation>>; readonly groups: Readonly<Record<string, VisualGroup>>; readonly selection: readonly string[] }
export interface VisualHistory { readonly past: readonly VisualModel[]; readonly present: VisualModel; readonly future: readonly VisualModel[] }
export type VisualCommand =
  | { readonly type: "create-element"; readonly id: string; readonly name: string; readonly elementType: string }
  | { readonly type: "create-relation"; readonly id: string; readonly sourceId: string; readonly targetId: string; readonly name?: string }
  | { readonly type: "create-group"; readonly id: string; readonly name: string; readonly memberIds: readonly string[] }
  | { readonly type: "update-element"; readonly id: string; readonly name: string; readonly elementType: string }
  | { readonly type: "select"; readonly ids: readonly string[] }
  | { readonly type: "remove-entity"; readonly id: string; readonly cascade: boolean };
export interface VisualError { readonly code: "INVALID_DRAFT" | "DUPLICATE_ID" | "UNRESOLVED_REFERENCE" | "UNKNOWN_ENTITY" | "DEPENDENT_RELATIONS"; readonly message: string; readonly dependentIds?: readonly string[] }
export type VisualCommandResult = { readonly ok: true; readonly history: VisualHistory } | { readonly ok: false; readonly error: VisualError; readonly history: VisualHistory };

const freeze = <T>(value: T): T => { if (value !== null && typeof value === "object" && !Object.isFrozen(value)) { Object.freeze(value); for (const child of Object.values(value)) freeze(child); } return value; };
const empty = (): VisualModel => ({ elements: {}, relations: {}, groups: {}, selection: [] });
const exists = (model: VisualModel, id: string): boolean => id in model.elements || id in model.relations || id in model.groups;
const validId = (id: string): boolean => /^[A-Za-z_][A-Za-z0-9_-]*$/.test(id);
const fail = (history: VisualHistory, code: VisualError["code"], message: string, dependentIds?: readonly string[]): VisualCommandResult => freeze({ ok: false, error: { code, message, ...(dependentIds ? { dependentIds } : {}) }, history });
const commit = (history: VisualHistory, present: VisualModel): VisualCommandResult => freeze({ ok: true, history: { past: [...history.past, history.present], present, future: [] } });

export function createVisualHistory(initial: VisualModel = empty()): VisualHistory { return freeze({ past: [], present: initial, future: [] }); }

export function dispatchVisualCommand(history: VisualHistory, command: VisualCommand): VisualCommandResult {
  const model = history.present;
  if (command.type === "select") {
    const unknown = command.ids.find(id => !exists(model, id));
    if (unknown) return fail(history, "UNKNOWN_ENTITY", `A entidade "${unknown}" não existe.`);
    return commit(history, { ...model, selection: [...new Set(command.ids)] });
  }
  if (!validId(command.id)) return fail(history, "INVALID_DRAFT", "O identificador deve começar com letra ou sublinhado e conter apenas caracteres seguros.");
  if (command.type.startsWith("create-") && exists(model, command.id)) return fail(history, "DUPLICATE_ID", `O identificador "${command.id}" já existe.`);
  if (command.type === "create-element") {
    if (!command.name.trim() || !command.elementType.trim()) return fail(history, "INVALID_DRAFT", "Nome e tipo são obrigatórios.");
    return commit(history, { ...model, elements: { ...model.elements, [command.id]: { id: command.id, name: command.name.trim(), type: command.elementType.trim() } } });
  }
  if (command.type === "update-element") {
    if (!model.elements[command.id]) return fail(history, "UNKNOWN_ENTITY", `O elemento "${command.id}" não existe.`);
    if (!command.name.trim() || !command.elementType.trim()) return fail(history, "INVALID_DRAFT", "Nome e tipo são obrigatórios.");
    return commit(history, { ...model, elements: { ...model.elements, [command.id]: { ...model.elements[command.id], name: command.name.trim(), type: command.elementType.trim() } } });
  }
  if (command.type === "create-relation") {
    if (!model.elements[command.sourceId] || !model.elements[command.targetId]) return fail(history, "UNRESOLVED_REFERENCE", "Origem e destino devem apontar para elementos existentes.");
    return commit(history, { ...model, relations: { ...model.relations, [command.id]: { id: command.id, sourceId: command.sourceId, targetId: command.targetId, ...(command.name ? { name: command.name } : {}) } } });
  }
  if (command.type === "create-group") {
    if (!command.name.trim() || command.memberIds.some(id => !model.elements[id])) return fail(history, "UNRESOLVED_REFERENCE", "O grupo precisa de nome e membros existentes.");
    return commit(history, { ...model, groups: { ...model.groups, [command.id]: { id: command.id, name: command.name.trim(), memberIds: [...new Set(command.memberIds)] } } });
  }
  if (!exists(model, command.id)) return fail(history, "UNKNOWN_ENTITY", `A entidade "${command.id}" não existe.`);
  const dependentIds = Object.values(model.relations).filter(relation => relation.sourceId === command.id || relation.targetId === command.id).map(relation => relation.id).sort();
  if (dependentIds.length && !command.cascade) return fail(history, "DEPENDENT_RELATIONS", "A remoção afeta relações dependentes e exige confirmação explícita.", dependentIds);
  const elements = { ...model.elements }, relations = { ...model.relations }, groups = { ...model.groups };
  delete elements[command.id]; delete relations[command.id]; delete groups[command.id];
  for (const id of dependentIds) delete relations[id];
  for (const [id, group] of Object.entries(groups)) groups[id] = { ...group, memberIds: group.memberIds.filter(memberId => memberId !== command.id) };
  return commit(history, { elements, relations, groups, selection: model.selection.filter(id => id !== command.id && !dependentIds.includes(id)) });
}

export function undoVisualCommand(history: VisualHistory): VisualHistory { const previous = history.past.at(-1); return previous ? freeze({ past: history.past.slice(0,-1), present: previous, future: [history.present, ...history.future] }) : history; }
export function redoVisualCommand(history: VisualHistory): VisualHistory { const next = history.future[0]; return next ? freeze({ past: [...history.past, history.present], present: next, future: history.future.slice(1) }) : history; }
