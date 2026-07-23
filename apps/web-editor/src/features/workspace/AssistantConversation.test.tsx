import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createLocalDiagramProvider, createOllamaDiagramProvider, DEFAULT_OLLAMA_CONFIG } from '../assistant/index.js'
import { AssistantConversation } from './WorkspaceChrome.js'

describe('AssistantConversation', () => {
  it('renders the local proposal preparation and consent flow', () => {
    const markup = renderToStaticMarkup(createElement(AssistantConversation, {
      currentSource: 'adl version "1.0" diagram {}',
      currentRevision: 0,
      providers: {
        ollama: createOllamaDiagramProvider({ config: DEFAULT_OLLAMA_CONFIG }),
        demo: createLocalDiagramProvider(),
      },
      ollamaConfig: DEFAULT_OLLAMA_CONFIG,
      onApply: () => undefined,
    }))
    expect(markup).toContain('Ollama local')
    expect(markup).toContain('qwen3:4b')
    expect(markup).toContain('Demonstração (sem IA)')
    expect(markup).toContain('Preparar proposta')
    expect(markup).toContain('Descreva o diagrama')
    expect(markup).not.toContain('API conectada')
  })
})
