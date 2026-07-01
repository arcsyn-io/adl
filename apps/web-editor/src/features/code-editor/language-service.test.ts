import { describe, expect, it } from "vitest";
import { analyzeRevision, applyEdit, createEditingDocument, redoEdit, suggestionsAt, undoEdit } from "./language-service.js";

const valid = 'adl version "1.0" diagram { element api { name "API" type "service" } }';

describe("ADL editing service", () => {
  it("associates diagnostics only with the current revision", () => {
    const initial = createEditingDocument(valid);
    const invalid = applyEdit(initial, valid.replace("type", "typo"), { anchor: 5, head: 5 });
    const analyzed = analyzeRevision(invalid.present);
    expect(analyzed.revision).toBe(invalid.present.revision);
    expect(analyzed.decorations.some(item => item.kind === "diagnostic" && item.from >= 0 && item.to >= item.from)).toBe(true);
    expect(analyzeRevision(initial.present).decorations.filter(item => item.kind === "diagnostic")).toEqual([]);
  });

  it("undoes and redoes text and selection exactly", () => {
    const initial = createEditingDocument(valid, { anchor: 2, head: 4 });
    const changed = applyEdit(initial, `${valid}\n# note`, { anchor: valid.length, head: valid.length });
    expect(undoEdit(changed).present).toEqual(initial.present);
    expect(redoEdit(undoEdit(changed)).present).toEqual(changed.present);
  });

  it("offers context-safe language suggestions", () => {
    expect(suggestionsAt("adl ", 4)).toContain("version");
    expect(suggestionsAt('adl version "1.0" diagram { ', 28)).toEqual(expect.arrayContaining(["element", "relation", "group"]));
  });
});
