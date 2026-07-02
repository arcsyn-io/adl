import { expect, test } from '@playwright/test'

test('opens the ADL editor', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Payments Flow' })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Assistente ADL' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Diagrama Payments Flow' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Descreva alterações no diagrama' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enviar' })).toBeVisible()
})
