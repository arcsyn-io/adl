import { expect,it } from "vitest"; import { assistanceFixture } from "./fixtures.js"; it("discloses content before provider use",()=>expect(assistanceFixture.disclosedContent).toBeTruthy());
