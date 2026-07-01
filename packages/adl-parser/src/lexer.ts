export interface SourcePosition {
  readonly offset: number;
  readonly line: number;
  readonly column: number;
}

export interface SourceRange {
  readonly start: SourcePosition;
  readonly end: SourcePosition;
}

export type TokenKind =
  | "Keyword" | "Identifier" | "String" | "LeftBrace" | "RightBrace"
  | "LeftBracket" | "RightBracket" | "Comma" | "Whitespace" | "Comment"
  | "Invalid" | "Eof";

export interface Token {
  readonly kind: TokenKind;
  readonly text: string;
  readonly value?: string;
  readonly range: SourceRange;
}

export interface IdentifierNode {
  readonly kind: "Identifier";
  readonly name: string;
  readonly range: SourceRange;
}

export interface ElementFields {
  readonly name?: string;
  readonly type?: string;
  readonly description?: string;
  readonly properties?: Readonly<Record<string, string>>;
}

export interface RelationFields extends ElementFields {
  readonly source?: string;
  readonly target?: string;
}

export interface GroupFields {
  readonly name?: string;
  readonly description?: string;
  readonly elements?: readonly string[];
  readonly properties?: Readonly<Record<string, string>>;
}

export type DeclarationNode =
  | { readonly kind: "Element"; readonly id: IdentifierNode; readonly fields: ElementFields; readonly range: SourceRange }
  | { readonly kind: "Relation"; readonly id: IdentifierNode; readonly fields: RelationFields; readonly range: SourceRange }
  | { readonly kind: "Group"; readonly id: IdentifierNode; readonly fields: GroupFields; readonly range: SourceRange };

export interface DocumentNode {
  readonly kind: "Document";
  readonly version: { readonly kind: "StringLiteral"; readonly value: string; readonly range: SourceRange };
  readonly declarations: readonly DeclarationNode[];
  readonly range: SourceRange;
}

export type ParseErrorCode = "INVALID_TOKEN" | "EXPECTED_TOKEN" | "UNEXPECTED_TOKEN" | "INVALID_STRING";

export interface ParseError {
  readonly code: ParseErrorCode;
  readonly message: string;
  readonly range: SourceRange;
}

export type ParseResult =
  | { readonly ok: true; readonly document: DocumentNode; readonly tokens: readonly Token[] }
  | { readonly ok: false; readonly errors: readonly ParseError[]; readonly tokens: readonly Token[] };
