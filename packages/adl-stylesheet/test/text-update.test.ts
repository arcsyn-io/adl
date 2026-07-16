import { describe, expect, it } from "vitest";
import { updateElementRule, updateGroupRule, updateRelationRule } from "../src/update.js";

describe("text style updates", () => {
  it("adds text declarations to an existing element id rule", () => {
    const result = updateElementRule('stylesheet version "1.0" {\n  element id api {\n    x "10px"\n    y "20px"\n  }\n}', {
      elementId: "api",
      text: {
        fontFamily: ["Inter", "sans-serif"],
        fontSize: 18,
        textPaint: "#3366FFFF",
        textAlign: "left",
        fontWeight: "bold",
        fontStyle: "italic",
        textDecoration: "underline",
      },
    });
    expect(result.ok && result.text).toContain('font-family "Inter, sans-serif"');
    expect(result.ok && result.text).toContain('font-size "18px"');
    expect(result.ok && result.text).toContain('text-paint "#3366FFFF"');
    expect(result.ok && result.text).toContain('text-align "left"');
    expect(result.ok && result.text).toContain('font-weight "bold"');
    expect(result.ok && result.text).toContain('font-style "italic"');
    expect(result.ok && result.text).toContain('text-decoration "underline"');
  });

  it("creates an element id rule when only text style is updated", () => {
    const result = updateElementRule('stylesheet version "1.0" {\n}', {
      elementId: "api",
      text: { fontSize: 20 },
    });
    expect(result.ok && result.text).toContain("element id api");
    expect(result.ok && result.text).toContain('font-size "20px"');
  });

  it("creates a relation id rule when relation label text style is updated", () => {
    const result = updateRelationRule('stylesheet version "1.0" {\n}', {
      relationId: "calls",
      text: { fontSize: 17, fontWeight: "bold" },
    });
    expect(result.ok && result.text).toContain("relation id calls");
    expect(result.ok && result.text).toContain('font-size "17px"');
    expect(result.ok && result.text).toContain('font-weight "bold"');
  });

  it("creates a group id rule when boundary label text style is updated", () => {
    const result = updateGroupRule('stylesheet version "1.0" {\n}', {
      groupId: "solution",
      text: { fontSize: 18, textDecoration: "underline" },
    });
    expect(result.ok && result.text).toContain("group id solution");
    expect(result.ok && result.text).toContain('font-size "18px"');
    expect(result.ok && result.text).toContain('text-decoration "underline"');
  });
});
