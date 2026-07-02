import {describe,expect,it} from "vitest";
import {createDiagramScene} from "../src/index.js";
import {geometry,model} from "./fixtures.js";
describe("@adl/renderer contract",()=>{
 it("is deterministic, immutable and does not mutate inputs",()=>{const first=createDiagramScene({model,geometry});expect(first).toEqual(createDiagramScene({model,geometry}));expect(Object.isFrozen(first)).toBe(true);expect(Object.isFrozen(geometry.entities.api)).toBe(false)});
});
