import { RESERVED_WORDS } from "@adl/language";
import type {
  DeclarationNode, DocumentNode, ElementFields, GroupFields, IdentifierNode,
  ParseError, ParseResult, RelationFields, SourcePosition, SourceRange, Token, TokenKind,
} from "./lexer.js";

const keywords = new Set<string>([...RESERVED_WORDS, "name", "type", "description", "source", "target", "elements"]);
const punctuation: Readonly<Record<string, TokenKind>> = {
  "{": "LeftBrace", "}": "RightBrace", "[": "LeftBracket", "]": "RightBracket", ",": "Comma",
};

function position(offset: number, line: number, column: number): SourcePosition {
  return { offset, line, column };
}

export function lex(source: string): readonly Token[] {
  const tokens: Token[] = [];
  let offset = 0;
  let line = 1;
  let column = 1;

  const current = () => position(offset, line, column);
  const advance = () => {
    const character = source[offset++];
    if (character === "\n") { line++; column = 1; } else { column++; }
    return character;
  };
  const add = (kind: TokenKind, start: SourcePosition, value?: string) => {
    tokens.push({ kind, text: source.slice(start.offset, offset), ...(value === undefined ? {} : { value }), range: { start, end: current() } });
  };

  while (offset < source.length) {
    const start = current();
    const char = source[offset];
    if (/\s/u.test(char)) {
      while (offset < source.length && /\s/u.test(source[offset])) advance();
      add("Whitespace", start);
    } else if (char === "#" || (char === "/" && source[offset + 1] === "/")) {
      while (offset < source.length && source[offset] !== "\n") advance();
      add("Comment", start);
    } else if (punctuation[char]) {
      advance(); add(punctuation[char], start);
    } else if (char === '"') {
      advance();
      let closed = false;
      while (offset < source.length) {
        const next = advance();
        if (next === '"') { closed = true; break; }
        if (next === "\\" && offset < source.length) advance();
        if (next === "\n" || next === "\r") break;
      }
      const text = source.slice(start.offset, offset);
      if (!closed) add("Invalid", start);
      else {
        try { add("String", start, JSON.parse(text) as string); }
        catch { add("Invalid", start); }
      }
    } else if (/[A-Za-z]/.test(char)) {
      while (offset < source.length && /[A-Za-z0-9_-]/.test(source[offset])) advance();
      const text = source.slice(start.offset, offset);
      add(keywords.has(text) ? "Keyword" : "Identifier", start, text);
    } else {
      advance(); add("Invalid", start);
    }
  }
  const end = current();
  tokens.push({ kind: "Eof", text: "", range: { start: end, end } });
  return tokens;
}

class Parser {
  private readonly significant: readonly Token[];
  private index = 0;
  readonly errors: ParseError[] = [];

  constructor(readonly source: string, readonly tokens: readonly Token[]) {
    this.significant = tokens.filter((token) => token.kind !== "Whitespace" && token.kind !== "Comment");
    for (const token of this.significant) {
      if (token.kind === "Invalid") this.error("INVALID_TOKEN", `Invalid token ${JSON.stringify(token.text)}.`, token.range);
    }
  }

  private get token(): Token { return this.significant[this.index]; }
  private take(): Token { const token = this.token; if (token.kind !== "Eof") this.index++; return token; }
  private is(kind: TokenKind, value?: string): boolean { return this.token.kind === kind && (value === undefined || this.token.value === value); }
  private error(code: ParseError["code"], message: string, range = this.token.range): void { this.errors.push({ code, message, range }); }
  private expect(kind: TokenKind, value?: string): Token {
    if (this.is(kind, value)) return this.take();
    this.error("EXPECTED_TOKEN", `Expected ${value ?? kind}, found ${this.token.text || "end of input"}.`);
    return { kind, text: "", ...(value === undefined ? {} : { value }), range: { start: this.token.range.start, end: this.token.range.start } };
  }
  private keyword(value: string): Token { return this.expect("Keyword", value); }
  private identifier(): IdentifierNode {
    const token = this.expect("Identifier");
    return { kind: "Identifier", name: token.value ?? "", range: token.range };
  }
  private string(): string { return this.expect("String").value ?? ""; }

