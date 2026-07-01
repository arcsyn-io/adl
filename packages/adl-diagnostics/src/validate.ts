import { parse, type DocumentNode, type ParseError, type SourceRange } from "@adl/parser";
import { buildSemanticModel, type SemanticError } from "@adl/semantic";
import type { Diagnostic, DiagnosticCode, RelatedLocation, Rule, ValidationResult } from "./diagnostic.js";

const diagnosticRules = [
  { code: "SYNTAX_INVALID_TOKEN", defaultSeverity: "error", description: "Token não reconhecido pela gramática ADL." },
  { code: "SYNTAX_EXPECTED_TOKEN", defaultSeverity: "error", description: "Construção obrigatória ausente." },
  { code: "SYNTAX_UNEXPECTED_TOKEN", defaultSeverity: "error", description: "Construção fora da posição permitida." },
  { code: "SYNTAX_INVALID_STRING", defaultSeverity: "error", description: "Literal textual inválido." },
  { code: "SEMANTIC_UNSUPPORTED_VERSION", defaultSeverity: "error", description: "Versão da linguagem não suportada." },
  { code: "SEMANTIC_MISSING_FIELD", defaultSeverity: "error", description: "Campo obrigatório ausente." },
  { code: "SEMANTIC_DUPLICATE_ID", defaultSeverity: "error", description: "Identidade declarada mais de uma vez." },
  { code: "SEMANTIC_UNRESOLVED_REFERENCE", defaultSeverity: "error", description: "Referência sem elemento correspondente." },
] as const satisfies readonly Rule[];

export const DIAGNOSTIC_RULES: readonly Rule[] = Object.freeze(
  diagnosticRules.map((rule) => Object.freeze(rule)),
);

function cloneRange(range: SourceRange): SourceRange {
  return { start: { ...range.start }, end: { ...range.end } };
}

function safe(value: string): string {
  return JSON.stringify(value);
}

function syntaxCode(error: ParseError): DiagnosticCode {
  const codes: Readonly<Record<ParseError["code"], DiagnosticCode>> = {
    INVALID_TOKEN: "SYNTAX_INVALID_TOKEN",
    EXPECTED_TOKEN: "SYNTAX_EXPECTED_TOKEN",
    UNEXPECTED_TOKEN: "SYNTAX_UNEXPECTED_TOKEN",
    INVALID_STRING: "SYNTAX_INVALID_STRING",
  };
  return codes[error.code];
}

function syntaxMessage(error: ParseError, source: string): string {
  const text = source.slice(error.range.start.offset, error.range.end.offset);
  switch (error.code) {
    case "INVALID_TOKEN":
      return `O trecho ${safe(text)} não pertence à sintaxe ADL. Remova-o ou substitua-o por uma construção válida.`;
    case "EXPECTED_TOKEN":
      return "Falta uma construção obrigatória nesta posição. Complete a declaração conforme a gramática ADL.";
    case "UNEXPECTED_TOKEN":
      return `O trecho ${safe(text)} aparece em uma posição inválida. Remova-o ou mova-o para uma declaração compatível.`;
    case "INVALID_STRING":
      return "O literal textual é inválido. Use aspas duplas e escapes JSON válidos.";
  }
}

function syntaxDiagnostics(errors: readonly ParseError[], source: string): readonly Diagnostic[] {
  const invalidOffsets = new Set(
    errors.filter((error) => error.code === "INVALID_TOKEN").map((error) => error.range.start.offset),
  );
  const occupiedRanges = new Set<string>();
  const diagnostics: Diagnostic[] = [];
  for (const error of errors) {
    if (error.code !== "INVALID_TOKEN" && invalidOffsets.has(error.range.start.offset)) continue;
    const rangeKey = `${error.range.start.offset}:${error.range.end.offset}`;
    if (occupiedRanges.has(rangeKey)) continue;
    occupiedRanges.add(rangeKey);
    diagnostics.push({
      code: syntaxCode(error),
      severity: "error",
      message: syntaxMessage(error, source),
      range: cloneRange(error.range),
      related: [],
    });
  }
  return diagnostics;
}

function duplicateContext(document: DocumentNode): {
  readonly duplicateIds: ReadonlySet<string>;
  readonly firstRanges: ReadonlyMap<string, SourceRange>;
} {
  const counts = new Map<string, number>();
  const firstRanges = new Map<string, SourceRange>();
  for (const declaration of document.declarations) {
    counts.set(declaration.id.name, (counts.get(declaration.id.name) ?? 0) + 1);
    if (!firstRanges.has(declaration.id.name)) firstRanges.set(declaration.id.name, declaration.id.range);
  }
  return {
    duplicateIds: new Set([...counts].filter(([, count]) => count > 1).map(([id]) => id)),
    firstRanges,
  };
}

function semanticCode(error: SemanticError): DiagnosticCode {
  return `SEMANTIC_${error.code}`;
}

function semanticMessage(error: SemanticError, document: DocumentNode): string {
  switch (error.code) {
    case "UNSUPPORTED_VERSION":
      return `A versão ${safe(document.version.value)} não é suportada. Altere a versão para "1.0".`;
    case "MISSING_FIELD":
      return `A declaração ${safe(error.entityId ?? "")} não informa o campo obrigatório ${safe(error.field ?? "")}. Adicione esse campo com um valor válido.`;
    case "DUPLICATE_ID":
      return `O identificador ${safe(error.entityId ?? "")} já foi declarado. Use um identificador único nesta declaração.`;
    case "UNRESOLVED_REFERENCE":
      return `A referência ${safe(error.reference ?? "")} não aponta para um elemento único. Corrija o identificador ou declare o elemento correspondente.`;
  }
}

function semanticDiagnostics(document: DocumentNode, errors: readonly SemanticError[]): readonly Diagnostic[] {
  const { duplicateIds, firstRanges } = duplicateContext(document);
  const diagnostics: Diagnostic[] = [];
  for (const error of errors) {
    if (error.code === "UNRESOLVED_REFERENCE" && duplicateIds.has(error.reference ?? "")) continue;
    const related: RelatedLocation[] = [];
    if (error.code === "DUPLICATE_ID") {
      const firstRange = firstRanges.get(error.entityId ?? "");
      if (firstRange) {
        related.push({
          message: "Esta é a primeira declaração do identificador.",
          range: cloneRange(firstRange),
        });
      }
    }
    diagnostics.push({
      code: semanticCode(error),
      severity: "error",
      message: semanticMessage(error, document),
      range: cloneRange(error.range),
      related,
    });
  }
  return diagnostics;
}

function compareDiagnostics(left: Diagnostic, right: Diagnostic): number {
  return left.range.start.offset - right.range.start.offset
    || left.range.end.offset - right.range.end.offset
    || left.code.localeCompare(right.code);
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function result(diagnostics: readonly Diagnostic[]): ValidationResult {
  const ordered = [...diagnostics].sort(compareDiagnostics);
  const hasErrors = ordered.some((diagnostic) => diagnostic.severity === "error");
  return deepFreeze({ diagnostics: ordered, hasErrors, canProceed: !hasErrors });
}

export function validateSource(source: string): ValidationResult {
  const parsed = parse(source);
  if (!parsed.ok) return result(syntaxDiagnostics(parsed.errors, source));
  const semantic = buildSemanticModel(parsed.document);
  if (!semantic.ok) return result(semanticDiagnostics(parsed.document, semantic.errors));
  return result([]);
}
