import { describe, expect, it } from 'vitest'
import { freeFontOptions } from './free-font-options.js'

describe('free font options', () => {
  it('uses a closed list of documented free fonts with generic fallbacks', () => {
    expect(freeFontOptions.length).toBeGreaterThanOrEqual(5)
    expect(new Set(freeFontOptions.map(option => option.id)).size).toBe(freeFontOptions.length)

    for (const option of freeFontOptions) {
      expect(option.licenseName).toMatch(/Open Font|Apache/)
      expect(option.licenseSource.length).toBeGreaterThan(0)
      expect(['sans-serif', 'serif', 'monospace']).toContain(option.genericFallback)
      expect(option.fontFamily.at(-1)).toBe(option.genericFallback)
    }
  })
})
