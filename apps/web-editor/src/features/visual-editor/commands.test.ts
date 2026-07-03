import { describe, expect, it } from "vitest";
import { createVisualHistory, dispatchVisualCommand, redoVisualCommand, undoVisualCommand } from "./commands.js";

describe("visual command bus", () => {
  it("creates elements and rejects conflicting identifiers", () => {
    const created = dispatchVisualCommand(createVisualHistory(), { type: "create-element", id: "api", name: "API", elementType: "service" });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.history.present.elements.api?.name).toBe("API");
    expect(dispatchVisualCommand(created.history, { type: "create-element", id: "api", name: "Other", elementType: "service" })).toMatchObject({ ok: false, error: { code: "DUPLICATE_ID" }, history: created.history });
  });

  it("creates only relations whose references exist", () => {
    const one = dispatchVisualCommand(createVisualHistory(), { type: "create-element", id: "api", name: "API", elementType: "service" });
    if (!one.ok) return;
    expect(dispatchVisualCommand(one.history, { type: "create-relation", id: "calls", sourceId: "api", targetId: "missing", name: "calls" })).toMatchObject({ ok: false, error: { code: "UNRESOLVED_REFERENCE" } });
  });

  it("stores the selected MDL connector type", () => {
    let history = createVisualHistory();
    for (const command of [{ type: "create-element", id: "api", name: "API", elementType: "service" }, { type: "create-element", id: "db", name: "DB", elementType: "database" }] as const) { const result=dispatchVisualCommand(history,command);if(result.ok)history=result.history; }
    const result=dispatchVisualCommand(history,{type:"create-relation",id:"owns",sourceId:"api",targetId:"db",name:"owns",relationType:"composition"});
    expect(result.ok&&result.history.present.relations.owns?.type).toBe("composition");
  });

  it("requires explicit cascade and makes deletion reversible", () => {
    const commands = [
      { type: "create-element", id: "api", name: "API", elementType: "service" },
      { type: "create-element", id: "db", name: "DB", elementType: "database" },
      { type: "create-relation", id: "writes", sourceId: "api", targetId: "db", name: "writes" },
    ] as const;
    let history = createVisualHistory(); for (const command of commands) { const result = dispatchVisualCommand(history, command); expect(result.ok).toBe(true); if (result.ok) history = result.history; }
    expect(dispatchVisualCommand(history, { type: "remove-entity", id: "api", cascade: false })).toMatchObject({ ok: false, error: { code: "DEPENDENT_RELATIONS", dependentIds: ["writes"] } });
    const removed = dispatchVisualCommand(history, { type: "remove-entity", id: "api", cascade: true });
    if (!removed.ok) return;
    expect(removed.history.present.relations.writes).toBeUndefined();
    expect(undoVisualCommand(removed.history).present.elements.api).toBeDefined();
    expect(redoVisualCommand(undoVisualCommand(removed.history)).present.elements.api).toBeUndefined();
  });
  it("duplicates elements deterministically and reverses relations", () => { let history=createVisualHistory();for(const command of [{type:"create-element",id:"a",name:"A",elementType:"service"},{type:"create-element",id:"b",name:"B",elementType:"service"},{type:"create-relation",id:"r",sourceId:"a",targetId:"b"}] as const){const result=dispatchVisualCommand(history,command);if(result.ok)history=result.history}let result=dispatchVisualCommand(history,{type:"reverse-relation",id:"r"});expect(result.ok&&result.history.present.relations.r.sourceId).toBe("b");if(!result.ok)return;result=dispatchVisualCommand(result.history,{type:"duplicate-elements",ids:["a"]});expect(result.ok&&result.history.present.elements["a-2"]).toBeDefined(); });
});
