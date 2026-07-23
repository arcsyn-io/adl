import { describe, expect, it, vi } from 'vitest'
import { createOllamaDiagramProvider, ollamaProposalJsonSchema } from './ollama-provider.js'

describe('ollama diagram provider', () => {
  it('builds an ADL-grounded request and correlates the proposal', async () => {
    const fetcher = vi.fn(async (_input: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { messages: Array<{ role: string; content: string }> }
      expect(body.messages[0]?.content).toContain('adl version "1.0" diagram')
      expect(body.messages[0]?.content).toContain('Não use Markdown')
      expect(body.messages[1]?.content).toContain('fila de cobrança')
      return new Response(JSON.stringify({
        message: {
          content: JSON.stringify({
            source: 'adl version "1.0" diagram { element billing { name "Billing" type "service" } }',
            summary: 'Serviço de cobrança',
          }),
        },
      }), { status: 200 })
    })
    const provider = createOllamaDiagramProvider({
      config: { endpoint: 'http://127.0.0.1:11434', model: 'qwen3:4b', timeoutMs: 120_000 },
      fetcher,
    })
    await expect(provider.propose({
      id: 'r1',
      intent: 'create-diagram',
      baseRevision: 7,
      disclosedContent: 'Crie uma fila de cobrança',
    })).resolves.toEqual({
      requestId: 'r1',
      baseRevision: 7,
      source: 'adl version "1.0" diagram { element billing { name "Billing" type "service" } }',
      summary: 'Serviço de cobrança',
    })
    expect(ollamaProposalJsonSchema.required).toEqual(['source', 'summary'])
  })
})
