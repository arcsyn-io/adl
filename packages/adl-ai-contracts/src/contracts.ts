export interface AssistanceRequest { readonly id: string; readonly intent: string; readonly baseRevision: number; readonly disclosedContent: string }
export interface Consent { readonly requestId: string; readonly approved: boolean; readonly disclosedContent: string }
export interface Proposal { readonly requestId: string; readonly baseRevision: number; readonly source: string; readonly summary: string }
export interface ProposalDiff { readonly before: string; readonly after: string; readonly summary: string }
export interface ProviderAdapter { readonly id: string; propose(request: AssistanceRequest): Promise<unknown> }
export interface ProposalValidator { validate(source: string): { ok: true } | { ok: false; message: string } }
export type AssistanceErrorCode = "EMPTY_INTENT" | "UNSUPPORTED_INTENT" | "PROVIDER_UNAVAILABLE" | "INVALID_RESPONSE" | "STALE_PROPOSAL" | "INVALID_PROPOSAL_SOURCE" | "APPLY_FAILED" | "CONSENT_REQUIRED";
export type ProposalResult<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly code: AssistanceErrorCode; readonly message: string };
