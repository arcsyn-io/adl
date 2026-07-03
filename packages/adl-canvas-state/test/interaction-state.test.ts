import { describe, expect, it } from "vitest";
import { clampViewport, reconcileSelection } from "../src/index.js";

describe("interaction state", () => {
  it("reconciles discriminated selection by identity", () => expect(reconcileSelection({ kind: "elements", ids: ["a", "gone"], anchorId: "gone" }, new Set(["a"]), new Set())).toEqual({ kind: "elements", ids: ["a"], anchorId: "a" }));
  it("clamps invalid and out-of-range viewports", () => expect(clampViewport({ x: Number.NaN, y: 4, zoom: 9 })).toEqual({ x: 0, y: 4, zoom: 2 }));
});
