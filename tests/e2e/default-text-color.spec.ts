import { expect, test } from '@playwright/test'

test('renders unstyled labels with the default text color', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('[data-entity-id="api"] text').first()).toHaveAttribute('fill', '#CBD5E1FF')
})
