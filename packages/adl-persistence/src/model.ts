export interface LocalDocument { readonly id: string; readonly source: string; readonly updatedAt: string }
export interface VisualStateEnvelope { readonly version: 1; readonly documentRevision: number; readonly value: unknown }
export interface PersistedRevision { readonly revision: number; readonly document: LocalDocument; readonly visual?: VisualStateEnvelope }
export type SaveStatus = { readonly status: "idle" | "pending" | "saved"; readonly revision?: number } | { readonly status: "failed"; readonly message: string };
export interface PersistenceRecord { readonly format: "adl-local-v1"; readonly confirmed: PersistedRevision }
export interface StorageAdapter { get(key: string): string | null | Promise<string | null>; set(key: string, value: string): void | Promise<void> }
