import { expect, test } from '@playwright/test'

test('opens the ADL editor', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Eu te amo Ju, amor da minha vida!' })).toBeVisible()
})
