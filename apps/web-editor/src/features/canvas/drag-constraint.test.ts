import { describe, expect, it } from 'vitest'
import { constrainDrag, dragAxisForDelta } from './drag-constraint.js'

describe('drag constraints', () => {
  it('chooses the dominant direction for a Shift drag', () => {
    expect(dragAxisForDelta({ x: 40, y: 18 })).toBe('horizontal')
    expect(dragAxisForDelta({ x: 18, y: 40 })).toBe('vertical')
  })

  it('keeps the perpendicular coordinate fixed', () => {
    expect(constrainDrag({ x: 120, y: 84 }, { x: 180, y: 132 }, 'horizontal')).toEqual({ x: 180, y: 84 })
    expect(constrainDrag({ x: 120, y: 84 }, { x: 180, y: 132 }, 'vertical')).toEqual({ x: 120, y: 132 })
  })
})
