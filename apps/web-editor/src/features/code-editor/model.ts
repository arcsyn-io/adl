import type { DiagnosticCode } from "@adl/diagnostics";

export interface TextSelection { readonly anchor: number; readonly head: number }
export interface EditingDocument { readonly text: string; readonly revision: number; readonly selection: TextSelection }
export interface Decoration { readonly kind: "diagnostic" | "keyword"; readonly from: number; readonly to: number; readonly message?: string; readonly code?: DiagnosticCode }
export interface RevisionAnalysis { readonly revision: number; readonly decorations: readonly Decoration[] }
export interface EditHistory { readonly past: readonly EditingDocument[]; readonly present: EditingDocument; readonly future: readonly EditingDocument[] }
