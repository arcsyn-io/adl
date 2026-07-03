import type { Point } from "./placement.js";
export const snapPoint = (point: Point, size: number, enabled: boolean): Point => enabled ? { x: Math.round(point.x / size) * size, y: Math.round(point.y / size) * size } : point;
