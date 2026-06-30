# Tasks: Bulk Template Mapping Assignments

**Input**: Design documents from `/specs/005-bulk-map-assignments/`

## Phase 1: Setup

- [X] T001 Review current mapping row, semantic variant, template selection, persistence, and undo paths in `src/app/template/mappings-card/` and `src/domain/operations/template-operations/mappings/`
- [X] T002 [P] Add focused bulk mapping assignment fixtures and test helpers in `src/app/template/template-renderer-workflows.test.tsx`

## Phase 2: Foundational

- [X] T003 Define stable mapping identity and discriminated mapping assignment types in `src/model/template-mapping-assignment.ts`
- [X] T004 Extend transient mapping selection shape and mutation methods in `src/domain/state/ui/template-ui-state.ts` and `src/domain/state/ui/template-ui-store.ts`
- [X] T005 [P] Add selection mutation operations in `src/domain/operations/template-operations/mappings/`
- [X] T006 Update template selection and unload operations to clear mapping selection in `src/domain/operations/template-operations/template-list/` and `src/domain/operations/template-operations/template-details/`
- [X] T007 Add complete-target validation and next-template construction tests in `src/domain/operations/template-operations/mappings/apply-mapping-assignment-operation.test.ts`
- [X] T008 Implement shared all-target mapping assignment policy in `src/domain/operations/template-operations/mappings/apply-mapping-assignment-operation.ts`

## Phase 3: User Story 1 - Assign One Value to Multiple Mappings (P1)

**Goal**: Apply group, color, or contrast assignment once to all selected mappings.

**Independent Test**: Select mappings across token types and verify each supported assignment changes selected mappings only.

- [X] T009 [US1] Add bulk assignment action variants and routing tests in `src/app/template/mappings-card/actions/mappings-card-action-type.ts` and `src/app/template/template-flow-routing.test.ts`
- [X] T010 [US1] Implement focused bulk assignment controller orchestration in `src/app/template/mappings-card/controllers/apply-selected-mapping-assignment-controller.ts`
- [X] T011 [US1] Route bulk assignment actions through `src/app/template/mappings-card/actions/mappings-card-handler.ts`
- [X] T012 [US1] Expose bulk assignment callbacks and assignment options in `src/app/template/mappings-card/use-mappings-card-viewmodel.ts`
- [X] T013 [US1] Add explicit bulk group, color, and contrast controls in `src/app/template/mappings-card/MappingsCard.tsx`
- [X] T014 [US1] Verify group, color, contrast, clear, no-op, stale-target, and orphan-removal workflows in `src/app/template/template-renderer-workflows.test.tsx`

## Phase 4: User Story 2 - Build and Understand a Multi-Selection (P2)

**Goal**: Select, deselect, count, retain, and clear exact mapping targets.

**Independent Test**: Build a selection across sections, hide rows with filters/collapse, and verify identities and count persist until explicitly cleared or context changes.

- [X] T015 [US2] Add selection action variants, controller routing, and tests in `src/app/template/mappings-card/actions/`, `src/app/template/mappings-card/controllers/`, and `src/app/template/template-flow-routing.test.ts`
- [X] T016 [US2] Expose selected identities, count, and named selection callbacks in `src/app/template/mappings-card/use-mappings-card-viewmodel.ts`
- [X] T017 [US2] Add accessible selection affordances to `src/app/template/mappings-card/MappingRow.tsx` and `src/app/template/mappings-card/SemanticVariantListRow.tsx`
- [X] T018 [US2] Wire selection through grouped, semantic-base, and virtualized rendering while preserving existing row sizing changes in `src/app/template/mappings-card/MappingsCard.tsx`
- [X] T019 [US2] Verify visible selection, hidden selection retention, clear, virtual-row exclusion, read-only exclusion, and context clearing in `src/app/template/template-renderer-workflows.test.tsx`

## Phase 5: User Story 3 - Reverse a Bulk Assignment Safely (P3)

**Goal**: Undo and redo the complete bulk edit as one history transition.

**Independent Test**: Apply one assignment to mappings with different prior values, undo once, and redo once.

- [X] T020 [US3] Add one-entry bulk assignment undo and redo coverage in `src/app/template/template-renderer-workflows.test.tsx`
- [X] T021 [US3] Add failed, invalid, and no-op history exclusion coverage in `src/domain/operations/undo-operations/undo-failure-paths.test.ts`
- [X] T022 [US3] Ensure bulk controller records one complete before/after transition and no incomplete transition in `src/app/template/mappings-card/controllers/apply-selected-mapping-assignment-controller.ts`

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T023 [P] Update mappings-card feature documentation if behavior guidance is needed in `src/app/template/README.md`
- [X] T024 Run focused domain, routing, renderer, undo, and architecture tests from `specs/005-bulk-map-assignments/quickstart.md`
- [X] T025 Run `npm run lint`, inspect the final diff for unrelated changes, and confirm `AGENTS.md` and architecture tests require no rule update

## Dependencies

- Phase 2 blocks all user stories.
- User Story 1 depends on T003-T008.
- User Story 2 depends on T003-T006 and can proceed alongside controller work for User Story 1 after the shared state model is complete.
- User Story 3 depends on the completed User Story 1 assignment workflow.
- Polish depends on all selected user stories.

## Parallel Opportunities

- T002 can proceed with T003-T006 after fixtures and current behavior are understood.
- T005 can proceed with T007 because selection mutation and assignment-policy tests touch separate modules.
- T017 can proceed with T015-T016 after the callback contract is agreed.
- T020 and T021 can proceed in parallel after bulk assignment orchestration exists.

## Implementation Strategy

1. Establish typed identities, transient selection, and pure assignment policy.
2. Deliver User Story 1 as the MVP with explicit bulk controls and atomic changes.
3. Complete full selection affordances and context lifecycle behavior for User Story 2.
4. Prove one-step undo/redo and all failure exclusions for User Story 3.
5. Run full focused validation and lint before completion.
