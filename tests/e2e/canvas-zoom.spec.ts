import { expect, test } from '@playwright/test'

test('zooms the diagram from the canvas toolbar', async ({ page }) => {
  await page.goto('/')

  const diagram = page.getByRole('img')
  const toolbar = page.locator('.canvas-toolbar')
  await expect(toolbar).toContainText('100%')
  const initialViewBox = (await diagram.getAttribute('viewBox'))!.split(' ').map(Number)

  await page.getByRole('button', { name: 'Aumentar zoom' }).click()
  await expect(toolbar).toContainText('110%')
  const zoomedViewBox = (await diagram.getAttribute('viewBox'))!.split(' ').map(Number)
  expect(zoomedViewBox[2]).toBeCloseTo(initialViewBox[2]! / 1.1)
  expect(zoomedViewBox[3]).toBeCloseTo(initialViewBox[3]! / 1.1)

  await page.getByRole('button', { name: 'Diminuir zoom' }).click()
  await expect(toolbar).toContainText('100%')
  await expect(diagram).toHaveAttribute('viewBox', initialViewBox.join(' '))
})
