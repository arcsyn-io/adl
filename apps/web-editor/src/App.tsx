import { emptyPlacementState, expandContainerToFit, findAlignmentGuides, MIN_ELEMENT_HEIGHT, MIN_ELEMENT_WIDTH, moveElement, resizeElement, setPinned, snapPoint, type AlignmentGuide, type Box, type Point } from '@adl/canvas-state'
import { calculateLayout, type LayoutResult } from '@adl/layout'
import { parse } from '@adl/parser'
import { createDiagramScene, type EntityView } from '@adl/renderer'
import { serializeModel } from '@adl/serializer'
import { buildSemanticModel, type DiagramModel } from '@adl/semantic'
import { updateElementRule, updateGroupRule, updateRelationRule, type Paint, type ResolvedDiagramStyles, type ResolvedElementStyle, type TextStyle, type TextStylePatch } from '@adl/stylesheet'
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { EditorTabs, createSourceBinding } from './features/code-editor/index.js'
import { createLocalDiagramProvider, createOllamaDiagramProvider, DEFAULT_OLLAMA_CONFIG } from './features/assistant/index.js'
import { elementIdsIntersectingArea, groupIdsIntersectingArea, relationIdsIntersectingArea, selectionArea } from './features/canvas/area-selection.js'
import { constrainDrag, dragAxisForDelta } from './features/canvas/drag-constraint.js'
import { composeDiagramGeometry } from './features/canvas/diagram-geometry.js'
import { relationLabelPosition, relationPath, relationRoute } from './features/canvas/relation-routing.js'
import { DIAGRAM_GRID_SIZE, resizeBox, resizeEdgeHitArea, type ResizeEdge, type ResizeHandle } from './features/canvas/resize-geometry.js'
import { applyEditableEntityText, findEditableEntityText, type EditableEntityText } from './features/canvas/text-editing.js'
import { decreaseZoom, increaseZoom, zoomedViewBox } from './features/canvas/zoom.js'
import { runStylesheetPipeline } from './features/stylesheet/stylesheet-pipeline.js'
import { fromDiagramModel, toDiagramModel } from './features/visual-editor/model-adapter.js'
import { AssistantConversation, CanvasToolbar, TopBar } from './features/workspace/WorkspaceChrome.js'
import { deriveTextToolbarState } from './features/workspace/text-toolbar-state.js'
import './source-tabs.css'

export const source = `adl version "1.0" diagram {
  element customer { name "Customer" type "user" }
  element database { name "Database" type "data" }
  element api { name "API" type "backend" }
  element web { name "Web application" type "frontend" }
  element partner { name "Partner system" type "black-box" }
  element auth { name "Authentication module" type "part" }
  element queue { name "Message queue" type "queue" }

  relation uses { source customer target web name "1. uses application" type "link" }
  relation calls { source web target api name "validates every request" type "always-link" }
  relation extends { source partner target api type "specialization" }
  relation reads { source api target database name "optional data lookup" type "virtual-link" }
  relation contains { source auth target api type "composition" }

  group solution { name "Solution boundary" elements [customer, database, api, web, partner, auth, queue] }
}`

const appliedStylesheet = `stylesheet version "1.0" {
  element type "backend" {
    shape "ellipse"
  }
  element type "data" { shape "cylinder" orientation "vertical" }
  element type "user" { shape "user" }
  element type "frontend" { shape "parallelogram" }
  element type "black-box" { shape "rectangle" }
  element type "part" { shape "rectangle" }
  element type "queue" { shape "cylinder" orientation "horizontal" }
}`

const parsed = parse(source)
if (!parsed.ok) throw new Error('Invalid fixture')
const semantic = buildSemanticModel(parsed.document)
if (!semantic.ok) throw new Error('Invalid model')
const initialModel = semantic.model

type BoxEntity = Exclude<EntityView, { kind: 'relation' }>
type ResizeGesture = { readonly id: string; readonly handle: ResizeHandle; readonly clientX: number; readonly clientY: number; readonly box: Box }
type DragGesture = { readonly id: string; readonly clientX: number; readonly clientY: number; readonly x: number; readonly y: number }
type AreaSelectionGesture = { readonly start: Point; readonly current: Point; readonly displayStart: Point; readonly displayCurrent: Point; readonly additive: boolean; readonly startedOnSelectable: boolean }
type CanvasPointer = { readonly diagram: Point; readonly display: Point }
type TextEditorState = { readonly target: EditableEntityText; readonly value: string; readonly x: number; readonly y: number; readonly width: number }

const resizeHandles = [
  { handle: 'nw', x: 0, y: 0, label: 'superior esquerdo', axis: 'both', position: 'canto' },
  { handle: 'n', x: 0.5, y: 0, label: 'superior', axis: 'vertical', position: 'lateral' },
  { handle: 'ne', x: 1, y: 0, label: 'superior direito', axis: 'both', position: 'canto' },
  { handle: 'e', x: 1, y: 0.5, label: 'direita', axis: 'horizontal', position: 'lateral' },
  { handle: 'se', x: 1, y: 1, label: 'inferior direito', axis: 'both', position: 'canto' },
  { handle: 's', x: 0.5, y: 1, label: 'inferior', axis: 'vertical', position: 'lateral' },
  { handle: 'sw', x: 0, y: 1, label: 'inferior esquerdo', axis: 'both', position: 'canto' },
  { handle: 'w', x: 0, y: 0.5, label: 'esquerda', axis: 'horizontal', position: 'lateral' },
] as const
const resizeEdges: readonly ResizeEdge[] = ['n', 'e', 's', 'w']

