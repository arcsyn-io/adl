import { expect,it } from "vitest"; import { conformanceFixture } from "./fixtures.js"; it("versions normative cases",()=>expect(conformanceFixture.version).toBe("1"));
