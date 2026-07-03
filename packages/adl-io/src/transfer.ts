export interface ImportedFile { readonly name: string; readonly mediaType: "text/x-adl"; readonly source: string }
export interface ExportArtifact { readonly filename: string; readonly mediaType: "text/x-adl" | "text/x-adls" | "image/svg+xml" | "image/png"; readonly content: string | Uint8Array; readonly revision?: number }
export interface VisualExportRequest { readonly filename: string; readonly svg: string }
export type TransferResult<T> = { readonly ok: true; readonly value: T; readonly warnings: readonly string[] } | { readonly ok: false; readonly code: "INVALID_TYPE" | "INVALID_CONTENT" | "UNSUPPORTED_VERSION" | "EXPORT_FAILED"; readonly message: string };
export interface ImportValidator<Model> { validate(source: string): { ok: true; model: Model } | { ok: false; code?: "UNSUPPORTED_VERSION"; message: string } }
export interface SourceSerializer<Model> { serialize(model: Model): string }
