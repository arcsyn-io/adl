import { expect, test } from '@playwright/test'

test('shows alignment guides while an element is aligned with another element', async ({ page }) => {
  await page.goto('/')

  const moving = page.locator('[data-entity-id="api"]')
  const target = page.locator('[data-entity-id="database"]')
  const movingBox = await moving.locator('.element').boundingBox()
  const targetBox = await target.locator('.element').boundingBox()
  expect(movingBox).not.toBeNull()
  expect(targetBox).not.toBeNull()

  await page.mouse.move(movingBox!.x + movingBox!.width / 2, movingBox!.y + movingBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(targetBox!.x + targetBox!.width / 2, targetBox!.y + targetBox!.height / 2)

  await expect.poll(() => page.locator('[data-alignment-guide="x"]').count()).toBeGreaterThan(0)
  await expect.poll(() => page.locator('[data-alignment-guide="y"]').count()).toBeGreaterThan(0)

  await page.mouse.up()
  await expect(page.locator('[data-alignment-guide]')).toHaveCount(0)
})