  parseDocument(): DocumentNode {
    const start = this.keyword("adl").range.start;
    this.keyword("version");
    const versionToken = this.expect("String");
    this.keyword("diagram");
    this.expect("LeftBrace");
    const declarations: DeclarationNode[] = [];
    while (!this.is("RightBrace") && !this.is("Eof")) {
      const before = this.index;
      const declaration = this.declaration();
      if (declaration) declarations.push(declaration);
      if (this.index === before) this.take();
    }
    const close = this.expect("RightBrace");
    if (!this.is("Eof")) {
      this.error("UNEXPECTED_TOKEN", `Unexpected token ${JSON.stringify(this.token.text)} after document.`);
      while (!this.is("Eof")) this.take();
    }
    return {
      kind: "Document",
      version: { kind: "StringLiteral", value: versionToken.value ?? "", range: versionToken.range },
      declarations,
      range: { start, end: close.text ? close.range.end : this.token.range.end },
    };
  }

  private declaration(): DeclarationNode | undefined {
    if (!this.is("Keyword") || !["element", "relation", "group"].includes(this.token.value ?? "")) {
      this.error("UNEXPECTED_TOKEN", `Expected a declaration, found ${JSON.stringify(this.token.text)}.`);
      return undefined;
    }
    const opening = this.take();
    const kind = opening.value as "element" | "relation" | "group";
    const id = this.identifier();
    this.expect("LeftBrace");
    const fields: Record<string, string | readonly string[] | Readonly<Record<string, string>>> = {};
    while (!this.is("RightBrace") && !this.is("Eof")) {
      const before = this.index;
      this.field(kind, fields);
      if (this.index === before) this.take();
    }
    const close = this.expect("RightBrace");
    const range: SourceRange = { start: opening.range.start, end: close.range.end };
    if (kind === "element") return { kind: "Element", id, fields: fields as ElementFields, range };
    if (kind === "relation") return { kind: "Relation", id, fields: fields as RelationFields, range };
    return { kind: "Group", id, fields: fields as GroupFields, range };
  }

  private field(owner: "element" | "relation" | "group", fields: Record<string, string | readonly string[] | Readonly<Record<string, string>>>): void {
    if (!this.is("Keyword")) { this.error("UNEXPECTED_TOKEN", `Expected a field, found ${JSON.stringify(this.token.text)}.`); return; }
    const field = this.take().value ?? "";
    const allowed: Readonly<Record<typeof owner, readonly string[]>> = {
      element: ["name", "type", "description", "properties"],
      relation: ["source", "target", "name", "type", "description", "properties"],
      group: ["name", "description", "elements", "properties"],
    };
    if (!allowed[owner].includes(field)) { this.error("UNEXPECTED_TOKEN", `Field ${field} is not valid in ${owner}.`); return; }
    if (field === "properties") fields[field] = this.properties();
    else if (field === "elements") fields[field] = this.identifierList();
    else if (field === "source" || field === "target") fields[field] = this.identifier().name;
    else fields[field] = this.string();
  }

  private properties(): Readonly<Record<string, string>> {
    this.expect("LeftBrace");
    const properties: Record<string, string> = {};
    while (!this.is("RightBrace") && !this.is("Eof")) {
      const key = this.is("Identifier") ? this.identifier().name : this.take().value;
      if (!key) { this.error("EXPECTED_TOKEN", "Expected a property name."); continue; }
      properties[key] = this.string();
    }
    this.expect("RightBrace");
    return properties;
  }

  private identifierList(): readonly string[] {
    this.expect("LeftBracket");
    const identifiers: string[] = [];
    while (!this.is("RightBracket") && !this.is("Eof")) {
      identifiers.push(this.identifier().name);
      if (this.is("Comma")) this.take();
      else if (!this.is("RightBracket")) { this.error("EXPECTED_TOKEN", "Expected comma or closing bracket."); this.take(); }
    }
    this.expect("RightBracket");
    return identifiers;
  }
}

export function parse(source: string): ParseResult {
  const tokens = lex(source);
  const parser = new Parser(source, tokens);
  const document = parser.parseDocument();
  return parser.errors.length > 0 ? { ok: false, errors: parser.errors, tokens } : { ok: true, document, tokens };
}
