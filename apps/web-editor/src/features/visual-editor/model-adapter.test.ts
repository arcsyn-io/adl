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

  it('preserves the MDL connector type in both directions',()=>{const parsed=parse('adl version "1.0" diagram { element api { name "API" type "service" } element db { name "DB" type "database" } relation writes { source api target db type "always-link" } }');if(!parsed.ok)throw new Error('fixture');const semantic=buildSemanticModel(parsed.document);if(!semantic.ok)throw new Error('fixture');const visual=fromDiagramModel(semantic.model);expect(visual.relations.writes?.type).toBe('always-link');expect(toDiagramModel(visual).relations[0]?.type).toBe('always-link')})
})
