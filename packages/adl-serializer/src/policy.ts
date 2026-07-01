export const CANONICAL_POLICY = Object.freeze({ indent: "  ", lineEnding: "\n", finalNewline: true, declarationOrder: ["element", "relation", "group"] as const });
export interface SerializationOptions { readonly targetVersion?: string }
export type SerializationErrorCode = "UNSUPPORTED_TARGET_VERSION" | "INVALID_MODEL" | "UNREPRESENTABLE_VALUE";
export interface SerializationError { readonly code: SerializationErrorCode; readonly message: string; readonly path: string }
export type SerializationResult = { readonly ok: true; readonly text: string; readonly targetVersion: "1.0" } | { readonly ok: false; readonly errors: readonly SerializationError[] };
