import type { Box, Point } from '@adl/canvas-state'

export interface SelectableElement {
  readonly id: string
  readonly geometry: Box
}

export interface SelectableRelation {
  readonly id: string
  readonly start: Point
  readonly end: Point
}

interface Segment {
  readonly start: Point
  readonly end: Point
}

export function selectionArea(start: Point, end: Point): Box {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  }
}

function intersects(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

function containsPoint(area: Box, point: Point): boolean {
  return point.x >= area.x && point.x <= area.x + area.width && point.y >= area.y && point.y <= area.y + area.height
}

function rectangleEdges(area: Box): readonly Segment[] {
  const topLeft = { x: area.x, y: area.y }
  const topRight = { x: area.x + area.width, y: area.y }
  const bottomRight = { x: area.x + area.width, y: area.y + area.height }
  const bottomLeft = { x: area.x, y: area.y + area.height }
  return [
    { start: topLeft, end: topRight },
    { start: topRight, end: bottomRight },
    { start: bottomRight, end: bottomLeft },
    { start: bottomLeft, end: topLeft },
  ]
}

function direction(from: Point, to: Point, point: Point): number {
  return (to.x - from.x) * (point.y - from.y) - (to.y - from.y) * (point.x - from.x)
}

function liesOnSegment(from: Point, to: Point, point: Point): boolean {
  return point.x >= Math.min(from.x, to.x) && point.x <= Math.max(from.x, to.x) && point.y >= Math.min(from.y, to.y) && point.y <= Math.max(from.y, to.y)
}

function segmentsIntersect(first: Segment, second: Segment): boolean {
  const firstStart = direction(first.start, first.end, second.start)
  const firstEnd = direction(first.start, first.end, second.end)
  const secondStart = direction(second.start, second.end, first.start)
  const secondEnd = direction(second.start, second.end, first.end)
  if (firstStart === 0 && liesOnSegment(first.start, first.end, second.start)) return true
  if (firstEnd === 0 && liesOnSegment(first.start, first.end, second.end)) return true
  if (secondStart === 0 && liesOnSegment(second.start, second.end, first.start)) return true
  if (secondEnd === 0 && liesOnSegment(second.start, second.end, first.end)) return true
  return (firstStart > 0) !== (firstEnd > 0) && (secondStart > 0) !== (secondEnd > 0)
}

export function elementIdsIntersectingArea(elements: readonly SelectableElement[], area: Box): string[] {
  return elements.filter(element => intersects(element.geometry, area)).map(element => element.id)
}

export function groupIdsIntersectingArea(groups: readonly SelectableElement[], area: Box): string[] {
  return groups.filter(group => rectangleEdges(group.geometry).some(edge => rectangleEdges(area).some(areaEdge => segmentsIntersect(edge, areaEdge))) || rectangleEdges(group.geometry).some(edge => containsPoint(area, edge.start))).map(group => group.id)
}

export function relationIdsIntersectingArea(relations: readonly SelectableRelation[], area: Box): string[] {
  const areaEdges = rectangleEdges(area)
  return [...new Set(relations.filter(relation => {
    const segment = { start: relation.start, end: relation.end }
    return containsPoint(area, relation.start) || containsPoint(area, relation.end) || areaEdges.some(edge => segmentsIntersect(segment, edge))
  }).map(relation => relation.id))]
}