const COPY_OFFSET = 24
const paintValue = (paint: Paint | undefined, fallback: string) => paint?.kind === 'solid' ? paint.color : fallback
const center = (entity: BoxEntity) => ({ x: entity.geometry.x + entity.geometry.width / 2, y: entity.geometry.y + entity.geometry.height / 2 })
const boundaryPoint = (from: BoxEntity, to: BoxEntity) => {
  const a = center(from)
  const b = center(to)
  const dx = b.x - a.x
  const dy = b.y - a.y
  if (dx === 0 && dy === 0) return a
  const scale = 0.5 / Math.max(Math.abs(dx) / from.geometry.width, Math.abs(dy) / from.geometry.height)
  return { x: a.x + dx * scale, y: a.y + dy * scale }
}
const relationMarkers = (kind: Extract<EntityView, { kind: 'relation' }>['connectorKind']) => ({
  markerStart: kind === 'always-link' ? 'url(#mdl-circle)' : undefined,
  markerEnd: kind === 'specialization' ? 'url(#mdl-specialization)' : kind === 'composition' ? 'url(#mdl-composition)' : 'url(#mdl-arrow)',
})
const textAttributes = (style: TextStyle | undefined) => {
  if (!style) return {}
  const textAnchor: 'start' | 'end' | 'middle' = style.textAlign === 'left' ? 'start' : style.textAlign === 'right' ? 'end' : 'middle'
  return {
    fill: paintValue(style.paint, 'currentColor'),
    fontSize: style.fontSize,
    fontFamily: style.fontFamily.join(', '),
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    textAnchor,
    style: {
      fill: paintValue(style.paint, 'currentColor'),
      fontSize: style.fontSize,
      fontFamily: style.fontFamily.join(', '),
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      textDecoration: style.textDecoration,
    },
  }
}
const textX = (geometry: Box, style: TextStyle | undefined) => {
  if (style?.textAlign === 'left') return geometry.x + 16
  if (style?.textAlign === 'right') return geometry.x + geometry.width - 16
  return geometry.x + geometry.width / 2
}
const primarySelection = (ids: readonly string[]) => ids.at(-1) ?? null
const updateSelection = (current: readonly string[], id: string, additive: boolean) => {
  if (!additive) return [id]
  return current.includes(id) ? current.filter(item => item !== id) : [...current, id]
}
const canvasPointer = (svg: SVGSVGElement, clientX: number, clientY: number): CanvasPointer => {
  const bounds = svg.getBoundingClientRect()
  const viewBox = svg.viewBox.baseVal
  if (bounds.width === 0 || bounds.height === 0) return { diagram: { x: viewBox.x, y: viewBox.y }, display: { x: 0, y: 0 } }
  const display = { x: Math.max(0, Math.min(bounds.width, clientX - bounds.left)), y: Math.max(0, Math.min(bounds.height, clientY - bounds.top)) }
  const transform = svg.getScreenCTM()
  if (!transform) return { diagram: { x: viewBox.x + display.x * viewBox.width / bounds.width, y: viewBox.y + display.y * viewBox.height / bounds.height }, display }
  const clientPoint = svg.createSVGPoint()
  clientPoint.x = clientX
  clientPoint.y = clientY
  const diagram = clientPoint.matrixTransform(transform.inverse())
  return { diagram: { x: diagram.x, y: diagram.y }, display }
}

function ElementShape({ geometry, style }: { readonly geometry: Box; readonly style?: ResolvedElementStyle }) {
  const common = {
    fill: paintValue(style?.fill, '#10151c'),
    stroke: paintValue(style?.borderPaint, '#3a4655'),
    strokeWidth: style?.borderWidth ?? 1,
    transform: style?.rotation ? `rotate(${style.rotation} ${geometry.x + geometry.width / 2} ${geometry.y + geometry.height / 2})` : undefined,
  }
  if (style?.shape === 'ellipse') return <ellipse className="element" data-shape="ellipse" cx={geometry.x + geometry.width / 2} cy={geometry.y + geometry.height / 2} rx={geometry.width / 2} ry={geometry.height / 2} {...common} />
  if (style?.shape === 'parallelogram') {
    const skew = Math.min(24, geometry.width / 5)
    return <path className="element" data-shape="parallelogram" d={`M ${geometry.x + skew} ${geometry.y} H ${geometry.x + geometry.width} L ${geometry.x + geometry.width - skew} ${geometry.y + geometry.height} H ${geometry.x} Z`} {...common} />
  }
  if (style?.shape === 'cylinder') {
    if (style.orientation === 'horizontal') {
      const cap = Math.min(18, geometry.width / 4)
      return <path className="element" data-shape="cylinder" data-orientation="horizontal" d={`M ${geometry.x + cap} ${geometry.y} A ${cap} ${geometry.height / 2} 0 0 0 ${geometry.x + cap} ${geometry.y + geometry.height} H ${geometry.x + geometry.width - cap} A ${cap} ${geometry.height / 2} 0 0 0 ${geometry.x + geometry.width - cap} ${geometry.y} Z M ${geometry.x + cap} ${geometry.y} A ${cap} ${geometry.height / 2} 0 0 1 ${geometry.x + cap} ${geometry.y + geometry.height}`} {...common} />
    }
    const cap = Math.min(18, geometry.height / 4)
    return <path className="element" data-shape="cylinder" data-orientation="vertical" d={`M ${geometry.x} ${geometry.y + cap} A ${geometry.width / 2} ${cap} 0 0 1 ${geometry.x + geometry.width} ${geometry.y + cap} V ${geometry.y + geometry.height - cap} A ${geometry.width / 2} ${cap} 0 0 1 ${geometry.x} ${geometry.y + geometry.height - cap} Z M ${geometry.x} ${geometry.y + cap} A ${geometry.width / 2} ${cap} 0 0 0 ${geometry.x + geometry.width} ${geometry.y + cap}`} {...common} />
  }
  if (style?.shape === 'user') {
    const radius = Math.min(18, geometry.height / 5)
    const cx = geometry.x + geometry.width / 2
    return <path className="element" data-shape="user" d={`M ${cx - radius} ${geometry.y + radius} A ${radius} ${radius} 0 1 0 ${cx + radius} ${geometry.y + radius} A ${radius} ${radius} 0 1 0 ${cx - radius} ${geometry.y + radius} M ${geometry.x + geometry.width * 0.2} ${geometry.y + geometry.height} Q ${geometry.x + geometry.width * 0.2} ${geometry.y + radius * 2.5} ${cx} ${geometry.y + radius * 2.5} Q ${geometry.x + geometry.width * 0.8} ${geometry.y + radius * 2.5} ${geometry.x + geometry.width * 0.8} ${geometry.y + geometry.height} Z`} {...common} />
  }
  return <rect className="element" data-shape="rectangle" {...geometry} rx={style?.borderRadius} {...common} />
}

