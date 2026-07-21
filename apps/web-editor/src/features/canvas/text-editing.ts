import type { DiagramModel } from '@adl/semantic'

export type EditableEntityText =
  | { readonly kind: 'element' | 'group'; readonly entityId: string; readonly text: string }
  | { readonly kind: 'relation'; readonly entityId: string; readonly text: string | null }

export function findEditableEntityText(model: DiagramModel, entityId: string): EditableEntityText | null {
  const element = model.elements.find(candidate => candidate.identity.value === entityId)
  if (element) return { kind: 'element', entityId, text: element.name }

  const relation = model.relations.find(candidate => candidate.identity.value === entityId)
  if (relation) return { kind: 'relation', entityId, text: relation.name }

  const group = model.groups.find(candidate => candidate.identity.value === entityId)
  return group ? { kind: 'group', entityId, text: group.name } : null
}

export function applyEditableEntityText(model: DiagramModel, change: EditableEntityText): DiagramModel {
  const text = change.text?.trim() || null
  if (change.kind === 'element') {
    if (!text) return model
    const elements = model.elements.map(element => element.identity.value === change.entityId && element.name !== text ? { ...element, name: text } : element)
    return elements.some((element, index) => element !== model.elements[index]) ? { ...model, elements } : model
  }
  if (change.kind === 'group') {
    if (!text) return model
    const groups = model.groups.map(group => group.identity.value === change.entityId && group.name !== text ? { ...group, name: text } : group)
    return groups.some((group, index) => group !== model.groups[index]) ? { ...model, groups } : model
  }
  const relations = model.relations.map(relation => relation.identity.value === change.entityId && relation.name !== text ? { ...relation, name: text } : relation)
  return relations.some((relation, index) => relation !== model.relations[index]) ? { ...model, relations } : model
}
