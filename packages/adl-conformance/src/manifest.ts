export type ConformanceStage = "parse" | "semantic" | "diagnostics" | "serialize";
export interface ConformanceExpectation { readonly ok: boolean; readonly diagnosticCodes?: readonly string[]; readonly canonicalSource?: string }
export interface ConformanceCase { readonly id: string; readonly version: string; readonly source: string; readonly expected: Readonly<Partial<Record<ConformanceStage, ConformanceExpectation>>> }
export interface LanguageReference { readonly version: string; readonly constructs: readonly { readonly name: string; readonly description: string; readonly exampleId: string; readonly limits: readonly string[] }[]; readonly manualCoordinatesInAdl: false }
export interface ExampleDocument { readonly id: string; readonly version: string; readonly title: string; readonly source: string }
export interface VersionRecord { readonly version: string; readonly compatibility: "current" | "compatible" | "deprecated" | "unsupported"; readonly migration?: string }
export interface ConformanceManifest { readonly schemaVersion: 1; readonly language: LanguageReference; readonly versions: readonly VersionRecord[]; readonly examples: readonly ExampleDocument[]; readonly cases: readonly ConformanceCase[] }
