import { describe, expect, it } from 'vitest'
import { separateElementBoxes } from '../src/overlap-prevention.js'

const overlaps = (first: { x: number; y: number; width: number; height: number }, second: { x: number; y: number; width: number; height: number }) => first.x < second.x + second.width && second.x < first.x + first.width && first.y < second.y + second.height && second.y < first.y + first.height

describe('overlap prevention', () => {
  it('separates automatic elements while preserving manual placements', () => {
    const boxes = separateElementBoxes({
      pinned: { x: 0, y: 0, width: 180, height: 84 },
      api: { x: 0, y: 0, width: 180, height: 84 },
      worker: { x: 0, y: 0, width: 180, height: 84 },
    }, ['pinned', 'api', 'worker'], new Set(['pinned']), 24)

    expect(boxes.pinned).toEqual({ x: 0, y: 0, width: 180, height: 84 })
    expect(overlaps(boxes.pinned!, boxes.api!)).toBe(false)
    expect(overlaps(boxes.pinned!, boxes.worker!)).toBe(false)
    expect(overlaps(boxes.api!, boxes.worker!)).toBe(false)
  })
})
