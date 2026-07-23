import {
  applyProposal,
  previewProposal,
  requestProposal,
  type AssistanceRequest,
  type Proposal,
  type ProposalDiff,
  type ProposalResult,
  type ProposalValidator,
  type ProviderAdapter,
} from '@adl/ai-contracts'
import { validateSource } from '@adl/diagnostics'

export const adlProposalValidator: ProposalValidator = {
  validate(source) {
    const result = validateSource(source)
    if (!result.hasErrors) return { ok: true }
    return {
      ok: false,
      message: result.diagnostics[0]?.message ?? 'A proposta não contém um documento ADL válido.',
    }
  },
}

export interface PrepareAssistantRequestInput {
  readonly prompt: string
  readonly currentSource: string
  readonly currentRevision: number
  readonly requestId: string
}

export type PreparedAssistantRequest =
  | { readonly ok: true; readonly request: AssistanceRequest }
  | { readonly ok: false; readonly message: string }

export type GeneratedAssistantProposal =
  | { readonly ok: true; readonly proposal: Proposal; readonly preview: ProposalDiff }
  | Extract<ProposalResult<never>, { readonly ok: false }>

export function prepareAssistantRequest(input: PrepareAssistantRequestInput): PreparedAssistantRequest {
  const prompt = input.prompt.trim()
  if (!prompt) return { ok: false, message: 'Descreva o diagrama que deseja gerar.' }
  const hasCurrentDiagram = input.currentSource.trim().length > 0
  const disclosedContent = [
    'Pedido do autor:',
    prompt,
    '',
    'Documento ADL atual:',
    hasCurrentDiagram ? input.currentSource : '(vazio)',
  ].join('\n')
  return {
    ok: true,
    request: {
      id: input.requestId,
      intent: hasCurrentDiagram ? 'revise-diagram' : 'create-diagram',
      baseRevision: input.currentRevision,
      disclosedContent,
    },
  }
}

export async function generateAssistantProposal(input: {
  readonly request: AssistanceRequest
  readonly approved: boolean
  readonly provider: ProviderAdapter
  readonly currentSource: string
  readonly currentRevision: number
  readonly validator: ProposalValidator
}): Promise<GeneratedAssistantProposal> {
  const proposal = await requestProposal(input.request, {
    requestId: input.request.id,
    approved: input.approved,
    disclosedContent: input.request.disclosedContent,
  }, input.provider)
  if (!proposal.ok) return proposal
  const preview = previewProposal(input.currentSource, proposal.value, input.currentRevision, input.validator)
  return preview.ok
    ? { ok: true, proposal: proposal.value, preview: preview.value }
    : preview
}

export function applyAssistantProposal(input: {
  readonly proposal: Proposal
  readonly currentSource: string
  readonly currentRevision: number
  readonly validator: ProposalValidator
}): ProposalResult<string> {
  return applyProposal(input.currentSource, input.proposal, input.currentRevision, true, input.validator)
}
