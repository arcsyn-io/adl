export const supportedVersion = "1.0";

export const minimalDocumentFixture = {
  version: supportedVersion,
  elements: [
    {
      id: "web-app",
      name: "Web application",
      type: "application",
    },
    {
      id: "api",
      name: "API",
      type: "service",
    },
  ],
  relations: [
    {
      id: "web-app-calls-api",
      source: "web-app",
      target: "api",
    },
  ],
  groups: [],
} as const;

export const metadataAndGroupingDocumentFixture = {
  version: supportedVersion,
  elements: [
    {
      id: "orders-api",
      name: "Orders API",
      type: "service",
      description: "Accepts and processes customer orders.",
      properties: {
        owner: "Commerce",
        lifecycle: "production",
      },
    },
    {
      id: "orders-db",
      name: "Orders database",
      type: "database",
      description: "Stores order records.",
      properties: {
        engine: "PostgreSQL",
      },
    },
  ],
  relations: [
    {
      id: "orders-api-writes-orders-db",
      source: "orders-api",
      target: "orders-db",
      description: "Writes order records",
      properties: {
        protocol: "SQL",
      },
    },
  ],
  groups: [
    {
      id: "orders",
      name: "Orders",
      description: "Components owned by the orders capability.",
      elementIds: ["orders-api", "orders-db"],
      properties: {
        owner: "Commerce",
      },
    },
  ],
} as const;

export const unsupportedVersionDocumentFixture = {
  ...minimalDocumentFixture,
  version: "999.0",
} as const;
