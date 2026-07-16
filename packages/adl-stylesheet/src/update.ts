import { parseStylesheet } from "./parser.js";

export interface TextStylePatch {
  readonly fontFamily?: readonly string[];
  readonly fontSize?: number;
  readonly textPaint?: string;
  readonly textAlign?: "left" | "center" | "right";
  readonly fontWeight?: "normal" | "bold";
  readonly fontStyle?: "normal" | "italic";
  readonly textDecoration?: "none" | "underline";
}
export interface VisualStylePatch { readonly elementId:string; readonly x?:number; readonly y?:number; readonly width?:number; readonly height?:number; readonly text?:TextStylePatch }
export interface RelationStylePatch { readonly relationId:string; readonly text?:TextStylePatch }
export interface GroupStylePatch { readonly groupId:string; readonly text?:TextStylePatch }
export type PatchResult={readonly ok:true;readonly text:string}|{readonly ok:false;readonly code:"STYLE_READ_ONLY"|"STYLE_SYNTAX";readonly message:string};
const px=(value:number)=>`${Number.isInteger(value)?value:Number(value.toFixed(3))}px`;
const textDeclarations=(patch:TextStylePatch|undefined):readonly [string,string][]=>patch===undefined?[]:[
  ["font-family",patch.fontFamily?.join(", ")],
  ["font-size",typeof patch.fontSize==="number"?px(patch.fontSize):undefined],
  ["text-paint",patch.textPaint],
  ["text-align",patch.textAlign],
  ["font-weight",patch.fontWeight],
  ["font-style",patch.fontStyle],
  ["text-decoration",patch.textDecoration],
].filter((item):item is [string,string]=>typeof item[1]==="string");
function updateIdRule(text:string,target:"element"|"relation"|"group",id:string,declarations:readonly [string,string][],options:{readonly writable?:boolean;readonly embedded?:boolean}={}):PatchResult{if(options.writable===false)return{ok:false,code:"STYLE_READ_ONLY",message:"The stylesheet source is read-only."};const parsed=parseStylesheet(text,{embedded:options.embedded});if(!parsed.ok)return{ok:false,code:"STYLE_SYNTAX",message:"The stylesheet contains syntax errors."};if(declarations.length===0)return{ok:true,text};const rule=parsed.document.rules.find(item=>item.selector.target===target&&item.selector.kind==="id"&&item.selector.value===id);if(rule){let body=text.slice(rule.range.start.offset,rule.range.end.offset);for(const [property,value] of declarations){const expression=new RegExp(`(\\b${property}\\s+)"[^"]*"`);body=expression.test(body)?body.replace(expression,`$1"${value}"`):body.replace(/\s*}$/,`\n    ${property} "${value}"\n  }`)}return{ok:true,text:text.slice(0,rule.range.start.offset)+body+text.slice(rule.range.end.offset)}}const close=text.lastIndexOf("}");if(close<0)return{ok:false,code:"STYLE_SYNTAX",message:"The stylesheet has no closing brace."};const block=`  ${target} id ${id} {\n${declarations.map(([property,value])=>`    ${property} "${value}"`).join("\n")}\n  }\n`;return{ok:true,text:text.slice(0,close)+block+text.slice(close)}}
export function updateElementRule(text:string,patch:VisualStylePatch,options:{readonly writable?:boolean;readonly embedded?:boolean}={}):PatchResult{const geometryDeclarations=[["x",patch.x],["y",patch.y],["width",patch.width],["height",patch.height]].filter((item):item is [string,number]=>typeof item[1]==="number").map(([property,value]):[string,string]=>[property,px(value)]);return updateIdRule(text,"element",patch.elementId,[...geometryDeclarations,...textDeclarations(patch.text)],options)}
export function updateRelationRule(text:string,patch:RelationStylePatch,options:{readonly writable?:boolean;readonly embedded?:boolean}={}):PatchResult{return updateIdRule(text,"relation",patch.relationId,textDeclarations(patch.text),options)}
export function updateGroupRule(text:string,patch:GroupStylePatch,options:{readonly writable?:boolean;readonly embedded?:boolean}={}):PatchResult{return updateIdRule(text,"group",patch.groupId,textDeclarations(patch.text),options)}
