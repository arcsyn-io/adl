import { expect, test } from '@playwright/test'

test('opens the ADL editor', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Architecture diagram' })).toBeVisible()
})

test('starts with every MDL element and connector supported by ADL',async({page})=>{await page.goto('/');const diagram=page.getByRole('img');for(const type of ['user','data','backend','frontend','black-box','part'])await expect(diagram.getByText(type,{exact:true})).toBeVisible();await expect(diagram.getByText('Solution boundary',{exact:true})).toBeVisible();for(const connector of ['link','always-link','specialization','virtual-link','composition'])await expect(page.locator(`[data-connector-kind="${connector}"]`)).toHaveCount(1)})
