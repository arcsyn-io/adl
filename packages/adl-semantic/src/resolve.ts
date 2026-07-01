import { LANGUAGE_VERSION } from "@adl/language";
import type { DeclarationNode, DocumentNode, SourceRange } from "@adl/parser";
import type {
  DiagramModel,
  Provenance,
  ResolvedReference,
  SemanticElement,
  SemanticEntityKind,
  SemanticError,
  SemanticGroup,
  SemanticIdentity,
  SemanticRelation,
  SemanticResult,
} from "./model.js";

function identity(kind: SemanticEntityKind, value: string): SemanticIdentity {
  return { kind, value };
}

function cloneRange(range: SourceRange): SourceRange {
  return {
    start: { ...range.start },
    end: { ...range.end },
  };
}

function provenance(node: DeclarationNode): Provenance {
  return {
    syntaxKind: node.kind,
    range: cloneRange(node.range),
    idRange: cloneRange(node.id.range),
  };
}

function resolvedReference(
  node: DeclarationNode,
  resolvedIdentity: SemanticIdentity,
): ResolvedReference {
  return {
    identity: resolvedIdentity,
    provenance: {
      syntaxKind: node.kind,
      range: cloneRange(node.range),
    },
  };
}

function sortedProperties(
  properties: Readonly<Record<string, string>> | undefined,
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(properties ?? {}).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function missingField(
  node: DeclarationNode,
  field: string,
  errors: SemanticError[],
): void {
  errors.push({
    code: "MISSING_FIELD",
    message: `${node.kind} "${node.id.name}" requires field "${field}".`,
    range: cloneRange(node.range),
    entityId: node.id.name,
    field,
  });
}

function unresolvedReference(
  node: DeclarationNode,
  field: string,
  reference: string,
  errors: SemanticError[],
): void {
  errors.push({
    code: "UNRESOLVED_REFERENCE",
    message: `${node.kind} "${node.id.name}" field "${field}" cannot resolve element "${reference}".`,
    range: cloneRange(node.range),
    entityId: node.id.name,
    field,
    reference,
  });
}

function required(value: string | undefined): value is string {
  return value !== undefined && value.length > 0;
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export function buildSemanticModel(document: DocumentNode): SemanticResult {
  const errors: SemanticError[] = [];
  if (document.version.value !== LANGUAGE_VERSION) {
    errors.push({
      code: "UNSUPPORTED_VERSION",
      message: `Unsupported ADL version "${document.version.value}". Supported version: "${LANGUAGE_VERSION}".`,
      range: cloneRange(document.version.range),
    });
  }

  const idCounts = new Map<string, number>();
  for (const declaration of document.declarations) {
    idCounts.set(declaration.id.name, (idCounts.get(declaration.id.name) ?? 0) + 1);
  }

  const unambiguousElements = new Map<string, SemanticIdentity>();
  for (const declaration of document.declarations) {
    if (declaration.kind === "Element" && idCounts.get(declaration.id.name) === 1) {
      unambiguousElements.set(declaration.id.name, identity("element", declaration.id.name));
    }
  }

  const seenIds = new Set<string>();
  for (const declaration of document.declarations) {
    if (seenIds.has(declaration.id.name)) {
      errors.push({
        code: "DUPLICATE_ID",
        message: `Semantic identity "${declaration.id.name}" is declared more than once.`,
        range: cloneRange(declaration.id.range),
        entityId: declaration.id.name,
      });
    }
    seenIds.add(declaration.id.name);

    if (declaration.kind === "Element") {
      if (!required(declaration.fields.name)) missingField(declaration, "name", errors);
      if (!required(declaration.fields.type)) missingField(declaration, "type", errors);
      continue;
    }

    if (declaration.kind === "Relation") {
      if (!required(declaration.fields.source)) missingField(declaration, "source", errors);
      else if (!unambiguousElements.has(declaration.fields.source)) {
        unresolvedReference(declaration, "source", declaration.fields.source, errors);
      }
      if (!required(declaration.fields.target)) missingField(declaration, "target", errors);
      else if (!unambiguousElements.has(declaration.fields.target)) {
        unresolvedReference(declaration, "target", declaration.fields.target, errors);
      }
      continue;
    }

    if (!required(declaration.fields.name)) missingField(declaration, "name", errors);
    for (const member of declaration.fields.elements ?? []) {
      if (!unambiguousElements.has(member)) {
        unresolvedReference(declaration, "elements", member, errors);
      }
    }
  }

  if (errors.length > 0) return deepFreeze({ ok: false, errors });

  const elements: SemanticElement[] = [];
  const relations: SemanticRelation[] = [];
  const groups: SemanticGroup[] = [];

  for (const declaration of document.declarations) {
    if (declaration.kind === "Element") {
      elements.push({
        identity: identity("element", declaration.id.name),
        name: declaration.fields.name ?? "",
        type: declaration.fields.type ?? "",
        description: declaration.fields.description ?? null,
        properties: sortedProperties(declaration.fields.properties),
        provenance: provenance(declaration),
      });
      continue;
    }

    if (declaration.kind === "Relation") {
      relations.push({
        identity: identity("relation", declaration.id.name),
        source: resolvedReference(
          declaration,
          unambiguousElements.get(declaration.fields.source ?? "")!,
        ),
        target: resolvedReference(
          declaration,
          unambiguousElements.get(declaration.fields.target ?? "")!,
        ),
        name: declaration.fields.name ?? null,
        type: declaration.fields.type ?? null,
        description: declaration.fields.description ?? null,
        properties: sortedProperties(declaration.fields.properties),
        provenance: provenance(declaration),
      });
      continue;
    }

    const memberNames = [...new Set(declaration.fields.elements ?? [])].sort((left, right) =>
      left.localeCompare(right),
    );
    groups.push({
      identity: identity("group", declaration.id.name),
      name: declaration.fields.name ?? "",
      description: declaration.fields.description ?? null,
      members: memberNames.map(
        (member): ResolvedReference =>
          resolvedReference(declaration, unambiguousElements.get(member)!),
      ),
      properties: sortedProperties(declaration.fields.properties),
      provenance: provenance(declaration),
    });
  }

  const byIdentity = <T extends { readonly identity: SemanticIdentity }>(left: T, right: T) =>
    left.identity.value.localeCompare(right.identity.value);
  const model: DiagramModel = {
    version: LANGUAGE_VERSION,
    elements: elements.sort(byIdentity),
    relations: relations.sort(byIdentity),
    groups: groups.sort(byIdentity),
    provenance: { syntaxKind: "Document", range: cloneRange(document.range) },
  };
  return deepFreeze({ ok: true, model });
}

export function areSemanticallyEquivalent(left: DiagramModel, right: DiagramModel): boolean {
  const meaning = (model: DiagramModel) =>
    JSON.stringify(model, (key, value: unknown) => (key === "provenance" ? undefined : value));
  return meaning(left) === meaning(right);
}
