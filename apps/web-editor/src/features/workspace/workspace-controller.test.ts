import { expect, it } from "vitest";
import { WorkspaceController, type WorkspaceSnapshot } from "./workspace-controller.js";
const source = (text: string) => ({ text, validText: text, validRevision: 0, status: "valid" as const, diagnostics: [] });
const initial: WorkspaceSnapshot = { revision: 0, name: "Payments", adl: source("adl"), adls: source("adls"), placements: {}, conversation: [] };
it("keeps ADL, ADLS and visual state on one revision", () => { const controller = new WorkspaceController(initial); expect(controller.dispatch({ id: "1", type: "source.replace-adls", baseRevision: 0, origin: "adls", payload: { text: "next" } })).toMatchObject({ ok: true, revision: 1 }); expect(controller.getSnapshot()).toMatchObject({ revision: 1, adls: { validRevision: 1 }, adl: { validText: "adl" } }); });
