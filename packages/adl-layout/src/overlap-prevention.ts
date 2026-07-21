import type { NodeGeometry } from './model.js'

const overlaps = (first: NodeGeometry, second: NodeGeometry) => first.x < second.x + second.width && second.x < first.x + first.width && first.y < second.y + second.height && second.y < first.y + first.height

export function separateElementBoxes(nodes: Readonly<Record<string, NodeGeometry>>, elementIds: readonly string[], lockedIds: ReadonlySet<string>, gap: number): Record<string, NodeGeometry> {
  const result: Record<string, NodeGeometry> = { ...nodes }
  const placed: string[] = []
  const orderedIds = [...elementIds.filter(id => lockedIds.has(id)), ...elementIds.filter(id => !lockedIds.has(id))]
  const safeGap = Number.isFinite(gap) ? Math.max(0, gap) : 0

  for (const id of orderedIds) {
    const initial = result[id]
    if (!initial) continue
    let candidate = initial
    if (!lockedIds.has(id)) {
      for (;;) {
        const collisionId = placed.find(otherId => {
          const other = result[otherId]
          return other ? overlaps(candidate, other) : false
        })
        if (!collisionId) break
        const collision = result[collisionId]
        if (!collision) break
        candidate = { ...candidate, y: Math.max(candidate.y, collision.y + collision.height + safeGap) }
      }
    }
    result[id] = candidate
    placed.push(id)
  }

  return result
}
