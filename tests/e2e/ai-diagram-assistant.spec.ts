import { expect, test } from '@playwright/test'

async function generateProposal(page: import('@playwright/test').Page, prompt: string) {
  await page.getByLabel('Provedor de geração').selectOption('demo')
  await page.getByLabel('Descreva o diagrama').fill(prompt)
  await page.getByRole('button', { name: 'Preparar proposta' }).click()
  const disclosure = page.getByRole('heading', { name: 'Conteúdo divulgado' }).locator('..')
  await expect(disclosure).toBeVisible()
  await expect(disclosure).toContainText(prompt)
  await page.getByLabel('Autorizo esta solicitação com o conteúdo exibido.').check()
  await page.getByRole('button', { name: 'Gerar proposta' }).click()
  await expect(page.getByRole('heading', { name: 'Proposta pronta' })).toBeVisible()
}

test('generates, reviews and applies a local ADL proposal', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByLabel('Provedor de geração')).toHaveValue('ollama')
  await expect(page.getByText('qwen3:4b', { exact: true })).toBeVisible()
  await expect(page.locator('[data-entity-id="worker"]')).toHaveCount(0)

  await generateProposal(page, 'API publica em uma fila, worker grava no banco e notifica sistema externo.')
  await expect(page.getByText('Demonstração local sem IA', { exact: false })).toBeVisible()

  await expect(page.locator('[data-entity-id="worker"]')).toHaveCount(0)
  await expect(page.getByText('element worker', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Aplicar proposta' }).click()

  await expect(page.getByText('Proposta aplicada ao documento.')).toBeVisible()
  await expect(page.locator('[data-entity-id="worker"]')).toBeVisible()
  await page.getByRole('tab', { name: 'Código ADL' }).click()
  await expect(page.locator('.cm-content')).toContainText('element worker')
})

test('discards a proposal without changing the diagram', async ({ page }) => {
  await page.goto('/')

  await generateProposal(page, 'API envia trabalho para um worker.')
  await page.getByRole('button', { name: 'Descartar' }).click()

  await expect(page.getByRole('heading', { name: 'Proposta pronta' })).toHaveCount(0)
  await expect(page.locator('[data-entity-id="worker"]')).toHaveCount(0)
  await expect(page.locator('[data-entity-id="database"]')).toBeVisible()
})

test('blocks a proposal after the document revision changes', async ({ page }) => {
  await page.goto('/')

  await generateProposal(page, 'API envia trabalho para um worker.')
  await page.getByRole('img').getByRole('button', { name: /API/ }).click()
  await page.getByRole('button', { name: 'Copiar selecao' }).click()
  await expect(page.locator('[data-entity-id="api_copy"]')).toBeVisible()

  await page.getByRole('button', { name: 'Aplicar proposta' }).click()
  await expect(page.getByRole('alert')).toContainText('O documento mudou desde a geração')
  await expect(page.locator('[data-entity-id="api_copy"]')).toBeVisible()
  await expect(page.locator('[data-entity-id="worker"]')).toHaveCount(0)
})

test('shows Ollama recovery instructions and keeps the explicit demo fallback', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByLabel('Provedor de geração')).toHaveValue('ollama')
  await expect(page.getByText('Ollama indisponível', { exact: false })).toBeVisible()
  await expect(page.getByText('ollama pull qwen3:4b', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Gerar proposta' })).toHaveCount(0)

  await page.getByLabel('Provedor de geração').selectOption('demo')
  await expect(page.getByText('Demonstração local sem IA', { exact: false })).toBeVisible()
})
