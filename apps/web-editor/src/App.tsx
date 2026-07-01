import { emptyPlacementState, moveElement, setPinned } from '@adl/canvas-state'
import { calculateLayout, type LayoutResult } from '@adl/layout'
import { parse } from '@adl/parser'
import { createDiagramScene, type EntityView } from '@adl/renderer'
import { buildSemanticModel, type DiagramModel } from '@adl/semantic'
import { useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { CodeEditor } from './features/code-editor/index.js'
import { fromDiagramModel, toDiagramModel, VisualEditor, type VisualModel } from './features/visual-editor/index.js'

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

function DiagramPreview({ model }: { readonly model: DiagramModel }) {
  const [layout, setLayout] = useState<LayoutResult | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [placements, setPlacements] = useState(emptyPlacementState)
  const [drag, setDrag] = useState<{ readonly id: string; readonly clientX: number; readonly clientY: number; readonly x: number; readonly y: number } | null>(null)
  useEffect(() => { let active = true; void calculateLayout(model).then(result => { if (active && result.ok) setLayout(result.layout) }); return () => { active = false } }, [model])
  if (!layout) return <section className="preview"><h2>Diagrama</h2><p>Calculando layout…</p></section>
  const positionedNodes = Object.fromEntries(Object.entries(layout.nodes).map(([id, geometry]) => { const placement = placements.placements[id]; return [id, placement ? { ...geometry, x: placement.x, y: placement.y } : geometry] }))
  const result = createDiagramScene({ model, geometry: { entities: positionedNodes }, state: { selectedId } })
  if (!result.ok) return <section className="preview"><h2>Diagrama</h2><p>Diagrama indisponível.</p></section>
  const elements = result.scene.entities.filter(entity => entity.kind === 'element'), groups = result.scene.entities.filter(entity => entity.kind === 'group'), relations = result.scene.entities.filter(entity => entity.kind === 'relation'), byId = new Map(elements.map(entity => [entity.identity.value, entity]))
  const boxes = [...elements, ...groups], right = Math.max(...boxes.map(item => item.geometry.x + item.geometry.width), 650), bottom = Math.max(...boxes.map(item => item.geometry.y + item.geometry.height), 280)
  const place = (id: string, x: number, y: number, input: 'pointer' | 'keyboard') => setPlacements(current => setPinned(moveElement(current, id, { x, y }, input), id, true))
  const startDrag = (event: ReactPointerEvent<SVGGElement>, id: string, x: number, y: number) => { event.currentTarget.setPointerCapture(event.pointerId); setSelectedId(id); setDrag({ id, clientX: event.clientX, clientY: event.clientY, x, y }) }
  const continueDrag = (event: ReactPointerEvent<SVGGElement>) => { if (!drag || drag.id !== event.currentTarget.dataset.entityId) return; const svg = event.currentTarget.ownerSVGElement; if (!svg) return; const bounds = svg.getBoundingClientRect(); const viewBox = svg.viewBox.baseVal; place(drag.id, drag.x + (event.clientX - drag.clientX) * viewBox.width / bounds.width, drag.y + (event.clientY - drag.clientY) * viewBox.height / bounds.height, 'pointer') }
  return <section className="preview"><div className="panel-heading"><h2>Diagrama</h2><button type="button" onClick={() => void calculateLayout(model, { direction: 'DOWN' }, layout).then(next => { if (next.ok) setLayout(next.layout) })}>Reorganizar</button></div><svg className="diagram" viewBox={`0 0 ${right + 40} ${bottom + 40}`} role="img" aria-label={result.scene.textAlternative}>{groups.map(group => <rect key={group.identity.value} className="group" {...group.geometry} />)}{relations.map(relation => { const a = center(byId.get(relation.sourceId)!), b = center(byId.get(relation.targetId)!); return <g key={relation.identity.value}><line className="relation" x1={a.x} y1={a.y} x2={b.x} y2={b.y}/><text x={(a.x+b.x)/2} y={(a.y+b.y)/2-10}>{relation.label}</text></g> })}{elements.map(element => <g key={element.identity.value} role="button" tabIndex={0} aria-label={`${element.ariaLabel}. Arraste ou use as setas para mover.`} data-entity-id={element.identity.value} data-state={element.state} onPointerDown={event => startDrag(event, element.identity.value, element.geometry.x, element.geometry.y)} onPointerMove={continueDrag} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)} onClick={() => setSelectedId(element.identity.value)} onKeyDown={event => { const delta = event.shiftKey ? 50 : 10; const directions: Partial<Record<string, readonly [number, number]>> = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] }; const direction = directions[event.key]; if (direction) { event.preventDefault(); place(element.identity.value, element.geometry.x + direction[0], element.geometry.y + direction[1], 'keyboard') } else if (event.key === 'Enter' || event.key === ' ') setSelectedId(element.identity.value) }}><rect className="element" {...element.geometry}/><text x={element.geometry.x+16} y={element.geometry.y+34}>{element.label}</text><text className="type" x={element.geometry.x+16} y={element.geometry.y+58}>{element.type}</text></g>)}</svg><p className="inspection" aria-live="polite">{selectedId ? `Selecionado: ${selectedId}. Arraste ou use as setas para mover.` : 'Selecione uma entidade. Arraste ou use as setas para mover.'}</p></section>
}

export function App() {
  const initialVisualModel = fromDiagramModel(model)
  const [visualModel, setVisualModel] = useState<VisualModel>(initialVisualModel)
  const renderedModel = toDiagramModel(visualModel)
  return <main className="app-shell"><header><span className="eyebrow">ADL workspace</span><h1>Architecture diagram</h1></header><div className="workspace-grid"><CodeEditor initialText={source}/><DiagramPreview model={renderedModel}/><VisualEditor initialModel={initialVisualModel} onModelChange={setVisualModel}/></div></main>
}
