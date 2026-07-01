import { IDENTIFIER_PATTERN, LANGUAGE_VERSION } from "@adl/language";
import type { DiagramModel, SemanticElement, SemanticGroup, SemanticRelation } from "@adl/semantic";
import type { SerializationError, SerializationOptions, SerializationResult } from "./policy.js";

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function hasOnly(value: Readonly<Record<string, unknown>>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}
function isProperties(value: unknown): value is Readonly<Record<string, string>> {
  return isRecord(value) && Object.entries(value).every(([key, item]) => IDENTIFIER_PATTERN.test(key) && typeof item === "string");
}
function isIdentity(value: unknown, kind: "element" | "relation" | "group"): boolean {
  return isRecord(value) && hasOnly(value, ["kind", "value"]) && value.kind === kind && typeof value.value === "string" && IDENTIFIER_PATTERN.test(value.value);
}
function isReference(value: unknown): boolean {
  return isRecord(value) && hasOnly(value, ["identity", "provenance"]) && isIdentity(value.identity, "element");
}
function isElement(value: unknown): value is SemanticElement {
  return isRecord(value) && hasOnly(value, ["identity", "name", "type", "description", "properties", "provenance"])
    && isIdentity(value.identity, "element") && typeof value.name === "string" && typeof value.type === "string"
    && (value.description === null || typeof value.description === "string") && isProperties(value.properties);
}
function isRelation(value: unknown): value is SemanticRelation {
  return isRecord(value) && hasOnly(value, ["identity", "source", "target", "name", "type", "description", "properties", "provenance"])
    && isIdentity(value.identity, "relation") && isReference(value.source) && isReference(value.target)
    && (value.name === null || typeof value.name === "string") && (value.type === null || typeof value.type === "string")
    && (value.description === null || typeof value.description === "string") && isProperties(value.properties);
}
function isGroup(value: unknown): value is SemanticGroup {
  return isRecord(value) && hasOnly(value, ["identity", "name", "description", "members", "properties", "provenance"])
    && isIdentity(value.identity, "group") && typeof value.name === "string"
    && (value.description === null || typeof value.description === "string") && Array.isArray(value.members)
    && value.members.every(isReference) && isProperties(value.properties);
}
function isDiagramModel(value: unknown): value is DiagramModel {
  return isRecord(value) && hasOnly(value, ["version", "elements", "relations", "groups", "provenance"])
    && value.version === LANGUAGE_VERSION && Array.isArray(value.elements) && value.elements.every(isElement)
    && Array.isArray(value.relations) && value.relations.every(isRelation)
    && Array.isArray(value.groups) && value.groups.every(isGroup);
}
function error(code: SerializationError["code"], message: string, path: string): SerializationResult {
  return { ok: false, errors: [{ code, message, path }] };
}
function quoted(value: string): string { return JSON.stringify(value); }
function propertiesLine(properties: Readonly<Record<string, string>>): string | undefined {
  const entries = Object.entries(properties).sort(([left], [right]) => left.localeCompare(right));
  return entries.length === 0 ? undefined : `properties { ${entries.map(([key, value]) => `${key} ${quoted(value)}`).join(" ")} }`;
}
function block(kind: string, id: string, fields: readonly (string | undefined)[]): string[] {
  return [`  ${kind} ${id} {`, ...fields.filter((field): field is string => field !== undefined).map((field) => `    ${field}`), "  }"];
}

export function serializeModel(model: unknown, options: SerializationOptions = {}): SerializationResult {
  const targetVersion = options.targetVersion ?? LANGUAGE_VERSION;
  if (targetVersion !== LANGUAGE_VERSION) return error("UNSUPPORTED_TARGET_VERSION", `A versão alvo ${quoted(targetVersion)} não é suportada. Use "1.0".`, "$.targetVersion");
  if (isRecord(model) && !hasOnly(model, ["version", "elements", "relations", "groups", "provenance"])) {
    return error("UNREPRESENTABLE_VALUE", "O modelo contém informação que não pode ser representada em ADL 1.0.", "$");
  }
  if (!isDiagramModel(model)) return error("INVALID_MODEL", "O modelo não corresponde ao contrato semântico ADL 1.0.", "$");

  const ids = [...model.elements, ...model.relations, ...model.groups].map((entity) => entity.identity.value);
  if (new Set(ids).size !== ids.length) return error("INVALID_MODEL", "O modelo contém identidades duplicadas.", "$");
  const elementIds = new Set(model.elements.map((element) => element.identity.value));
  for (const [index, relation] of model.relations.entries()) {
    if (!elementIds.has(relation.source.identity.value) || !elementIds.has(relation.target.identity.value)) {
      return error("INVALID_MODEL", "Uma relação aponta para um elemento inexistente.", `$.relations[${index}]`);
    }
  }
  for (const [index, group] of model.groups.entries()) {
    if (group.members.some((member) => !elementIds.has(member.identity.value))) {
      return error("INVALID_MODEL", "Um grupo aponta para um elemento inexistente.", `$.groups[${index}]`);
    }
  }

  const lines = [`adl version ${quoted(LANGUAGE_VERSION)}`, "diagram {"];
  for (const element of [...model.elements].sort((a, b) => a.identity.value.localeCompare(b.identity.value))) {
    lines.push(...block("element", element.identity.value, [
      `name ${quoted(element.name)}`, `type ${quoted(element.type)}`,
      element.description === null ? undefined : `description ${quoted(element.description)}`,
      propertiesLine(element.properties),
    ]));
  }
  for (const relation of [...model.relations].sort((a, b) => a.identity.value.localeCompare(b.identity.value))) {
    lines.push(...block("relation", relation.identity.value, [
      `source ${relation.source.identity.value}`, `target ${relation.target.identity.value}`,
      relation.name === null ? undefined : `name ${quoted(relation.name)}`,
      relation.type === null ? undefined : `type ${quoted(relation.type)}`,
      relation.description === null ? undefined : `description ${quoted(relation.description)}`,
      propertiesLine(relation.properties),
    ]));
  }
  for (const group of [...model.groups].sort((a, b) => a.identity.value.localeCompare(b.identity.value))) {
    const members = [...group.members].map((member) => member.identity.value).sort((a, b) => a.localeCompare(b));
    lines.push(...block("group", group.identity.value, [
      `name ${quoted(group.name)}`,
      group.description === null ? undefined : `description ${quoted(group.description)}`,
      `elements [${members.join(", ")}]`, propertiesLine(group.properties),
    ]));
  }
  lines.push("}");
  return { ok: true, text: `${lines.join("\n")}\n`, targetVersion: LANGUAGE_VERSION };
}
