export const validSource = `adl version "1.0" diagram {
  element api { name "API" type "service" }
  element db { name "Database" type "database" }
  relation writes { source api target db type "sync" }
  group backend { name "Backend" elements [api, db] }
}`;

export const duplicateSource = `adl version "1.0" diagram {
  element api { name "First API" type "service" }
  element api { name "Second API" type "service" }
  relation calls { source api target api }
}`;

export const independentFailuresSource = `adl version "1.0" diagram {
  element api { name "API" }
  relation calls { source missing target other }
  group backend { elements [unknown] }
}`;
