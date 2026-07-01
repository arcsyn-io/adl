import type { SourceRange } from "@adl/parser";

export type SemanticEntityKind = "element" | "relation" | "group";

export interface SemanticIdentity {
  readonly kind: SemanticEntityKind;
  readonly value: string;
}

export interface Provenance {
  readonly syntaxKind: "Document" | "Element" | "Relation" | "Group";
  readonly range: SourceRange;
  readonly idRange?: SourceRange;
}

export interface ResolvedReference {
  readonly identity: SemanticIdentity;
  readonly provenance: Provenance;
}

export interface SemanticElement {
  readonly identity: SemanticIdentity;
  readonly name: string;
  readonly type: string;
  readonly description: string | null;
  readonly properties: Readonly<Record<string, string>>;
  readonly provenance: Provenance;
}

export interface SemanticRelation {
  readonly identity: SemanticIdentity;
  readonly source: ResolvedReference;
  readonly target: ResolvedReference;
  readonly name: string | null;
  readonly type: string | null;
  readonly description: string | null;
  readonly properties: Readonly<Record<string, string>>;
  readonly provenance: Provenance;
}

export interface SemanticGroup {
  readonly identity: SemanticIdentity;
  readonly name: string;
  readonly description: string | null;
  readonly members: readonly ResolvedReference[];
  readonly properties: Readonly<Record<string, string>>;
  readonly provenance: Provenance;
}

export interface DiagramModel {
  readonly version: "1.0";
  readonly elements: readonly SemanticElement[];
  readonly relations: readonly SemanticRelation[];
  readonly groups: readonly SemanticGroup[];
  readonly provenance: Provenance;
}

export type SemanticErrorCode =
  | "UNSUPPORTED_VERSION"
  | "MISSING_FIELD"
  | "DUPLICATE_ID"
  | "UNRESOLVED_REFERENCE";

export interface SemanticError {
  readonly code: SemanticErrorCode;
  readonly message: string;
  readonly range: SourceRange;
  readonly entityId?: string;
  readonly field?: string;
  readonly reference?: string;
}

export type SemanticResult =
  | { readonly ok: true; readonly model: DiagramModel }
  | { readonly ok: false; readonly errors: readonly SemanticError[] };
