import type { DiagramModel, Provenance, ResolvedReference, SemanticIdentity } from '@adl/semantic'
import { MDL_CONNECTOR_TYPES, type MdlConnectorType, type VisualModel } from './commands.js'

const range = { start: { offset: 0, line: 1, column: 1 }, end: { offset: 0, line: 1, column: 1 } } as const
const provenance = (syntaxKind: Provenance['syntaxKind']): Provenance => ({ syntaxKind, range })
const identity = (kind: SemanticIdentity['kind'], value: string): SemanticIdentity => ({ kind, value })
const connectorType=(value:string|null):MdlConnectorType=>MDL_CONNECTOR_TYPES.includes(value as MdlConnectorType)?value as MdlConnectorType:'link'

export function fromDiagramModel(model: DiagramModel): VisualModel {
  return {
    elements: Object.fromEntries(model.elements.map(element => [element.identity.value, { id: element.identity.value, name: element.name, type: element.type, ...(element.description ? { description: element.description } : {}) }])),
    relations: Object.fromEntries(model.relations.map(relation => [relation.identity.value, { id: relation.identity.value, sourceId: relation.source.identity.value, targetId: relation.target.identity.value, type: connectorType(relation.type), ...(relation.name ? { name: relation.name } : {}) }])),
    groups: Object.fromEntries(model.groups.map(group => [group.identity.value, { id: group.identity.value, name: group.name, memberIds: group.members.map(member => member.identity.value) }])),
    selection: [],
  }
}

export function toDiagramModel(model: VisualModel): DiagramModel {
  const reference = (value: string): ResolvedReference => ({ identity: identity('element', value), provenance: provenance('Element') })
  return {
    version: '1.0',
    elements: Object.values(model.elements).map(element => ({ identity: identity('element', element.id), name: element.name, type: element.type, description: element.description ?? null, properties: {}, provenance: provenance('Element') })),
    relations: Object.values(model.relations).map(relation => ({ identity: identity('relation', relation.id), source: reference(relation.sourceId), target: reference(relation.targetId), name: relation.name ?? null, type: relation.type, description: null, properties: {}, provenance: provenance('Relation') })),
    groups: Object.values(model.groups).map(group => ({ identity: identity('group', group.id), name: group.name, description: null, members: group.memberIds.map(reference), properties: {}, provenance: provenance('Group') })),
    provenance: provenance('Document'),
  }
}
