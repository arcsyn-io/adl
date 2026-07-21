import { expect, test } from '@playwright/test'

test('collapses and expands the side menu from the top bar', async ({ page }) => {
  await page.goto('/')

  const sidebar = page.getByRole('complementary', { name: 'Workspace lateral' })
  const diagram = page.getByRole('region', { name: 'Diagrama Payments Flow' })
  const toggle = page.getByRole('button', { name: 'Recolher painel lateral' })
  const initialDiagramWidth = await diagram.evaluate(element => element.getBoundingClientRect().width)

  await toggle.click()
  await expect(sidebar).toBeHidden()
  const expandToggle = page.getByRole('button', { name: 'Expandir painel lateral' })
  await expect(expandToggle).toHaveAttribute('aria-expanded', 'false')
  await expect.poll(() => diagram.evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThan(initialDiagramWidth)

  await page.getByRole('button', { name: 'Expandir painel lateral' }).click()
  await expect(page.getByRole('button', { name: 'Recolher painel lateral' })).toHaveAttribute('aria-expanded', 'true')
  await expect(sidebar).toBeVisible()
  await expect(page.getByRole('button', { name: 'Recolher painel lateral' })).toBeVisible()
})
