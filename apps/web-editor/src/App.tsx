import { calculateLayout, type LayoutResult } from '@adl/layout'
import { parse } from '@adl/parser'
import { createDiagramScene, type EntityView } from '@adl/renderer'
import { buildSemanticModel } from '@adl/semantic'
import { useEffect, useState } from 'react'
import { CodeEditor } from './features/code-editor/index.js'
import { VisualEditor } from './features/visual-editor/index.js'

const source = `adl version "1.0" diagram {
  element api { name "API" type "service" }
  element db { name "Database" type "database" }
  relation writes { source api target db name "writes" }
  group backend { name "Backend" elements [api, db] }
}`
const parsed = parse(source)
if (!parsed.ok) throw new Error('Invalid fixture')
const semantic = buildSemanticModel(parsed.document)
if (!semantic.ok) throw new Error('Invalid model')
const model = semantic.model
const center = (entity: EntityView) => entity.kind === 'relation' ? { x: 0, y: 0 } : { x: entity.geometry.x + entity.geometry.width / 2, y: entity.geometry.y + entity.geometry.height / 2 }

function DiagramPreview() {
  const [layout, setLayout] = useState<LayoutResult | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  useEffect(() => { let active = true; void calculateLayout(model).then(result => { if (active && result.ok) setLayout(result.layout) }); return () => { active = false } }, [])
  if (!layout) return <section className="preview"><h2>Diagrama</h2><p>Calculando layout…</p></section>
  const result = createDiagramScene({ model, geometry: { entities: layout.nodes }, state: { selectedId } })
  if (!result.ok) return <section className="preview"><h2>Diagrama</h2><p>Diagrama indisponível.</p></section>
  const elements = result.scene.entities.filter(entity => entity.kind === 'element'), groups = result.scene.entities.filter(entity => entity.kind === 'group'), relations = result.scene.entities.filter(entity => entity.kind === 'relation'), byId = new Map(elements.map(entity => [entity.identity.value, entity]))
  const boxes = [...elements, ...groups], right = Math.max(...boxes.map(item => item.geometry.x + item.geometry.width), 650), bottom = Math.max(...boxes.map(item => item.geometry.y + item.geometry.height), 280)
  return <section className="preview"><div className="panel-heading"><h2>Diagrama</h2><button type="button" onClick={() => void calculateLayout(model, { direction: 'DOWN' }, layout).then(next => { if (next.ok) setLayout(next.layout) })}>Reorganizar</button></div><svg className="diagram" viewBox={`0 0 ${right + 40} ${bottom + 40}`} role="img" aria-label={result.scene.textAlternative}>{groups.map(group => <rect key={group.identity.value} className="group" {...group.geometry} />)}{relations.map(relation => { const a = center(byId.get(relation.sourceId)!), b = center(byId.get(relation.targetId)!); return <g key={relation.identity.value}><line className="relation" x1={a.x} y1={a.y} x2={b.x} y2={b.y}/><text x={(a.x+b.x)/2} y={(a.y+b.y)/2-10}>{relation.label}</text></g> })}{elements.map(element => <g key={element.identity.value} role="button" tabIndex={0} aria-label={element.ariaLabel} data-state={element.state} onClick={() => setSelectedId(element.identity.value)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setSelectedId(element.identity.value) }}><rect className="element" {...element.geometry}/><text x={element.geometry.x+16} y={element.geometry.y+34}>{element.label}</text><text className="type" x={element.geometry.x+16} y={element.geometry.y+58}>{element.type}</text></g>)}</svg><p className="inspection" aria-live="polite">{selectedId ? `Selected: ${selectedId}` : 'Select an entity to inspect it.'}</p></section>
}

export function App() { return <main className="app-shell"><header><span className="eyebrow">ADL workspace</span><h1>Architecture diagram</h1></header><div className="workspace-grid"><CodeEditor initialText={source}/><DiagramPreview/><VisualEditor/></div></main> }
