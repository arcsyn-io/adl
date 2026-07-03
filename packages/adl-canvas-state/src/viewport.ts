import type { ViewportState } from "./placement.js";
export const clampViewport = (viewport: ViewportState, minimum = 0.25, maximum = 2): ViewportState => ({ x: Number.isFinite(viewport.x) ? viewport.x : 0, y: Number.isFinite(viewport.y) ? viewport.y : 0, zoom: Math.min(maximum, Math.max(minimum, Number.isFinite(viewport.zoom) ? viewport.zoom : 1)) });
