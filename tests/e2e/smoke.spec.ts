import { expect, test } from '@playwright/test'

test('opens the ADL editor', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Payments Flow' })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Workspace lateral' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Assistente IA' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('region', { name: 'Diagrama Payments Flow' })).toBeVisible()
})

test('starts with every MDL element and connector supported by ADL',async({page})=>{await page.goto('/');const diagram=page.getByRole('img');for(const type of ['user','data','backend','frontend','black-box','part','queue'])await expect(diagram.getByText(type,{exact:true})).toBeVisible();await expect(diagram.getByText('Solution boundary',{exact:true})).toBeVisible();await expect(page.locator('[data-entity-id="api"] [data-shape="ellipse"]')).toHaveCount(1);await expect(page.locator('[data-entity-id="database"] [data-shape="cylinder"][data-orientation="vertical"]')).toHaveCount(1);await expect(page.locator('[data-entity-id="customer"] [data-shape="user"]')).toHaveCount(1);await expect(page.locator('[data-entity-id="web"] [data-shape="parallelogram"]')).toHaveCount(1);await expect(page.locator('[data-entity-id="partner"] [data-shape="rectangle"]')).toHaveCount(1);await expect(page.locator('[data-entity-id="auth"] [data-shape="rectangle"]')).toHaveCount(1);await expect(page.locator('[data-entity-id="queue"] [data-shape="cylinder"][data-orientation="horizontal"]')).toHaveCount(1);for(const connector of ['link','always-link','specialization','virtual-link','composition'])await expect(page.locator(`[data-connector-kind="${connector}"]`)).toHaveCount(1)})
