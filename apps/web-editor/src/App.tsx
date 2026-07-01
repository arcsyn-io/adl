import { parse } from '@adl/parser'
import { createDiagramScene, type EntityView } from '@adl/renderer'
import { buildSemanticModel } from '@adl/semantic'
import { useState } from 'react'

const source = `adl version "1.0" diagram {
  element api { name "API" type "service" }
  element db { name "Database" type "database" }
  relation writes { source api target db name "writes" }
  group backend { name "Backend" elements [api, db] }
}`
const parsed = parse(source)
if (!parsed.ok) throw new Error('Invalid renderer fixture')
const semantic = buildSemanticModel(parsed.document)
if (!semantic.ok) throw new Error('Invalid renderer model')
const model = semantic.model
const geometry = { entities: { api: { x: 80, y: 100, width: 180, height: 84 }, db: { x: 390, y: 100, width: 180, height: 84 }, backend: { x: 45, y: 55, width: 560, height: 175 } } }

function center(entity: EntityView) {
  if (entity.kind === 'relation') return { x: 0, y: 0 }
  return { x: entity.geometry.x + entity.geometry.width / 2, y: entity.geometry.y + entity.geometry.height / 2 }
}

export function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const result = createDiagramScene({ model, geometry, state: { selectedId, focusedId } })
  if (!result.ok) return <main><p>Diagrama indisponível.</p></main>
  const elements = result.scene.entities.filter(entity => entity.kind === 'element')
  const groups = result.scene.entities.filter(entity => entity.kind === 'group')
  const relations = result.scene.entities.filter(entity => entity.kind === 'relation')
  const byId = new Map(elements.map(entity => [entity.identity.value, entity]))
  return <main className="diagram-shell"><header><span className="eyebrow">ADL</span><h1>Architecture diagram</h1></header>
    <svg className="diagram" viewBox="0 0 650 280" role="img" aria-label={result.scene.textAlternative}>
      {groups.map(group => <rect key={group.identity.value} className="group" {...group.geometry}><title>{group.ariaLabel}</title></rect>)}
      {relations.map(relation => { const sourceView=byId.get(relation.sourceId)!; const targetView=byId.get(relation.targetId)!; const a=center(sourceView);const b=center(targetView);return <g key={relation.identity.value} aria-label={relation.ariaLabel}><line className="relation" x1={a.x} y1={a.y} x2={b.x} y2={b.y}/><text x={(a.x+b.x)/2} y={a.y-12}>{relation.label}</text></g> })}
      {elements.map(element => <g key={element.identity.value} role="button" tabIndex={0} aria-label={element.ariaLabel} data-state={element.state} onClick={()=>setSelectedId(element.identity.value)} onFocus={()=>setFocusedId(element.identity.value)} onBlur={()=>setFocusedId(null)}><rect className="element" {...element.geometry}/><text x={element.geometry.x+16} y={element.geometry.y+34}>{element.label}</text><text className="type" x={element.geometry.x+16} y={element.geometry.y+58}>{element.type}</text></g>)}
    </svg><p className="inspection" aria-live="polite">{selectedId ? `Selected: ${selectedId}` : 'Select an entity to inspect it.'}</p>
  </main>
}
