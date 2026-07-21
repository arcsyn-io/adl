import type { Box, Point } from '@adl/canvas-state'

const intersects = (first: Box, second: Box) => first.x < second.x + second.width && second.x < first.x + first.width && first.y < second.y + second.height && second.y < first.y + first.height
const samePoint = (first: Point, second: Point) => first.x === second.x && first.y === second.y
const cross = (origin: Point, first: Point, second: Point) => (first.x - origin.x) * (second.y - origin.y) - (first.y - origin.y) * (second.x - origin.x)
const onSegment = (first: Point, second: Point, point: Point) => Math.min(first.x, second.x) <= point.x && point.x <= Math.max(first.x, second.x) && Math.min(first.y, second.y) <= point.y && point.y <= Math.max(first.y, second.y)
const segmentsIntersect = (firstStart: Point, firstEnd: Point, secondStart: Point, secondEnd: Point) => {
  const first = cross(firstStart, firstEnd, secondStart)
  const second = cross(firstStart, firstEnd, secondEnd)
  const third = cross(secondStart, secondEnd, firstStart)
  const fourth = cross(secondStart, secondEnd, firstEnd)
  if (first === 0 && onSegment(firstStart, firstEnd, secondStart)) return true
  if (second === 0 && onSegment(firstStart, firstEnd, secondEnd)) return true
  if (third === 0 && onSegment(secondStart, secondEnd, firstStart)) return true
  if (fourth === 0 && onSegment(secondStart, secondEnd, firstEnd)) return true
  return (first > 0) !== (second > 0) && (third > 0) !== (fourth > 0)
}
const routeIntersectsBox = (points: readonly Point[], box: Box) => points.slice(1).some((end, index) => {
  const start = points[index]!
  if (start.x > box.x && start.x < box.x + box.width && start.y > box.y && start.y < box.y + box.height) return true
  if (end.x > box.x && end.x < box.x + box.width && end.y > box.y && end.y < box.y + box.height) return true
  const corners = [
    { x: box.x, y: box.y },
    { x: box.x + box.width, y: box.y },
    { x: box.x + box.width, y: box.y + box.height },
    { x: box.x, y: box.y + box.height },
  ]
  return corners.some((corner, cornerIndex) => segmentsIntersect(start, end, corner, corners[(cornerIndex + 1) % corners.length]!))
})
const simplify = (points: readonly Point[]) => points.filter((point, index) => index === 0 || !samePoint(point, points[index - 1]!))
const clearRoute = (points: readonly Point[], obstacles: readonly Box[]) => !obstacles.some(obstacle => routeIntersectsBox(points, obstacle))

export function relationRoute(points: readonly Point[] | undefined, start: Point, end: Point, obstacles: readonly Box[]): readonly Point[] {
  const clearance = 20
  const horizontalTop = Math.min(start.y, end.y, ...obstacles.map(obstacle => obstacle.y - clearance))
  const horizontalBottom = Math.max(start.y, end.y, ...obstacles.map(obstacle => obstacle.y + obstacle.height + clearance))
  const verticalLeft = Math.min(start.x, end.x, ...obstacles.map(obstacle => obstacle.x - clearance))
  const verticalRight = Math.max(start.x, end.x, ...obstacles.map(obstacle => obstacle.x + obstacle.width + clearance))
  const elkRoute = points && points.length >= 2 ? [start, ...points.slice(1, -1), end] : undefined
  const candidates = [
    elkRoute,
    [start, end],
    [start, { x: start.x, y: horizontalTop }, { x: end.x, y: horizontalTop }, end],
    [start, { x: start.x, y: horizontalBottom }, { x: end.x, y: horizontalBottom }, end],
    [start, { x: verticalLeft, y: start.y }, { x: verticalLeft, y: end.y }, end],
    [start, { x: verticalRight, y: start.y }, { x: verticalRight, y: end.y }, end],
  ].filter((candidate): candidate is Point[] => candidate !== undefined).map(simplify)
  return candidates.find(candidate => clearRoute(candidate, obstacles)) ?? [start, end]
}

export function relationPath(points: readonly Point[]): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
}

export function relationLabelPosition(points: readonly Point[], label: string, obstacles: readonly Box[]): Point {
  const labelBox = { width: Math.max(32, Array.from(label).length * 8 + 16), height: 28 }
  const segments = points.slice(1).map((end, index) => {
    const start = points[index]!
    const dx = end.x - start.x
    const dy = end.y - start.y
    return { start, end, length: Math.hypot(dx, dy), normal: { x: -dy, y: dx } }
  }).filter(segment => segment.length > 0).sort((first, second) => second.length - first.length)

  for (const segment of segments) {
    const middle = { x: (segment.start.x + segment.end.x) / 2, y: (segment.start.y + segment.end.y) / 2 }
    const normal = { x: segment.normal.x / segment.length, y: segment.normal.y / segment.length }
    for (const distance of [0, 20, 40, 60, 80, 100, 120]) {
      for (const direction of distance === 0 ? [0] : [-1, 1]) {
        const candidate = { x: middle.x + normal.x * distance * direction, y: middle.y + normal.y * distance * direction }
        const bounds = { x: candidate.x - labelBox.width / 2, y: candidate.y - labelBox.height / 2, ...labelBox }
        if (!obstacles.some(obstacle => intersects(bounds, obstacle))) return candidate
      }
    }
  }

  return points.at(Math.floor(points.length / 2)) ?? { x: 0, y: 0 }
}
