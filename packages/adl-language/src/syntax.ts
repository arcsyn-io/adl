export const LANGUAGE_VERSION = "1.0" as const;

export const IDENTIFIER_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*$/;

export const RESERVED_WORDS = [
  "adl",
  "diagram",
  "element",
  "relation",
  "group",
  "properties",
  "version",
] as const;

export const COMMENT_PREFIXES = ["//", "#"] as const;

export type AdlProperties = Readonly<Record<string, string>>;

export interface AdlElement {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly description?: string;
  readonly properties?: AdlProperties;
}

export interface AdlRelation {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly name?: string;
  readonly type?: string;
  readonly description?: string;
  readonly properties?: AdlProperties;
}

export interface AdlGroup {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly elementIds: readonly string[];
  readonly properties?: AdlProperties;
}

export interface AdlDocument {
  readonly version: typeof LANGUAGE_VERSION;
  readonly elements: readonly AdlElement[];
  readonly relations: readonly AdlRelation[];
  readonly groups: readonly AdlGroup[];
}

export type LanguageErrorCode =
  | "INVALID_DOCUMENT"
  | "UNSUPPORTED_VERSION"
  | "MISSING_FIELD"
  | "INVALID_FIELD"
  | "INVALID_IDENTIFIER"
  | "RESERVED_IDENTIFIER"
  | "DUPLICATE_ID"
  | "UNRESOLVED_REFERENCE"
  | "INVALID_PROPERTY"
  | "VISUAL_STATE_FORBIDDEN";

export interface LanguageError {
  readonly code: LanguageErrorCode;
  readonly message: string;
  readonly path: string;
}

export type LanguageResult =
  | { readonly ok: true; readonly document: AdlDocument }
  | { readonly ok: false; readonly errors: readonly LanguageError[] };
