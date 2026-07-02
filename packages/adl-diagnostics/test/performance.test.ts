import { describe, expect, it } from "vitest";
import { validateSource } from "../src/index.js";

describe("diagnostics performance", () => {
  it("validates 10,000 declarations in at most two seconds", () => {
    const declarations = Array.from(
      { length: 10_000 },
      (_, index) => `element node-${index} { name "Node ${index}" type "service" }`,
    ).join("\n");
    const source = `adl version "1.0" diagram {\n${declarations}\n}`;
    const startedAt = performance.now();
    const result = validateSource(source);
    const elapsed = performance.now() - startedAt;

    expect(result).toEqual({ diagnostics: [], hasErrors: false, canProceed: true });
    expect(elapsed).toBeLessThanOrEqual(2_000);
  });
});
