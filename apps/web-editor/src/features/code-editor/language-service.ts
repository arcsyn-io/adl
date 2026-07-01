import { validateSource } from "@adl/diagnostics";
import type { Decoration, EditHistory, EditingDocument, RevisionAnalysis, TextSelection } from "./model.js";

const clampSelection = (text: string, selection: TextSelection): TextSelection => ({ anchor: Math.max(0, Math.min(text.length, selection.anchor)), head: Math.max(0, Math.min(text.length, selection.head)) });
const freeze = <T>(value: T): T => { if (value !== null && typeof value === "object" && !Object.isFrozen(value)) { Object.freeze(value); for (const child of Object.values(value)) freeze(child); } return value; };

export function createEditingDocument(text: string, selection: TextSelection = { anchor: 0, head: 0 }): EditHistory {
  return freeze({ past: [], present: { text, revision: 0, selection: clampSelection(text, selection) }, future: [] });
}

export function applyEdit(history: EditHistory, text: string, selection: TextSelection): EditHistory {
  if (text === history.present.text && selection.anchor === history.present.selection.anchor && selection.head === history.present.selection.head) return history;
  return freeze({ past: [...history.past, history.present], present: { text, revision: history.present.revision + 1, selection: clampSelection(text, selection) }, future: [] });
}

export function undoEdit(history: EditHistory): EditHistory {
  const previous = history.past.at(-1); if (!previous) return history;
  return freeze({ past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] });
}

export function redoEdit(history: EditHistory): EditHistory {
  const next = history.future[0]; if (!next) return history;
  return freeze({ past: [...history.past, history.present], present: next, future: history.future.slice(1) });
}

export function analyzeRevision(document: EditingDocument): RevisionAnalysis {
  const validation = validateSource(document.text);
  const diagnostics: Decoration[] = validation.diagnostics.map(item => ({ kind: "diagnostic", from: item.range.start.offset, to: item.range.end.offset, message: item.message, code: item.code }));
  const keywords: Decoration[] = [];
  for (const match of document.text.matchAll(/\b(adl|version|diagram|element|relation|group|name|type|description|source|target|elements|properties)\b/g)) keywords.push({ kind: "keyword", from: match.index, to: match.index + match[0].length });
  return freeze({ revision: document.revision, decorations: [...keywords, ...diagnostics] });
}

export function suggestionsAt(text: string, offset: number): readonly string[] {
  const before = text.slice(0, Math.max(0, Math.min(text.length, offset)));
  if (/\badl\s+\w*$/.test(before)) return ["version"];
  if (/\bdiagram\s*\{[^}]*$/s.test(before)) return ["element", "relation", "group"];
  if (/\belement\s+\w+\s*\{[^}]*$/s.test(before)) return ["name", "type", "description", "properties"];
  if (/\brelation\s+\w+\s*\{[^}]*$/s.test(before)) return ["source", "target", "name", "type", "description", "properties"];
  return [];
}
