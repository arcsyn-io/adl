import { describe, expect, it, vi } from 'vitest'
import { checkOllamaStatus, normalizeOllamaEndpoint, requestOllamaStructuredProposal } from './ollama-client.js'

const config = { endpoint: 'http://127.0.0.1:11434', model: 'qwen3:4b', timeoutMs: 120_000 }

describe('ollama client', () => {
  it('accepts only local HTTP endpoints and removes a trailing slash', () => {
    expect(normalizeOllamaEndpoint('http://localhost:11434/')).toBe('http://localhost:11434')
    expect(() => normalizeOllamaEndpoint('https://models.example.com')).toThrow('local')
    expect(() => normalizeOllamaEndpoint('ftp://127.0.0.1')).toThrow('HTTP')
  })

  it('distinguishes available, missing model and unavailable runtime', async () => {
    const availableFetch = vi.fn(async () => new Response(JSON.stringify({
      models: [{ name: 'qwen3:4b', model: 'qwen3:4b' }],
    }), { status: 200 }))
    await expect(checkOllamaStatus(config, { fetcher: availableFetch })).resolves.toEqual({
      kind: 'available',
      model: 'qwen3:4b',
    })

    const missingFetch = vi.fn(async () => new Response(JSON.stringify({ models: [] }), { status: 200 }))
    await expect(checkOllamaStatus(config, { fetcher: missingFetch })).resolves.toEqual({
      kind: 'model-missing',
      model: 'qwen3:4b',
    })

    const offlineFetch = vi.fn(async () => { throw new TypeError('fetch failed') })
    await expect(checkOllamaStatus(config, { fetcher: offlineFetch })).resolves.toMatchObject({
      kind: 'unavailable',
    })
  })

  it('validates the structured chat response', async () => {
    const fetcher = vi.fn(async (input: string, init?: RequestInit) => {
      void input
      void init
      return new Response(JSON.stringify({
        message: {
          content: JSON.stringify({
            source: 'adl version "1.0" diagram {}',
            summary: 'Diagrama vazio',
          }),
        },
      }), { status: 200 })
    })
    await expect(requestOllamaStructuredProposal(config, 'pedido', { fetcher })).resolves.toEqual({
      source: 'adl version "1.0" diagram {}',
      summary: 'Diagrama vazio',
    })
    const body = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body)) as Record<string, unknown>
    expect(body).toMatchObject({ model: 'qwen3:4b', stream: false, think: false })
    expect(body.format).toMatchObject({ type: 'object' })
  })

  it('reports a missing model with the pull command', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ error: 'model not found' }), { status: 404 }))
    await expect(requestOllamaStructuredProposal(config, 'pedido', { fetcher }))
      .rejects.toThrow('ollama pull qwen3:4b')
  })

  it('aborts generation after the configured timeout', async () => {
    vi.useFakeTimers()
    const fetcher = vi.fn((_input: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    }))
    const result = requestOllamaStructuredProposal({ ...config, timeoutMs: 10 }, 'pedido', { fetcher })
    const rejection = expect(result).rejects.toThrow('tempo limite')
    await vi.advanceTimersByTimeAsync(10)
    await rejection
    vi.useRealTimers()
  })
})
