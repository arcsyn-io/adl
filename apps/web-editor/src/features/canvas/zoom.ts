export type ViewBox = { readonly x: number; readonly y: number; readonly width: number; readonly height: number }

const MIN_ZOOM = 0.5
const MAX_ZOOM = 2
const ZOOM_STEP = 0.1

const clampZoom = (zoom: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))

export function increaseZoom(zoom: number): number {
  return clampZoom(Math.round((zoom + ZOOM_STEP) * 10) / 10)
}

export function decreaseZoom(zoom: number): number {
  return clampZoom(Math.round((zoom - ZOOM_STEP) * 10) / 10)
}

export function zoomedViewBox(viewBox: ViewBox, zoom: number): ViewBox {
  const width = viewBox.width / zoom
  const height = viewBox.height / zoom
  return {
    x: viewBox.x + (viewBox.width - width) / 2,
    y: viewBox.y + (viewBox.height - height) / 2,
    width,
    height,
  }
}
