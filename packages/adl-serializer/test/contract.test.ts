import { describe, expect, it } from "vitest";
import { CANONICAL_POLICY, serializeModel } from "../src/index.js";
import { modelFromSource } from "./fixtures.js";
describe("@adl/serializer contract", () => {
  it("is deterministic and does not mutate the model", () => {
    const model = modelFromSource();
    expect(serializeModel(model)).toEqual(serializeModel(model));
    expect(Object.isFrozen(model)).toBe(true);
  });
  it("publishes the canonical formatting policy", () => {
    expect(CANONICAL_POLICY).toEqual({ indent: "  ", lineEnding: "\n", finalNewline: true, declarationOrder: ["element", "relation", "group"] });
  });
});
