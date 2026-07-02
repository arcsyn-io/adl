# @adl/conformance

Versioned, executable language conformance manifests. Normative cases are separate from reference text and examples; `validateManifest` ensures published examples and constructs have cases, while `runConformance` compares implementation stages deterministically.

Manual coordinates are explicitly forbidden from ADL by `LanguageReference.manualCoordinatesInAdl: false`. Unsupported versions require migration guidance.
