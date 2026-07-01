import { expect, test } from '@playwright/test'

test('edits ADL with current diagnostics and keyboard controls', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Editor ADL' })).toBeVisible()
  await expect(page.getByText('Documento válido.')).toBeVisible()
  await page.locator('.cm-content').click()
  await page.keyboard.press('Control+End')
  await page.keyboard.type(' invalid')
  await expect(page.getByRole('heading', { name: /Diagnósticos \([1-9]/ })).toBeVisible()
  await page.getByRole('button', { name: 'Desfazer' }).first().click()
})

test('creates, relates, selects and safely removes visual entities by keyboard', async ({ page }) => {
  await page.goto('/')
  const visual = page.getByRole('heading', { name: 'Editor visual' }).locator('..').locator('..')
  await expect(visual.getByLabel('Tipo').first()).toHaveRole('combobox')
  await visual.getByLabel('ID').first().fill('worker'); await visual.getByLabel('Nome').first().fill('Worker'); await visual.getByLabel('Tipo').first().selectOption('service'); await visual.getByRole('button', { name: 'Adicionar elemento' }).click()
  await expect(page.getByRole('img', { name: /Worker/ }).getByText('Worker', { exact: true })).toBeVisible()
  const relation = visual.getByRole('heading', { name: 'Nova relação' }).locator('..'); await relation.locator('input[name="id"]').fill('dispatches'); await relation.locator('select[name="source"]').selectOption('api'); await relation.locator('select[name="target"]').selectOption('worker'); await relation.getByRole('button', { name: 'Adicionar relação' }).click()
  await visual.getByRole('button', { name: /Worker.*worker/ }).focus(); await page.keyboard.press('Enter')
  await visual.getByRole('button', { name: 'Remover Worker' }).click(); await expect(visual.getByRole('alert')).toContainText('dependentes'); await visual.getByRole('button', { name: /Confirmar remoção/ }).click(); await expect(visual.getByText('Worker', { exact: true })).toHaveCount(0)
})
