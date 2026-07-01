import { autocompletion, type CompletionContext } from "@codemirror/autocomplete";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { Decoration as ViewDecoration, EditorView, keymap, ViewPlugin, type DecorationSet, type ViewUpdate } from "@codemirror/view";
import { useEffect, useRef, useState } from "react";
import { analyzeRevision, applyEdit, createEditingDocument, redoEdit, suggestionsAt, undoEdit } from "./language-service.js";
import type { EditHistory } from "./model.js";

export interface CodeEditorProps { readonly initialText: string; readonly onChange?: (text: string) => void }

const adlDecorations = ViewPlugin.fromClass(class {
  decorations: DecorationSet;
  constructor(editor: EditorView) { this.decorations = this.build(editor); }
  update(update: ViewUpdate) { if (update.docChanged) this.decorations = this.build(update.view); }
  build(editor: EditorView): DecorationSet { return ViewDecoration.set(analyzeRevision({ text: editor.state.doc.toString(), revision: 0, selection: { anchor: 0, head: 0 } }).decorations.map(item => ViewDecoration.mark({ class: item.kind === "keyword" ? "adl-keyword" : "adl-diagnostic", attributes: item.message ? { title: item.message } : {} }).range(item.from, Math.max(item.from, item.to))), true); }
}, { decorations: value => value.decorations });

export function CodeEditor({ initialText, onChange }: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null), view = useRef<EditorView | null>(null);
  const [history, setHistory] = useState<EditHistory>(() => createEditingDocument(initialText));
  const analysis = analyzeRevision(history.present);
  const diagnostics = analysis.decorations.filter(item => item.kind === "diagnostic");
  useEffect(() => {
    if (!host.current) return;
    const completion = (context: CompletionContext) => { const options = suggestionsAt(context.state.doc.toString(), context.pos); return options.length ? { from: context.matchBefore(/\w*/)?.from ?? context.pos, options: options.map(label => ({ label, type: "keyword" })) } : null; };
    const instance = new EditorView({ parent: host.current, state: EditorState.create({ doc: initialText, extensions: [keymap.of([indentWithTab, ...defaultKeymap]), autocompletion({ override: [completion] }), adlDecorations, EditorView.lineWrapping, EditorView.updateListener.of(update => { if (!update.docChanged && !update.selectionSet) return; const text = update.state.doc.toString(), selection = update.state.selection.main; setHistory(current => applyEdit(current, text, { anchor: selection.anchor, head: selection.head })); if (update.docChanged) onChange?.(text); })] }) });
    view.current = instance; return () => { instance.destroy(); view.current = null; };
  }, [initialText, onChange]);
  const restore = (next: EditHistory) => { setHistory(next); const editor = view.current; if (!editor || editor.state.doc.toString() === next.present.text) return; editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: next.present.text }, selection: { anchor: next.present.selection.anchor, head: next.present.selection.head } }); };
  return <section className="code-editor" aria-labelledby="code-editor-title">
    <div className="panel-heading"><h2 id="code-editor-title">Editor ADL</h2><div className="toolbar"><button type="button" onClick={() => restore(undoEdit(history))} disabled={!history.past.length}>Desfazer</button><button type="button" onClick={() => restore(redoEdit(history))} disabled={!history.future.length}>Refazer</button></div></div>
    <div ref={host} className="code-editor-host" aria-label="Código ADL" />
    <div className="diagnostics" aria-live="polite"><h3>Diagnósticos ({diagnostics.length})</h3>{diagnostics.length === 0 ? <p>Documento válido.</p> : <ol>{diagnostics.map((item, index) => <li key={`${item.code}-${item.from}-${index}`}><button type="button" onClick={() => view.current?.dispatch({ selection: { anchor: item.from, head: item.to }, scrollIntoView: true })}>{item.message}</button></li>)}</ol>}</div>
  </section>;
}
