import { describe, expect, it } from "vitest";
import { DIAGNOSTIC_RULES, validateSource } from "../src/index.js";
import { validSource } from "./fixtures.js";

describe("@adl/diagnostics contract", () => {
  it("returns a deterministic immutable validation result", () => {
    const first = validateSource(validSource);
    const second = validateSource(validSource);
    expect(first).toEqual(second);
    expect(first).toEqual({ diagnostics: [], hasErrors: false, canProceed: true });
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.diagnostics)).toBe(true);
  });

  it("publishes unique stable rules with severities", () => {
    expect(new Set(DIAGNOSTIC_RULES.map((rule) => rule.code)).size).toBe(DIAGNOSTIC_RULES.length);
    expect(DIAGNOSTIC_RULES.every((rule) => rule.defaultSeverity === "error" || rule.defaultSeverity === "warning")).toBe(true);
  });
});
