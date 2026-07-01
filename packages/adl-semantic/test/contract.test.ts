import { describe, expect, it } from "vitest";
import { areSemanticallyEquivalent, buildSemanticModel } from "../src/index.js";
import { canonicalSource, parseDocument, reorderedSource } from "./fixtures.js";

describe("@adl/semantic contract", () => {
  it("returns deterministic normalized models", () => {
    const document = parseDocument(canonicalSource);
    expect(buildSemanticModel(document)).toEqual(buildSemanticModel(document));
  });

  it("defines equivalence independently from text order and provenance", () => {
    const first = buildSemanticModel(parseDocument(canonicalSource));
    const second = buildSemanticModel(parseDocument(reorderedSource));
    expect(first.ok && second.ok).toBe(true);
    if (first.ok && second.ok) expect(areSemanticallyEquivalent(first.model, second.model)).toBe(true);
  });

  it("does not freeze or mutate the parser AST", () => {
    const document = parseDocument(canonicalSource);
    const declarationRange = document.declarations[0].range;
    expect(Object.isFrozen(declarationRange)).toBe(false);
    buildSemanticModel(document);
    expect(Object.isFrozen(document)).toBe(false);
    expect(Object.isFrozen(declarationRange)).toBe(false);
  });
});