function DiagramPreview({ model, styles, selectedIds, optimisticGeometry, onSelectionChange, onAreaSelectionChange, onEntityTextChange, onElementGeometryChange, onVisibleGeometryChange }: {
  readonly model: DiagramModel
  readonly styles?: ResolvedDiagramStyles
  readonly selectedIds: readonly string[]
  readonly optimisticGeometry: Readonly<Record<string, Box>>
  readonly onSelectionChange: (id: string, additive: boolean) => void
  readonly onAreaSelectionChange: (ids: readonly string[], additive: boolean) => void
  readonly onEntityTextChange?: (change: EditableEntityText) => void
  readonly onElementGeometryChange?: (id: string, geometry: Box) => void
  readonly onVisibleGeometryChange?: (geometry: Readonly<Record<string, Box>>) => void
}) {
  const [layout, setLayout] = useState<LayoutResult | null>(null)
  const [placements, setPlacements] = useState(emptyPlacementState)
  const placementsRef = useRef(emptyPlacementState())
  const [drag, setDrag] = useState<DragGesture | null>(null)
  const [alignmentGuides, setAlignmentGuides] = useState<readonly AlignmentGuide[]>([])
  const [resize, setResize] = useState<ResizeGesture | null>(null)
  const [areaSelection, setAreaSelection] = useState<AreaSelectionGesture | null>(null)
  const [textEditor, setTextEditor] = useState<TextEditorState | null>(null)
  const [zoom, setZoom] = useState(1)
  const marqueeCompleted = useRef(false)
  const textEditFinished = useRef(false)

  useEffect(() => {
    let active = true
    const elementStyles = styles ? Object.fromEntries(Object.entries(styles.elements).map(([id, style]) => [id, { width: style.width, height: style.height, rotation: style.rotation, ...(style.position ? { position: style.position } : {}) }])) : undefined
    void calculateLayout(model, { elementStyles }).then(result => { if (active && result.ok) setLayout(result.layout) })
    return () => { active = false }
  }, [model, styles])

  const positionedNodes = layout ? composeDiagramGeometry({ model, layout, placements, optimisticGeometry, styles }) : null

  useEffect(() => {
    if (positionedNodes) onVisibleGeometryChange?.(positionedNodes)
  }, [onVisibleGeometryChange, positionedNodes])

  if (!layout || !positionedNodes) return <section className="preview" aria-label="Diagrama Payments Flow"><h2 className="sr-only">Diagrama</h2><p>Calculando layout...</p></section>
  const selectedId = primarySelection(selectedIds)
  const result = createDiagramScene({ model, geometry: { entities: positionedNodes }, state: { selectedId }, styles })
  if (!result.ok) return <section className="preview" aria-label="Diagrama Payments Flow"><h2 className="sr-only">Diagrama</h2><p>Diagrama indisponivel.</p></section>

  const elements = result.scene.entities.filter((entity): entity is Extract<EntityView, { kind: 'element' }> => entity.kind === 'element')
  const groups = result.scene.entities.filter((entity): entity is Extract<EntityView, { kind: 'group' }> => entity.kind === 'group')
  const relations = result.scene.entities.filter((entity): entity is Extract<EntityView, { kind: 'relation' }> => entity.kind === 'relation')
  const byId = new Map(elements.map(entity => [entity.identity.value, entity]))
  const boxes = [...elements, ...groups]
  const right = Math.max(...boxes.map(item => item.geometry.x + item.geometry.width), 650)
  const bottom = Math.max(...boxes.map(item => item.geometry.y + item.geometry.height), 280)
  const viewBox = zoomedViewBox({ x: 0, y: 0, width: right + 40, height: bottom + 40 }, zoom)
  const selectionOverlay = areaSelection ? selectionArea(areaSelection.displayStart, areaSelection.displayCurrent) : null
  const relationGeometry = (relation: Extract<EntityView, { kind: 'relation' }>, source: Extract<EntityView, { kind: 'element' }>, target: Extract<EntityView, { kind: 'element' }>) => {
    const start = boundaryPoint(source, target)
    const end = boundaryPoint(target, source)
    const hasManualEndpoint = [source, target].some(entity => placements.placements[entity.identity.value] || optimisticGeometry[entity.identity.value])
    const obstacles = elements.filter(element => element.identity.value !== source.identity.value && element.identity.value !== target.identity.value).map(element => element.geometry)
    const points = relationRoute(hasManualEndpoint ? undefined : layout.edges[relation.identity.value]?.points, start, end, obstacles)
    return { points, path: relationPath(points), label: relationLabelPosition(points, relation.label, obstacles) }
  }
  const updatePlacements = (updater: (current: typeof placements) => typeof placements) => setPlacements(current => {
    const next = updater(current)
    placementsRef.current = next
    return next
  })
  const place = (id: string, x: number, y: number, input: 'pointer' | 'keyboard') => updatePlacements(current => {
    let next = setPinned(moveElement(current, id, { x, y }, input), id, true)
    const element = elements.find(item => item.identity.value === id)
    if (!element) return next
    for (const group of groups.filter(item => item.memberIds.includes(id))) next = expandContainerToFit(next, group.identity.value, group.geometry, { ...element.geometry, x, y })
    return next
  })
  const commitGeometry = (id: string) => {
    const placement = placementsRef.current.placements[id]
    const base = layout.nodes[id]
    if (!placement || !base) return
    onElementGeometryChange?.(id, { x: placement.x, y: placement.y, width: placement.width ?? base.width, height: placement.height ?? base.height })
  }
  const startDrag = (event: ReactPointerEvent<SVGGElement>, id: string, x: number, y: number) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    onSelectionChange(id, event.shiftKey || event.ctrlKey || event.metaKey)
    setAlignmentGuides([])
    setDrag({ id, clientX: event.clientX, clientY: event.clientY, x, y })
  }
  const continueDrag = (event: ReactPointerEvent<SVGGElement>) => {
    if (!drag || drag.id !== event.currentTarget.dataset.entityId) return
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return
    const bounds = svg.getBoundingClientRect()
    const viewBox = svg.viewBox.baseVal
    const raw = {
      x: drag.x + (event.clientX - drag.clientX) * viewBox.width / bounds.width,
      y: drag.y + (event.clientY - drag.clientY) * viewBox.height / bounds.height,
    }
    const axis = event.shiftKey ? dragAxisForDelta({ x: raw.x - drag.x, y: raw.y - drag.y }) : null
    const snapped = snapPoint(raw, DIAGRAM_GRID_SIZE, true)
    const { x, y } = axis ? constrainDrag({ x: drag.x, y: drag.y }, snapped, axis) : snapped
    const active = elements.find(element => element.identity.value === drag.id)
    setAlignmentGuides(active ? findAlignmentGuides({ ...active.geometry, x, y }, elements.filter(element => element.identity.value !== drag.id).map(element => element.geometry)) : [])
    place(drag.id, x, y, 'pointer')
  }
  const finishDrag = () => {
    if (drag) commitGeometry(drag.id)
    setAlignmentGuides([])
    setDrag(null)
  }
  const startResize = (event: ReactPointerEvent<SVGRectElement>, element: EntityView, handle: ResizeHandle) => {
    if (element.kind === 'relation') return
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    onSelectionChange(element.identity.value, event.shiftKey || event.ctrlKey || event.metaKey)
    setResize({ id: element.identity.value, handle, clientX: event.clientX, clientY: event.clientY, box: element.geometry })
  }
  const continueResize = (event: ReactPointerEvent<SVGRectElement>) => {
    if (!resize) return
    event.stopPropagation()
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return
    const bounds = svg.getBoundingClientRect()
    const viewBox = svg.viewBox.baseVal
    const dx = (event.clientX - resize.clientX) * viewBox.width / bounds.width
    const dy = (event.clientY - resize.clientY) * viewBox.height / bounds.height
    updatePlacements(current => resizeElement(current, resize.id, resizeBox(resize.box, resize.handle, { x: dx, y: dy })))
  }
  const startAreaSelection = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return
    if (event.target instanceof Element && event.target.closest('[data-entity-id], .resize-handle, .resize-edge-target')) return
    const pointer = canvasPointer(event.currentTarget, event.clientX, event.clientY)
    const startedOnSelectable = event.target instanceof Element && event.target.closest('[data-group-id], [data-relation-id], [data-relation-label-id], [data-relation-hit-id]') !== null
    if (!startedOnSelectable) event.currentTarget.setPointerCapture(event.pointerId)
    setAreaSelection({ start: pointer.diagram, current: pointer.diagram, displayStart: pointer.display, displayCurrent: pointer.display, additive: event.shiftKey || event.ctrlKey || event.metaKey, startedOnSelectable })
  }
  const continueAreaSelection = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!areaSelection) return
    const pointer = canvasPointer(event.currentTarget, event.clientX, event.clientY)
    setAreaSelection(current => current ? { ...current, current: pointer.diagram, displayCurrent: pointer.display } : null)
  }
  const completeAreaSelection = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!areaSelection) return
    const pointer = canvasPointer(event.currentTarget, event.clientX, event.clientY)
    const area = selectionArea(areaSelection.start, pointer.diagram)
    const isMarquee = area.width >= 4 || area.height >= 4
    if (isMarquee) {
      const relationSegments = relations.flatMap(relation => {
        const sourceEntity = byId.get(relation.sourceId)
        const targetEntity = byId.get(relation.targetId)
        if (!sourceEntity || !targetEntity) return []
        const geometry = relationGeometry(relation, sourceEntity, targetEntity)
        return geometry.points.slice(1).map((end, index) => ({ id: relation.identity.value, start: geometry.points[index]!, end }))
      })
      onAreaSelectionChange([
        ...groupIdsIntersectingArea(groups.map(group => ({ id: group.identity.value, geometry: group.geometry })), area),
        ...relationIdsIntersectingArea(relationSegments, area),
        ...elementIdsIntersectingArea(elements.map(element => ({ id: element.identity.value, geometry: element.geometry })), area),
      ], areaSelection.additive)
    } else if (!areaSelection.startedOnSelectable) onAreaSelectionChange([], false)
    marqueeCompleted.current = isMarquee
    setAreaSelection(null)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const preventCompletedMarqueeClick = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (!marqueeCompleted.current) return
    marqueeCompleted.current = false
    event.stopPropagation()
  }
  const reorganize = () => void calculateLayout(model, { direction: 'DOWN' }, layout).then(next => { if (next.ok) setLayout(next.layout) })
  const startTextEditing = (entity: EntityView) => {
    const target = findEditableEntityText(model, entity.identity.value)
    if (!target) return
    textEditFinished.current = false
    if (entity.kind === 'relation') {
      if (target.kind !== 'relation') return
      const source = byId.get(entity.sourceId)
      const destination = byId.get(entity.targetId)
      if (!source || !destination) return
      const geometry = relationGeometry(entity, source, destination)
      setTextEditor({ target, value: target.text ?? '', x: geometry.label.x - 90, y: geometry.label.y - 32, width: 180 })
    } else {
      if (target.kind === 'relation') return
      setTextEditor({ target, value: target.text, x: entity.geometry.x + 8, y: entity.geometry.y + 12, width: Math.max(80, entity.geometry.width - 16) })
    }
    onSelectionChange(entity.identity.value, false)
  }
  const finishTextEditing = (save: boolean, value = textEditor?.value ?? '') => {
    if (!textEditor || textEditFinished.current) return
    textEditFinished.current = true
    if (save) onEntityTextChange?.({ ...textEditor.target, text: value })
    setTextEditor(null)
  }

  return (
    <section className="preview" aria-label="Diagrama Payments Flow">
      <h2 className="sr-only">Diagrama</h2>
      <div className="canvas-meta">Diagrama ADL - {elements.length} elementos</div>
      <svg className="diagram" data-selecting={areaSelection ? 'true' : undefined} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`} role="img" aria-label={result.scene.textAlternative} onPointerDown={startAreaSelection} onPointerMove={continueAreaSelection} onPointerUp={completeAreaSelection} onPointerCancel={() => { marqueeCompleted.current = false; setAreaSelection(null) }} onClickCapture={preventCompletedMarqueeClick}>
        <defs>
          <marker id="mdl-arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth"><path className="marker-chevron" d="M1 1 L9 5 L1 9" /></marker>
          <marker id="mdl-circle" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth"><circle cx="5" cy="5" r="4" /></marker>
          <marker id="mdl-specialization" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto" markerUnits="strokeWidth"><path className="marker-outline" d="M0 0 L12 6 L0 12 Z" /></marker>
          <marker id="mdl-composition" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto" markerUnits="strokeWidth"><path d="M0 6 L6 0 L12 6 L6 12 Z" /></marker>
        </defs>
        {groups.map(group => (
          <g key={group.identity.value} role="button" tabIndex={0} aria-label={`${group.ariaLabel}. Selecione para redimensionar. Clique duas vezes para editar o texto.`} data-group-id={group.identity.value} data-state={selectedIds.includes(group.identity.value) ? 'selected' : group.state} onClick={event => onSelectionChange(group.identity.value, event.shiftKey || event.ctrlKey || event.metaKey)} onDoubleClick={event => { event.stopPropagation(); startTextEditing(group) }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') onSelectionChange(group.identity.value, event.shiftKey || event.ctrlKey || event.metaKey) }}>
            <rect className="group" {...group.geometry} />
            <text className="group-label" x={textX(group.geometry, group.style?.text)} y={group.geometry.y + 28} {...textAttributes(group.style?.text)}>{group.label}</text>
            {selectedId === group.identity.value && resizeEdges.map(edge => <rect key={edge} className={`resize-edge-target resize-${edge}`} data-resize-edge={edge} aria-hidden="true" {...resizeEdgeHitArea(group.geometry, edge)} onPointerDown={event => startResize(event, group, edge)} onPointerMove={continueResize} onPointerUp={() => setResize(null)} onPointerCancel={() => setResize(null)} />)}
            {selectedId === group.identity.value && resizeHandles.map(handle => <rect key={handle.handle} className={`resize-handle resize-${handle.handle}`} role="slider" tabIndex={0} aria-label={`Redimensionar ${group.label} ${handle.position === 'canto' ? 'pelo canto' : 'pela lateral'} ${handle.label}`} aria-valuemin={handle.axis === 'vertical' ? MIN_ELEMENT_HEIGHT : MIN_ELEMENT_WIDTH} aria-valuenow={handle.axis === 'vertical' ? group.geometry.height : group.geometry.width} x={group.geometry.x + handle.x * group.geometry.width - 6} y={group.geometry.y + handle.y * group.geometry.height - 6} width={12} height={12} onPointerDown={event => startResize(event, group, handle.handle)} onPointerMove={continueResize} onPointerUp={() => setResize(null)} onPointerCancel={() => setResize(null)} />)}
          </g>
        ))}
        {relations.map(relation => {
          const sourceEntity = byId.get(relation.sourceId)
          const targetEntity = byId.get(relation.targetId)
          if (!sourceEntity || !targetEntity) return null
          const geometry = relationGeometry(relation, sourceEntity, targetEntity)
          return (
            <g key={relation.identity.value} role="button" tabIndex={0} aria-label={`${relation.ariaLabel}. Selecione ou clique duas vezes para editar o texto.`} data-state={selectedIds.includes(relation.identity.value) ? 'selected' : relation.state} data-relation-id={relation.identity.value} data-connector-kind={relation.connectorKind} onClick={event => onSelectionChange(relation.identity.value, event.shiftKey || event.ctrlKey || event.metaKey)} onDoubleClick={event => { event.stopPropagation(); startTextEditing(relation) }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') onSelectionChange(relation.identity.value, event.shiftKey || event.ctrlKey || event.metaKey) }}>
              <path className={`relation relation-${relation.connectorKind}`} d={geometry.path} stroke={paintValue(relation.style?.linePaint, '#64748b')} strokeWidth={relation.style?.lineWidth} fill="none" {...relationMarkers(relation.connectorKind)} />
            </g>
          )
        })}
        {elements.map(element => (
          <g key={element.identity.value} role="button" tabIndex={0} aria-label={`${element.ariaLabel}. Arraste, use as setas para mover ou clique duas vezes para editar o texto.`} data-entity-id={element.identity.value} data-state={selectedIds.includes(element.identity.value) ? 'selected' : element.state} onPointerDown={event => startDrag(event, element.identity.value, element.geometry.x, element.geometry.y)} onPointerMove={continueDrag} onPointerUp={finishDrag} onPointerCancel={() => { setAlignmentGuides([]); setDrag(null) }} onClick={event => { if (!event.shiftKey && !event.ctrlKey && !event.metaKey) onSelectionChange(element.identity.value, false) }} onDoubleClick={event => { event.stopPropagation(); startTextEditing(element) }} onKeyDown={event => {
            const delta = event.shiftKey ? 50 : 10
            const directions: Partial<Record<string, readonly [number, number]>> = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] }
            const direction = directions[event.key]
            if (direction) {
              event.preventDefault()
              const x = element.geometry.x + direction[0]
              const y = element.geometry.y + direction[1]
              place(element.identity.value, x, y, 'keyboard')
              onElementGeometryChange?.(element.identity.value, { ...element.geometry, x, y })
            } else if (event.key === 'Enter' || event.key === ' ') onSelectionChange(element.identity.value, event.shiftKey || event.ctrlKey || event.metaKey)
          }}>
            <ElementShape geometry={element.geometry} style={element.style} />
            <text x={textX(element.geometry, element.style?.text)} y={element.geometry.y + 34} {...textAttributes(element.style?.text)}>{element.label}</text>
            <text className="type" x={textX(element.geometry, element.style?.text)} y={element.geometry.y + 58} {...textAttributes(element.style?.text)}>{element.type}</text>
            {selectedId === element.identity.value && resizeEdges.map(edge => <rect key={edge} className={`resize-edge-target resize-${edge}`} data-resize-edge={edge} aria-hidden="true" {...resizeEdgeHitArea(element.geometry, edge)} onPointerDown={event => startResize(event, element, edge)} onPointerMove={continueResize} onPointerUp={() => { if (resize) commitGeometry(resize.id); setResize(null) }} onPointerCancel={() => setResize(null)} />)}
            {selectedId === element.identity.value && resizeHandles.map(handle => <rect key={handle.handle} className={`resize-handle resize-${handle.handle}`} role="slider" tabIndex={0} aria-label={`Redimensionar ${element.label} ${handle.position === 'canto' ? 'pelo canto' : 'pela lateral'} ${handle.label}`} aria-valuemin={handle.axis === 'vertical' ? MIN_ELEMENT_HEIGHT : MIN_ELEMENT_WIDTH} aria-valuenow={handle.axis === 'vertical' ? element.geometry.height : element.geometry.width} x={element.geometry.x + handle.x * element.geometry.width - 6} y={element.geometry.y + handle.y * element.geometry.height - 6} width={12} height={12} onPointerDown={event => startResize(event, element, handle.handle)} onPointerMove={continueResize} onPointerUp={() => { if (resize) commitGeometry(resize.id); setResize(null) }} onPointerCancel={() => setResize(null)} />)}
          </g>
        ))}
        {relations.map(relation => {
          const sourceEntity = byId.get(relation.sourceId)
          const targetEntity = byId.get(relation.targetId)
          if (!sourceEntity || !targetEntity) return null
          const geometry = relationGeometry(relation, sourceEntity, targetEntity)
          return <path key={`${relation.identity.value}-hit`} className="relation-hit" data-relation-hit-id={relation.identity.value} d={geometry.path} onClick={event => { event.stopPropagation(); onSelectionChange(relation.identity.value, event.shiftKey || event.ctrlKey || event.metaKey) }} onDoubleClick={event => { event.stopPropagation(); startTextEditing(relation) }} />
        })}
        {relations.map(relation => {
          const sourceEntity = byId.get(relation.sourceId)
          const targetEntity = byId.get(relation.targetId)
          if (!sourceEntity || !targetEntity || relation.label.length === 0) return null
          const geometry = relationGeometry(relation, sourceEntity, targetEntity)
          return <text key={`${relation.identity.value}-label-hit`} className="relation-label relation-label-overlay" x={geometry.label.x} y={geometry.label.y} data-relation-label-id={relation.identity.value} onClick={event => { event.stopPropagation(); onSelectionChange(relation.identity.value, event.shiftKey || event.ctrlKey || event.metaKey) }} onDoubleClick={event => { event.stopPropagation(); startTextEditing(relation) }} {...textAttributes(relation.style?.text)}>{relation.label}</text>
        })}
        {alignmentGuides.map(guide => guide.axis === 'x'
          ? <line key={`${guide.axis}-${guide.value}`} className="alignment-guide" data-alignment-guide="x" x1={guide.value} x2={guide.value} y1={0} y2={bottom + 40} aria-hidden="true" />
          : <line key={`${guide.axis}-${guide.value}`} className="alignment-guide" data-alignment-guide="y" x1={0} x2={right + 40} y1={guide.value} y2={guide.value} aria-hidden="true" />
        )}
        {textEditor && <foreignObject className="inline-text-editor" x={textEditor.x} y={textEditor.y} width={textEditor.width} height={32} onPointerDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()} onDoubleClick={event => event.stopPropagation()}>
          <input aria-label={`Editar texto de ${textEditor.target.entityId}`} autoFocus defaultValue={textEditor.value} placeholder="Adicionar texto" onBlur={event => finishTextEditing(true, event.currentTarget.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); finishTextEditing(true, event.currentTarget.value) } else if (event.key === 'Escape') { event.preventDefault(); finishTextEditing(false) } }} />
        </foreignObject>}
      </svg>
      {selectionOverlay && <div className="selection-area" data-selection-area="true" aria-hidden="true" style={{ left: selectionOverlay.x, top: selectionOverlay.y, width: selectionOverlay.width, height: selectionOverlay.height }} />}
      <p className="inspection" aria-live="polite">{selectedIds.length > 1 ? `${selectedIds.length} entidades selecionadas. Use Shift, Ctrl ou Cmd para ajustar a seleção.` : selectedId ? `Selecionado: ${selectedId}. Arraste para mover ou use as alças dos cantos e laterais para redimensionar.` : 'Selecione uma entidade. Arraste ou use as setas para mover.'}</p>
      <CanvasToolbar onReorganize={reorganize} zoom={zoom} onDecreaseZoom={() => setZoom(decreaseZoom)} onIncreaseZoom={() => setZoom(increaseZoom)} />
    </section>
  )
}

export function App() {
  const [renderedModel, setRenderedModel] = useState<DiagramModel>(initialModel)
  const [resolvedStyles, setResolvedStyles] = useState<ResolvedDiagramStyles | undefined>()
  const [stylesheetSource, setStylesheetSource] = useState(appliedStylesheet)
  const [adlSource, setAdlSource] = useState(source)
  const [adlRevision, setAdlRevision] = useState(0)
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [optimisticGeometry, setOptimisticGeometry] = useState<Readonly<Record<string, Box>>>({})
  const adlText = useRef(source)
  const stylesheetText = useRef(appliedStylesheet)
  const visibleGeometry = useRef<Readonly<Record<string, Box>>>({})
  const sourceBinding = useMemo(() => createSourceBinding(setRenderedModel, 30), [])
  const assistantProviders = useMemo(() => ({
    ollama: createOllamaDiagramProvider({ config: DEFAULT_OLLAMA_CONFIG }),
    demo: createLocalDiagramProvider(),
  }), [])

  useEffect(() => () => sourceBinding.dispose(), [sourceBinding])

  const applyStyles = useCallback((nextAdl: string, nextStylesheet: string) => {
    const document = parse(nextAdl)
    const hasReference = document.ok && document.document.stylesheetReference !== undefined
    const pipelineSource = hasReference ? nextAdl : `stylesheet "./applied.adls"\n${nextAdl}`
    void runStylesheetPipeline({ adlText: pipelineSource, adlUri: 'memory:/editor.adl', loadStylesheet: async () => ({ text: nextStylesheet, uri: 'memory:/applied.adls' }) }).then(result => {
      if (result.ok) setResolvedStyles(result.styles)
    })
  }, [])

  const updateAdlSource = useCallback((nextSource: string) => {
    adlText.current = nextSource
    setAdlSource(nextSource)
    setAdlRevision(current => current + 1)
    sourceBinding.schedule(nextSource)
    applyStyles(nextSource, stylesheetText.current)
  }, [applyStyles, sourceBinding])

  const handleStylesheetChange = useCallback((nextStylesheet: string) => {
    stylesheetText.current = nextStylesheet
    setStylesheetSource(nextStylesheet)
    applyStyles(adlText.current, nextStylesheet)
  }, [applyStyles])

  const handleElementGeometryChange = useCallback((id: string, geometry: Box) => {
    const result = updateElementRule(stylesheetText.current, { elementId: id, ...geometry })
    if (!result.ok) return
    stylesheetText.current = result.text
    setStylesheetSource(result.text)
    applyStyles(adlText.current, result.text)
  }, [applyStyles])

  const handleApplyTextStyle = useCallback((patch: TextStylePatch) => {
    const targetIds = selectedIds.filter(id => resolvedStyles?.elements[id] !== undefined || resolvedStyles?.relations[id] !== undefined || resolvedStyles?.groups[id] !== undefined)
    if (targetIds.length === 0) return
    let nextText = stylesheetText.current
    for (const id of targetIds) {
      const result = resolvedStyles?.relations[id] !== undefined
        ? updateRelationRule(nextText, { relationId: id, text: patch })
        : resolvedStyles?.groups[id] !== undefined
          ? updateGroupRule(nextText, { groupId: id, text: patch })
          : updateElementRule(nextText, { elementId: id, text: patch })
      if (!result.ok) return
      nextText = result.text
    }
    stylesheetText.current = nextText
    setStylesheetSource(nextText)
    applyStyles(adlText.current, nextText)
  }, [applyStyles, resolvedStyles, selectedIds])

  const serializeAndApplyModel = useCallback((nextModel: DiagramModel) => {
    const serialized = serializeModel(nextModel)
    if (!serialized.ok) return
    setRenderedModel(nextModel)
    updateAdlSource(serialized.text)
  }, [updateAdlSource])

  const handleEntityTextChange = useCallback((change: EditableEntityText) => {
    const nextModel = applyEditableEntityText(renderedModel, change)
    if (nextModel !== renderedModel) serializeAndApplyModel(nextModel)
  }, [renderedModel, serializeAndApplyModel])

  const handleCopySelection = useCallback(() => {
    if (selectedIds.length === 0) return
    const visual = fromDiagramModel(renderedModel)
    const elements = { ...visual.elements }
    const relations = { ...visual.relations }
    const groups = { ...visual.groups }
    const copiedIds: string[] = []
    const copiedGeometry: Record<string, Box> = {}
    for (const selectedId of selectedIds) {
      const element = visual.elements[selectedId]
      const relation = visual.relations[selectedId]
      const group = visual.groups[selectedId]
      if (element) {
        let copyId = `${selectedId}_copy`
        let index = 2
        while (elements[copyId] || relations[copyId] || groups[copyId]) copyId = `${selectedId}_copy_${index++}`
        elements[copyId] = { ...element, id: copyId, name: `${element.name} Copy` }
        copiedIds.push(copyId)
        const geometry = visibleGeometry.current[selectedId]
        if (geometry) copiedGeometry[copyId] = { ...geometry, x: geometry.x + COPY_OFFSET, y: geometry.y + COPY_OFFSET }
      } else if (relation) {
        let copyId = `${selectedId}_copy`
        let index = 2
        while (elements[copyId] || relations[copyId] || groups[copyId]) copyId = `${selectedId}_copy_${index++}`
        relations[copyId] = { ...relation, id: copyId, ...(relation.name ? { name: `${relation.name} Copy` } : {}) }
        copiedIds.push(copyId)
      } else if (group) {
        let copyId = `${selectedId}_copy`
        let index = 2
        while (elements[copyId] || relations[copyId] || groups[copyId]) copyId = `${selectedId}_copy_${index++}`
        groups[copyId] = { ...group, id: copyId, name: `${group.name} Copy` }
        copiedIds.push(copyId)
        const geometry = visibleGeometry.current[selectedId]
        if (geometry) copiedGeometry[copyId] = { ...geometry, x: geometry.x + COPY_OFFSET, y: geometry.y + COPY_OFFSET }
      }
    }
    if (copiedIds.length === 0) return
    if (Object.keys(copiedGeometry).length > 0) setOptimisticGeometry(current => ({ ...current, ...copiedGeometry }))
    const next = toDiagramModel({ ...visual, elements, relations, groups, selection: copiedIds })
    setSelectedIds(copiedIds)
    serializeAndApplyModel(next)
  }, [renderedModel, selectedIds, serializeAndApplyModel])

  const handleRemoveSelection = useCallback(() => {
    if (selectedIds.length === 0) return
    const visual = fromDiagramModel(renderedModel)
    const selected = new Set(selectedIds)
    const elements = { ...visual.elements }
    const relations = { ...visual.relations }
    const groups = { ...visual.groups }
    for (const selectedId of selected) {
      delete elements[selectedId]
      delete relations[selectedId]
      delete groups[selectedId]
    }
    for (const [id, relation] of Object.entries(relations)) if (selected.has(id) || selected.has(relation.sourceId) || selected.has(relation.targetId)) delete relations[id]
    for (const [id, group] of Object.entries(groups)) groups[id] = { ...group, memberIds: group.memberIds.filter(memberId => !selected.has(memberId)) }
    setSelectedIds([])
    serializeAndApplyModel(toDiagramModel({ elements, relations, groups, selection: [] }))
  }, [renderedModel, selectedIds, serializeAndApplyModel])

  const handleSelectionChange = useCallback((id: string, additive: boolean) => {
    setSelectedIds(current => updateSelection(current, id, additive))
  }, [])

  const handleAreaSelectionChange = useCallback((ids: readonly string[], additive: boolean) => {
    setSelectedIds(current => additive ? ids.reduce((selection, id) => updateSelection(selection, id, true), current) : ids)
  }, [])

  const handleVisibleGeometryChange = useCallback((geometry: Readonly<Record<string, Box>>) => {
    visibleGeometry.current = geometry
  }, [])

  const textToolbarState = useMemo(() => selectedIds.length > 0 && resolvedStyles ? deriveTextToolbarState({ selectedIds, styles: resolvedStyles }) : undefined, [resolvedStyles, selectedIds])

  useEffect(() => applyStyles(source, appliedStylesheet), [applyStyles])

  return (
    <main className="app-shell">
      <TopBar textToolbarState={textToolbarState} onApplyTextStyle={handleApplyTextStyle} onCopySelection={handleCopySelection} onRemoveSelection={handleRemoveSelection} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(current => !current)} />
      <div className={`workspace-grid${sidebarCollapsed ? ' workspace-grid-sidebar-collapsed' : ''}`}>
        <EditorTabs adlText={adlSource} stylesheetText={stylesheetSource} onAdlChange={updateAdlSource} onStylesheetChange={handleStylesheetChange} assistant={<AssistantConversation currentSource={adlSource} currentRevision={adlRevision} providers={assistantProviders} ollamaConfig={DEFAULT_OLLAMA_CONFIG} onApply={updateAdlSource} />} />
        {resolvedStyles
          ? <DiagramPreview model={renderedModel} styles={resolvedStyles} selectedIds={selectedIds} optimisticGeometry={optimisticGeometry} onSelectionChange={handleSelectionChange} onAreaSelectionChange={handleAreaSelectionChange} onEntityTextChange={handleEntityTextChange} onElementGeometryChange={handleElementGeometryChange} onVisibleGeometryChange={handleVisibleGeometryChange} />
          : <section className="preview" aria-label="Diagrama Payments Flow"><h2 className="sr-only">Diagrama</h2><p>Aplicando stylesheet...</p></section>}
      </div>
    </main>
  )
}
