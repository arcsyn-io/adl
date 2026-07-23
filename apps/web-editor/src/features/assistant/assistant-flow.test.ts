import { describe, expect, it, vi } from 'vitest'
import type { ProviderAdapter } from '@adl/ai-contracts'
import { applyAssistantProposal, generateAssistantProposal, prepareAssistantRequest } from './assistant-flow.js'

const source = 'adl version "1.0" diagram { element current { name "Current" type "service" } }'
const proposed = 'adl version "1.0" diagram { element next { name "Next" type "service" } }'
const validator = {
  validate(value: string) {
    return value.startsWith('adl version "1.0"')
      ? { ok: true as const }
      : { ok: false as const, message: 'ADL inválido.' }
  },
}

describe('assistant flow', () => {
  it('rejects an empty prompt before creating a request', () => {
    expect(prepareAssistantRequest({ prompt: '  ', currentSource: source, currentRevision: 3, requestId: 'r1' }))
      .toEqual({ ok: false, message: 'Descreva o diagrama que deseja gerar.' })
  })

  it('prepares the exact disclosed content and base revision', () => {
    const result = prepareAssistantRequest({ prompt: 'Crie uma API', currentSource: source, currentRevision: 3, requestId: 'r1' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.request).toMatchObject({ id: 'r1', intent: 'revise-diagram', baseRevision: 3 })
    expect(result.request.disclosedContent).toContain('Crie uma API')
    expect(result.request.disclosedContent).toContain(source)
  })

  it('does not call the provider without consent', async () => {
    const prepared = prepareAssistantRequest({ prompt: 'Crie uma API', currentSource: source, currentRevision: 3, requestId: 'r1' })
    if (!prepared.ok) throw new Error('fixture')
    const propose = vi.fn()
    const result = await generateAssistantProposal({
      request: prepared.request,
      approved: false,
      provider: { id: 'test', propose },
      currentSource: source,
      currentRevision: 3,
      validator,
    })
    expect(result.ok).toBe(false)
    expect(propose).not.toHaveBeenCalled()
  })

  it('validates a provider proposal before exposing its preview', async () => {
    const prepared = prepareAssistantRequest({ prompt: 'Crie uma API', currentSource: source, currentRevision: 3, requestId: 'r1' })
    if (!prepared.ok) throw new Error('fixture')
    const provider: ProviderAdapter = {
      id: 'test',
      propose: async () => ({ requestId: 'r1', baseRevision: 3, source: proposed, summary: 'Novo diagrama' }),
    }
    const result = await generateAssistantProposal({
      request: prepared.request,
      approved: true,
      provider,
      currentSource: source,
      currentRevision: 3,
      validator,
    })
    expect(result).toMatchObject({ ok: true, preview: { before: source, after: proposed }, proposal: { summary: 'Novo diagrama' } })
  })

  it('rejects a stale proposal when applying', () => {
    const result = applyAssistantProposal({
      proposal: { requestId: 'r1', baseRevision: 3, source: proposed, summary: 'Novo diagrama' },
      currentSource: source,
      currentRevision: 4,
      validator,
    })
    expect(result).toMatchObject({ ok: false, code: 'STALE_PROPOSAL' })
    expect(source).toContain('current')
  })
})
