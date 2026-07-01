import { expect,it } from "vitest"; import { placementFixture } from "./fixtures.js"; it("keeps geometry in canvas state",()=>expect(placementFixture()).toHaveProperty("placements"));
