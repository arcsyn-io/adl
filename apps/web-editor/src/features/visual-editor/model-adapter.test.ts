import { parse } from '@adl/parser'
import { buildSemanticModel } from '@adl/semantic'
import { describe, expect, it } from 'vitest'
import { fromDiagramModel, toDiagramModel } from './model-adapter.js'

describe('visual model adapter', () => {
  it('keeps visual edits renderable as a semantic diagram', () => {
    const parsed = parse('adl version "1.0" diagram { element api { name "API" type "service" } }')
    if (!parsed.ok) throw new Error('fixture')
    const semantic = buildSemanticModel(parsed.document)
    if (!semantic.ok) throw new Error('fixture')
    const visual = fromDiagramModel(semantic.model)
    const rendered = toDiagramModel({ ...visual, elements: { ...visual.elements, worker: { id: 'worker', name: 'Worker', type: 'service' } } })
    expect(rendered.elements.map(element => element.identity.value)).toEqual(['api', 'worker'])
  })
})
