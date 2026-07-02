import { describe, expect, it } from "vitest";
import { calculateLayout } from "../src/index.js";
import { model } from "./fixtures.js";

describe("automatic layout", () => {
  it("assigns finite non-overlapping geometry and relation routes", async () => {
    const result = await calculateLayout(model());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Object.keys(result.layout.nodes).sort()).toEqual(["api", "backend", "db"]);
    expect(result.layout.edges.writes?.points.length).toBeGreaterThanOrEqual(2);
    for (const node of Object.values(result.layout.nodes))
      expect([node.x, node.y, node.width, node.height].every(Number.isFinite)).toBe(true);
    const { api, db } = result.layout.nodes;
    expect(api.x + api.width <= db.x || db.x + db.width <= api.x || api.y + api.height <= db.y || db.y + db.height <= api.y).toBe(true);
  });

  it("is deterministic and leaves the semantic model untouched", async () => {
    const input = model();
    const snapshot = JSON.stringify(input);
    expect(await calculateLayout(input)).toEqual(await calculateLayout(input));
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it("returns a stable error and preserves a previous layout for invalid limits", async () => {
    const previous = await calculateLayout(model());
    expect(previous.ok).toBe(true);
    if (!previous.ok) return;
    const result = await calculateLayout(model(), { spacing: -1 }, previous.layout);
    expect(result).toMatchObject({ ok: false, errors: [{ code: "INVALID_OPTIONS" }], previous: previous.layout });
  });

  it("reserves horizontal space for long relation labels", async () => {
    const label = "dispatches asynchronous processing requests";
    const result = await calculateLayout(model(`adl version "1.0" diagram {
      element api { name "API" type "service" }
      element worker { name "Worker" type "service" }
      relation dispatches { source api target worker name "${label}" }
    }`), { direction: "RIGHT", spacing: 20 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { api, worker } = result.layout.nodes;
    const gap = worker.x >= api.x ? worker.x - (api.x + api.width) : api.x - (worker.x + worker.width);
    expect(gap).toBeGreaterThanOrEqual(Array.from(label).length * 8 + 24);
  });
});
