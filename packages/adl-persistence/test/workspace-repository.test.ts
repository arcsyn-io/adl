import { describe, expect, it } from "vitest";
import { MemoryStorage, WorkspaceRepository, type PersistedWorkspaceEnvelope } from "../src/index.js";

const envelope = (): PersistedWorkspaceEnvelope => ({ format: "adl-workspace-v2", revision: 4, document: { name: "Payments", adl: { text: "a", validText: "a", validRevision: 4 }, adls: { text: "s", validText: "s", validRevision: 4 } }, visual: { version: 2, documentRevision: 4, placements: {}, viewport: { x: 0, y: 0, zoom: 1 } }, conversation: { version: 1, messages: [] }, preferences: { version: 1, theme: "system", panel: { collapsed: false, expandedWidth: 356, mode: "assistant" }, canvas: { gridVisible: true, snapEnabled: true, guidesEnabled: true, gridSize: 24 } }, savedAt: "2026-07-03T00:00:00.000Z" });

describe("workspace repository", () => {
  it("writes and restores one correlated v2 envelope", async () => { const repository = new WorkspaceRepository(new MemoryStorage()); await repository.save("current", envelope()); const result = await repository.restore("current"); expect(result.status).toBe("restored"); });
  it("recovers from corrupt records", async () => { const storage = new MemoryStorage(); storage.set("adl:workspace:current", "{"); const result = await new WorkspaceRepository(storage).restore("current"); expect(result).toMatchObject({ status: "recovered", warnings: [{ code: "CORRUPTED_RECORD" }] }); });
});
