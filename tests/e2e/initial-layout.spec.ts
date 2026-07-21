import { expect, test } from '@playwright/test'

test('renders every element without overlap on the initial diagram', async ({ page }) => {
  await page.goto('/')

  const boxes = await page.locator('[data-entity-id] .element').evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect()
    return { id: element.parentElement?.getAttribute('data-entity-id'), left: box.left, top: box.top, right: box.right, bottom: box.bottom }
  }))

  for (const [index, box] of boxes.entries()) {
    for (const other of boxes.slice(index + 1)) {
      const overlaps = box.left < other.right && other.left < box.right && box.top < other.bottom && other.top < box.bottom
      expect(overlaps, `${box.id} overlaps ${other.id}`).toBe(false)
    }
  }
})
