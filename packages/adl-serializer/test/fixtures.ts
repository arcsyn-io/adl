import { parse } from "@adl/parser";
import { buildSemanticModel, type DiagramModel } from "@adl/semantic";
export const source = `adl version "1.0" diagram {
  group backend { name "Backend 🚀" elements [db, api] properties { owner "Platform" } }
  element db { name "Database" type "database" }
  relation writes { target db source api description "Writes\\nrecords" }
  element api { type "service" name "API \\u0022public\\u0022" properties { owner "Platform" lifecycle "production" } }
}`;
export function modelFromSource(text = source): DiagramModel {
  const parsed = parse(text); if (!parsed.ok) throw new Error(parsed.errors[0]?.message);
  const semantic = buildSemanticModel(parsed.document); if (!semantic.ok) throw new Error(semantic.errors[0]?.message);
  return semantic.model;
}
