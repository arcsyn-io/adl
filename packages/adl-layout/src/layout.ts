import ELK, { type ElkExtendedEdge, type ElkNode } from "elkjs/lib/elk.bundled.js";
import type { DiagramModel } from "@adl/semantic";
import { transformedBounds, type EdgeRoute, type LayoutOptions, type LayoutOutcome, type LayoutResult, type NodeGeometry } from "./model.js";
import { separateElementBoxes } from "./overlap-prevention.js";

const elk = new ELK();
const freeze = <T>(value: T): T => {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freeze(child);
  }
  return value;
};

function options(input: LayoutOptions): Required<Omit<LayoutOptions,"elementStyles">> | null {
  const result = { direction: input.direction ?? "RIGHT", spacing: input.spacing ?? 60, nodeWidth: input.nodeWidth ?? 180, nodeHeight: input.nodeHeight ?? 84, maxElements: input.maxElements ?? 5000 };
  return result.spacing >= 0 && result.nodeWidth > 0 && result.nodeHeight > 0 && Number.isInteger(result.maxElements) && result.maxElements > 0 ? result : null;
}

function absoluteGeometry(node: ElkNode, parentX: number, parentY: number, output: Record<string, NodeGeometry>): void {
  const x = parentX + (node.x ?? 0), y = parentY + (node.y ?? 0);
  if (node.id !== "root") output[node.id] = { x, y, width: node.width ?? 0, height: node.height ?? 0 };
  for (const child of node.children ?? []) absoluteGeometry(child, x, y, output);
}

function route(edge: ElkExtendedEdge): EdgeRoute {
  const section = edge.sections?.[0];
  if (!section) return { points: [] };
  return { points: [section.startPoint, ...(section.bendPoints ?? []), section.endPoint].map(point => ({ x: point.x, y: point.y })) };
}

export async function calculateLayout(model: DiagramModel, input: LayoutOptions = {}, previous?: LayoutResult): Promise<LayoutOutcome> {
  const config = options(input);
  if (!config) return freeze({ ok: false, errors: [{ code: "INVALID_OPTIONS", message: "As opções de layout devem conter dimensões e limites positivos." }], ...(previous ? { previous } : {}) });
  if (model.elements.length + model.groups.length > config.maxElements)
    return freeze({ ok: false, errors: [{ code: "LIMIT_EXCEEDED", message: `O diagrama excede o limite de ${config.maxElements} entidades.` }], ...(previous ? { previous } : {}) });
  const memberGroup = new Map<string, string>();
  for (const group of [...model.groups].sort((a,b)=>a.identity.value.localeCompare(b.identity.value)))
    for (const member of group.members) if (!memberGroup.has(member.identity.value)) memberGroup.set(member.identity.value, group.identity.value);
  const elementNode = (id: string, label: string): ElkNode => { const style=input.elementStyles?.[id]; return { id, width:style?.width??Math.max(config.nodeWidth, Array.from(label).length * 8 + 32), height:style?.height??config.nodeHeight }; };
  const grouped = new Set(memberGroup.keys());
  const groups: ElkNode[] = [...model.groups].sort((a,b)=>a.identity.value.localeCompare(b.identity.value)).map(group => ({
    id: group.identity.value,
    layoutOptions: { "elk.padding": "[top=44,left=24,bottom=24,right=24]" },
    children: group.members.map(member => model.elements.find(element => element.identity.value === member.identity.value)).filter(element => element !== undefined).map(element => elementNode(element.identity.value, element.name)),
  }));
  const children = [...model.elements].filter(element => !grouped.has(element.identity.value)).sort((a,b)=>a.identity.value.localeCompare(b.identity.value)).map(element => elementNode(element.identity.value, element.name)).concat(groups);
  const connectorTypes=new Set(["link","always-link","specialization","virtual-link","composition"]);
  const edges: ElkExtendedEdge[] = [...model.relations].sort((a,b)=>a.identity.value.localeCompare(b.identity.value)).map(relation => { const label=relation.name??(relation.type&&!connectorTypes.has(relation.type)?relation.type:"");return { id: relation.identity.value, sources: [relation.source.identity.value], targets: [relation.target.identity.value], ...(label?{labels: [{ text: label, width: Array.from(label).length*8+24, height: 24 }]}:{}) }; });
  try {
    const graph = await elk.layout({ id: "root", children, edges, layoutOptions: { "elk.algorithm": "layered", "elk.direction": config.direction, "elk.spacing.nodeNode": String(config.spacing), "elk.layered.spacing.nodeNodeBetweenLayers": String(config.spacing), "elk.hierarchyHandling": "INCLUDE_CHILDREN" } });
    const nodes: Record<string, NodeGeometry> = {}; absoluteGeometry(graph, 0, 0, nodes);
    for(const [id,style] of Object.entries(input.elementStyles??{})){const node=nodes[id];if(!node)continue;const canonical={...node,width:style.width,height:style.height,...(style.position??{})};nodes[id]=transformedBounds(canonical,style.rotation??0)}
    const lockedElementIds = new Set(Object.entries(input.elementStyles ?? {}).flatMap(([id, style]) => style.position ? [id] : []));
    const collisionFreeNodes = separateElementBoxes(nodes, model.elements.map(element => element.identity.value), lockedElementIds, Math.min(config.spacing, 24));
    for (const group of model.groups) {
      const groupBox = collisionFreeNodes[group.identity.value]
      const memberBoxes = group.members.map(member => collisionFreeNodes[member.identity.value]).filter((box): box is NodeGeometry => box !== undefined)
      if (!groupBox || memberBoxes.length === 0) continue
      const right = Math.max(groupBox.x + groupBox.width, ...memberBoxes.map(box => box.x + box.width + 24))
      const bottom = Math.max(groupBox.y + groupBox.height, ...memberBoxes.map(box => box.y + box.height + 24))
      collisionFreeNodes[group.identity.value] = { ...groupBox, width: right - groupBox.x, height: bottom - groupBox.y }
    }
    const edgeRoutes = Object.fromEntries((graph.edges ?? []).map(edge => [edge.id, route(edge)]));
    return freeze({ ok: true, layout: { revision: `${model.version}:${model.elements.map(e=>e.identity.value).join(",")}:${model.relations.map(e=>e.identity.value).join(",")}`, nodes: collisionFreeNodes, edges: edgeRoutes } });
  } catch (error) {
    return freeze({ ok: false, errors: [{ code: "LAYOUT_FAILED", message: error instanceof Error ? error.message : "Falha desconhecida no layout." }], ...(previous ? { previous } : {}) });
  }
}
