import { expect,it } from "vitest";
import { parse } from "@adl/parser";
import { serializeDocument } from "../src/index.js";
it("round-trips stylesheet envelope",()=>{const parsed=parse('stylesheet "./theme.adls"\nadl version "1.0" diagram {} stylesheet { element id api { x "1px" y "2px" } }');expect(parsed.ok).toBe(true);if(parsed.ok){const text=serializeDocument(parsed.document);expect(text).toContain('stylesheet "./theme.adls"');expect(text).toContain('stylesheet { element id api')}});
