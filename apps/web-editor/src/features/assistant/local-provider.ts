import type { AssistanceRequest, Proposal, ProviderAdapter } from '@adl/ai-contracts'

interface DiagramConcept {
  readonly id: string
  readonly name: string
  readonly type: string
  readonly patterns: readonly RegExp[]
}

const concepts: readonly DiagramConcept[] = [
  { id: 'customer', name: 'Customer', type: 'user', patterns: [/\bcliente\b/i, /\bcustomer\b/i, /\busu[aá]rio\b/i] },
  { id: 'web', name: 'Web application', type: 'frontend', patterns: [/\bweb\b/i, /\bfront-?end\b/i, /\baplica[cç][aã]o\b/i] },
  { id: 'api', name: 'API', type: 'backend', patterns: [/\bapi\b/i, /\bbackend\b/i, /\bservi[cç]o\b/i] },
  { id: 'queue', name: 'Message queue', type: 'queue', patterns: [/\bfila\b/i, /\bqueue\b/i, /\bmensageria\b/i] },
  { id: 'worker', name: 'Worker', type: 'worker', patterns: [/\bworker\b/i, /\bprocessador\b/i, /\bconsumidor\b/i] },
  { id: 'database', name: 'Database', type: 'data', patterns: [/\bbanco\b/i, /\bdatabase\b/i, /\bpostgres(?:ql)?\b/i] },
  { id: 'external_system', name: 'External system', type: 'black-box', patterns: [/\bextern[oa]\b/i, /\bantifraude\b/i, /\bpartner\b/i] },
] as const

function promptFromDisclosedContent(content: string): string {
  const start = content.indexOf('Pedido do autor:')
  const end = content.indexOf('\n\nDocumento ADL atual:')
  return start >= 0 && end > start
    ? content.slice(start + 'Pedido do autor:'.length, end).trim()
    : content
}

function selectedConcepts(prompt: string): readonly DiagramConcept[] {
  const selected = concepts.filter(concept => concept.patterns.some(pattern => pattern.test(prompt)))
  if (selected.length >= 2) return selected
  if (selected.length === 1) {
    const only = selected[0]!
    const companion = only.id === 'customer'
      ? concepts.find(concept => concept.id === 'web')!
      : concepts.find(concept => concept.id === 'customer')!
    return [companion, only]
  }
  return [
    { id: 'user', name: 'User', type: 'user', patterns: [] },
    { id: 'system', name: 'System', type: 'service', patterns: [] },
  ]
}

function createSource(prompt: string): string {
  const selected = selectedConcepts(prompt)
  const elements = selected.map(concept =>
    `  element ${concept.id} { name "${concept.name}" type "${concept.type}" }`,
  )
  const relations = selected.slice(0, -1).map((concept, index) => {
    const target = selected[index + 1]!
    return `  relation connects_${concept.id}_${target.id} { source ${concept.id} target ${target.id} name "connects to" type "link" }`
  })
  const members = selected.map(concept => concept.id).join(', ')
  return [
    'adl version "1.0" diagram {',
    ...elements,
    '',
    ...relations,
    '',
    `  group generated_solution { name "Generated solution" elements [${members}] }`,
    '}',
  ].join('\n')
}

export function createLocalDiagramProvider(): ProviderAdapter {
  return {
    id: 'local-diagram-demo',
    async propose(request: AssistanceRequest): Promise<Proposal> {
      const prompt = promptFromDisclosedContent(request.disclosedContent)
      const source = createSource(prompt)
      return {
        requestId: request.id,
        baseRevision: request.baseRevision,
        source,
        summary: `Proposta local com ${selectedConcepts(prompt).length} elementos e layout automático.`,
      }
    },
  }
}
