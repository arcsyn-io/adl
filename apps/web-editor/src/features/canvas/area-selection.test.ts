import { describe, expect, it } from 'vitest'
import { elementIdsIntersectingArea, groupIdsIntersectingArea, relationIdsIntersectingArea, selectionArea } from './area-selection.js'

describe('area selection', () => {
  it('normalizes a drag made from bottom-right to top-left', () => {
    expect(selectionArea({ x: 320, y: 240 }, { x: 120, y: 80 })).toEqual({ x: 120, y: 80, width: 200, height: 160 })
  })

  it('selects every element touched by the area, including partial intersections', () => {
    const selectedIds = elementIdsIntersectingArea([
      { id: 'api', geometry: { x: 100, y: 100, width: 180, height: 84 } },
      { id: 'database', geometry: { x: 340, y: 100, width: 180, height: 84 } },
      { id: 'queue', geometry: { x: 600, y: 100, width: 180, height: 84 } },
    ], { x: 180, y: 120, width: 240, height: 100 })

    expect(selectedIds).toEqual(['api', 'database'])
  })

  it('selects groups only when the area reaches their boundary or contains them', () => {
    const groups = [{ id: 'solution', geometry: { x: 100, y: 100, width: 300, height: 180 } }]

    expect(groupIdsIntersectingArea(groups, { x: 180, y: 140, width: 80, height: 60 })).toEqual([])
    expect(groupIdsIntersectingArea(groups, { x: 90, y: 140, width: 20, height: 60 })).toEqual(['solution'])
    expect(groupIdsIntersectingArea(groups, { x: 80, y: 80, width: 360, height: 240 })).toEqual(['solution'])
  })

  it('selects relations whose visible segment crosses the area', () => {
    const selectedIds = relationIdsIntersectingArea([
      { id: 'calls', start: { x: 20, y: 20 }, end: { x: 220, y: 220 } },
      { id: 'reads', start: { x: 300, y: 20 }, end: { x: 300, y: 220 } },
    ], { x: 100, y: 100, width: 40, height: 40 })

    expect(selectedIds).toEqual(['calls'])
  })
})
