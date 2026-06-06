# Tasks: Theme Studio Baseline

**Input**: Design documents from `/specs/001-theme-studio-baseline/`

**Prerequisites**: plan.md (required), spec.md (required for user stories),
research.md, data-model.md, contracts/

**Tests**: Include the tests and enforcement updates required by the
constitution. If code changes touch an existing architecture rule, dependency
boundary, naming convention, documented exception, DI seam, use-case boundary,
or model/validation contract, the corresponding tests or enforcement artifacts
are mandatory.

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
- Architecture or convention enforcement: `test/**` and the project's directive
  artifacts

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and rule-aware scaffolding

- [ ] T001 Confirm the baseline documentation set is current across `specs/001-theme-studio-baseline/spec.md`, `specs/001-theme-studio-baseline/plan.md`, and `specs/001-theme-studio-baseline/tasks.md`
- [ ] T002 Record the planned validation surface for the baseline in `specs/001-theme-studio-baseline/quickstart.md` and `specs/001-theme-studio-baseline/contracts/persisted-artifacts.md`
- [ ] T003 [P] Inventory the existing behavior and file ownership boundaries to be covered by tests in `src/model/schema/`, `src/domain/operations/`, `src/gateway/`, and `src/app/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can
be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Establish shared baseline fixture coverage for persisted artifacts in `src/model/schema/catalog.ts`, `src/model/schema/template-schemas.ts`, `src/model/schema/theme-schemas.ts`, and `src/model/schema/primitives.ts`
- [ ] T005 [P] Establish shared policy validation coverage for versioning, locking, and naming behavior in `src/domain/catalog/validations/`, `src/domain/validations/template-validations/`, and `src/domain/validations/theme-validations/`
- [ ] T006 [P] Establish shared renderer workflow harnesses for queue-driven interactions in `src/app/core/action-queue/`, `src/app/core/background-queue/`, and `src/main.tsx`
- [ ] T007 [P] Establish shared adapter seam coverage for file, fetch, preview, screenshot, and window integrations in `src/gateway/services/`, `src/gateway/catalog/`, `src/gateway/template/`, `src/gateway/theme/`, and `electron/ipc-handlers.ts`
- [ ] T008 Add or update architecture and convention enforcement for baseline boundaries in `AGENTS.md`, `.specify/memory/constitution.md`, and any existing `test/**` architecture coverage
- [ ] T009 Remove or document any duplicate baseline test helpers or unclear fixture naming introduced during setup in `src/test-setup.ts` and the new baseline test files

**Checkpoint**: Foundation ready; user stories can now be implemented without
breaking the constitution

---

## Phase 3: User Story 1 - Maintain Token Catalogs (Priority: P1) 🎯 MVP

**Goal**: Deliver a fully validated catalog workflow covering manual catalogs,
remote catalogs, version history, locking, and token maintenance.

**Independent Test**: Create a catalog, edit or bulk-add tokens, manage remote
sources, sync when applicable, and verify version persistence after reload.

### Tests for User Story 1

- [ ] T010 [P] [US1] Add catalog schema and gateway persistence tests for `src/model/schema/catalog.ts` and `src/gateway/catalog/catalog-gateway.ts`
- [ ] T011 [P] [US1] Add catalog policy tests for create, delete, revert, lock, bulk-add, and sync behavior in `src/domain/catalog/operations/`, `src/domain/operations/catalog-operations/`, and `src/domain/catalog/validations/`
- [ ] T012 [P] [US1] Add renderer workflow tests for catalog dialogs, details, and token editing in `src/app/catalog/catalog-page/CatalogsPage.tsx`, `src/app/catalog/catalog-details-card/CatalogDetailsCard.tsx`, `src/app/catalog/create-dialog/CreateCatalogDialog.tsx`, and `src/app/catalog/tokens-card/TokensCard.tsx`

### Implementation for User Story 1

- [ ] T013 [P] [US1] Complete catalog creation and selection flow coverage across `src/app/catalog/catalogs-card/`, `src/app/catalog/create-dialog/`, and `src/domain/operations/create-dialog/`
- [ ] T014 [P] [US1] Complete manual token editing and semantic registry behavior in `src/app/catalog/tokens-card/` and `src/domain/operations/catalog-operations/tokens/`
- [ ] T015 [P] [US1] Complete remote source editing and synchronization behavior in `src/app/catalog/catalog-details-card/`, `src/domain/operations/catalog-operations/sources/`, and `src/gateway/catalog/token-sync-gateway.ts`
- [ ] T016 [US1] Connect end-to-end catalog queue, controller, validation, and persistence flow through `src/app/catalog/actions/`, `src/app/catalog/catalog-page/controllers/`, `src/domain/operations/catalog-operations/`, and `src/gateway/catalog/catalog-gateway.ts`
- [ ] T017 [US1] Refine catalog naming, cohesion, and lock/version edge-case handling in `src/domain/catalog/validations/`, `src/domain/utils/compare-versions.ts`, and `src/domain/utils/find-nearest-version-ref.ts`

**Checkpoint**: User Story 1 should be fully functional and independently
testable

---

## Phase 4: User Story 2 - Assemble Reusable Templates (Priority: P1)

**Goal**: Deliver a template workflow that combines catalog versions with
groups, variables, mappings, and semantic variants.

**Independent Test**: Create a template, include catalogs, manage variables and
groups, assign mappings, and verify the template reloads with the same state.

### Tests for User Story 2

- [ ] T018 [P] [US2] Add template schema and gateway persistence tests for `src/model/schema/template-schemas.ts` and `src/gateway/template/template-gateway.ts`
- [ ] T019 [P] [US2] Add template policy tests for create, delete, lock, catalog inclusion, group management, variable management, and mapping behavior in `src/domain/operations/template-operations/` and `src/domain/validations/template-validations/`
- [ ] T020 [P] [US2] Add renderer workflow tests for template creation, catalogs, groups, variables, and mappings in `src/app/template/template-page/TemplatesPage.tsx`, `src/app/template/template-catalogs-card/TemplateCatalogsCard.tsx`, `src/app/template/groups-card/GroupsCard.tsx`, `src/app/template/variables-card/VariablesCard.tsx`, and `src/app/template/mappings-card/MappingsCard.tsx`

### Implementation for User Story 2

- [ ] T021 [P] [US2] Complete template creation, selection, and details flow in `src/app/template/templates-card/`, `src/app/template/create-template-dialog/`, `src/app/template/template-details-card/`, and `src/domain/operations/template-operations/template-list/`
- [ ] T022 [P] [US2] Complete catalog inclusion, version update, and lock behavior in `src/app/template/template-catalogs-card/` and `src/domain/operations/template-operations/template-details/`
- [ ] T023 [P] [US2] Complete group, variable, and mapping mutation behavior in `src/app/template/groups-card/`, `src/app/template/variables-card/`, `src/app/template/mappings-card/`, and `src/domain/operations/template-operations/`
- [ ] T024 [US2] Connect end-to-end template queue, controller, validation, and persistence flow through `src/app/template/actions/`, `src/app/template/template-page/controllers/`, `src/domain/operations/template-operations/`, and `src/gateway/template/template-gateway.ts`
- [ ] T025 [US2] Refine semantic variant handling, orphan detection, and template cohesion in `src/model/parse-semantic-selector.ts`, `src/model/format-semantic-selector.ts`, `src/domain/utils/template-catalog-merge.ts`, and `src/domain/utils/is-mapping-orphan-for-template.ts`

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Create, Tune, and Export Themes (Priority: P1)

**Goal**: Deliver theme creation, versioning, assignment editing, palette
operations, and paired export generation.

**Independent Test**: Create a theme, bind it to a template, edit assignments,
increment version, generate outputs, and verify dark and light export files.

### Tests for User Story 3

- [ ] T026 [P] [US3] Add theme schema and gateway persistence tests for `src/model/schema/theme-schemas.ts`, `src/model/factories/theme-factory.ts`, and `src/gateway/theme/theme-gateway.ts`
- [ ] T027 [P] [US3] Add theme policy tests for create, save, version increment, assignment edits, and generation in `src/domain/operations/theme-operations/`, `src/domain/utils/theme-generator.ts`, and `src/gateway/theme/debounced-theme-persist-gateway.ts`
- [ ] T028 [P] [US3] Add renderer workflow tests for theme creation, details, palette editing, and variables editing in `src/app/theme/theme-page/ThemesPage.tsx`, `src/app/theme/create-theme-dialog/CreateThemeDialog.tsx`, `src/app/theme/theme-details-card/ThemeDetailsCard.tsx`, `src/app/theme/theme-palette-card/ThemePaletteCard.tsx`, and `src/app/theme/theme-variables-card/ThemeVariablesCard.tsx`

### Implementation for User Story 3

- [ ] T029 [P] [US3] Complete theme creation, selection, and version-management flow in `src/app/theme/themes-card/`, `src/app/theme/create-theme-dialog/`, `src/app/theme/theme-details-card/`, and `src/domain/operations/theme-operations/theme-list/`
- [ ] T030 [P] [US3] Complete color and contrast assignment mutation behavior in `src/app/theme/theme-variables-card/`, `src/domain/operations/theme-operations/theme-details/`, and `src/domain/operations/theme-operations/variables/`
- [ ] T031 [P] [US3] Complete palette-wide editing, eyedropper assignment, and export generation behavior in `src/app/theme/theme-palette-card/`, `src/domain/operations/theme-operations/palette-*`, `src/domain/operations/eyedropper-operations/`, `src/domain/utils/theme-generator.ts`, and `src/gateway/services/screenshot-service.ts`
- [ ] T032 [US3] Connect end-to-end theme queue, controller, validation, autosave, and generation flow through `src/app/theme/actions/`, `src/app/theme/theme-page/controllers/`, `src/domain/operations/theme-operations/`, `src/gateway/theme/`, and `src/gateway/services/file-system-service.ts`
- [ ] T033 [US3] Refine export naming, assignment fallback behavior, and theme cohesion in `src/domain/utils/stringify-theme.ts`, `src/domain/utils/to-safe-theme-file-name.ts`, and `src/domain/utils/assert-valid-theme-file-name.ts`

**Checkpoint**: User Stories 1, 2, and 3 should now be independently functional

---

## Phase 6: User Story 4 - Validate Themes with Interactive Previews (Priority: P2)

**Goal**: Deliver synchronized dark/light previews, preview-role token
selection, and token-level resolution inspection.

**Independent Test**: Load a theme with a template, change preview-role token
references, browse sample files, and confirm both panes update consistently.

### Tests for User Story 4

- [ ] T034 [P] [US4] Add preview gateway and tokenization tests for `src/gateway/preview/preview-gateway.ts` and `src/gateway/services/textmate-tokenizer-service.ts`
- [ ] T035 [P] [US4] Add preview policy tests for token resolution and contrast-aware display behavior in `src/domain/utils/scope-resolver.ts`, `src/domain/utils/compute-display-color-assignments.ts`, and `src/domain/utils/color-wcag.ts`
- [ ] T036 [P] [US4] Add renderer workflow tests for preview token selection and synchronized panes in `src/app/theme/editor-previews-card/EditorPreviewsCard.tsx` and `src/app/theme/editor-previews-card/use-editor-previews-card-viewmodel.ts`

### Implementation for User Story 4

- [ ] T037 [P] [US4] Complete preview sample loading and tokenization flow in `src/domain/operations/theme-operations/previews/load-previews-operation.ts`, `src/gateway/preview/preview-gateway.ts`, and `previews/`
- [ ] T038 [P] [US4] Complete preview-role token selection behavior in `src/app/theme/editor-previews-card/`, `src/domain/operations/theme-operations/pickers/`, and `src/model/theme-pane-state.ts`
- [ ] T039 [P] [US4] Complete synchronized dark/light rendering and hover-inspection behavior in `src/app/theme/editor-previews-card/EditorPreviewsCard.tsx` and `src/domain/utils/scope-resolver.ts`
- [ ] T040 [US4] Connect end-to-end preview queue, controller, resolution, and renderer flow through `src/app/theme/theme-page/controllers/`, `src/domain/operations/theme-operations/previews/`, and `src/gateway/preview/preview-gateway.ts`
- [ ] T041 [US4] Refine preview performance, virtualization, and fallback behavior in `src/app/theme/editor-previews-card/EditorPreviewsCard.tsx` and `src/model/preview-types.ts`

**Checkpoint**: User Story 4 should be fully functional and independently
testable against an existing theme/template pair

---

## Phase 7: User Story 5 - Continue Work Safely in a Desktop Editing Session (Priority: P3)

**Goal**: Deliver reliable autosave, undo/history navigation, persisted color
scheme, and desktop shell controls across the session.

**Independent Test**: Make edits, use undo and redo, reload or restart the app,
and confirm state continuity plus shell controls remain functional.

### Tests for User Story 5

- [ ] T042 [P] [US5] Add app-config and undo-state tests for `src/gateway/config/config-gateway.ts`, `src/domain/operations/app-operations/load-app-config-operation.ts`, and `src/domain/operations/undo-operations/`
- [ ] T043 [P] [US5] Add shell integration and window-service tests for `src/app/app/menu-bar/MenuBar.tsx`, `src/app/app/window/controllers/`, `src/gateway/services/window-service.ts`, `electron/preload.ts`, and `electron/ipc-handlers.ts`
- [ ] T044 [P] [US5] Add renderer workflow tests for menu actions, color-scheme toggling, and history navigation in `src/app/app/menu-bar/`, `src/app/app/app-shell/`, and `src/app/core/undo/`

### Implementation for User Story 5

- [ ] T045 [P] [US5] Complete app-config load/save and color-scheme behavior in `src/app/app/app-shell/ColorSchemeProvider.tsx`, `src/domain/operations/app-operations/load-app-config-operation.ts`, `src/domain/operations/app-operations/save-app-config-operation.ts`, and `src/gateway/config/config-gateway.ts`
- [ ] T046 [P] [US5] Complete undo, redo, and history menu behavior in `src/app/app/menu-bar/`, `src/domain/core/undo-manager-v2.ts`, `src/domain/operations/undo-operations/`, and `src/domain/state/undo-stack/`
- [ ] T047 [P] [US5] Complete desktop shell controls for reload, dev tools, and window state in `src/app/app/window/controllers/`, `src/gateway/services/window-service.ts`, `electron/ipc-handlers.ts`, and `electron/preload.ts`
- [ ] T048 [US5] Connect end-to-end app bootstrap, autosave continuity, and session recovery flow through `src/app/core/bootstrap/bootstrap-app-controller.ts`, `src/domain/operations/app-operations/`, `src/gateway/theme/debounced-theme-persist-gateway.ts`, and `data/config.json`
- [ ] T049 [US5] Refine history labels, shell control naming, and session-edge handling in `src/app/app/menu-bar/use-menubar-viewmodel.ts`, `src/domain/operations/window-operations/`, and `src/model/window-state-event.ts`

**Checkpoint**: User Story 5 should be independently testable on top of the
foundational application behavior

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T050 [P] Update baseline documentation and validation guidance in `specs/001-theme-studio-baseline/quickstart.md`, `specs/001-theme-studio-baseline/contracts/persisted-artifacts.md`, and `specs/001-theme-studio-baseline/contracts/generated-theme-exports.md`
- [ ] T051 Run lint, relevant Vitest suites, and architecture/convention tests from `package.json` against the touched catalog, template, theme, preview, and shell surfaces
- [ ] T052 If architecture rules or directives changed, synchronize `AGENTS.md`, `.specify/memory/constitution.md`, and any touched `test/**` enforcement artifacts in the same change set
- [ ] T053 Remove temporary scaffolding and confirm no layer-boundary, dependency-direction, or clean-code regressions across `src/app/`, `src/domain/`, `src/gateway/`, `src/model/`, and `electron/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational; delivers the MVP catalog workflow on its own
- **User Story 2 (P1)**: Starts after User Story 1 because template composition depends on stable catalog behavior
- **User Story 3 (P1)**: Starts after User Story 2 because theme authoring depends on template structure
- **User Story 4 (P2)**: Starts after User Story 3 because preview validation depends on working theme assignments
- **User Story 5 (P3)**: Starts after Foundational and can overlap later phases, but final validation should run after core authoring flows are stable

### Within Each User Story

- Add or update policy tests before finalizing implementation where practical
- Preserve queue-driven action flow into controllers and policy units
- Keep state writes and business logic inside policy-owned units
- Keep typed model and boundary translation responsibilities intact
- Improve names, remove duplication, and reduce complexity in touched code
- Finish enforcement and directive sync before marking the story complete

### Parallel Opportunities

- **US1**: T010, T011, and T012 can run in parallel; T013, T014, and T015 can run in parallel once catalog fixtures are stable
- **US2**: T018, T019, and T020 can run in parallel; T021, T022, and T023 can run in parallel once template fixture data is agreed
- **US3**: T026, T027, and T028 can run in parallel; T029, T030, and T031 can run in parallel once theme/template fixture data is stable
- **US4**: T034, T035, and T036 can run in parallel; T037, T038, and T039 can run in parallel after preview sample contracts are fixed
- **US5**: T042, T043, and T044 can run in parallel; T045, T046, and T047 can run in parallel before T048 ties bootstrap and recovery together

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup
2. Complete Foundational work
3. Complete User Story 1
4. Validate lint, relevant tests, and architecture/convention enforcement
5. Stop and review before expanding scope

### Incremental Delivery

1. Establish layer-correct foundations
2. Add User Story 1 and validate independently
3. Add User Story 2 and validate independently
4. Add User Story 3 and validate independently
5. Add User Story 4 and validate independently
6. Add User Story 5 and validate independently
7. Keep every increment constitution-compliant and cleaner than before

## Notes

- `[P]` tasks mean different files and no blocking dependency
- Every task names the exact file path or file group it changes
- The task list keeps architecture impact explicit instead of hiding it behind vague wording
- Rule, directive, and enforcement synchronization is called out directly in the setup, foundational, and polish phases
