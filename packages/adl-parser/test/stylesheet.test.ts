import { describe,expect,it } from "vitest";
import { parse } from "../src/index.js";

describe("stylesheet envelope",()=>{it("preserves an external reference and embedded block",()=>{const result=parse('stylesheet "./theme.adls"\nadl version "1.0" diagram { element api { name "API" type "service" } }\nstylesheet { element id api { fill "#FFFFFFFF" } }');expect(result.ok).toBe(true);if(result.ok){expect(result.document.stylesheetReference?.value).toBe("./theme.adls");expect(result.document.embeddedStylesheet?.text).toContain("element id api")}});it("rejects a duplicate embedded block",()=>{const result=parse('adl version "1.0" diagram {} stylesheet {} stylesheet {}');expect(result.ok).toBe(false)})});
