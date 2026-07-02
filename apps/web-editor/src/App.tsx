import { emptyPlacementState, expandContainerToFit, MIN_ELEMENT_HEIGHT, MIN_ELEMENT_WIDTH, moveElement, resizeElement, setPinned, type Box } from '@adl/canvas-state'
import { calculateLayout, type LayoutResult } from '@adl/layout'
import { parse } from '@adl/parser'
import { createDiagramScene, type EntityView } from '@adl/renderer'
import { buildSemanticModel, type DiagramModel } from '@adl/semantic'
import type { Paint, ResolvedDiagramStyles, ResolvedElementStyle, TextStyle } from '@adl/stylesheet'
import { useCallback, useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { CodeEditor, createSourceBinding } from './features/code-editor/index.js'
import { fromDiagramModel, toDiagramModel, VisualEditor, type VisualModel } from './features/visual-editor/index.js'
import { runStylesheetPipeline } from './features/stylesheet/stylesheet-pipeline.js'

const source = `adl version "1.0" diagram {
  element customer { name "Customer" type "user" }
  element database { name "Database" type "data" }
  element api { name "API" type "backend" }
  element web { name "Web application" type "frontend" }
  element partner { name "Partner system" type "black-box" }
  element auth { name "Authentication module" type "part" }

  relation uses { source customer target web name "1. uses application" type "link" }
  relation calls { source web target api name "validates every request" type "always-link" }
  relation extends { source partner target api type "specialization" }
  relation reads { source api target database name "optional data lookup" type "virtual-link" }
  relation contains { source auth target api type "composition" }

  group solution { name "Solution boundary" elements [customer, database, api, web, partner, auth] }
}`
const parsed = parse(source)
if (!parsed.ok) throw new Error('Invalid fixture')
const semantic = buildSemanticModel(parsed.document)
if (!semantic.ok) throw new Error('Invalid model')
const model = semantic.model
type BoxEntity = Exclude<EntityView,{kind:'relation'}>
const center = (entity: BoxEntity) => ({ x: entity.geometry.x + entity.geometry.width / 2, y: entity.geometry.y + entity.geometry.height / 2 })
const boundaryPoint=(from:BoxEntity,to:BoxEntity)=>{const a=center(from),b=center(to),dx=b.x-a.x,dy=b.y-a.y;if(dx===0&&dy===0)return a;const scale=.5/Math.max(Math.abs(dx)/from.geometry.width,Math.abs(dy)/from.geometry.height);return{x:a.x+dx*scale,y:a.y+dy*scale}}
const relationMarkers=(kind:Extract<EntityView,{kind:'relation'}>['connectorKind'])=>({markerStart:kind==='always-link'?'url(#mdl-circle)':undefined,markerEnd:kind==='specialization'?'url(#mdl-specialization)':kind==='composition'?'url(#mdl-composition)':'url(#mdl-arrow)'})
type ResizeCorner = 'nw' | 'ne' | 'sw' | 'se'
type ResizeGesture = { readonly id: string; readonly corner: ResizeCorner; readonly clientX: number; readonly clientY: number; readonly box: Box }
const resizeHandles = [{ corner: 'nw', x: 0, y: 0, label: 'superior esquerdo' }, { corner: 'ne', x: 1, y: 0, label: 'superior direito' }, { corner: 'sw', x: 0, y: 1, label: 'inferior esquerdo' }, { corner: 'se', x: 1, y: 1, label: 'inferior direito' }] as const
const paintValue=(paint:Paint|undefined,fallback:string)=>paint?.kind==='solid'?paint.color:fallback
const textAttributes=(style:TextStyle|undefined)=>{if(!style)return{};const textAnchor:'start'|'end'|'middle'=style.textAlign==='left'?'start':style.textAlign==='right'?'end':'middle';return{fill:paintValue(style.paint,'currentColor'),fontSize:style.fontSize,fontFamily:style.fontFamily.join(', '),fontWeight:style.fontWeight,fontStyle:style.fontStyle,textDecoration:style.textDecoration,textAnchor}}
function ElementShape({geometry,style}:{readonly geometry:Box;readonly style?:ResolvedElementStyle}){const common={fill:paintValue(style?.fill,'white'),stroke:paintValue(style?.borderPaint,'#64748b'),strokeWidth:style?.borderWidth??1,transform:style?.rotation?`rotate(${style.rotation} ${geometry.x+geometry.width/2} ${geometry.y+geometry.height/2})`:undefined};if(style?.shape==='ellipse')return <ellipse className="element" cx={geometry.x+geometry.width/2} cy={geometry.y+geometry.height/2} rx={geometry.width/2} ry={geometry.height/2} {...common}/>;if(style?.shape==='parallelogram'){const skew=Math.min(24,geometry.width/5);return <path className="element" d={`M ${geometry.x+skew} ${geometry.y} H ${geometry.x+geometry.width} L ${geometry.x+geometry.width-skew} ${geometry.y+geometry.height} H ${geometry.x} Z`} {...common}/>};if(style?.shape==='cylinder'){const cap=Math.min(18,geometry.height/4);return <path className="element" d={`M ${geometry.x} ${geometry.y+cap} A ${geometry.width/2} ${cap} 0 0 1 ${geometry.x+geometry.width} ${geometry.y+cap} V ${geometry.y+geometry.height-cap} A ${geometry.width/2} ${cap} 0 0 1 ${geometry.x} ${geometry.y+geometry.height-cap} Z M ${geometry.x} ${geometry.y+cap} A ${geometry.width/2} ${cap} 0 0 0 ${geometry.x+geometry.width} ${geometry.y+cap}`} {...common}/>};if(style?.shape==='user'){const radius=Math.min(18,geometry.height/5),cx=geometry.x+geometry.width/2;return <path className="element" d={`M ${cx-radius} ${geometry.y+radius} A ${radius} ${radius} 0 1 0 ${cx+radius} ${geometry.y+radius} A ${radius} ${radius} 0 1 0 ${cx-radius} ${geometry.y+radius} M ${geometry.x+geometry.width*.2} ${geometry.y+geometry.height} Q ${geometry.x+geometry.width*.2} ${geometry.y+radius*2.5} ${cx} ${geometry.y+radius*2.5} Q ${geometry.x+geometry.width*.8} ${geometry.y+radius*2.5} ${geometry.x+geometry.width*.8} ${geometry.y+geometry.height} Z`} {...common}/>};return <rect className="element" {...geometry} rx={style?.borderRadius} {...common}/>}

function DiagramPreview({ model, styles }: { readonly model: DiagramModel; readonly styles?:ResolvedDiagramStyles }) {
  const [layout, setLayout] = useState<LayoutResult | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [placements, setPlacements] = useState(emptyPlacementState)
  const [drag, setDrag] = useState<{ readonly id: string; readonly clientX: number; readonly clientY: number; readonly x: number; readonly y: number } | null>(null)
  const [resize, setResize] = useState<ResizeGesture | null>(null)
  useEffect(() => { let active = true; const elementStyles=styles?Object.fromEntries(Object.entries(styles.elements).map(([id,style])=>[id,{width:style.width,height:style.height,rotation:style.rotation,...(style.position?{position:style.position}:{})}])):undefined;void calculateLayout(model,{elementStyles}).then(result => { if (active && result.ok) setLayout(result.layout) }); return () => { active = false } }, [model,styles])
  if (!layout) return <section className="preview"><h2>Diagrama</h2><p>Calculando layout…</p></section>
  const positionedNodes = Object.fromEntries(Object.entries(layout.nodes).map(([id, geometry]) => { const placement = placements.placements[id]; return [id, placement ? { ...geometry, x: placement.x, y: placement.y, width: placement.width ?? geometry.width, height: placement.height ?? geometry.height } : geometry] }))
  const result = createDiagramScene({ model, geometry: { entities: positionedNodes }, state: { selectedId }, styles })
  if (!result.ok) return <section className="preview"><h2>Diagrama</h2><p>Diagrama indisponível.</p></section>
  const elements = result.scene.entities.filter(entity => entity.kind === 'element'), groups = result.scene.entities.filter(entity => entity.kind === 'group'), relations = result.scene.entities.filter(entity => entity.kind === 'relation'), byId = new Map(elements.map(entity => [entity.identity.value, entity]))
  const boxes = [...elements, ...groups], right = Math.max(...boxes.map(item => item.geometry.x + item.geometry.width), 650), bottom = Math.max(...boxes.map(item => item.geometry.y + item.geometry.height), 280)
  const place = (id: string, x: number, y: number, input: 'pointer' | 'keyboard') => setPlacements(current => { let next=setPinned(moveElement(current,id,{x,y},input),id,true);const element=elements.find(item=>item.identity.value===id);if(!element)return next;for(const group of groups.filter(item=>item.memberIds.includes(id)))next=expandContainerToFit(next,group.identity.value,group.geometry,{...element.geometry,x,y});return next })
  const startDrag = (event: ReactPointerEvent<SVGGElement>, id: string, x: number, y: number) => { event.currentTarget.setPointerCapture(event.pointerId); setSelectedId(id); setDrag({ id, clientX: event.clientX, clientY: event.clientY, x, y }) }
  const continueDrag = (event: ReactPointerEvent<SVGGElement>) => { if (!drag || drag.id !== event.currentTarget.dataset.entityId) return; const svg = event.currentTarget.ownerSVGElement; if (!svg) return; const bounds = svg.getBoundingClientRect(); const viewBox = svg.viewBox.baseVal; place(drag.id, drag.x + (event.clientX - drag.clientX) * viewBox.width / bounds.width, drag.y + (event.clientY - drag.clientY) * viewBox.height / bounds.height, 'pointer') }
  const startResize = (event: ReactPointerEvent<SVGRectElement>, element: EntityView, corner: ResizeCorner) => { if (element.kind === 'relation') return; event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); setResize({ id: element.identity.value, corner, clientX: event.clientX, clientY: event.clientY, box: element.geometry }) }
  const continueResize = (event: ReactPointerEvent<SVGRectElement>) => { if (!resize) return; event.stopPropagation(); const svg = event.currentTarget.ownerSVGElement; if (!svg) return; const bounds = svg.getBoundingClientRect(); const viewBox = svg.viewBox.baseVal; const dx = (event.clientX - resize.clientX) * viewBox.width / bounds.width, dy = (event.clientY - resize.clientY) * viewBox.height / bounds.height; const west = resize.corner.endsWith('w'), north = resize.corner.startsWith('n'); const width = Math.max(MIN_ELEMENT_WIDTH, resize.box.width + (west ? -dx : dx)), height = Math.max(MIN_ELEMENT_HEIGHT, resize.box.height + (north ? -dy : dy)); setPlacements(current => resizeElement(current, resize.id, { x: west ? resize.box.x + resize.box.width - width : resize.box.x, y: north ? resize.box.y + resize.box.height - height : resize.box.y, width, height })) }
  return <section className="preview"><div className="panel-heading"><h2>Diagrama</h2><button type="button" onClick={() => void calculateLayout(model, { direction: 'DOWN' }, layout).then(next => { if (next.ok) setLayout(next.layout) })}>Reorganizar</button></div><svg className="diagram" viewBox={`0 0 ${right + 40} ${bottom + 40}`} role="img" aria-label={result.scene.textAlternative}>
    <defs><marker id="mdl-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth"><path className="marker-chevron" d="M1 1 L9 5 L1 9"/></marker><marker id="mdl-circle" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth"><circle cx="5" cy="5" r="4"/></marker><marker id="mdl-specialization" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto" markerUnits="strokeWidth"><path className="marker-outline" d="M0 0 L12 6 L0 12 Z"/></marker><marker id="mdl-composition" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto" markerUnits="strokeWidth"><path d="M0 6 L6 0 L12 6 L6 12 Z"/></marker></defs>
    {groups.map(group => <g key={group.identity.value} role="button" tabIndex={0} aria-label={`${group.ariaLabel}. Selecione para redimensionar.`} data-state={group.state} onClick={() => setSelectedId(group.identity.value)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setSelectedId(group.identity.value) }}>
      <rect className="group" {...group.geometry}/>
      <text className="group-label" x={group.geometry.x+16} y={group.geometry.y+28}>{group.label}</text>
      {selectedId === group.identity.value && resizeHandles.map(handle => <rect key={handle.corner} className={`resize-handle resize-${handle.corner}`} role="slider" tabIndex={0} aria-label={`Redimensionar ${group.label} pelo canto ${handle.label}`} aria-valuemin={handle.x ? MIN_ELEMENT_WIDTH : MIN_ELEMENT_HEIGHT} aria-valuenow={handle.x ? group.geometry.width : group.geometry.height} x={group.geometry.x + handle.x * group.geometry.width - 6} y={group.geometry.y + handle.y * group.geometry.height - 6} width={12} height={12} onPointerDown={event => startResize(event, group, handle.corner)} onPointerMove={continueResize} onPointerUp={() => setResize(null)} onPointerCancel={() => setResize(null)}/>) }
    </g>)}
    {relations.map(relation => { const source=byId.get(relation.sourceId)!,target=byId.get(relation.targetId)!,a=boundaryPoint(source,target),b=boundaryPoint(target,source); return <g key={relation.identity.value} data-relation-id={relation.identity.value} data-connector-kind={relation.connectorKind}><line className={`relation relation-${relation.connectorKind}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={paintValue(relation.style?.linePaint,'#64748b')} strokeWidth={relation.style?.lineWidth} {...relationMarkers(relation.connectorKind)}/><text x={(a.x+b.x)/2} y={(a.y+b.y)/2-10} {...textAttributes(relation.style?.text)}>{relation.label}</text></g> })}
    {elements.map(element => <g key={element.identity.value} role="button" tabIndex={0} aria-label={`${element.ariaLabel}. Arraste ou use as setas para mover.`} data-entity-id={element.identity.value} data-state={element.state} onPointerDown={event => startDrag(event, element.identity.value, element.geometry.x, element.geometry.y)} onPointerMove={continueDrag} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)} onClick={() => setSelectedId(element.identity.value)} onKeyDown={event => { const delta = event.shiftKey ? 50 : 10; const directions: Partial<Record<string, readonly [number, number]>> = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] }; const direction = directions[event.key]; if (direction) { event.preventDefault(); place(element.identity.value, element.geometry.x + direction[0], element.geometry.y + direction[1], 'keyboard') } else if (event.key === 'Enter' || event.key === ' ') setSelectedId(element.identity.value) }}>
      <ElementShape geometry={element.geometry} style={element.style}/><text x={element.geometry.x+element.geometry.width/2} y={element.geometry.y+34} {...textAttributes(element.style?.text)}>{element.label}</text><text className="type" x={element.geometry.x+element.geometry.width/2} y={element.geometry.y+58} {...textAttributes(element.style?.text)}>{element.type}</text>
      {selectedId === element.identity.value && resizeHandles.map(handle => <rect key={handle.corner} className={`resize-handle resize-${handle.corner}`} role="slider" tabIndex={0} aria-label={`Redimensionar ${element.label} pelo canto ${handle.label}`} aria-valuemin={handle.x ? MIN_ELEMENT_WIDTH : MIN_ELEMENT_HEIGHT} aria-valuenow={handle.x ? element.geometry.width : element.geometry.height} x={element.geometry.x + handle.x * element.geometry.width - 6} y={element.geometry.y + handle.y * element.geometry.height - 6} width={12} height={12} onPointerDown={event => startResize(event, element, handle.corner)} onPointerMove={continueResize} onPointerUp={() => setResize(null)} onPointerCancel={() => setResize(null)}/>) }
    </g>)}
  </svg><p className="inspection" aria-live="polite">{selectedId ? `Selecionado: ${selectedId}. Arraste para mover ou use as alças nos cantos para redimensionar.` : 'Selecione uma entidade. Arraste ou use as setas para mover.'}</p></section>
}

export function App() {
  const initialVisualModel = fromDiagramModel(model)
  const [visualModel, setVisualModel] = useState<VisualModel>(initialVisualModel)
  const [sourceRevision, setSourceRevision] = useState(0)
  const [resolvedStyles, setResolvedStyles] = useState<ResolvedDiagramStyles|undefined>()
  const sourceBinding = useMemo(() => createSourceBinding(nextModel => { setVisualModel(fromDiagramModel(nextModel)); setSourceRevision(current => current + 1) }, 30), [])
  useEffect(() => () => sourceBinding.dispose(), [sourceBinding])
  const handleSourceChange = useCallback((nextSource: string) => {sourceBinding.schedule(nextSource);void runStylesheetPipeline({adlText:nextSource,adlUri:'memory:/editor.adl'}).then(result=>{if(result.ok)setResolvedStyles(result.styles)})}, [sourceBinding])
  const renderedModel = toDiagramModel(visualModel)
  return <main className="app-shell"><header><span className="eyebrow">ADL workspace</span><h1>Architecture diagram</h1></header><div className="workspace-grid"><CodeEditor initialText={source} onChange={handleSourceChange}/><DiagramPreview model={renderedModel} styles={resolvedStyles}/><VisualEditor key={sourceRevision} initialModel={visualModel} onModelChange={setVisualModel}/></div></main>
}
