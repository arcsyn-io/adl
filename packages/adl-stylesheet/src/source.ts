import type { SourceRange } from "@adl/parser";
import { parseStylesheet } from "./parser.js";
import type { StyleDiagnostic, StylesheetDocument } from "./syntax.js";
import { validateStylesheet } from "./validate.js";

export type StylesheetLoader=(reference:string,baseUri:string)=>Promise<{readonly text:string;readonly uri:string}>;
export type ExternalStylesheetResult={readonly source?:StylesheetDocument;readonly diagnostics:readonly StyleDiagnostic[]};
export function resolveStylesheetUri(reference:string,baseUri:string):string{try{return new URL(reference,baseUri).toString()}catch{return reference}}
export async function loadExternalStylesheet(reference:string,baseUri:string,range:SourceRange,loader:StylesheetLoader):Promise<ExternalStylesheetResult>{try{const loaded=await loader(reference,baseUri);const parsed=parseStylesheet(loaded.text,{origin:"external",uri:loaded.uri});if(!parsed.ok)return{diagnostics:parsed.diagnostics};const validated=validateStylesheet(parsed.document);return{source:parsed.document,diagnostics:validated.diagnostics}}catch(error){return{diagnostics:[{code:"STYLE_LOAD_FAILED",severity:"error",message:`Could not load stylesheet ${JSON.stringify(reference)}: ${error instanceof Error?error.message:"unknown error"}.`,uri:baseUri,range}]}}}
