import { expect, test } from '@playwright/test'

const overlaps = (first: { x: number; y: number; width: number; height: number }, second: { x: number; y: number; width: number; height: number }) => first.x < second.x + second.width && second.x < first.x + first.width && first.y < second.y + second.height && second.y < first.y + first.height

test('keeps initial relation labels clear of every element', async ({ page }) => {
  await page.goto('/')

  const label = await page.locator('[data-relation-label-id="calls"]').boundingBox()
  const elements = await page.locator('[data-entity-id] .element').evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect()
    return { x: box.x, y: box.y, width: box.width, height: box.height }
  }))
  expect(label).not.toBeNull()

  for (const element of elements) expect(overlaps(label!, element)).toBe(false)
})
