import { z } from 'zod'

export interface OllamaConfig {
  readonly endpoint: string
  readonly model: string
  readonly timeoutMs: number
}

export type OllamaFetch = (input: string, init?: RequestInit) => Promise<Response>

export type OllamaStatus =
  | { readonly kind: 'available'; readonly model: string }
  | { readonly kind: 'model-missing'; readonly model: string }
  | { readonly kind: 'unavailable'; readonly message: string }

export interface OllamaChatMessage {
  readonly role: 'system' | 'user'
  readonly content: string
}

export const DEFAULT_OLLAMA_CONFIG: OllamaConfig = Object.freeze({
  endpoint: 'http://127.0.0.1:11434',
  model: 'qwen3:4b',
  timeoutMs: 120_000,
})

const OllamaTagsSchema = z.object({
  models: z.array(z.object({
    name: z.string(),
    model: z.string().optional(),
  })),
})

const OllamaChatSchema = z.object({
  message: z.object({
    content: z.string(),
  }),
})

const OllamaErrorSchema = z.object({ error: z.string() })

export const OllamaStructuredProposalSchema = z.object({
  source: z.string().trim().min(1),
  summary: z.string().trim().min(1),
})

export type OllamaStructuredProposal = z.infer<typeof OllamaStructuredProposalSchema>

export const OLLAMA_PROPOSAL_JSON_SCHEMA = Object.freeze({
  type: 'object',
  properties: {
    source: { type: 'string' },
    summary: { type: 'string' },
  },
  required: ['source', 'summary'],
  additionalProperties: false,
} as const)

export function normalizeOllamaEndpoint(value: string): string {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('Informe um endpoint HTTP válido para o Ollama local.')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('O endpoint do Ollama deve usar HTTP ou HTTPS.')
  }
  const localHosts = new Set(['127.0.0.1', 'localhost', '[::1]'])
  if (!localHosts.has(url.hostname)) {
    throw new Error('O endpoint deve apontar para um runtime local.')
  }
  if (url.username || url.password || (url.pathname !== '/' && url.pathname !== '')) {
    throw new Error('Informe somente a origem local do Ollama, sem credenciais ou caminho.')
  }
  return url.origin
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  fetcher: OllamaFetch,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetcher(url, { ...init, signal: controller.signal })
  } catch (cause) {
    if (controller.signal.aborted) {
      throw new Error(`O Ollama excedeu o tempo limite de ${timeoutMs} ms.`, { cause })
    }
    throw cause
  } finally {
    clearTimeout(timer)
  }
}

async function responseError(response: Response, model: string): Promise<Error> {
  const body: unknown = await response.json().catch(() => undefined)
  const parsed = OllamaErrorSchema.safeParse(body)
  if (response.status === 404) {
    return new Error(`O modelo ${model} não está instalado. Execute: ollama pull ${model}`)
  }
  return new Error(parsed.success
    ? `Ollama respondeu com erro ${response.status}: ${parsed.data.error}`
    : `Ollama respondeu com erro HTTP ${response.status}.`)
}

const modelIdentity = (value: string): string => value.endsWith(':latest') ? value.slice(0, -':latest'.length) : value

export async function checkOllamaStatus(
  config: OllamaConfig,
  options: { readonly fetcher?: OllamaFetch; readonly timeoutMs?: number } = {},
): Promise<OllamaStatus> {
  const endpoint = normalizeOllamaEndpoint(config.endpoint)
  const fetcher = options.fetcher ?? fetch
  try {
    const response = await fetchWithTimeout(`${endpoint}/api/tags`, { method: 'GET' }, options.timeoutMs ?? 1_000, fetcher)
    if (!response.ok) return { kind: 'unavailable', message: (await responseError(response, config.model)).message }
    const body: unknown = await response.json()
    const parsed = OllamaTagsSchema.safeParse(body)
    if (!parsed.success) return { kind: 'unavailable', message: 'Ollama retornou uma lista de modelos inválida.' }
    const expected = modelIdentity(config.model)
    const installed = parsed.data.models.some(item =>
      [item.name, item.model].some(name => typeof name === 'string' && modelIdentity(name) === expected),
    )
    return installed
      ? { kind: 'available', model: config.model }
      : { kind: 'model-missing', model: config.model }
  } catch (cause) {
    return {
      kind: 'unavailable',
      message: cause instanceof Error
        ? `Ollama local não está acessível: ${cause.message}`
        : 'Ollama local não está acessível.',
    }
  }
}

export async function requestOllamaStructuredProposal(
  config: OllamaConfig,
  content: string | readonly OllamaChatMessage[],
  options: { readonly fetcher?: OllamaFetch } = {},
): Promise<OllamaStructuredProposal> {
  const endpoint = normalizeOllamaEndpoint(config.endpoint)
  const messages: readonly OllamaChatMessage[] = typeof content === 'string'
    ? [{ role: 'user', content }]
    : content
  let response: Response
  try {
    response = await fetchWithTimeout(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages,
        stream: false,
        think: false,
        format: OLLAMA_PROPOSAL_JSON_SCHEMA,
        options: { temperature: 0 },
      }),
    }, config.timeoutMs, options.fetcher ?? fetch)
  } catch (cause) {
    if (cause instanceof Error && cause.message.includes('tempo limite')) throw cause
    throw new Error('Ollama local não está acessível. Inicie o Ollama e confira a permissão de origem do navegador.', { cause })
  }
  if (!response.ok) throw await responseError(response, config.model)
  const envelope: unknown = await response.json()
  const parsedEnvelope = OllamaChatSchema.safeParse(envelope)
  if (!parsedEnvelope.success) throw new Error('Ollama retornou um envelope de resposta inválido.')
  let proposal: unknown
  try {
    proposal = JSON.parse(parsedEnvelope.data.message.content)
  } catch {
    throw new Error('Ollama retornou conteúdo que não é JSON estruturado.')
  }
  const parsedProposal = OllamaStructuredProposalSchema.safeParse(proposal)
  if (!parsedProposal.success) throw new Error('Ollama retornou uma proposta fora do contrato esperado.')
  return parsedProposal.data
}
