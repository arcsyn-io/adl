import { describe, expect, it } from 'vitest'
import { resizeBox, resizeEdgeHitArea } from './resize-geometry.js'

const box = { x: 100, y: 80, width: 180, height: 84 }

describe('resizeBox', () => {
  it('changes only the width when dragging a horizontal side handle', () => {
    expect(resizeBox(box, 'e', { x: 48, y: 36 })).toEqual({ x: 100, y: 80, width: 228, height: 84 })
  })

  it('keeps the opposite vertical edge fixed when dragging the left side handle', () => {
    expect(resizeBox(box, 'w', { x: -48, y: 36 })).toEqual({ x: 52, y: 80, width: 228, height: 84 })
  })

  it('changes only the height when dragging a vertical side handle', () => {
    expect(resizeBox(box, 's', { x: 48, y: 36 })).toEqual({ x: 100, y: 80, width: 180, height: 120 })
  })

  it('keeps the opposite horizontal edge fixed when dragging the top side handle', () => {
    expect(resizeBox(box, 'n', { x: 48, y: -36 })).toEqual({ x: 100, y: 44, width: 180, height: 120 })
  })

  it('continues to resize both dimensions from a corner handle', () => {
    expect(resizeBox(box, 'se', { x: 48, y: 36 })).toEqual({ x: 100, y: 80, width: 228, height: 120 })
  })

  it('snaps resized dimensions to the 12 px grid', () => {
    expect(resizeBox(box, 'e', { x: 18, y: 0 })).toEqual({ x: 100, y: 80, width: 204, height: 84 })
  })

  it('creates a hit area along the full right border excluding the corner handles', () => {
    expect(resizeEdgeHitArea(box, 'e')).toEqual({ x: 274, y: 86, width: 12, height: 72 })
  })
})
