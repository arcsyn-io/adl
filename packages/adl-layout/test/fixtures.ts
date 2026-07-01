import { parse } from "@adl/parser";
import { buildSemanticModel, type DiagramModel } from "@adl/semantic";

export function model(source = `adl version "1.0" diagram {
  element api { name "API" type "service" }
  element db { name "Database" type "database" }
  relation writes { source api target db name "writes" }
  group backend { name "Backend" elements [api, db] }
}`): DiagramModel {
  const parsed = parse(source);
  if (!parsed.ok) throw new Error("invalid fixture");
  const semantic = buildSemanticModel(parsed.document);
  if (!semantic.ok) throw new Error("invalid fixture");
  return semantic.model;
}
