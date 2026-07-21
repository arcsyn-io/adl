import { MIN_ELEMENT_HEIGHT, MIN_ELEMENT_WIDTH, type Box, type Point } from '@adl/canvas-state'

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
export type ResizeEdge = 'n' | 'e' | 's' | 'w'

export const DIAGRAM_GRID_SIZE = 12
const EDGE_HIT_AREA_SIZE = 12

const westHandles: readonly ResizeHandle[] = ['nw', 'w', 'sw']
const eastHandles: readonly ResizeHandle[] = ['ne', 'e', 'se']
const northHandles: readonly ResizeHandle[] = ['nw', 'n', 'ne']
const southHandles: readonly ResizeHandle[] = ['sw', 's', 'se']

export function resizeBox(box: Box, handle: ResizeHandle, delta: Point): Box {
  const west = westHandles.includes(handle)
  const east = eastHandles.includes(handle)
  const north = northHandles.includes(handle)
  const south = southHandles.includes(handle)
  const snapDimension = (value: number, minimum: number) => Math.max(minimum, Math.round(value / DIAGRAM_GRID_SIZE) * DIAGRAM_GRID_SIZE)
  const width = west || east ? snapDimension(box.width + (west ? -delta.x : delta.x), MIN_ELEMENT_WIDTH) : box.width
  const height = north || south ? snapDimension(box.height + (north ? -delta.y : delta.y), MIN_ELEMENT_HEIGHT) : box.height

  return {
    x: west ? box.x + box.width - width : box.x,
    y: north ? box.y + box.height - height : box.y,
    width,
    height,
  }
}

export function resizeEdgeHitArea(box: Box, edge: ResizeEdge): Box {
  const halfSize = EDGE_HIT_AREA_SIZE / 2
  if (edge === 'n') return { x: box.x + halfSize, y: box.y - halfSize, width: Math.max(0, box.width - EDGE_HIT_AREA_SIZE), height: EDGE_HIT_AREA_SIZE }
  if (edge === 'e') return { x: box.x + box.width - halfSize, y: box.y + halfSize, width: EDGE_HIT_AREA_SIZE, height: Math.max(0, box.height - EDGE_HIT_AREA_SIZE) }
  if (edge === 's') return { x: box.x + halfSize, y: box.y + box.height - halfSize, width: Math.max(0, box.width - EDGE_HIT_AREA_SIZE), height: EDGE_HIT_AREA_SIZE }
  return { x: box.x - halfSize, y: box.y + halfSize, width: EDGE_HIT_AREA_SIZE, height: Math.max(0, box.height - EDGE_HIT_AREA_SIZE) }
}
