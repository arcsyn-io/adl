import { lazy, Suspense } from "react";
import type { EditorTabsProps } from "./EditorTabs.js";
const EditorTabs = lazy(() => import("./EditorTabs.js").then(module => ({ default: module.EditorTabs })));
export function LazyEditorTabs(props: EditorTabsProps) { return <Suspense fallback={<aside aria-label="Workspace lateral" className="source-tabs"><p>Carregando editor…</p></aside>}><EditorTabs {...props} /></Suspense>; }
