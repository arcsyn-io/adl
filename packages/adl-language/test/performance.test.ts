import { describe, expect, it } from "vitest";

import { validateDocument } from "../src/index.js";

describe("language contract reference limits", () => {
  it("validates a 1,000-element document deterministically within 100 ms", () => {
    const document = {
      version: "1.0",
      elements: Array.from({ length: 1_000 }, (_, index) => ({
        id: `service-${index}`,
        name: `Service ${index}`,
        type: "service",
      })),
      relations: Array.from({ length: 999 }, (_, index) => ({
        id: `relation-${index}`,
        source: `service-${index}`,
        target: `service-${index + 1}`,
      })),
    };

    const startedAt = performance.now();
    const first = validateDocument(document);
    const elapsed = performance.now() - startedAt;

    expect(first).toMatchObject({ ok: true });
    expect(validateDocument(document)).toEqual(first);
    expect(elapsed).toBeLessThan(100);
  });
});
