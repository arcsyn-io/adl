# Tasks: Editor de código ADL

**Input**: design documents in specs/008-code-editor/
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md
**Tests**: contract and acceptance tests are included because the specification defines verifiable scenarios.

## Phase 1: Setup

- [ ] T001 Create the feature entry structure in apps/web-editor/src/features/code-editor/index.ts and register dependencies in apps/web-editor/package.json
- [ ] T002 [P] Add reusable feature fixtures in apps/web-editor/src/features/code-editor/test/fixtures.ts
- [ ] T003 [P] Reuse and, if required, extend test/typecheck scripts in apps/web-editor/package.json

---

## Phase 2: Foundational

**Goal**: establish the public contract and domain primitives shared by all stories.

- [ ] T004 Add public domain types and invariants from data-model.md in apps/web-editor/src/features/code-editor/model.ts
- [ ] T005 [P] Add public contract tests from contracts/ in apps/web-editor/src/features/code-editor/test/contract.test.ts
- [ ] T006 Export the minimal public API without reverse dependencies in apps/web-editor/src/features/code-editor/index.ts

**Checkpoint**: contract compiles and foundational tests fail only for unimplemented story behavior.

---

## Phase 3: User Story 1 - Primary outcome (Priority: P1) 🎯 MVP

**Goal**: deliver the first user story from spec.md as an independently testable slice.
**Independent Test**: execute the first acceptance scenarios using feature fixtures without requiring stories 2 or 3.

- [ ] T007 [P] [US1] Add acceptance and failure tests for User Story 1 in apps/web-editor/src/features/code-editor/code-editor.test.tsx
- [ ] T008 [US1] Implement the primary domain behavior in apps/web-editor/src/features/code-editor/CodeEditor.tsx
- [ ] T009 [US1] Connect the primary behavior to the public API in apps/web-editor/src/features/code-editor/index.ts

**Checkpoint**: User Story 1 passes independently and constitutes the MVP.

---

## Phase 4: User Story 2 - Extended behavior (Priority: P2)

**Goal**: add the second journey without changing the User Story 1 contract.
**Independent Test**: execute only the second story scenarios and verify User Story 1 remains green.

- [ ] T010 [P] [US2] Add acceptance and edge-case tests for User Story 2 in apps/web-editor/src/features/code-editor/code-editor.test.tsx
- [ ] T011 [US2] Implement the second-story rules in apps/web-editor/src/features/code-editor/CodeEditor.tsx
- [ ] T012 [US2] Expose second-story results through apps/web-editor/src/features/code-editor/index.ts

**Checkpoint**: stories 1 and 2 are independently usable.

---

## Phase 5: User Story 3 - Resilience and evolution (Priority: P3)

**Goal**: implement the third journey, including version/error or recovery behavior.
**Independent Test**: exercise the third story with valid, invalid and stale/incompatible inputs.

- [ ] T013 [P] [US3] Add acceptance and resilience tests for User Story 3 in apps/web-editor/src/features/code-editor/code-editor.test.tsx
- [ ] T014 [US3] Implement third-story state/error behavior in apps/web-editor/src/features/code-editor/CodeEditor.tsx
- [ ] T015 [US3] Publish third-story outcomes through apps/web-editor/src/features/code-editor/index.ts

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T016 [P] Add performance/reference cases for the SC limits in apps/web-editor/src/features/code-editor/test/performance.test.ts
- [ ] T017 [P] Document public usage and constraints in apps/web-editor/src/features/code-editor/README.md
- [ ] T018 Validate the feature quickstart and record any corrected commands in specs/008-code-editor/quickstart.md
- [ ] T019 Run repository gates declared in package.json and fix only feature-owned files under apps/web-editor/src/features/code-editor
- [ ] T020 Run relevant interaction/visual E2E scenarios in tests/e2e/code-editor.spec.ts

## Dependencies

- Phase 1 precedes Phase 2.
- Phase 2 blocks all user stories.
- User Story 1 is the MVP; User Stories 2 and 3 can proceed in parallel after T009 when they touch independent files.
- Polish begins after all selected stories pass.
- Cross-feature dependencies remain those declared in plan.md and specs/README.md.

## Parallel Example

- T002 and T003 can run together.
- T005 can run alongside T004 after the contract is approved.
- Test tasks T010 and T013 can be prepared in parallel.
- T016 and T017 can run together after story behavior stabilizes.

## Implementation Strategy

1. Complete setup and foundational contract.
2. Deliver and validate User Story 1.
3. Add User Stories 2 and 3 incrementally.
4. Run package tests, repository gates and E2E where applicable.
5. Do not implement later roadmap features inside this feature.
