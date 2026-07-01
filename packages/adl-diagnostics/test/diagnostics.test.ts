import { describe, expect, it } from "vitest";
import { validateSource } from "../src/index.js";
import { duplicateSource, independentFailuresSource } from "./fixtures.js";

describe("validation diagnostics", () => {
  it("locates both declarations of a duplicate identity and suppresses derived references", () => {
    const result = validateSource(duplicateSource);
    expect(result.hasErrors).toBe(true);
    expect(result.canProceed).toBe(false);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({
      code: "SEMANTIC_DUPLICATE_ID",
      severity: "error",
      message: expect.stringContaining("Use um identificador único"),
      related: [{ message: expect.stringContaining("primeira declaração") }],
    });
    expect(result.diagnostics[0].range.start.offset).toBeGreaterThan(result.diagnostics[0].related[0].range.start.offset);
  });

  it("returns every independent problem in deterministic source order", () => {
    const first = validateSource(independentFailuresSource);
    const second = validateSource(independentFailuresSource);
    expect(first).toEqual(second);
    expect(first.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
      "SEMANTIC_MISSING_FIELD",
      "SEMANTIC_UNRESOLVED_REFERENCE",
      "SEMANTIC_UNRESOLVED_REFERENCE",
      "SEMANTIC_MISSING_FIELD",
      "SEMANTIC_UNRESOLVED_REFERENCE",
    ]);
    expect(first.diagnostics.every((diagnostic) => diagnostic.severity === "error")).toBe(true);
  });

  it("uses the common contract for syntax errors and suppresses EOF cascades", () => {
    const result = validateSource('adl version "1.0" diagram { element api {');
    expect(result.canProceed).toBe(false);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({
      code: "SYNTAX_EXPECTED_TOKEN",
      severity: "error",
      range: { start: { offset: 41 }, end: { offset: 41 } },
      related: [],
    });
  });

  it("escapes user-provided content in actionable messages", () => {
    const result = validateSource('adl version "evil\\nvalue" diagram {}');
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].code).toBe("SEMANTIC_UNSUPPORTED_VERSION");
    expect(result.diagnostics[0].message).toContain('"evil\\nvalue"');
    expect(result.diagnostics[0].message).not.toContain("evil\nvalue");
    expect(result.diagnostics[0].message).toContain("Altere a versão para");
  });

  it("handles unknown tokens and overlapping parser errors without throwing", () => {
    const result = validateSource("@ adl version \"1.0\" diagram {}");
    expect(result.diagnostics[0].code).toBe("SYNTAX_INVALID_TOKEN");
    expect(result.diagnostics.filter((diagnostic) => diagnostic.range.start.offset === 0)).toHaveLength(1);
  });
});
