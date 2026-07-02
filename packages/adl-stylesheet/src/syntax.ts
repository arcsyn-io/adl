import type { SourceRange } from "@adl/parser";

export type StyleOrigin = "external" | "embedded";
export type StyleTarget = "global" | "element" | "relation";
export type SelectorKind = "global" | "category" | "type" | "id";
export type Shape = "rectangle" | "ellipse" | "cylinder" | "user" | "parallelogram";
export type Orientation = "horizontal" | "vertical";
export type TextAlign = "left" | "center" | "right";
export type VerticalAlign = "top" | "middle" | "bottom";

export interface StyleSelector { readonly target: StyleTarget; readonly kind: SelectorKind; readonly value?: string; readonly range: SourceRange }
export interface StyleDeclaration { readonly property: string; readonly value: string; readonly range: SourceRange }
export interface StyleRule { readonly selector: StyleSelector; readonly declarations: readonly StyleDeclaration[]; readonly range: SourceRange; readonly order: number }
export interface StylesheetDocument { readonly version: "1.0"; readonly origin: StyleOrigin; readonly uri: string; readonly rules: readonly StyleRule[]; readonly range: SourceRange }

export type StyleDiagnosticSeverity = "error" | "warning";
export type StyleDiagnosticCode = "STYLE_SYNTAX" | "STYLE_VERSION" | "STYLE_UNKNOWN_PROPERTY" | "STYLE_INVALID_VALUE" | "STYLE_PROPERTY_SCOPE" | "STYLE_UNMATCHED_SELECTOR" | "STYLE_OVERRIDE" | "STYLE_LOAD_FAILED" | "STYLE_READ_ONLY";
export interface StyleDiagnostic { readonly code: StyleDiagnosticCode; readonly severity: StyleDiagnosticSeverity; readonly message: string; readonly uri: string; readonly range: SourceRange }
export type StylesheetParseResult = { readonly ok: true; readonly document: StylesheetDocument; readonly diagnostics: readonly StyleDiagnostic[] } | { readonly ok: false; readonly diagnostics: readonly StyleDiagnostic[] };

export interface SolidPaint { readonly kind: "solid"; readonly color: string }
export interface GradientStop { readonly color: string; readonly offset: number }
export interface LinearGradientPaint { readonly kind: "linear-gradient"; readonly angle: number; readonly stops: readonly GradientStop[] }
export type Paint = SolidPaint | LinearGradientPaint;
export interface TextStyle { readonly paint: Paint; readonly fontSize: number; readonly fontFamily: readonly string[]; readonly fontWeight: "normal" | "bold"; readonly fontStyle: "normal" | "italic"; readonly textDecoration: "none" | "underline"; readonly textAlign: TextAlign; readonly verticalAlign: VerticalAlign }
export interface ResolvedElementStyle { readonly shape: Shape; readonly width: number; readonly height: number; readonly fill: Paint; readonly borderPaint: Paint; readonly borderWidth: number; readonly borderRadius: number; readonly orientation: Orientation; readonly rotation: number; readonly text: TextStyle; readonly position?: { readonly x: number; readonly y: number } }
export interface ResolvedRelationStyle { readonly linePaint: Paint; readonly lineWidth: number; readonly text: TextStyle }
export interface DiagramStyleDefaults { readonly element?: Partial<ResolvedElementStyle>; readonly relation?: Partial<ResolvedRelationStyle> }
export interface ResolvedDiagramStyles { readonly elements: Readonly<Record<string, ResolvedElementStyle>>; readonly relations: Readonly<Record<string, ResolvedRelationStyle>>; readonly diagnostics: readonly StyleDiagnostic[]; readonly completeness: "complete" | "fallback" }
export interface ValidatedRule { readonly source: StyleRule; readonly values: Readonly<Record<string, unknown>> }
export interface ValidatedStylesheet { readonly source: StylesheetDocument; readonly rules: readonly ValidatedRule[]; readonly diagnostics: readonly StyleDiagnostic[]; readonly valid: boolean }
