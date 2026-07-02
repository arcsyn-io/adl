# @adl/persistence

Atomic local persistence for correlated ADL and optional visual state. `LocalDocumentRepository` confirms a revision only after the storage adapter succeeds and restores recoverable ADL even when its visual envelope is incompatible.

`MemoryStorage` is provided for tests. Browser consumers can adapt `localStorage` without introducing a backend.
