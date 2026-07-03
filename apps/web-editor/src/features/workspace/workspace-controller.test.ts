import { expect, it } from "vitest";
import { WorkspaceController, type WorkspaceSnapshot } from "./workspace-controller.js";
const source = (text: string) => ({ text, validText: text, validRevision: 0, status: "valid" as const, diagnostics: [] });
const initial: WorkspaceSnapshot = { revision: 0, name: "Payments", adl: source("adl"), adls: source("adls"), placements: {}, conversation: [] };
it("keeps ADL, ADLS and visual state on one revision", () => { const controller = new WorkspaceController(initial); expect(controller.dispatch({ id: "1", type: "source.replace-adls", baseRevision: 0, origin: "adls", payload: { text: "stylesheet version \"1.0\" {}" } })).toMatchObject({ ok: true, revision: 1 }); expect(controller.getSnapshot()).toMatchObject({ revision: 1, adls: { validRevision: 1 }, adl: { validText: "adl" } }); });

it("applies an assistant proposal and conversation atomically and rejects stale proposals", () => {
  const controller = new WorkspaceController(initial)
  const proposal = 'adl version "1.0" diagram {}'
  expect(controller.dispatch({ id: "ai-1", type: "assistant.apply-proposal", baseRevision: 0, origin: "assistant", payload: { source: proposal, summary: "Aplicado" } })).toMatchObject({ ok: true, revision: 1 })
  expect(controller.getSnapshot()).toMatchObject({ revision: 1, adl: { text: proposal }, conversation: ["Aplicado"] })
  expect(controller.dispatch({ id: "ai-2", type: "assistant.apply-proposal", baseRevision: 0, origin: "assistant", payload: { source: proposal, summary: "Stale" } })).toMatchObject({ ok: false, code: "STALE_REVISION", currentRevision: 1 })
  expect(controller.getSnapshot().conversation).toEqual(["Aplicado"])
})

it("resets document state and history while preserving preferences", () => {
  const controller = new WorkspaceController({ ...initial, preferences: { theme: "dark", panel: { collapsed: true, expandedWidth: 420, mode: "adl" }, canvas: { gridVisible: false, snapEnabled: true, guidesEnabled: false, gridSize: 20 } } })
  controller.dispatch({ id: "rename", type: "workspace.rename", baseRevision: 0, origin: "workspace", payload: { name: "Changed" } })
  controller.reset()
  expect(controller.getSnapshot()).toMatchObject({ name: "Untitled diagram", conversation: [], placements: {}, preferences: { theme: "dark", panel: { collapsed: true, expandedWidth: 420 } } })
  expect(controller.history).toEqual({ canUndo: false, canRedo: false })
})
