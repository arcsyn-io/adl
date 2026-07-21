import { buildSemanticModel } from '@adl/semantic'
import { parse } from '@adl/parser'
import { describe, expect, it } from 'vitest'
import { applyEditableEntityText, findEditableEntityText } from './text-editing.js'

const source = 'adl version "1.0" diagram { element api { name "API" type "service" } element db { name "Database" type "data" } relation uses { source api target db type "link" } }'

function model() {
  const parsed = parse(source)
  if (!parsed.ok) throw new Error('fixture')
  const semantic = buildSemanticModel(parsed.document)
  if (!semantic.ok) throw new Error('fixture')
  return semantic.model
}

describe('canvas text editing', () => {
  it('edits required element names and adds an optional relation name', () => {
    const initial = model()
    const element = findEditableEntityText(initial, 'api')
    const relation = findEditableEntityText(initial, 'uses')

    expect(element).toMatchObject({ kind: 'element', entityId: 'api', text: 'API' })
    expect(relation).toMatchObject({ kind: 'relation', entityId: 'uses', text: null })
    if (!element || !relation) throw new Error('fixture')

    const renamed = applyEditableEntityText(initial, { ...element, text: 'API Gateway' })
    const namedRelation = applyEditableEntityText(renamed, { ...relation, text: 'uses API' })

    expect(namedRelation.elements[0]?.name).toBe('API Gateway')
    expect(namedRelation.relations[0]?.name).toBe('uses API')
  })

  it('does not clear a required element name but clears an optional relation name', () => {
    const initial = model()
    const unchanged = applyEditableEntityText(initial, { kind: 'element', entityId: 'api', text: '' })
    const named = applyEditableEntityText(initial, { kind: 'relation', entityId: 'uses', text: 'uses API' })
    const cleared = applyEditableEntityText(named, { kind: 'relation', entityId: 'uses', text: '' })

    expect(unchanged).toBe(initial)
    expect(cleared.relations[0]?.name).toBeNull()
  })
})
