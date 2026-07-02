import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSourceBinding } from './source-binding.js'

const valid = (name: string) => `adl version "1.0" diagram { element api { name "${name}" type "service" } }`

describe('debounced source binding', () => {
  afterEach(() => vi.useRealTimers())

  it('applies only valid semantic models after 30 ms', () => {
    vi.useFakeTimers()
    const applied = vi.fn()
    const binding = createSourceBinding(applied, 30)
    binding.schedule(valid('First'))
    vi.advanceTimersByTime(29)
    expect(applied).not.toHaveBeenCalled()
    binding.schedule('invalid source')
    vi.advanceTimersByTime(30)
    expect(applied).not.toHaveBeenCalled()
    binding.schedule(valid('Updated'))
    vi.advanceTimersByTime(30)
    expect(applied).toHaveBeenCalledTimes(1)
    expect(applied.mock.calls[0]?.[0].elements[0]?.name).toBe('Updated')
  })
})
