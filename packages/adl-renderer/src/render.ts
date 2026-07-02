import type { Diagnostic } from "@adl/diagnostics";
import type { DiagramModel, SemanticIdentity } from "@adl/semantic";
import type { ConnectorKind, DiagramScene, EntityView, Rect, RenderError, RenderInput, RenderResult, RenderState, ViewState } from "./scene.js";

function deepFreeze<T>(value:T):T{if(value!==null&&typeof value==="object"&&!Object.isFrozen(value)){Object.freeze(value);for(const child of Object.values(value))deepFreeze(child)}return value}
function cloneRect(rect:Rect):Rect{return{x:rect.x,y:rect.y,width:rect.width,height:rect.height}}
function validRect(rect:Rect|undefined):rect is Rect{return rect!==undefined&&[rect.x,rect.y,rect.width,rect.height].every(Number.isFinite)&&rect.width>0&&rect.height>0}
function truncate(value:string,max:number):string{const chars=Array.from(value);return chars.length<=max?value:`${chars.slice(0,max-1).join("")}…`}
function viewState(id:string,state:RenderState):{state:ViewState;stateLabel:string}{if(state.errorIds?.includes(id))return{state:"error",stateLabel:"Com erro"};if(state.selectedId===id)return{state:"selected",stateLabel:"Selecionado"};if(state.focusedId===id)return{state:"focused",stateLabel:"Em foco"};return{state:"default",stateLabel:"Normal"}}
function cloneDiagnostics(diagnostics:readonly Diagnostic[]):Diagnostic[]{return diagnostics.map(d=>({...d,range:{start:{...d.range.start},end:{...d.range.end}},related:d.related.map(r=>({...r,range:{start:{...r.range.start},end:{...r.range.end}}}))}))}
function unavailable(diagnostics:readonly Diagnostic[]):RenderResult{return deepFreeze({ok:true,scene:{status:"unavailable",entities:[],textAlternative:"Diagrama indisponível devido a erros bloqueantes.",diagnostics:cloneDiagnostics(diagnostics)}})}
function empty():RenderResult{return deepFreeze({ok:true,scene:{status:"empty",entities:[],textAlternative:"Nenhum diagrama disponível.",diagnostics:[]}})}
function failure(error:RenderError):RenderResult{return deepFreeze({ok:false,errors:[error]})}
function knownIdentities(model:DiagramModel):SemanticIdentity[]{return[...model.elements.map(e=>e.identity),...model.relations.map(e=>e.identity),...model.groups.map(e=>e.identity)]}
const connectorKinds=new Set<ConnectorKind>(["link","always-link","specialization","virtual-link","composition"]);
function connectorKind(type:string|null):ConnectorKind{return type!==null&&connectorKinds.has(type as ConnectorKind)?type as ConnectorKind:"link"}

export function createDiagramScene(input:RenderInput):RenderResult{
 if(input.validation?.hasErrors)return unavailable(input.validation.diagnostics);
 if(input.model===null)return empty();
 const model=input.model;const identities=knownIdentities(model);if(identities.length===0)return empty();
 const known=new Set(identities.map(identity=>identity.value));const state=input.state??{};
 for(const id of [state.selectedId,state.focusedId,...(state.errorIds??[])])if(id!==undefined&&id!==null&&!known.has(id))return failure({code:"INVALID_RENDER_STATE",message:`A identidade de interação "${id}" não existe no modelo.`,entityId:id});
 for(const entity of [...model.elements,...model.groups]){const rect=input.geometry.entities[entity.identity.value];if(rect===undefined)return failure({code:"MISSING_GEOMETRY",message:`Não há geometria para "${entity.identity.value}".`,entityId:entity.identity.value});if(!validRect(rect))return failure({code:"INVALID_GEOMETRY",message:`A geometria de "${entity.identity.value}" é inválida.`,entityId:entity.identity.value})}
 const max=Math.max(2,input.maxLabelLength??48);const entities:EntityView[]=[];
 for(const element of model.elements){const display=viewState(element.identity.value,state);entities.push({kind:"element",identity:{...element.identity},label:truncate(element.name,max),fullLabel:element.name,ariaLabel:`Elemento ${element.name}, tipo ${element.type}, ${display.stateLabel}`,type:element.type,description:element.description,properties:{...element.properties},geometry:cloneRect(input.geometry.entities[element.identity.value]),...display})}
 for(const relation of model.relations){const display=viewState(relation.identity.value,state);const fullLabel=relation.name??relation.type??`${relation.source.identity.value} → ${relation.target.identity.value}`;const connector=connectorKind(relation.type);const visualLabel=relation.name??(relation.type!==null&&!connectorKinds.has(relation.type as ConnectorKind)?relation.type:"");entities.push({kind:"relation",identity:{...relation.identity},label:truncate(visualLabel,max),fullLabel,ariaLabel:`Relação ${fullLabel}, conector ${connector}, de ${relation.source.identity.value} para ${relation.target.identity.value}, ${display.stateLabel}`,sourceId:relation.source.identity.value,targetId:relation.target.identity.value,type:relation.type,connectorKind:connector,description:relation.description,...display})}
 for(const group of model.groups){const display=viewState(group.identity.value,state);entities.push({kind:"group",identity:{...group.identity},label:truncate(group.name,max),fullLabel:group.name,ariaLabel:`Grupo ${group.name}, ${group.members.length} elementos, ${display.stateLabel}`,memberIds:group.members.map(m=>m.identity.value),properties:{...group.properties},geometry:cloneRect(input.geometry.entities[group.identity.value]),...display})}
 const textAlternative=entities.map(entity=>entity.kind==="relation"?`${entity.identity.value}: ${entity.sourceId} → ${entity.targetId} (${entity.fullLabel})`:`${entity.identity.value}: ${entity.fullLabel}`).join("; ");
 const scene:DiagramScene={status:"ready",entities,textAlternative,diagnostics:[]};return deepFreeze({ok:true,scene});
}
