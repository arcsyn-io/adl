import { describe, expect, it } from "vitest";
import { analyzeRevision } from "./code-editor/language-service.js";
import { createVisualHistory, dispatchVisualCommand } from "./visual-editor/commands.js";

describe("editor reference performance", () => {
  it("analyzes a 10,000-line document within the feedback budget", () => {
    const text = `adl version "1.0" diagram {\n${Array.from({ length: 9_998 }, (_, index) => `# line ${index}`).join("\n")}\n}`;
    const started = performance.now(); const analysis = analyzeRevision({ text, revision: 1, selection: { anchor: 0, head: 0 } });
    expect(performance.now() - started).toBeLessThan(500); expect(analysis.revision).toBe(1);
  });

  it("applies a representative visual editing sequence synchronously", () => {
    let history = createVisualHistory(); const started = performance.now();
    for (let index = 0; index < 100; index++) { const result = dispatchVisualCommand(history, { type: "create-element", id: `node_${index}`, name: `Node ${index}`, elementType: "service" }); expect(result.ok).toBe(true); if (result.ok) history = result.history; }
    expect(performance.now() - started).toBeLessThan(500); expect(Object.keys(history.present.elements)).toHaveLength(100);
  });
});
