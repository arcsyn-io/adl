import { autocompletion, type CompletionContext } from "@codemirror/autocomplete";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { EditorState, type Extension } from "@codemirror/state";
import { Decoration as ViewDecoration, EditorView, keymap, ViewPlugin, type DecorationSet, type ViewUpdate } from "@codemirror/view";
import { parseStylesheet, validateStylesheet } from "@adl/stylesheet";
import { useEffect, useRef, useState } from "react";
import { analyzeRevision, applyEdit, createEditingDocument, redoEdit, suggestionsAt, undoEdit } from "./language-service.js";
import type { EditHistory } from "./model.js";

export interface CodeEditorProps { readonly initialText: string; readonly onChange?: (text: string) => void; readonly mode?: "adl"|"stylesheet"; readonly title?:string; readonly ariaLabel?:string }

const adlDecorations = ViewPlugin.fromClass(class {
  decorations: DecorationSet;
  constructor(editor: EditorView) { this.decorations = this.build(editor); }
  update(update: ViewUpdate) { if (update.docChanged) this.decorations = this.build(update.view); }
  build(editor: EditorView): DecorationSet { return ViewDecoration.set(analyzeRevision({ text: editor.state.doc.toString(), revision: 0, selection: { anchor: 0, head: 0 } }).decorations.map(item => ViewDecoration.mark({ class: item.kind === "keyword" ? "adl-keyword" : "adl-diagnostic", attributes: item.message ? { title: item.message } : {} }).range(item.from, Math.max(item.from, item.to))), true); }
}, { decorations: value => value.decorations });

export function CodeEditor({ initialText, onChange, mode="adl", title="Editor ADL", ariaLabel="Código ADL" }: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null), view = useRef<EditorView | null>(null), initialTextRef=useRef(initialText);
  const [history, setHistory] = useState<EditHistory>(() => createEditingDocument(initialText));
  const analysis = analyzeRevision(history.present);
  const stylesheetResult=mode==="stylesheet"?parseStylesheet(history.present.text):undefined;
  const stylesheetDiagnostics=stylesheetResult?(stylesheetResult.ok?validateStylesheet(stylesheetResult.document).diagnostics:stylesheetResult.diagnostics):[];
  const diagnostics = mode==="adl"?analysis.decorations.filter(item => item.kind === "diagnostic"):stylesheetDiagnostics.map(item=>({kind:"diagnostic" as const,code:item.code,message:item.message,from:item.range.start.offset,to:item.range.end.offset}));
  useEffect(() => {
    if (!host.current) return;
    const completion = (context: CompletionContext) => { const options = suggestionsAt(context.state.doc.toString(), context.pos); return options.length ? { from: context.matchBefore(/\w*/)?.from ?? context.pos, options: options.map(label => ({ label, type: "keyword" })) } : null; };
    const extensions:Extension[]=[keymap.of([indentWithTab, ...defaultKeymap]),EditorView.lineWrapping,EditorView.updateListener.of(update => { if (!update.docChanged && !update.selectionSet) return; const text = update.state.doc.toString(), selection = update.state.selection.main; setHistory(current => applyEdit(current, text, { anchor: selection.anchor, head: selection.head })); if (update.docChanged) onChange?.(text); })];
    if(mode==="adl")extensions.push(autocompletion({ override: [completion] }),adlDecorations);
    const instance = new EditorView({ parent: host.current, state: EditorState.create({ doc: initialTextRef.current, extensions }) });
    view.current = instance; return () => { instance.destroy(); view.current = null; };
  }, [mode, onChange]);
  const restore = (next: EditHistory) => { setHistory(next); const editor = view.current; if (!editor || editor.state.doc.toString() === next.present.text) return; editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: next.present.text }, selection: { anchor: next.present.selection.anchor, head: next.present.selection.head } }); };
  return <section className="code-editor" aria-label={title}>
    <div className="panel-heading"><h2>{title}</h2><div className="toolbar"><button type="button" onClick={() => restore(undoEdit(history))} disabled={!history.past.length}>Desfazer</button><button type="button" onClick={() => restore(redoEdit(history))} disabled={!history.future.length}>Refazer</button></div></div>
    <div ref={host} className="code-editor-host" aria-label={ariaLabel} />
    <div className="diagnostics" aria-live="polite"><h3>Diagnósticos ({diagnostics.length})</h3>{diagnostics.length === 0 ? <p>Documento válido.</p> : <ol>{diagnostics.map((item, index) => <li key={`${item.code}-${item.from}-${index}`}><button type="button" onClick={() => view.current?.dispatch({ selection: { anchor: item.from, head: item.to }, scrollIntoView: true })}>{item.message}</button></li>)}</ol>}</div>
  </section>;
}
