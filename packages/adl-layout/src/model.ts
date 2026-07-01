export type LayoutDirection = "RIGHT" | "DOWN";

export interface LayoutOptions {
  readonly direction?: LayoutDirection;
  readonly spacing?: number;
  readonly nodeWidth?: number;
  readonly nodeHeight?: number;
  readonly maxElements?: number;
}

export interface NodeGeometry {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface RoutePoint { readonly x: number; readonly y: number }
export interface EdgeRoute { readonly points: readonly RoutePoint[] }
export interface LayoutResult {
  readonly revision: string;
  readonly nodes: Readonly<Record<string, NodeGeometry>>;
  readonly edges: Readonly<Record<string, EdgeRoute>>;
}
export interface LayoutError { readonly code: "INVALID_OPTIONS" | "LIMIT_EXCEEDED" | "LAYOUT_FAILED"; readonly message: string }
export type LayoutOutcome =
  | { readonly ok: true; readonly layout: LayoutResult }
  | { readonly ok: false; readonly errors: readonly LayoutError[]; readonly previous?: LayoutResult };
