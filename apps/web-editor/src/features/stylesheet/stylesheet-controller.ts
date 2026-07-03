import { updateElementRule } from "@adl/stylesheet";
import { runStylesheetPipeline } from "./stylesheet-pipeline.js";
export interface StylesheetState { readonly text: string; readonly validText: string; readonly revision: number; readonly diagnostics: readonly string[] }
export class StylesheetController {
  state: StylesheetState;
  constructor(text: string) { this.state = { text, validText: text, revision: 0, diagnostics: [] }; }
  async replace(adl: string, text: string) {
    if (!/^\s*stylesheet\b/.test(text)) { this.state = { ...this.state, text, diagnostics: ["Stylesheet inválido."] }; return { ok: false as const, diagnostics: [{ message: "Stylesheet inválido." }] }; }
    const result = await runStylesheetPipeline({ adlText: `stylesheet "./diagram.adls"\n${adl}`, adlUri: "memory:/diagram.adl", loadStylesheet: async () => ({ text, uri: "memory:/diagram.adls" }) });
    this.state = result.ok ? { text, validText: text, revision: this.state.revision + 1, diagnostics: [] } : { ...this.state, text, diagnostics: result.diagnostics.map(item => item.message) }; return result;
  }
  updateGeometry(id: string, geometry: { x: number; y: number; width: number; height: number }) { const result = updateElementRule(this.state.text, { elementId: id, ...geometry }); if (result.ok) this.state = { text: result.text, validText: result.text, revision: this.state.revision + 1, diagnostics: [] }; return result; }
}
