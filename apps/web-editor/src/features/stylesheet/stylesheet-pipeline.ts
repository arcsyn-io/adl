import { calculateLayout, type LayoutResult } from '@adl/layout'
import { parse, type SourceRange } from '@adl/parser'
import { createDiagramScene, type DiagramScene } from '@adl/renderer'
import { buildSemanticModel, type DiagramModel } from '@adl/semantic'
import { parseStylesheet, resolveStyles, validateStylesheet, type StyleDiagnostic, type StylesheetLoader } from '@adl/stylesheet'

export type StylesheetPipelineResult =
  | { readonly ok:true; readonly model:DiagramModel; readonly styles:ReturnType<typeof resolveStyles>; readonly layout:LayoutResult; readonly scene:DiagramScene }
  | { readonly ok:false; readonly diagnostics:readonly StyleDiagnostic[] }

const emptyRange:SourceRange={start:{offset:0,line:1,column:1},end:{offset:0,line:1,column:1}}
export async function runStylesheetPipeline(input:{readonly adlText:string;readonly adlUri:string;readonly loadStylesheet?:StylesheetLoader}):Promise<StylesheetPipelineResult>{
  const parsed=parse(input.adlText)
  if(!parsed.ok)return{ok:false,diagnostics:parsed.errors.map(error=>({code:'STYLE_SYNTAX',severity:'error',message:error.message,uri:input.adlUri,range:error.range}))}
  const semantic=buildSemanticModel(parsed.document)
  if(!semantic.ok)return{ok:false,diagnostics:semantic.errors.map(error=>({code:'STYLE_SYNTAX',severity:'error',message:error.message,uri:input.adlUri,range:error.range}))}
  const sources=[];const diagnostics:StyleDiagnostic[]=[]
  if(parsed.document.stylesheetReference){const reference=parsed.document.stylesheetReference;if(!input.loadStylesheet)diagnostics.push({code:'STYLE_LOAD_FAILED',severity:'error',message:`No loader is available for ${JSON.stringify(reference.value)}.`,uri:input.adlUri,range:reference.range});else try{const loaded=await input.loadStylesheet(reference.value,input.adlUri);const result=parseStylesheet(loaded.text,{origin:'external',uri:loaded.uri});if(result.ok)sources.push(validateStylesheet(result.document));else diagnostics.push(...result.diagnostics)}catch(error){diagnostics.push({code:'STYLE_LOAD_FAILED',severity:'error',message:error instanceof Error?error.message:'Could not load external stylesheet.',uri:input.adlUri,range:reference.range})}}
  if(parsed.document.embeddedStylesheet){const embedded=parsed.document.embeddedStylesheet;const result=parseStylesheet(embedded.text,{origin:'embedded',uri:input.adlUri,embedded:true});if(result.ok)sources.push(validateStylesheet(result.document));else diagnostics.push(...result.diagnostics)}
  const styles=resolveStyles({model:semantic.model,sources,sourceDiagnostics:diagnostics})
  const layoutResult=await calculateLayout(semantic.model,{elementStyles:Object.fromEntries(Object.entries(styles.elements).map(([id,style])=>[id,{width:style.width,height:style.height,rotation:style.rotation,...(style.position?{position:style.position}:{})}]))})
  if(!layoutResult.ok)return{ok:false,diagnostics:[...styles.diagnostics,{code:'STYLE_INVALID_VALUE',severity:'error',message:layoutResult.errors[0]?.message??'Layout failed.',uri:input.adlUri,range:emptyRange}]}
  const sceneResult=createDiagramScene({model:semantic.model,geometry:{entities:layoutResult.layout.nodes},styles})
  if(!sceneResult.ok)return{ok:false,diagnostics:[...styles.diagnostics,{code:'STYLE_INVALID_VALUE',severity:'error',message:sceneResult.errors[0]?.message??'Rendering failed.',uri:input.adlUri,range:emptyRange}]}
  return{ok:true,model:semantic.model,styles,layout:layoutResult.layout,scene:sceneResult.scene}
}
