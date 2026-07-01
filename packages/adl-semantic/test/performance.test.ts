import { parse } from "@adl/parser";
import { describe, expect, it } from "vitest";
import { buildSemanticModel } from "../src/index.js";

describe("semantic model performance", () => {
  it("normalizes 10,000 entities in at most two seconds", () => {
    const declarations = Array.from(
      { length: 10_000 },
      (_, index) => `element node-${index} { name "Node ${index}" type "service" }`,
    ).join("\n");
    const parsed = parse(`adl version "1.0" diagram {\n${declarations}\n}`);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const startedAt = performance.now();
    const result = buildSemanticModel(parsed.document);
    const elapsed = performance.now() - startedAt;

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.model.elements).toHaveLength(10_000);
    expect(elapsed).toBeLessThanOrEqual(2_000);
  });
});
