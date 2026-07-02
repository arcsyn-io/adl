import { parse } from '@adl/parser'
import { buildSemanticModel, type DiagramModel } from '@adl/semantic'

export interface SourceBinding {
  schedule(source: string): void
  dispose(): void
}

export function createSourceBinding(apply: (model: DiagramModel) => void, debounceMs = 30): SourceBinding {
  let pending: ReturnType<typeof setTimeout> | undefined
  return {
    schedule(source) {
      if (pending !== undefined) clearTimeout(pending)
      pending = setTimeout(() => {
        pending = undefined
        const parsed = parse(source)
        if (!parsed.ok) return
        const semantic = buildSemanticModel(parsed.document)
        if (semantic.ok) apply(semantic.model)
      }, debounceMs)
    },
    dispose() {
      if (pending !== undefined) clearTimeout(pending)
      pending = undefined
    },
  }
}
