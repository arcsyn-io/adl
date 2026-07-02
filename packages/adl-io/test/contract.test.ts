import { expect,it } from "vitest"; import { importedFixture } from "./fixtures.js"; it("labels external ADL explicitly",()=>expect(importedFixture.mediaType).toBe("text/x-adl"));
