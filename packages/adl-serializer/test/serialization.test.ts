import { parse } from "@adl/parser";
import { areSemanticallyEquivalent, buildSemanticModel } from "@adl/semantic";
import { describe, expect, it } from "vitest";
import { serializeModel } from "../src/index.js";
import { modelFromSource } from "./fixtures.js";
describe("canonical serialization", () => {
  it("prints valid ADL in canonical declaration and field order", () => {
    const result = serializeModel(modelFromSource()); expect(result.ok).toBe(true); if (!result.ok) return;
    expect(result.text.indexOf("element api")).toBeLessThan(result.text.indexOf("element db"));
    expect(result.text.indexOf("element db")).toBeLessThan(result.text.indexOf("relation writes"));
    expect(result.text.indexOf("relation writes")).toBeLessThan(result.text.indexOf("group backend"));
    expect(result.text).toContain('name "API \\"public\\""');
    expect(result.text).toContain('description "Writes\\nrecords"');
    expect(result.text).not.toMatch(/\b(x|y|width|height|position|viewport)\b/);
    expect(parse(result.text).ok).toBe(true);
  });
  it("round-trips without semantic change and stabilizes byte-for-byte", () => {
    const original = modelFromSource(); const first = serializeModel(original); expect(first.ok).toBe(true); if (!first.ok) return;
    const parsed = parse(first.text); expect(parsed.ok).toBe(true); if (!parsed.ok) return;
    const rebuilt = buildSemanticModel(parsed.document); expect(rebuilt.ok).toBe(true); if (!rebuilt.ok) return;
    expect(areSemanticallyEquivalent(original, rebuilt.model)).toBe(true);
    expect(serializeModel(rebuilt.model)).toEqual(first);
  });
  it("serializes an empty diagram", () => {
    const model = modelFromSource('adl version "1.0" diagram {}');
    expect(serializeModel(model)).toEqual({ ok: true, text: 'adl version "1.0"\ndiagram {\n}\n', targetVersion: "1.0" });
  });
  it("rejects unsupported targets, unresolved references and extra state", () => {
    const model = modelFromSource();
    expect(serializeModel(model, { targetVersion: "2.0" })).toMatchObject({ ok: false, errors: [{ code: "UNSUPPORTED_TARGET_VERSION" }] });
    const broken = { ...model, relations: [{ ...model.relations[0], target: { ...model.relations[0].target, identity: { kind: "element", value: "missing" } } }] };
    expect(serializeModel(broken)).toMatchObject({ ok: false, errors: [{ code: "INVALID_MODEL" }] });
    expect(serializeModel({ ...model, viewport: { x: 0, y: 0 } })).toMatchObject({ ok: false, errors: [{ code: "UNREPRESENTABLE_VALUE" }] });
  });
});
