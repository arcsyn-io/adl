export type RasterResult = { readonly ok: true; readonly bytes: Uint8Array } | { readonly ok: false; readonly code: "EMPTY_EXPORT" | "RASTERIZATION_FAILED"; readonly message: string };
export async function rasterizeSvg(svg: string, width: number, height: number, scale = 2, maxArea = 40_000_000): Promise<RasterResult> {
  if (!width || !height) return { ok: false, code: "EMPTY_EXPORT", message: "O diagrama está vazio." };
  if (width * height * scale * scale > maxArea) return { ok: false, code: "RASTERIZATION_FAILED", message: "O diagrama excede o limite de exportação." };
  if (typeof document === "undefined" || typeof Image === "undefined") return { ok: false, code: "RASTERIZATION_FAILED", message: "Rasterização exige um navegador." };
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try { const image = new Image(); image.src = url; await image.decode(); const canvas = document.createElement("canvas"); canvas.width = Math.ceil(width * scale); canvas.height = Math.ceil(height * scale); const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas indisponível"); context.scale(scale, scale); context.drawImage(image, 0, 0, width, height); const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png")); if (!blob) throw new Error("Falha ao codificar PNG"); return { ok: true, bytes: new Uint8Array(await blob.arrayBuffer()) }; } catch { return { ok: false, code: "RASTERIZATION_FAILED", message: "Não foi possível rasterizar o diagrama." }; } finally { URL.revokeObjectURL(url); }
}
