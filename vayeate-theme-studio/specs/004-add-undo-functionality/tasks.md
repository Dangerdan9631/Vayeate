# Tasks: Add Undo Functionality

**Input**: Design documents from `/specs/004-add-undo-functionality/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/undo-history-contract.md`, `contracts/undo-workflow-integration.md`,
`quickstart.md`

**Tests**: This feature requires focused undo policy tests, renderer workflow
tests for representative app shell, catalog, template, and theme workflows,
gateway persistence tests, startup clearing tests, and architecture/convention
enforcement updates because undo changes action-flow, state-ownership,
context-key, persistence, and failure-path rules.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Path Conventions

- App/UI and translation work: `src/app/**`
- Policy and domain work: `src/domain/**`
- External detail adapters: `src/gateway/**`
- Typed model and parsing work: `src/model/**`
- Electron main/preload work: `electron/**`
- Architecture or convention enforcement: `test/**` and directive artifacts

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and rule-aware scaffolding

- [X] T001 Inventory current undo primitives and classify placeholder behavior in `src/domain/core/undo-stack-types.ts`, `src/domain/core/undo-stack.ts`, `src/domain/core/undo-manager-v2.ts`, `src/domain/operations/undo-operations`, `src/gateway/undo/undo-gateway.ts`, and `src/app/core/undo`
- [X] T002 [P] Inventory representative state-changing workflows for app shell, catalog, template, and theme undo participation in `src/app/app`, `src/app/catalog`, `src/app/template`, and `src/app/theme`
- [X] T003 [P] Inventory directive and enforcement touch points for undo rules in `AGENTS.md`, `test/architecture/layer-boundaries.test.ts`, and `test/architecture/component-workflow-compliance.test.ts`
- [X] T004 Record the workflow classification matrix for undoable, not-state-changing, not-reversible, and deferred actions in `specs/004-add-undo-functionality/tasks.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can
be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create typed undo context, diff, entry, stack position, transition result, and availability models in `src/model/undo-history.ts`
- [X] T006 [P] Add undo model validation tests for `*Ref`-based context keys and non-snapshot diff payloads in `src/model/undo-history.test.ts`
- [X] T007 Replace placeholder-only undo action typing with action-generated before/after diff action types in `src/domain/core/undo-stack-types.ts`
- [X] T008 Update stack push, undo, redo, go-to, branch pruning, list, and persistence semantics in `src/domain/core/undo-stack.ts`
- [X] T009 Update undo manager creation, persistence failure handling, and active-session hydration behavior in `src/domain/core/undo-manager-v2.ts`
- [X] T010 [P] Update undo processor dispatch for typed reversal and reapplication actions in `src/domain/core/undo-processor.ts`
- [X] T011 Update undo stack state and read-only availability summary shape in `src/domain/state/undo-stack/undo-stack-state.ts` and `src/domain/state/undo-stack/undo-stack-store.ts`
- [X] T012 [P] Add core undo stack tests for LIFO undo, redo order, branch pruning, 20-action depth, and go-to semantics in `src/domain/core/undo-stack.test.ts`
- [X] T013 [P] Add undo manager tests for write-through persistence, memory release reload, persistence failure behavior, and startup clearing in `src/domain/core/undo-manager-v2.test.ts`
- [X] T014 Update active stack selection and load operations to require context-derived stack IDs and read-only summaries in `src/domain/operations/undo-operations/set-current-undo-stack-id-operation.ts` and `src/domain/operations/undo-operations/load-undo-history-operation.ts`
- [X] T015 Update undo, redo, and history-go-to operations to return `HistoryTransitionResult` and preserve entries on failed transitions in `src/domain/operations/undo-operations/undo-operation.ts`, `src/domain/operations/undo-operations/redo-operation.ts`, and `src/domain/operations/undo-operations/history-go-to-operation.ts`
- [X] T016 Update startup clearing and undo persistence adapter behavior in `src/domain/operations/undo-operations/clear-persisted-undo-operation.ts` and `src/gateway/undo/undo-gateway.ts`
- [X] T017 [P] Add gateway tests for saving stack changes, listing persisted stack files, clearing `data/.undo`, and handling missing files in `src/gateway/undo/undo-gateway.test.ts`
- [X] T018 Update app-layer undo controller contracts for typed transition results in `src/app/core/undo/undo-controller.ts`, `src/app/core/undo/redo-controller.ts`, and `src/app/core/undo/history-go-to-controller.ts`
- [X] T019 Add architecture enforcement for context-scoped undo, read-only renderer summaries, action-generated diffs, and no placeholder undo actions in `test/architecture/component-workflow-compliance.test.ts`
- [X] T020 Add layer-boundary enforcement for undo policy independence from React, Electron, filesystem, and gateway details in `test/architecture/layer-boundaries.test.ts`

**Checkpoint**: Foundation ready; user stories can now be implemented without
breaking the constitution

---

## Phase 3: User Story 1 - Undo Recent Work in the Active Context (Priority: P1) MVP

**Goal**: Undo completed state-changing actions in the active tab and active
template/catalog/theme context in reverse order without touching inactive
contexts.

**Independent Test**: Start with a known tab and `*Ref` context, perform several
visible edits, invoke undo repeatedly, and verify each edit reverses in LIFO
order while no inactive tab or context changes.

### Tests for User Story 1

- [X] T021 [P] [US1] Add policy tests for recording completed reversible actions and rejecting no-op actions in `src/domain/operations/undo-operations/record-undo-entry-operation.test.ts`
- [X] T022 [P] [US1] Add app shell undo command tests for menu and keyboard routing in `src/app/app/menu-bar/menu-bar-renderer-workflows.test.tsx` and `src/app/app/app-shell/app-shell-renderer-workflows.test.tsx`
- [X] T023 [P] [US1] Add representative theme edit undo tests for visible state reversal in `src/app/theme/theme-renderer-workflows.test.tsx`

### Implementation for User Story 1

- [X] T024 [US1] Implement focused undo entry recording operation for completed reversible actions in `src/domain/operations/undo-operations/record-undo-entry-operation.ts`
- [X] T025 [US1] Generate before/after diffs for representative theme variable edits in `src/domain/operations/theme-operations` and `src/app/theme/theme-variables-card/controllers`
- [X] T026 [US1] Wire theme edit controllers through the named action flow to record undo only after successful mutation in `src/app/theme/theme-variables-card/controllers`
- [X] T027 [US1] Wire menu and keyboard undo commands to typed undo transition results in `src/app/app/menu-bar/actions/app-menu-handler.ts`, `src/app/app/menu-bar/use-menubar-viewmodel.ts`, and `src/app/app/app-shell/controllers/handle-keyboard-shortcut-controller.ts`
- [X] T028 [US1] Update menu disabled state and next undo description from read-only availability in `src/app/app/menu-bar/MenuBar.tsx` and `src/app/app/menu-bar/use-menubar-viewmodel.ts`
- [X] T029 [US1] Ensure empty-stack undo is unavailable or produces no state change without false success feedback in `src/domain/operations/undo-operations/undo-operation.ts` and `src/app/core/undo/undo-controller.ts`

**Checkpoint**: User Story 1 should be fully functional and independently
testable

---

## Phase 4: User Story 2 - Preserve Separate Undo History Per Tab and Content Version (Priority: P1)

**Goal**: Maintain and restore independent stacks for each active tab plus
template, catalog, and theme reference combination.

**Independent Test**: Perform different edits across tabs and across two
template, catalog, or theme references, switch between them, and verify undo
availability and reversal always match only the active context.

### Tests for User Story 2

- [X] T030 [P] [US2] Add context-key tests for active tab plus `templateRef`, `catalogRef`, and `themeRef` values in `src/model/undo-history.test.ts`
- [X] T031 [P] [US2] Add cross-context renderer tests for template and catalog context switching in `src/app/template/template-renderer-workflows.test.tsx` and `src/app/catalog/catalog-renderer-workflows.test.tsx`
- [X] T032 [P] [US2] Add theme reference switch tests for restoring the prior stack in `src/app/theme/theme-renderer-workflows.test.tsx`

### Implementation for User Story 2

- [X] T033 [US2] Implement context-key derivation from active tab and existing `*Ref` values in `src/model/undo-history.ts`
- [X] T034 [US2] Select the active undo stack when app shell tab state changes in `src/app/app/app-shell/controllers` and `src/domain/operations/undo-operations/set-current-undo-stack-id-operation.ts`
- [X] T035 [US2] Select the active undo stack when catalog references change in `src/app/catalog/catalogs-card/controllers/set-selected-catalog-controller.ts` and `src/domain/state/ui/catalog-ui-store.ts`
- [X] T036 [US2] Select the active undo stack when template references change in `src/app/template/templates-card/controllers/select-template-and-load-controller.ts` and `src/domain/state/ui/template-ui-state.ts`
- [X] T037 [US2] Select the active undo stack when theme references change in `src/app/theme/themes-card/controllers/select-theme-and-load-controller.ts` and `src/domain/state/ui/theme-ui-state.ts`
- [X] T038 [US2] Preserve inactive stack entries during active-context undo, redo, and go-to transitions in `src/domain/core/undo-manager-v2.ts` and `src/domain/core/undo-stack.ts`
- [X] T039 [US2] Refresh read-only undo availability after each context switch in `src/domain/operations/undo-operations/load-undo-history-operation.ts` and `src/domain/state/undo-stack/undo-stack-store.ts`

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Keep Session History With Disk-Backed Runtime Storage (Priority: P2)

**Goal**: Keep history available for the open app session using write-through
disk backing, allow memory release, and clear prior-session persisted state on
startup.

**Independent Test**: Build history across contexts, verify stack changes write
to disk, release in-memory data, use undo/redo/history in the same session, then
restart and verify no prior-session entries are available.

### Tests for User Story 3

- [X] T040 [P] [US3] Add startup clearing tests in `src/domain/session-and-preview-baseline.test.ts`
- [X] T041 [P] [US3] Add active-session disk reload tests for memory-released stacks in `src/domain/core/undo-manager-v2.test.ts`
- [X] T042 [P] [US3] Add persistence adapter failure-path tests in `src/gateway/undo/undo-gateway.test.ts` and `src/domain/operations/undo-operations/record-undo-entry-operation.test.ts`

### Implementation for User Story 3

- [X] T043 [US3] Ensure app startup clears prior-session undo files before undo history can be loaded in `src/app/app/app-shell/controllers/load-app-controller.ts`
- [X] T044 [US3] Remove cross-session undo hydration from app startup while retaining active-session reload after memory release in `src/domain/operations/undo-operations/load-undo-history-operation.ts`
- [X] T045 [US3] Make stack changes write through to `src/gateway/undo/undo-gateway.ts` before in-memory entries are eligible for release in `src/domain/core/undo-manager-v2.ts`
- [X] T046 [US3] Surface persistence failures so actions are not reported safely undoable without equivalent active-session guarantees in `src/domain/operations/undo-operations/record-undo-entry-operation.ts`
- [X] T047 [US3] Validate session-only behavior and active-session reload in `src/domain/session-and-preview-baseline.test.ts`

**Checkpoint**: User Story 3 should preserve open-session history and clear
prior-session history

---

## Phase 6: User Story 4 - Redo and Navigate Recent Action History (Priority: P2)

**Goal**: Redo undone actions, expose ordered recent actions, navigate to the
state immediately after a selected item, and prune redo branches after new
actions.

**Independent Test**: Perform several actions, undo multiple actions, redo in
order, select older and newer recent-action items, then record a new action and
verify redoable branch entries are pruned while earlier history remains.

### Tests for User Story 4

- [X] T048 [P] [US4] Add redo and branch-pruning policy tests in `src/domain/core/undo-stack.test.ts`
- [X] T049 [P] [US4] Add history-list selection tests in `src/app/app/menu-bar/menu-bar-renderer-workflows.test.tsx`
- [X] T050 [P] [US4] Add representative theme redo and history navigation workflow tests in `src/app/theme/theme-renderer-workflows.test.tsx`

### Implementation for User Story 4

- [X] T051 [US4] Ensure redo reapplies undone entries in order in `src/domain/operations/undo-operations/redo-operation.ts` and `src/domain/core/undo-stack.ts`
- [X] T052 [US4] Ensure history go-to targets the state immediately after the selected item in `src/domain/operations/undo-operations/history-go-to-operation.ts` and `src/domain/core/undo-stack.ts`
- [X] T053 [US4] Expose ordered recent actions, current position, canUndo, and canRedo in `src/domain/state/undo-stack/undo-stack-state.ts` and `src/app/app/menu-bar/use-menubar-viewmodel.ts`
- [X] T054 [US4] Wire history-list item selection through named actions in `src/app/app/menu-bar/MenuBar.tsx`, `src/app/app/menu-bar/actions/app-menu-action-type.ts`, and `src/app/app/menu-bar/actions/app-menu-handler.ts`
- [X] T055 [US4] Prune redoable branch entries when a new undoable action is recorded in `src/domain/operations/undo-operations/record-undo-entry-operation.ts` and `src/domain/core/undo-stack.ts`

**Checkpoint**: User Story 4 should support redo, ordered list navigation, and
branch pruning

---

## Phase 7: User Story 5 - Handle Failed or Interrupted Actions Safely (Priority: P2)

**Goal**: Ensure failed, canceled, rejected, interrupted, duplicate pending, and
external-detail failures never create incorrect undo entries.

**Independent Test**: Trigger validation failures, canceled actions, repeated
pending actions, and external-detail failures for remediated workflows; verify
only completed user-visible reversible changes appear in undo history.

### Tests for User Story 5

- [X] T056 [P] [US5] Add failure-path policy tests for validation, cancellation, interruption, pending duplicate work, and external-detail failures in `src/domain/operations/undo-operations/record-undo-entry-operation.test.ts`
- [X] T057 [P] [US5] Add catalog failure-path undo tests in `src/app/catalog/catalog-renderer-workflows.test.tsx`
- [X] T058 [P] [US5] Add template failure-path undo tests in `src/app/template/template-renderer-workflows.test.tsx`
- [X] T059 [P] [US5] Add theme failure-path undo tests in `src/app/theme/theme-renderer-workflows.test.tsx`

### Implementation for User Story 5

- [X] T060 [US5] Add completed-action recording guards to catalog state-changing workflows in `src/app/catalog/tokens-card/controllers` and `src/domain/operations/catalog-operations`
- [X] T061 [US5] Add completed-action recording guards to template state-changing workflows in `src/app/template/variables-card/controllers`, `src/app/template/groups-card/controllers`, and `src/domain/operations/template-operations`
- [X] T062 [US5] Add completed-action recording guards to theme state-changing workflows in `src/app/theme/theme-palette-card/controllers`, `src/app/theme/theme-variables-card/controllers`, and `src/domain/operations/theme-operations`
- [X] T063 [US5] Classify non-state-changing and non-reversible actions with rationale in `specs/004-add-undo-functionality/tasks.md`
- [X] T064 [US5] Ensure failed undo, redo, or history navigation preserves state and targeted entries in `src/domain/operations/undo-operations/undo-operation.ts`, `src/domain/operations/undo-operations/redo-operation.ts`, and `src/domain/operations/undo-operations/history-go-to-operation.ts`

**Checkpoint**: User Story 5 should prevent incorrect history entries and keep
history consistent after failures

---

## Phase 8b: Baseline Opened History Entry

**Purpose**: Prepend a synthetic "opened" baseline item to every active context's
history list; selecting it reverts all recorded actions in that context.

- [X] T073 [P] Add `UNDO_BASELINE_FRAME_ID`, `deriveUndoBaselineLabel`, and baseline label tests in `src/model/undo-history.ts` and `src/model/undo-history.test.ts`
- [X] T074 [P] Add baseline goto tests in `src/domain/core/undo-stack.test.ts`
- [X] T075 Expose `currentBaselineLabel`, prepend synthetic baseline rows in `refreshUndoSummary`, and set labels on context switch in `src/domain/state/undo-stack/undo-stack-state.ts`, `src/domain/state/undo-stack/undo-stack-store.ts`, `src/domain/operations/undo-operations/undo-operation-helpers.ts`, `src/domain/operations/undo-operations/set-current-undo-stack-id-operation.ts`, and `src/domain/core/undo-stack.ts`
- [X] T076 [P] Update theme, template, menu bar, and session baseline workflow tests in `src/app/theme/theme-renderer-workflows.test.tsx`, `src/app/template/template-renderer-workflows.test.tsx`, `src/app/app/menu-bar/menu-bar-renderer-workflows.test.tsx`, and `src/domain/session-and-preview-baseline.test.ts`
- [X] T077 Add baseline opened-item styling hook in `src/app/app/menu-bar/MenuBar.tsx`
- [X] T078 [P] Document baseline opened-item rules in `specs/004-add-undo-functionality/spec.md`, `specs/004-add-undo-functionality/data-model.md`, and `specs/004-add-undo-functionality/contracts/undo-history-contract.md`

**Checkpoint**: Every active context shows an opened baseline first; selecting it
reverts all recorded actions and checkmarks the baseline on fresh or fully undone
stacks.

---

## Phase 8a: Universal Undo Coverage (Phase F)

**Purpose**: Enforce that every app controller records undo or is explicitly
excluded; sync architecture exceptions and directives.

- [X] T079 [P] Add universal controller coverage enforcement in `test/architecture/undo-controller-coverage.test.ts` backed by `test/architecture/undo-controller-exclusions.ts`
- [X] T080 [P] Restore and extend operation-to-operation `execute` exceptions for undo apply-state, lifecycle, and record facades in `test/architecture/architecture.test.ts` and `.cursor/rules/app-architecture.mdc`
- [X] T081 Verify legacy cleanup: no `RestoreTemplateStateController`, `RestoreThemeStateController`, `CatalogUndoPush`, `TemplateUndoPush`, or unwired duplicate controllers from plan C4/D7 remain referenced in `src/`
- [X] T082 [P] Update universal coverage language in `specs/004-add-undo-functionality/spec.md`, `specs/004-add-undo-functionality/tasks.md`, and `specs/004-add-undo-functionality/contracts/undo-workflow-integration.md`
- [X] T083 [P] Refresh `AGENTS.md` SPECKIT directive for universal coverage with documented exclusions

**Checkpoint**: 139 audited controllers — 62 record via `Record*UndoOperation`,
77 excluded with evidence; architecture tests fail on unclassified controllers.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T065 [P] Update the active feature directive block in `AGENTS.md` after undo enforcement and task status are synchronized
- [X] T066 [P] Update `specs/004-add-undo-functionality/quickstart.md` with exact final validation commands and any renamed test files
- [X] T067 [P] Update `test/architecture/component-workflow-compliance.test.ts` with final workflow participation evidence for app shell, catalog, template, and theme
- [X] T068 Run `npm run lint` and fix lint issues in touched files
- [X] T069 Run focused Vitest suites for undo core, undo operations, gateway persistence, menu bar, catalog, template, theme, and architecture enforcement
- [X] T070 Run `npm test` for full regression validation
- [X] T071 Confirm final validation covers app shell, catalog, template, and theme undo/redo workflows, history-list navigation, redo branch pruning, disk writes, startup clearing, context switching, failure paths, and action-generated before/after diffs in `specs/004-add-undo-functionality/tasks.md`
- [X] T072 Remove temporary scaffolding and confirm no placeholder undo actions, whole-application snapshots, cross-session history restoration, renderer-owned history mutation, or workflow bypasses remain in `src/domain`, `src/app`, `src/gateway`, and `src/model`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational; MVP scope
- **User Story 2 (Phase 4)**: Depends on Foundational and should be validated with US1
- **User Story 3 (Phase 5)**: Depends on Foundational and context-scoped stack behavior from US2
- **User Story 4 (Phase 6)**: Depends on Foundational and stack behavior from US1
- **User Story 5 (Phase 7)**: Depends on Foundational and representative workflow participation from US1-US4
- **Polish (Phase 8)**: Depends on all selected user stories being complete

### User Story Dependencies

- **US1 (P1)**: Delivers MVP undo for completed actions in the active context
- **US2 (P1)**: Can start after foundational context models are ready; validates context isolation with US1
- **US3 (P2)**: Needs stack identity and persistence foundation; validates session retention and startup clearing
- **US4 (P2)**: Builds on stack ordering and app shell history UI; validates redo, go-to, and pruning
- **US5 (P2)**: Builds on recording operation and workflow participation; validates failure safety across representative areas

### Within Each User Story

- Add or update policy tests before finalizing implementation where practical
- Preserve named callback to action to handler to controller to policy operation flow
- Keep state writes and business logic inside policy-owned units
- Keep typed model and boundary translation responsibilities intact
- Improve names, remove duplication, and reduce complexity in touched code
- Finish enforcement and directive sync before marking the story complete

### Parallel Opportunities

- T002 and T003 can run in parallel after T001 starts because they inspect different surfaces
- T006, T010, T012, T013, and T017 can run in parallel once T005-T009 interfaces are agreed
- T021, T022, and T023 can run in parallel before US1 implementation completion
- T030, T031, and T032 can run in parallel for US2 context isolation coverage
- T040, T041, and T042 can run in parallel for US3 persistence coverage
- T048, T049, and T050 can run in parallel for US4 redo/history coverage
- T056, T057, T058, and T059 can run in parallel for US5 failure-path coverage
- T065, T066, and T067 can run in parallel after implementation behavior stabilizes

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup.
2. Complete Foundational work through typed undo models, stack semantics, write-through persistence contracts, and architecture enforcement.
3. Complete User Story 1 for app shell commands and one representative theme workflow.
4. Validate `npm run lint`, `npm test -- src/domain/core/undo-stack.test.ts`, `npm test -- src/domain/operations/undo-operations/record-undo-entry-operation.test.ts`, `npm test -- src/app/app/menu-bar/menu-bar-renderer-workflows.test.tsx`, `npm test -- src/app/theme/theme-renderer-workflows.test.tsx`, and relevant architecture tests.
5. Stop and review before expanding to cross-context, persistence, history navigation, and failure-path scope.

### Incremental Delivery

1. Establish layer-correct typed foundations and remove placeholder undo behavior.
2. Add US1 and validate independent undo in the active context.
3. Add US2 and validate tab plus `*Ref` context isolation.
4. Add US3 and validate disk-backed session retention plus startup clearing.
5. Add US4 and validate redo, history-list navigation, and branch pruning.
6. Add US5 and validate failure-path safety for app shell, catalog, template, and theme workflows.
7. Complete directive synchronization, enforcement, lint, focused tests, and full regression validation.

## Workflow Classification Matrix

| Area | Workflow Examples | Classification | Evidence / Required Rationale |
|------|-------------------|----------------|-------------------------------|
| Current undo primitives | `UndoActionNoop`, `NOOP` processor branches, `UndoFrame.actions`, stack push/undo/redo/goto/list, manager LRU hydration, `UndoGateway` stack files, app undo controllers | Migration evidence / placeholder behavior to replace | `src/domain/core/undo-stack-types.ts` defines only `UndoActionNoop`; `src/domain/core/undo-processor.ts` apply/revert branches are no-ops. Stack mechanics and gateway files are useful evidence, but Phase 2 must replace placeholder actions with typed action-generated before/after diffs, typed transition results, awaited write-through persistence, context-derived stack IDs, and startup clearing without cross-session restoration. |
| App shell history commands | `EditMenuUndoButtonOnClick`, `EditMenuRedoButtonOnClick`, `HistoryMenuGoToButtonOnClick`, keyboard shortcut handling | Undo infrastructure / reversible only through history transitions | `src/app/app/menu-bar/actions/app-menu-action-type.ts` and `app-menu-handler.ts` already route menu commands to undo, redo, and history-go-to controllers. Phase 2/US1 must return and surface typed `HistoryTransitionResult`, preserve entries on failure, and keep history-list navigation policy-owned. |
| App shell context selection | `TabButtonOnClick`, active tab load/unload, selected content context changes | Context selection, not undoable by itself | `src/app/app/ribbon/actions/app-ribbon-action-type.ts` routes tab selection through `SetActiveTabController`. Selection activates a context-scoped stack but should not create an undo entry because it changes visible navigation/context rather than reversible authored content. |
| Catalog authoring | Token key commits, token add/remove, semantic token add/remove/update, source URL/type/token-type commits, source add/remove, bulk add tokens, sync/lock/revert/delete version | Undoable when completed and reversible; some destructive/external cases deferred until guarded | `tokens-card`, `catalog-details-card`, and `bulk-add-dialog` action types expose completed commit/add/remove/sync/version actions. Phase 5 must record only successful visible catalog mutations, guard validation/cancel/pending/external failures, and explicitly defer any destructive or external-detail workflow that cannot be safely reversed in the initial implementation. |
| Catalog filtering and dialog input | Token search text, new-token draft text, new-source draft URL/type/token type, bulk-add text, create-dialog draft fields, open/close/cancel dialogs, selected catalog change | Not state-changing for authored catalog data; context selection where applicable | These actions update transient UI state or active reference selection. They must not create undo entries unless later implementation proves they persist authored app-visible state; selected catalog changes instead select the active undo context using `catalogRef`. |
| Template authoring | Variable add/remove/group commits, contrast source commits, group add/remove, mapping group/color/contrast commits, semantic variant add/update/remove, catalog toggle/version/update-all, create/delete/lock template version | Undoable when completed and reversible; destructive/external cases deferred until guarded | `variables-card`, `groups-card`, `mappings-card`, `template-catalogs-card`, and `template-details-card` action types identify completed template mutations. Phase 5 must use existing `templateRef` plus relevant `catalogRef`, record action-generated diffs after successful save/select flows, and classify delete/version/external update workflows if reversal cannot be guaranteed. |
| Template filtering and selection | Variables/mappings search text, mapping variable filters, add-variable/group draft text, create dialog draft/open/close, template selection/load/restore | Not state-changing for authored template data; context selection where applicable | These actions are transient renderer/UI state or active-reference changes. Selection/load should restore the matching context stack for existing `templateRef` values without recording undo entries. |
| Theme authoring | Theme variable color/contrast commits and use-dark toggles, palette assignment commits, hue/reference/cluster/color-ref commits, theme template commits, preview token ref commits, generate, increment version, create/delete version | Undoable when completed and reversible; generated/destructive cases deferred until guarded | `theme-variables-card`, `theme-palette-card`, and `theme-details-card` action types expose representative completed theme edits. MVP should start with theme variable edits, then Phase 5 must guard palette/generated/destructive workflows and use existing `themeRef` plus relevant `templateRef`. |
| Theme filtering and selection | Theme variable search/selection checkboxes, palette preview sliders, eyedropper open, color picker select/close, page load/restore, theme selection/load | Not undoable unless committed authored state changes | Selection and preview actions either choose active UI context or update transient UI/preview state. Commit actions can become undoable; preview deltas and open/close events should not record entries. |
| Renderer summaries | Menu disabled state, next undo/redo labels, ordered recent-action list, `UndoMenuSnapshot`/availability state | Not state-changing / read-only summary | Renderer summaries must derive from owned undo state. They must not mutate history, own stack position, or expose inactive-context entries. |
| Failed or pending work | Validation failures, cancellation, repeated pending actions, persistence failures, missing files, failed undo/redo/go-to | Not undoable unless confirmed reversible state changed | The recording boundary must prove completion before writing an entry. Transition failure must preserve visible state and targeted entries; persistence failure must not present the action as safely undoable without equivalent active-session guarantees. |
| Directive and enforcement touch points | `AGENTS.md`, `test/architecture/layer-boundaries.test.ts`, `test/architecture/component-workflow-compliance.test.ts`, `test/architecture/undo-controller-coverage.test.ts`, `test/architecture/undo-controller-exclusions.ts`, `test/architecture/architecture.test.ts` | Enforcement required before final validation | Universal coverage enforced: every `src/app/**` controller records via `Record*UndoOperation` or appears in `undo-controller-exclusions.ts`. Architecture tests also enforce undo apply-state/lifecycle operation exceptions, layer independence, read-only summaries, action-generated diffs, and no placeholder actions. |

## Notes

- `[P]` tasks mean different files and no blocking dependency.
- Every task names exact files or bounded existing directories.
- Existing undo files are migration evidence, not automatically compliant behavior.
- Final validation is incomplete until tasks T065-T072 are done and synchronized.
- Final validation completed with `npm run lint`, the focused quickstart Vitest
  command covering undo core, undo operations, gateway persistence, app shell
  menu history, catalog, template, theme, session/startup, and architecture
  enforcement, and full `npm test` regression.
- Representative workflow coverage includes app shell undo/redo/history list,
  catalog token-key edits, template variable and group additions, theme variable
  edits, and theme palette color assignments. Failure-path coverage rejects
  missing/blank catalog token edits, duplicate/blank template edits, and palette
  commits without selected color refs.
- A strict source scan for `UndoActionNoop`, `NOOP`,
  `whole-application undo`, `cross-session history restoration`,
  `renderer-owned history`, `placeholder undo`, and `workflow bypass` returned
  no matches in `src/domain`, `src/app`, `src/gateway`, or `src/model`.
