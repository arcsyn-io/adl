import { emptyPlacementState } from '@adl/canvas-state'
import { parse } from '@adl/parser'
import { buildSemanticModel } from '@adl/semantic'
import { describe, expect, it } from 'vitest'
import { composeDiagramGeometry } from './diagram-geometry.js'

const source = 'adl version "1.0" diagram { element api { name "API" type "backend" } element api_copy { name "API Copy" type "backend" } }'
const parsed = parse(source)
if (!parsed.ok) throw new Error('Invalid fixture')
const semantic = buildSemanticModel(parsed.document)
if (!semantic.ok) throw new Error('Invalid fixture')
const model = semantic.model

describe('composeDiagramGeometry', () => {
  it('keeps the current diagram geometry and places a copied element before its layout is ready', () => {
    const geometry = composeDiagramGeometry({
      model,
      layout: { revision: '1', nodes: { api: { x: 80, y: 120, width: 180, height: 84 } }, edges: {} },
      placements: emptyPlacementState(),
      optimisticGeometry: { api_copy: { x: 104, y: 144, width: 180, height: 84 } },
    })

    expect(geometry).toEqual({
      api: { x: 80, y: 120, width: 180, height: 84 },
      api_copy: { x: 104, y: 144, width: 180, height: 84 },
    })
  })

  it('gives an element added from source a visible fallback geometry', () => {
    const geometry = composeDiagramGeometry({
      model,
      layout: { revision: '1', nodes: { api: { x: 80, y: 120, width: 180, height: 84 } }, edges: {} },
      placements: emptyPlacementState(),
      optimisticGeometry: {},
    })

    expect(geometry.api_copy).toMatchObject({ width: 180, height: 84 })
    expect(geometry.api_copy).not.toEqual(geometry.api)
  })
})
