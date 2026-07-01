import { parse, type DocumentNode } from "@adl/parser";

export const canonicalSource = `adl version "1.0"
diagram {
  element api { name "API" type "service" properties { owner "Platform" lifecycle "production" } }
  element database { name "Database" type "database" }
  relation writes { source api target database }
  group backend { name "Backend" elements [api, database] }
}`;

export const reorderedSource = `# Semantically equivalent source
adl version "1.0" diagram {
  group backend { elements [database, api] name "Backend" }
  element database { type "database" name "Database" }
  element api { properties { lifecycle "production" owner "Platform" } type "service" name "API" }
  relation writes { target database source api }
}`;

export function parseDocument(source: string): DocumentNode {
  const result = parse(source);
  if (!result.ok) throw new Error(`Fixture failed to parse: ${result.errors[0]?.message}`);
  return result.document;
}
