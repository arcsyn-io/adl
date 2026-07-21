import type { Point } from '@adl/canvas-state'

export type DragAxis = 'horizontal' | 'vertical'

export function dragAxisForDelta(delta: Point): DragAxis {
  return Math.abs(delta.x) >= Math.abs(delta.y) ? 'horizontal' : 'vertical'
}

export function constrainDrag(origin: Point, target: Point, axis: DragAxis): Point {
  return axis === 'horizontal' ? { x: target.x, y: origin.y } : { x: origin.x, y: target.y }
}
