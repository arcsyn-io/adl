import { describe, expect, it } from "vitest";
import { parse } from "../src/index.js";
import { completeSource, minimalSource } from "./fixtures.js";

describe("ADL parser", () => {
  it("parses every declaration in a valid document", () => {
    const result = parse(minimalSource);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.document.version.value).toBe("1.0");
    expect(result.document.declarations.map((node) => [node.kind, node.id.name])).toEqual([
      ["Element", "web-app"], ["Element", "api"], ["Relation", "calls"],
    ]);
    expect(result.document.range).toMatchObject({ start: { offset: 0, line: 1, column: 1 }, end: { offset: minimalSource.length } });
  });

  it("preserves Unicode, escapes, properties and groups", () => {
    const result = parse(completeSource);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const element = result.document.declarations[0];
    expect(element).toMatchObject({ kind: "Element", fields: { name: "Serviço de pedidos 🚀", description: "Accepts\norders", properties: { owner: "Commerce", lifecycle: "production" } } });
    expect(result.document.declarations[3]).toMatchObject({ kind: "Group", fields: { elements: ["orders-api", "orders-db"] } });
  });

  it("rejects empty input, unexpected EOF and unknown tokens with precise ranges", () => {
    const empty = parse("");
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.errors[0]).toMatchObject({ code: "EXPECTED_TOKEN", range: { start: { offset: 0, line: 1, column: 1 } } });
    const eof = parse('adl version "1.0" diagram { element api { name "API"');
    expect(eof.ok).toBe(false);
    if (!eof.ok) expect(eof.errors.some((error) => error.code === "EXPECTED_TOKEN")).toBe(true);
    const invalid = parse("@ adl version \"1.0\" diagram {}" );
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.errors[0]).toMatchObject({ code: "INVALID_TOKEN", range: { start: { offset: 0 }, end: { offset: 1 } } });
  });

  it("recovers to report later syntax errors without returning partial success", () => {
    const result = parse('adl version "1.0" diagram { element first { name } element second { type } }');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
    expect(result.errors.every((error) => error.range.end.offset >= error.range.start.offset)).toBe(true);
  });
});
