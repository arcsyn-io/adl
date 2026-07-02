import { describe, expect, it } from "vitest";
import { buildSemanticModel } from "../src/index.js";
import { canonicalSource, parseDocument } from "./fixtures.js";

describe("semantic model", () => {
  it("normalizes entities, properties and explicit defaults", () => {
    const result = buildSemanticModel(parseDocument(canonicalSource));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.model.elements.map((entity) => entity.identity.value)).toEqual(["api", "database"]);
    expect(result.model.elements[0]).toMatchObject({
      description: null,
      properties: { lifecycle: "production", owner: "Platform" },
    });
    expect(result.model.relations[0]).toMatchObject({ name: null, type: null, description: null, properties: {} });
  });

  it("resolves relation and group references by stable identity", () => {
    const result = buildSemanticModel(parseDocument(canonicalSource));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.model.relations[0]).toMatchObject({
      source: { identity: { kind: "element", value: "api" }, provenance: { syntaxKind: "Relation" } },
      target: { identity: { kind: "element", value: "database" }, provenance: { syntaxKind: "Relation" } },
    });
    expect(result.model.groups[0].members).toMatchObject([
      { identity: { kind: "element", value: "api" }, provenance: { syntaxKind: "Group" } },
      { identity: { kind: "element", value: "database" }, provenance: { syntaxKind: "Group" } },
    ]);
  });

  it("preserves declaration and identifier provenance on every entity", () => {
    const result = buildSemanticModel(parseDocument(canonicalSource));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    for (const entity of [...result.model.elements, ...result.model.relations, ...result.model.groups]) {
      expect(entity.provenance.range.end.offset).toBeGreaterThan(entity.provenance.range.start.offset);
      expect(entity.provenance.idRange?.end.offset).toBeGreaterThan(entity.provenance.idRange?.start.offset ?? -1);
    }
  });

  it("reports all missing fields, duplicate identities and unresolved references", () => {
    const document = parseDocument(`adl version "1.0" diagram {
      element duplicate { name "First" }
      relation duplicate { source missing target duplicate }
      group group-a { elements [missing, duplicate] }
    }`);
    const result = buildSemanticModel(document);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.map((error) => error.code)).toEqual([
      "MISSING_FIELD", "DUPLICATE_ID", "UNRESOLVED_REFERENCE", "UNRESOLVED_REFERENCE",
      "MISSING_FIELD", "UNRESOLVED_REFERENCE", "UNRESOLVED_REFERENCE",
    ]);
  });

  it("rejects unsupported versions without fallback", () => {
    const result = buildSemanticModel(parseDocument('adl version "2.0" diagram {}'));
    expect(result).toMatchObject({ ok: false, errors: [{ code: "UNSUPPORTED_VERSION" }] });
  });

  it("contains no visual or interaction state and freezes successful output", () => {
    const result = buildSemanticModel(parseDocument(canonicalSource));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const serialized = JSON.stringify(result.model);
    for (const forbidden of ["position", "coordinates", "viewport", "selection", "width", "height"]) {
      expect(serialized).not.toContain(`"${forbidden}"`);
    }
    expect(Object.isFrozen(result.model)).toBe(true);
    expect(Object.isFrozen(result.model.elements[0].properties)).toBe(true);
  });
});
