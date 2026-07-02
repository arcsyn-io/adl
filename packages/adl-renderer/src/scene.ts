import type { Diagnostic, ValidationResult } from "@adl/diagnostics";
import type { DiagramModel, SemanticIdentity } from "@adl/semantic";
import type { ResolvedDiagramStyles, ResolvedElementStyle, ResolvedRelationStyle } from "@adl/stylesheet";
export interface Rect { readonly x:number; readonly y:number; readonly width:number; readonly height:number }
export interface GeometryInput { readonly entities: Readonly<Record<string, Rect>> }
export interface RenderState { readonly selectedId?:string|null; readonly focusedId?:string|null; readonly errorIds?:readonly string[] }
export type ViewState = "default"|"selected"|"focused"|"error";
export type ConnectorKind = "link"|"always-link"|"specialization"|"virtual-link"|"composition";
interface BaseView { readonly identity:SemanticIdentity; readonly label:string; readonly fullLabel:string; readonly ariaLabel:string; readonly state:ViewState; readonly stateLabel:string }
export interface ElementView extends BaseView { readonly kind:"element"; readonly type:string; readonly description:string|null; readonly geometry:Rect; readonly properties:Readonly<Record<string,string>>; readonly style?:ResolvedElementStyle }
export interface GroupView extends BaseView { readonly kind:"group"; readonly memberIds:readonly string[]; readonly geometry:Rect; readonly properties:Readonly<Record<string,string>> }
export interface RelationView extends BaseView { readonly kind:"relation"; readonly sourceId:string; readonly targetId:string; readonly type:string|null; readonly connectorKind:ConnectorKind; readonly description:string|null; readonly style?:ResolvedRelationStyle }
export type EntityView = ElementView|GroupView|RelationView;
export interface DiagramScene { readonly status:"ready"|"empty"|"unavailable"; readonly entities:readonly EntityView[]; readonly textAlternative:string; readonly diagnostics:readonly Diagnostic[] }
export interface RenderInput { readonly model:DiagramModel|null; readonly geometry:GeometryInput; readonly state?:RenderState; readonly validation?:ValidationResult; readonly maxLabelLength?:number; readonly styles?:ResolvedDiagramStyles }
export interface RenderError { readonly code:"INVALID_GEOMETRY"|"MISSING_GEOMETRY"|"INVALID_RENDER_STATE"; readonly message:string; readonly entityId?:string }
export type RenderResult = { readonly ok:true; readonly scene:DiagramScene }|{ readonly ok:false; readonly errors:readonly RenderError[] };
