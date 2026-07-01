import { describe, expect, it } from "vitest";
import { parse } from "../src/index.js";

describe("parser performance", () => {
  it("parses 10,000 declarations in at most two seconds", () => {
    const declarations = Array.from(
      { length: 10_000 },
      (_, index) => `element node-${index} { name "Node ${index}" type "service" }`,
    ).join("\n");
    const source = `adl version "1.0"\ndiagram {\n${declarations}\n}`;
    const startedAt = performance.now();
    const result = parse(source);
    const elapsed = performance.now() - startedAt;

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.document.declarations).toHaveLength(10_000);
    expect(elapsed).toBeLessThanOrEqual(2_000);
  });
});
