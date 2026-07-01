import { parse } from "@adl/parser";
import { buildSemanticModel } from "@adl/semantic";
export const source=`adl version "1.0" diagram {
 element api { name "API pública com um rótulo extremamente longo 🚀" type "service" properties { owner "Platform" } }
 element db { name "Database" type "database" }
 relation writes { source api target db type "sync" }
 relation self { source api target api name "Self check" }
 group backend { name "Backend" elements [api, db] }
}`;
const parsed=parse(source); if(!parsed.ok) throw new Error("fixture parse");
const semantic=buildSemanticModel(parsed.document); if(!semantic.ok) throw new Error("fixture semantic");
export const model=semantic.model;
export const geometry={entities:{api:{x:20,y:40,width:180,height:80},db:{x:300,y:40,width:180,height:80},backend:{x:10,y:20,width:490,height:130}}} as const;
