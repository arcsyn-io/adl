import { describe, expect, it } from 'vitest'
import { validateSource } from '@adl/diagnostics'
import { createLocalDiagramProvider } from './local-provider.js'

describe('local diagram provider', () => {
  it('generates deterministic valid ADL for recognized architecture concepts', async () => {
    const provider = createLocalDiagramProvider()
    const request = {
      id: 'request-1',
      intent: 'create-diagram',
      baseRevision: 2,
      disclosedContent: 'Pedido:\nAPI publica em uma fila; worker grava no banco e notifica sistema externo.',
    }
    const first = await provider.propose(request)
    const second = await provider.propose(request)
    expect(first).toEqual(second)
    expect(first).toMatchObject({ requestId: 'request-1', baseRevision: 2 })
    if (!first || typeof first !== 'object' || !('source' in first) || typeof first.source !== 'string') throw new Error('invalid fixture')
    expect(validateSource(first.source).canProceed).toBe(true)
    expect(first.source).toContain('element api')
    expect(first.source).toContain('element queue')
    expect(first.source).toContain('element worker')
    expect(first.source).toContain('element database')
    expect(first.source).toContain('element external_system')
  })

  it('uses a valid fallback when no known concept is present', async () => {
    const result = await createLocalDiagramProvider().propose({
      id: 'request-2',
      intent: 'create-diagram',
      baseRevision: 0,
      disclosedContent: 'Pedido:\nRepresentar minha solução.',
    })
    if (!result || typeof result !== 'object' || !('source' in result) || typeof result.source !== 'string') throw new Error('invalid fixture')
    expect(validateSource(result.source).canProceed).toBe(true)
  })
})
