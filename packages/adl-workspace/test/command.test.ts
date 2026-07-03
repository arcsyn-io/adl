import { expect, it } from "vitest";
import { validateCommandRevision, type WorkspaceCommand } from "../src/index.js";

it("rejects stale commands using a discriminated result", () => {
  const command: WorkspaceCommand = { id: "1", type: "workspace.rename", baseRevision: 2, origin: "workspace", payload: { name: "A" } };
  expect(validateCommandRevision(command, 3)).toEqual({ ok: false, code: "STALE_REVISION", message: expect.any(String), currentRevision: 3 });
});
