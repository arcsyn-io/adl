import type { Box, PlacementState } from '@adl/canvas-state'
import type { LayoutResult } from '@adl/layout'
import type { DiagramModel } from '@adl/semantic'
import type { ResolvedDiagramStyles } from '@adl/stylesheet'

const DEFAULT_ELEMENT_WIDTH = 180
const DEFAULT_ELEMENT_HEIGHT = 84
const FALLBACK_GAP = 24

export interface DiagramGeometryInput {
  readonly model: DiagramModel
  readonly layout: LayoutResult
  readonly placements: PlacementState
  readonly optimisticGeometry: Readonly<Record<string, Box>>
  readonly styles?: ResolvedDiagramStyles
}

function fallbackBox(index: number, rightEdge: number, model: DiagramModel, styles: ResolvedDiagramStyles | undefined): Box {
  const element = model.elements[index]
  const style = element ? styles?.elements[element.identity.value] : undefined
  return {
    x: rightEdge + FALLBACK_GAP + index * (DEFAULT_ELEMENT_WIDTH + FALLBACK_GAP),
    y: FALLBACK_GAP,
    width: style?.width ?? DEFAULT_ELEMENT_WIDTH,
    height: style?.height ?? DEFAULT_ELEMENT_HEIGHT,
  }
}

export function composeDiagramGeometry({ model, layout, placements, optimisticGeometry, styles }: DiagramGeometryInput): Record<string, Box> {
  const geometry: Record<string, Box> = {}
  const layoutBoxes = Object.values(layout.nodes)
  const rightEdge = Math.max(0, ...layoutBoxes.map(box => box.x + box.width))
  const entities = [...model.elements, ...model.groups]

  for (const [index, entity] of entities.entries()) {
    const id = entity.identity.value
    const base = layout.nodes[id] ?? optimisticGeometry[id] ?? fallbackBox(index, rightEdge, model, styles)
    const placement = placements.placements[id]
    geometry[id] = {
      ...base,
      ...(placement ? { x: placement.x, y: placement.y, ...(placement.width !== undefined ? { width: placement.width } : {}), ...(placement.height !== undefined ? { height: placement.height } : {}) } : {}),
    }
  }

  return geometry
}
