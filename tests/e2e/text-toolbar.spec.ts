import { expect, test } from '@playwright/test'

test('keeps existing diagram nodes mounted while copying a selection', async ({ page }) => {
  await page.goto('/')

  const api = page.locator('[data-entity-id="api"]')
  await api.click()
  const originalApi = await api.elementHandle()
  expect(originalApi).not.toBeNull()

  await page.getByRole('button', { name: 'Copiar selecao' }).click()

  await expect(page.locator('[data-entity-id="api_copy"]')).toBeVisible()
  expect(await originalApi!.evaluate(node => node.isConnected)).toBe(true)
  await expect(page.getByText('Diagrama indisponivel.')).toHaveCount(0)
})

test('applies selected element text style from the top toolbar', async ({ page }) => {
  await page.goto('/')

  const api = page.getByRole('img').getByRole('button', { name: /API/ })
  await api.click()

  await page.getByLabel('Fonte', { exact: true }).selectOption({ label: 'JetBrains Mono' })
  await page.getByLabel('Tamanho da fonte', { exact: true }).fill('22')
  await page.getByLabel('Cor do texto', { exact: true }).click()
  await expect(page.getByRole('button', { name: 'Cor predefinida #FFFFFF' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cor predefinida #1D4ED8' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cor predefinida #BE185D' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cor usada no modelo #CBD5E1' })).toBeVisible()
  await page.getByRole('img').click({ position: { x: 20, y: 20 } })
  await expect(page.getByLabel('Paleta de cor do texto')).toBeHidden()
  await page.getByLabel('Cor do texto', { exact: true }).click()
  await page.getByLabel('Cor personalizada', { exact: true }).fill('#2A6FDD')

  const apiLabel = page.locator('[data-entity-id="api"] text').first()
  const apiShape = page.locator('[data-entity-id="api"] .element')
  const shapeBox = await apiShape.boundingBox()
  expect(shapeBox).not.toBeNull()
  const shapeCenter = shapeBox!.x + shapeBox!.width / 2

  await page.getByRole('button', { name: 'Alinhar a esquerda' }).click()
  await expect(apiLabel).toHaveAttribute('text-anchor', 'start')
  await expect.poll(async () => Number(await apiLabel.getAttribute('x'))).toBeLessThan(shapeCenter)

  await page.getByRole('button', { name: 'Alinhar a direita' }).click()
  await page.getByRole('button', { name: 'Negrito' }).click()
  await page.getByRole('button', { name: 'Itálico' }).click()
  await page.getByRole('button', { name: 'Sublinhar' }).click()

  await expect(apiLabel).toHaveAttribute('font-family', 'JetBrains Mono, monospace')
  await expect(apiLabel).toHaveAttribute('font-size', '22')
  await expect(apiLabel).toHaveCSS('font-size', '22px')
  await expect(apiLabel).toHaveAttribute('fill', '#2A6FDDFF')
  await expect(apiLabel).toHaveAttribute('text-anchor', 'end')
  await expect.poll(async () => Number(await apiLabel.getAttribute('x'))).toBeGreaterThan(shapeCenter)
  await expect(apiLabel).toHaveAttribute('font-weight', 'bold')
  await expect(apiLabel).toHaveAttribute('font-style', 'italic')
  await expect(apiLabel).toHaveAttribute('text-decoration', 'underline')

  await page.getByRole('tab', { name: 'Stylesheet aplicado' }).click()
  const stylesheet = page.locator('.cm-content')
  await expect(stylesheet).toContainText('element id api')
  await expect(stylesheet).toContainText('font-family "JetBrains Mono, monospace"')
  await expect(stylesheet).toContainText('font-size "22px"')
  await expect(stylesheet).toContainText('text-paint "#2A6FDDFF"')
  await expect(stylesheet).toContainText('text-align "right"')
  await expect(stylesheet).toContainText('font-weight "bold"')
  await expect(stylesheet).toContainText('font-style "italic"')
  await expect(stylesheet).toContainText('text-decoration "underline"')
})

test('applies common text style changes to multiple selected elements', async ({ page }) => {
  await page.goto('/')

  const diagram = page.getByRole('img')
  const api = diagram.getByRole('button', { name: /API/ })
  const web = diagram.getByRole('button', { name: /Web application/ })
  await api.click()
  await web.click({ modifiers: ['Shift'] })

  await expect(page.locator('[data-entity-id="api"]')).toHaveAttribute('data-state', 'selected')
  await expect(page.locator('[data-entity-id="web"]')).toHaveAttribute('data-state', 'selected')
  await expect(page.getByText('2 entidades selecionadas')).toBeVisible()

  await page.getByLabel('Tamanho da fonte', { exact: true }).fill('24')
  await page.getByRole('button', { name: 'Negrito' }).click()

  const apiLabel = page.locator('[data-entity-id="api"] text').first()
  const webLabel = page.locator('[data-entity-id="web"] text').first()
  await expect(apiLabel).toHaveCSS('font-size', '24px')
  await expect(webLabel).toHaveCSS('font-size', '24px')
  await expect(apiLabel).toHaveAttribute('font-weight', 'bold')
  await expect(webLabel).toHaveAttribute('font-weight', 'bold')

  await page.getByRole('tab', { name: 'Stylesheet aplicado' }).click()
  const stylesheet = page.locator('.cm-content')
  await expect(stylesheet).toContainText('element id api')
  await expect(stylesheet).toContainText('element id web')
  await expect(stylesheet).toContainText(/element id api \{[\s\S]*font-size "24px"[\s\S]*font-weight "bold"/)
  await expect(stylesheet).toContainText(/element id web \{[\s\S]*font-size "24px"[\s\S]*font-weight "bold"/)
})

test('applies text style changes to a selected relation label', async ({ page }) => {
  await page.goto('/')

  await page.locator('[data-relation-label-id="calls"]').click()

  await expect(page.locator('[data-relation-id="calls"]')).toHaveAttribute('data-state', 'selected')
  await page.getByLabel('Tamanho da fonte', { exact: true }).fill('19')
  await page.getByRole('button', { name: 'Itálico' }).click()

  const label = page.locator('[data-relation-label-id="calls"]')
  await expect(label).toHaveCSS('font-size', '19px')
  await expect(label).toHaveAttribute('font-style', 'italic')

  await page.getByRole('tab', { name: 'Stylesheet aplicado' }).click()
  const stylesheet = page.locator('.cm-content')
  await expect(stylesheet).toContainText('relation id calls')
  await expect(stylesheet).toContainText(/relation id calls \{[\s\S]*font-size "19px"[\s\S]*font-style "italic"/)
})

test('applies text style changes to a selected boundary label', async ({ page }) => {
  await page.goto('/')

  await page.locator('[data-group-id="solution"]').click({ position: { x: 24, y: 24 } })

  await expect(page.locator('[data-group-id="solution"]')).toHaveAttribute('data-state', 'selected')
  await page.getByLabel('Tamanho da fonte', { exact: true }).fill('18')
  await page.getByRole('button', { name: 'Sublinhar' }).click()

  const label = page.locator('[data-group-id="solution"] .group-label')
  await expect(label).toHaveCSS('font-size', '18px')
  await expect(label).toHaveAttribute('text-decoration', 'underline')

  await page.getByRole('tab', { name: 'Stylesheet aplicado' }).click()
  const stylesheet = page.locator('.cm-content')
  await expect(stylesheet).toContainText('group id solution')
  await expect(stylesheet).toContainText(/group id solution \{[\s\S]*font-size "18px"[\s\S]*text-decoration "underline"/)
})
