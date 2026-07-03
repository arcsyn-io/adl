import { describe, expect, it } from "vitest";
import { analyzeRevision } from "./code-editor/language-service.js";
import { createVisualHistory, dispatchVisualCommand } from "./visual-editor/commands.js";
import { createScaleFixture } from "./performance-fixtures.js";
import { WorkspaceController, type WorkspaceSnapshot } from "./workspace/workspace-controller.js";
import { defaultPreferences } from "./workspace/workspace-preferences.js";

describe("editor reference performance", () => {
  it("analyzes a 10,000-line document within the feedback budget", () => {
    const text = `adl version "1.0" diagram {\n${Array.from({ length: 9_998 }, (_, index) => `# line ${index}`).join("\n")}\n}`;
    const started = performance.now(); const analysis = analyzeRevision({ text, revision: 1, selection: { anchor: 0, head: 0 } });
    expect(performance.now() - started).toBeLessThan(500); expect(analysis.revision).toBe(1);
  });

  it("applies a representative visual editing sequence synchronously", () => {
    let history = createVisualHistory(); const started = performance.now();
    for (let index = 0; index < 100; index++) { const result = dispatchVisualCommand(history, { type: "create-element", id: `node_${index}`, name: `Node ${index}`, elementType: "service" }); expect(result.ok).toBe(true); if (result.ok) history = result.history; }
    expect(performance.now() - started).toBeLessThan(500); expect(Object.keys(history.present.elements)).toHaveLength(100);
  });
  it("handles the 200 element, 400 relation and 50 operation reference fixture",()=>{const fixture=createScaleFixture();expect(fixture.elements).toHaveLength(200);expect(fixture.relations).toHaveLength(400);let history=createVisualHistory();const started=performance.now();for(const element of fixture.elements){const result=dispatchVisualCommand(history,{type:"create-element",id:element.id.replaceAll("-","_"),name:element.id,elementType:"service"});if(result.ok)history=result.history}for(let index=0;index<50;index++){const result=dispatchVisualCommand(history,{type:"update-element",id:`node_${index}`,name:`Updated ${index}`,elementType:"service"});if(result.ok)history=result.history}expect(performance.now()-started).toBeLessThan(1000);expect(Object.keys(history.present.elements)).toHaveLength(200)});
  it("commits and replays 50 mixed workspace operations at reference scale",()=>{const fixture=createScaleFixture(),adl=`adl version "1.0" diagram {\n${fixture.elements.map(item=>`element ${item.id.replaceAll("-","_")} { name "${item.id}" type "service" }`).join("\n")}\n}`,source={text:adl,validText:adl,validRevision:0,status:"valid" as const,diagnostics:[]},snapshot:WorkspaceSnapshot={revision:0,name:"Scale",adl:source,adls:{...source,text:'stylesheet version "1.0" {}',validText:'stylesheet version "1.0" {}'},placements:Object.fromEntries(fixture.elements.map((item,index)=>[item.id,{x:index*4,y:index*2}])),conversation:[],viewport:{x:0,y:0,zoom:1},selection:[],preferences:defaultPreferences},controller=new WorkspaceController(snapshot),started=performance.now();for(let index=0;index<50;index++)controller.dispatch({id:`move-${index}`,type:"visual.move-elements",baseRevision:controller.getSnapshot().revision,origin:"canvas",payload:{id:fixture.elements[index]?.id,box:{x:index*8,y:index*4,width:160,height:72}}});for(let index=0;index<50;index++)controller.undo();for(let index=0;index<50;index++)controller.redo();expect(performance.now()-started).toBeLessThan(500);expect(controller.getSnapshot().revision).toBe(50);expect(controller.history.canUndo).toBe(true)});
});
