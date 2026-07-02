import { describe, expect, it } from "vitest";
import type { DiagramModel, SemanticElement } from "@adl/semantic";
import { calculateLayout } from "../src/index.js";

const range = { start: { offset: 0, line: 1, column: 1 }, end: { offset: 0, line: 1, column: 1 } };
const provenance = { syntaxKind: "Element" as const, range };

describe("layout performance", () => {
  it("lays out 500 elements within the reference limit", async () => {
    const elements: SemanticElement[] = Array.from({ length: 500 }, (_, index) => ({ identity: { kind: "element", value: `node_${index}` }, name: `Node ${index}`, type: "service", description: null, properties: {}, provenance }));
    const model: DiagramModel = { version: "1.0", elements, relations: [], groups: [], provenance: { syntaxKind: "Document", range } };
    const started = performance.now(); const result = await calculateLayout(model); const elapsed = performance.now() - started;
    expect(result.ok).toBe(true); expect(elapsed).toBeLessThan(3000);
  }, 4000);
});
