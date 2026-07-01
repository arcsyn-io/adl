export const minimalSource = `adl version "1.0"
diagram {
  element web-app { name "Web application" type "application" }
  element api { name "API" type "service" }
  relation calls { source web-app target api }
}`;

export const completeSource = `# Unicode and metadata
adl version "1.0"
diagram {
  element orders-api {
    name "Serviço de pedidos 🚀"
    type "service"
    description "Accepts\\norders"
    properties { owner "Commerce" lifecycle "production" }
  }
  element orders-db { name "Orders DB" type "database" }
  relation writes { source orders-api target orders-db name "writes" type "sync" properties { protocol "SQL" } }
  group orders { name "Orders" elements [orders-api, orders-db] properties { owner "Commerce" } }
}`;
