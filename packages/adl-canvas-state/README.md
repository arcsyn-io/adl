# @adl/canvas-state

Stores manual geometry separately from ADL and semantic models. `moveElement` supports pointer and keyboard origins, pinning controls automatic-layout reconciliation, and undo/redo preserves exact points.

Persist this value through `@adl/persistence`; never serialize it into `.adl`.
