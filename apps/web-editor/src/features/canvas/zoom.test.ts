import { describe, expect, it } from 'vitest'
import { decreaseZoom, increaseZoom, zoomedViewBox } from './zoom.js'

describe('canvas zoom', () => {
  it('changes zoom in fixed increments and respects its limits', () => {
    expect(increaseZoom(1)).toBe(1.1)
    expect(increaseZoom(2)).toBe(2)
    expect(decreaseZoom(1)).toBe(0.9)
    expect(decreaseZoom(0.5)).toBe(0.5)
  })

  it('keeps the diagram centre fixed while changing the SVG viewport', () => {
    expect(zoomedViewBox({ x: 0, y: 0, width: 800, height: 400 }, 2)).toEqual({ x: 200, y: 100, width: 400, height: 200 })
  })
})
