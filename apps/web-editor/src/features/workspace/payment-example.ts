export const paymentExampleAdl = `adl version "1.0" diagram {
  element customer { name "Customer" type "user" }
  element api { name "API Gateway" type "backend" }
  element payments { name "Payments Service" type "backend" }
  element queue { name "Payment Queue" type "queue" }
  element worker { name "Payment Worker" type "part" }
  element database { name "Payments Database" type "data" }
  element external { name "External Notification System" type "black-box" }
  relation requests { source customer target api name "requests" type "link" }
  relation forwards { source api target payments name "forwards" type "always-link" }
  relation publishes { source payments target queue name "publishes" type "link" }
  relation consumes { source queue target worker name "consumes" type "link" }
  relation persists { source worker target database name "persists" type "composition" }
  relation notifies { source worker target external name "notifies" type "virtual-link" }
  group solution { name "Payments Flow" elements [customer, api, payments, queue, worker, database, external] }
}`;
export const paymentExampleAdls = `stylesheet version "1.0" { element type "backend" { shape "ellipse" } element type "data" { shape "cylinder" orientation "vertical" } element type "user" { shape "user" } element type "black-box" { shape "rectangle" } element type "part" { shape "rectangle" } element type "queue" { shape "cylinder" orientation "horizontal" } }`;
export const paymentExample = { name: "Payments Flow", adl: paymentExampleAdl, adls: paymentExampleAdls, elementCount: 7, relationCount: 6 } as const;
