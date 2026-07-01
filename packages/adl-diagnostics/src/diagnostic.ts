import type { SourceRange } from "@adl/parser";

export type DiagnosticSeverity = "error" | "warning";

export type DiagnosticCode =
  | "SYNTAX_INVALID_TOKEN"
  | "SYNTAX_EXPECTED_TOKEN"
  | "SYNTAX_UNEXPECTED_TOKEN"
  | "SYNTAX_INVALID_STRING"
  | "SEMANTIC_UNSUPPORTED_VERSION"
  | "SEMANTIC_MISSING_FIELD"
  | "SEMANTIC_DUPLICATE_ID"
  | "SEMANTIC_UNRESOLVED_REFERENCE";

export interface RelatedLocation {
  readonly message: string;
  readonly range: SourceRange;
}

export interface Diagnostic {
  readonly code: DiagnosticCode;
  readonly severity: DiagnosticSeverity;
  readonly message: string;
  readonly range: SourceRange;
  readonly related: readonly RelatedLocation[];
}

export interface ValidationResult {
  readonly diagnostics: readonly Diagnostic[];
  readonly hasErrors: boolean;
  readonly canProceed: boolean;
}

export interface Rule {
  readonly code: DiagnosticCode;
  readonly defaultSeverity: DiagnosticSeverity;
  readonly description: string;
}
