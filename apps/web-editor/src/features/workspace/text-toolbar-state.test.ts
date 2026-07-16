import { describe, expect, it } from 'vitest'
import { deriveTextToolbarState } from './text-toolbar-state.js'
import type { ResolvedDiagramStyles, ResolvedElementStyle, ResolvedGroupStyle, TextStyle } from '@adl/stylesheet'

const text = (overrides: Partial<TextStyle> = {}): TextStyle => ({
  paint: { kind: 'solid', color: '#111111FF' },
  fontSize: 14,
  fontFamily: ['Inter', 'sans-serif'],
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  textAlign: 'center',
  verticalAlign: 'middle',
  ...overrides,
})

const element = (textStyle: TextStyle): ResolvedElementStyle => ({
  shape: 'rectangle',
  width: 180,
  height: 96,
  fill: { kind: 'solid', color: '#FFFFFF' },
  borderPaint: { kind: 'solid', color: '#000000' },
  borderWidth: 1,
  borderRadius: 0,
  orientation: 'horizontal',
  rotation: 0,
  text: textStyle,
})

const group = (textStyle: TextStyle): ResolvedGroupStyle => ({
  text: textStyle,
})

const styles = (items: Record<string, TextStyle>): ResolvedDiagramStyles => ({
  elements: Object.fromEntries(Object.entries(items).map(([id, style]) => [id, element(style)])),
  relations: {},
  groups: {},
  diagnostics: [],
  completeness: 'complete',
})

describe('deriveTextToolbarState', () => {
  it('returns empty values and disabled actions without selection', () => {
    const state = deriveTextToolbarState({ selectedIds: [], styles: styles({}) })
    expect(state.targets).toHaveLength(0)
    expect(state.values.fontSize).toEqual({ kind: 'empty' })
    expect(state.actions.copy.enabled).toBe(false)
  })

  it('returns single values for one selected element', () => {
    const state = deriveTextToolbarState({ selectedIds: ['api'], styles: styles({ api: text({ fontWeight: 'bold', paint: { kind: 'solid', color: '#123456FF' } }) }) })
    expect(state.targets).toMatchObject([{ kind: 'element-text', entityId: 'api', canPersistStyle: true }])
    expect(state.values.fontFamily).toEqual({ kind: 'single', value: ['Inter', 'sans-serif'] })
    expect(state.values.fontWeight).toEqual({ kind: 'single', value: 'bold' })
    expect(state.usedTextPaints).toEqual(['#123456FF'])
    expect(state.actions.remove.enabled).toBe(true)
  })

  it('reports mixed values for multiselection without losing common values', () => {
    const state = deriveTextToolbarState({
      selectedIds: ['api', 'db'],
      styles: styles({ api: text({ fontSize: 16 }), db: text({ fontSize: 20 }) }),
    })
    expect(state.values.fontSize).toEqual({ kind: 'mixed' })
    expect(state.values.textAlign).toEqual({ kind: 'single', value: 'center' })
  })

  it('returns text controls for a selected boundary group', () => {
    const state = deriveTextToolbarState({
      selectedIds: ['solution'],
      styles: {
        elements: {},
        relations: {},
        groups: { solution: group(text({ fontSize: 18, paint: { kind: 'solid', color: '#667085FF' } })) },
        diagnostics: [],
        completeness: 'complete',
      },
    })
    expect(state.targets).toMatchObject([{ kind: 'group-label', entityId: 'solution', canPersistStyle: true }])
    expect(state.values.fontSize).toEqual({ kind: 'single', value: 18 })
    expect(state.usedTextPaints).toEqual(['#667085FF'])
  })
})
