import type { AssistanceRequest, Proposal, ProviderAdapter } from '@adl/ai-contracts'
import {
  OLLAMA_PROPOSAL_JSON_SCHEMA,
  requestOllamaStructuredProposal,
  type OllamaConfig,
  type OllamaFetch,
} from './ollama-client.js'

export const ollamaProposalJsonSchema = OLLAMA_PROPOSAL_JSON_SCHEMA

const ADL_SYSTEM_PROMPT = `Você gera documentos ADL 1.0 para diagramas de arquitetura.

Responda somente no JSON exigido pelo schema, com "source" e "summary".
O campo source deve conter um documento ADL completo e válido.
Não use Markdown, fences, coordenadas, dimensões ou stylesheet.
Use IDs ASCII únicos com letras, números, "_" ou "-".
Toda relação deve apontar para elementos declarados.

Sintaxe suportada:
adl version "1.0" diagram {
  element api { name "API" type "service" }
  element database { name "Database" type "data" }
  relation writes { source api target database name "writes" type "link" }
  group backend { name "Backend" elements [api, database] }
}

O schema de resposta é:
${JSON.stringify(OLLAMA_PROPOSAL_JSON_SCHEMA)}`

export function createOllamaDiagramProvider(options: {
  readonly config: OllamaConfig
  readonly fetcher?: OllamaFetch
}): ProviderAdapter {
  return {
    id: `ollama:${options.config.model}`,
    async propose(request: AssistanceRequest): Promise<Proposal> {
      const result = await requestOllamaStructuredProposal(options.config, [
        { role: 'system', content: ADL_SYSTEM_PROMPT },
        { role: 'user', content: request.disclosedContent },
      ], { ...(options.fetcher ? { fetcher: options.fetcher } : {}) })
      return {
        requestId: request.id,
        baseRevision: request.baseRevision,
        source: result.source,
        summary: result.summary,
      }
    },
  }
}
