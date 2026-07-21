import { expect, test } from '@playwright/test'

test('edits ADL with current diagnostics and keyboard controls', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('tab', { name: 'Código ADL' }).click()
  await expect(page.getByRole('heading', { name: 'Editor ADL' })).toBeVisible()
  await expect(page.getByText('Documento válido.')).toBeVisible()
  await page.locator('.cm-content').click()
  await page.keyboard.press('Control+End')
  await page.keyboard.type(' invalid')
  await expect(page.getByRole('heading', { name: /Diagnósticos \([1-9]/ })).toBeVisible()
  await page.getByRole('button', { name: 'Desfazer' }).first().click()
})

test('moves diagram elements with pointer and keyboard without changing ADL', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('tab', { name: 'Código ADL' }).click()
  const sourceBefore = await page.locator('.cm-content').textContent()
  const api = page.getByRole('img').getByRole('button', { name: /API/ })
  const initial = await api.boundingBox()
  if (!initial) throw new Error('API element is not visible')
  await api.hover()
  await page.mouse.down()
  await page.mouse.move(initial.x + initial.width / 2 + 80, initial.y + initial.height / 2 + 40)
  await page.mouse.up()
  const dragged = await api.boundingBox()
  expect(dragged?.x).toBeGreaterThan(initial.x + 50)
  await api.focus()
  await page.keyboard.press('ArrowRight')
  const keyboardMoved = await api.boundingBox()
  expect(keyboardMoved?.x).toBeGreaterThan(dragged?.x ?? 0)
  await expect(page.locator('.cm-content')).toHaveText(sourceBefore ?? '')
})

test('snaps pointer movement to the diagram grid', async ({ page }) => {
  await page.goto('/')
  const api = page.locator('[data-entity-id="api"]')
  const shape = api.locator('.element')
  const before = await api.boundingBox()
  if (!before) throw new Error('API element is not visible')
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2)
  await page.mouse.down()
  await page.mouse.move(before.x + before.width / 2 + 37, before.y + before.height / 2 + 29)
  await page.mouse.up()
  const geometry = await shape.evaluate(node => {
    const box = (node as SVGGraphicsElement).getBBox()
    return { x: box.x, y: box.y }
  })
  expect(geometry.x / 12).toBeCloseTo(Math.round(geometry.x / 12), 6)
  expect(geometry.y / 12).toBeCloseTo(Math.round(geometry.y / 12), 6)
})

test('constrains Shift pointer movement to a horizontal or vertical line', async ({ page }) => {
  await page.goto('/')
  const api = page.locator('[data-entity-id="api"]')
  const shape = api.locator('.element')
  const before = await shape.evaluate(node => {
    const box = (node as SVGGraphicsElement).getBBox()
    return { x: box.x, y: box.y }
  })
  const screenBox = await api.boundingBox()
  if (!screenBox) throw new Error('API element is not visible')
  await page.mouse.move(screenBox.x + screenBox.width / 2, screenBox.y + screenBox.height / 2)
  await page.mouse.down()
  await page.keyboard.down('Shift')
  await page.mouse.move(screenBox.x + screenBox.width / 2 + 65, screenBox.y + screenBox.height / 2 + 20)
  const horizontal = await shape.evaluate(node => {
    const box = (node as SVGGraphicsElement).getBBox()
    return { x: box.x, y: box.y }
  })
  await page.mouse.move(screenBox.x + screenBox.width / 2 + 20, screenBox.y + screenBox.height / 2 + 65)
  await page.mouse.up()
  await page.keyboard.up('Shift')
  const vertical = await shape.evaluate(node => {
    const box = (node as SVGGraphicsElement).getBBox()
    return { x: box.x, y: box.y }
  })
  expect(horizontal.x).toBeGreaterThan(before.x)
  expect(horizontal.y).toBe(before.y)
  expect(vertical.x).toBe(before.x)
  expect(vertical.y).toBeGreaterThan(before.y)
})

test('debounces valid code into the canvas and keeps the last valid render on errors', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('tab', { name: 'Código ADL' }).click()
  const editor = page.locator('.cm-content')
  const diagram = page.getByRole('img')
  const beforeInvalid = await diagram.innerHTML()
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.insertText('invalid source')
  await page.waitForTimeout(60)
  expect(await diagram.innerHTML()).toBe(beforeInvalid)
  await page.keyboard.press('Control+A')
  await page.keyboard.insertText('adl version "1.0" diagram { element worker { name "Worker" type "service" } }')
  await expect(diagram.getByText('Worker', { exact: true })).toBeVisible()
  await expect(diagram.getByText('API', { exact: true })).toHaveCount(0)
})
