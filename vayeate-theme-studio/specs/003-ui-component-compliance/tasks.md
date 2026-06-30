# Tasks: UI Component Compliance Remediation

**Input**: Design documents from `/specs/003-ui-component-compliance/`

**Prerequisites**: plan.md (required), spec.md (required for user stories),
research.md, data-model.md, contracts/, quickstart.md

**Tests**: Required by the feature specification and constitution. Add focused
workflow tests, policy tests where behavior moves inward, architecture or
convention tests for protected rules, and evidence records for every inventory
classification.

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

**Purpose**: Establish the compliance evidence workspace and canonical-pattern baseline.

- [X] T001 Create the evidence inventory document in `specs/003-ui-component-compliance/component-inventory.md` with rows for every unchecked `Todo.md` component item and directly related inconsistent workflow.
- [X] T002 Create the canonical pattern decision log in `specs/003-ui-component-compliance/canonical-patterns.md` using constitution, `specs/002-constitution-compliance-remediation/`, recent git history, and current compliant implementations as evidence sources.
- [X] T003 [P] Review recent pattern-setting commits with `git log` and record newer action/viewmodel/controller/state patterns in `specs/003-ui-component-compliance/canonical-patterns.md`.
- [X] T004 [P] Record the initial validation command set and expected evidence artifacts in `specs/003-ui-component-compliance/quickstart.md`.
- [X] T005 Verify the active directive pointer and completion guard in `AGENTS.md`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create enforcement and shared review structure that MUST be complete before user story implementation.

**CRITICAL**: No user-story checkpoint may be claimed until this phase is complete.

- [X] T006 Create architecture coverage for component workflow inventory and canonical-pattern evidence in `test/architecture/component-workflow-compliance.test.ts`.
- [X] T007 [P] Extend protected rule coverage for component-owned business logic, handler policy branching, controller granularity, and duplicate action contracts in `test/architecture/layer-boundaries.test.ts`.
- [X] T008 [P] Add or update common component workflow coverage for tooltip and overlay patterns in `src/app/common/styled-tooltip/styled-tooltip-flow-routing.test.ts` and `src/app/common/eyedropper-overlay/eyedropper-overlay-flow-routing.test.ts`.
- [X] T009 [P] Add or update shell workflow coverage for app shell, menu bar, ribbon, and status bar patterns in `src/app/app/app-shell/app-shell-renderer-workflows.test.tsx`, `src/app/app/menu-bar/menu-bar-renderer-workflows.test.tsx`, `src/app/app/ribbon/ribbon-renderer-workflows.test.tsx`, and `src/app/app/status-bar/status-bar-renderer-workflows.test.tsx`.
- [X] T010 [P] Add or update authoring workflow coverage for catalog, template, and theme component patterns in `src/app/catalog/catalog-flow-routing.test.ts`, `src/app/template/template-flow-routing.test.ts`, and `src/app/theme/theme-renderer-workflows.test.tsx`.
- [X] T011 [P] Define any missing typed action, viewmodel, workflow-status, or component UI state boundary models in `src/model/`.
- [X] T012 [P] Identify shared policy-operation or validation gaps exposed by component review in `src/domain/operations/`, `src/domain/ui/`, and `src/domain/state/`.
- [X] T013 Update `specs/003-ui-component-compliance/component-inventory.md` with the foundational evidence fields required by `specs/003-ui-component-compliance/data-model.md`.

**Checkpoint**: Foundation ready; user stories can now be implemented without breaking the constitution.

---

## Phase 3: User Story 1 - Verify Remaining Component Workflow Compliance (Priority: P1) MVP

**Goal**: Classify every unchecked `Todo.md` component item and every directly related inconsistent workflow as aligned, remediated, or deferred with evidence.

**Independent Test**: `specs/003-ui-component-compliance/component-inventory.md` contains a final classification, evidence source, and canonical-pattern decision for every unchecked common, app, catalog, template, and theme component item.

### Tests for User Story 1

- [X] T014 [P] [US1] Add inventory completeness assertions for all unchecked `Todo.md` entries in `test/architecture/component-workflow-compliance.test.ts`.
- [X] T015 [P] [US1] Add canonical-pattern evidence assertions for pattern conflicts in `test/architecture/component-workflow-compliance.test.ts`.
- [X] T016 [P] [US1] Add directive synchronization assertions for `AGENTS.md`, `specs/003-ui-component-compliance/plan.md`, and `specs/003-ui-component-compliance/contracts/inventory-and-enforcement.md` in `test/architecture/component-workflow-compliance.test.ts`.

### Implementation for User Story 1

- [X] T017 [US1] Classify common component inventory for `src/app/common/eyedropper-overlay/EyedropperOverlay.tsx`, `src/app/common/eyedropper-overlay/use-eyedropper-overlay-viewmodel.ts`, `src/app/common/eyedropper-overlay/actions/eyedropper-overlay-action-type.ts`, `src/app/common/eyedropper-overlay/actions/eyedropper-overlay-handler.ts`, `src/app/common/styled-tooltip/StyledTooltip.tsx`, `src/app/common/styled-tooltip/use-styled-tooltip-viewmodel.ts`, `src/app/common/styled-tooltip/actions/styled-tooltip-action-type.ts`, and `src/app/common/styled-tooltip/actions/styled-tooltip-handler.ts`.
- [X] T018 [US1] Classify shell component inventory for `src/app/app/app-shell/AppShell.tsx`, `src/app/app/app-shell/use-app-shell-viewmodel.ts`, `src/app/app/app-shell/actions/app-shell-action-type.ts`, `src/app/app/app-shell/actions/app-shell-handler.ts`, `src/app/app/menu-bar/MenuBar.tsx`, `src/app/app/menu-bar/use-menubar-viewmodel.ts`, `src/app/app/ribbon/Ribbon.tsx`, `src/app/app/ribbon/use-ribbon-viewmodel.ts`, `src/app/app/status-bar/StatusBar.tsx`, and `src/app/app/status-bar/use-status-bar-viewmodel.ts`.
- [X] T019 [US1] Classify catalog component inventory for `src/app/catalog/bulk-add-dialog/BulkAddDialog.tsx`, `src/app/catalog/catalog-details-card/CatalogDetailsCard.tsx`, `src/app/catalog/catalog-page/CatalogsPage.tsx`, `src/app/catalog/catalogs-card/CatalogsCard.tsx`, `src/app/catalog/create-dialog/CreateCatalogDialog.tsx`, `src/app/catalog/tokens-card/TokensCard.tsx`, and their matching `use-*-viewmodel.ts` and `actions/*-action-type.ts` files.
- [X] T020 [US1] Classify template component inventory for `src/app/template/create-template-dialog/CreateTemplateDialog.tsx`, `src/app/template/groups-card/GroupsCard.tsx`, `src/app/template/mappings-card/MappingsCard.tsx`, `src/app/template/template-catalogs-card/TemplateCatalogsCard.tsx`, `src/app/template/template-details-card/TemplateDetailsCard.tsx`, `src/app/template/template-page/TemplatesPage.tsx`, `src/app/template/templates-card/TemplatesCard.tsx`, and their matching `use-*-viewmodel.ts` and `actions/*-action-type.ts` files.
- [X] T021 [US1] Classify theme component inventory for `src/app/theme/create-theme-dialog/CreateThemeDialog.tsx`, `src/app/theme/editor-previews-card/EditorPreviewsCard.tsx`, `src/app/theme/theme-details-card/ThemeDetailsCard.tsx`, `src/app/theme/theme-page/ThemesPage.tsx`, `src/app/theme/theme-palette-card/ThemePaletteCard.tsx`, `src/app/theme/theme-variables-card/ThemeVariablesCard.tsx`, `src/app/theme/themes-card/ThemesCard.tsx`, and their matching `use-*-viewmodel.ts` and `actions/*-action-type.ts` files.
- [X] T022 [US1] Record directly related inconsistent app workflows discovered during classification in `specs/003-ui-component-compliance/component-inventory.md`.
- [X] T023 [US1] Record selected canonical patterns and superseded older patterns in `specs/003-ui-component-compliance/canonical-patterns.md`.
- [X] T024 [US1] Update `specs/003-ui-component-compliance/contracts/inventory-and-enforcement.md` when classification exposes a new enforcement trigger or documented exception.

**Checkpoint**: User Story 1 should be fully functional and independently testable.

---

## Phase 4: User Story 2 - Bring Component Interactions Into the Required Action Flow (Priority: P1)

**Goal**: Remediate non-trivial component interactions so they follow named viewmodel callback, validated action, handler route, focused controller use case, and policy-owned operation flow.

**Independent Test**: One common, one shell, one catalog, one template, and one theme workflow can be traced end to end through the required action flow with failure-path coverage for remediated categories.

### Tests for User Story 2

- [X] T025 [P] [US2] Add or update common action-flow and failure-path tests in `src/app/common/styled-tooltip/styled-tooltip-flow-routing.test.ts` and `src/app/common/eyedropper-overlay/eyedropper-overlay-flow-routing.test.ts`.
- [X] T026 [P] [US2] Add or update shell action-flow and failure-path tests in `src/app/app/app-shell/app-shell-renderer-workflows.test.tsx`, `src/app/app/menu-bar/menu-bar-renderer-workflows.test.tsx`, `src/app/app/ribbon/ribbon-renderer-workflows.test.tsx`, and `src/app/app/status-bar/status-bar-renderer-workflows.test.tsx`.
- [X] T027 [P] [US2] Add or update catalog action-flow and failure-path tests in `src/app/catalog/catalog-flow-routing.test.ts` and `src/app/catalog/catalog-renderer-workflows.test.tsx`.
- [X] T028 [P] [US2] Add or update template action-flow and failure-path tests in `src/app/template/template-flow-routing.test.ts` and `src/app/template/template-renderer-workflows.test.tsx`.
- [X] T029 [P] [US2] Add or update theme action-flow and failure-path tests in `src/app/theme/theme-renderer-workflows.test.tsx`.
- [X] T030 [P] [US2] Add or update policy-operation tests for remediated mutation or invariant behavior in `src/domain/`.
- [X] T031 [P] [US2] Extend architecture checks for handler single-controller delegation and component callback ownership in `test/architecture/layer-boundaries.test.ts` and `test/architecture/component-workflow-compliance.test.ts`.

### Implementation for User Story 2

- [X] T032 [P] [US2] Remediate common action contracts, handlers, viewmodels, components, and controllers in `src/app/common/eyedropper-overlay/actions/eyedropper-overlay-action-type.ts`, `src/app/common/eyedropper-overlay/actions/eyedropper-overlay-handler.ts`, `src/app/common/eyedropper-overlay/use-eyedropper-overlay-viewmodel.ts`, `src/app/common/eyedropper-overlay/EyedropperOverlay.tsx`, `src/app/common/styled-tooltip/actions/styled-tooltip-action-type.ts`, `src/app/common/styled-tooltip/actions/styled-tooltip-handler.ts`, `src/app/common/styled-tooltip/use-styled-tooltip-viewmodel.ts`, and `src/app/common/styled-tooltip/StyledTooltip.tsx`.
- [X] T033 [P] [US2] Remediate app shell action contracts, handlers, viewmodels, components, and controllers in `src/app/app/app-shell/actions/app-shell-action-type.ts`, `src/app/app/app-shell/actions/app-shell-handler.ts`, `src/app/app/app-shell/use-app-shell-viewmodel.ts`, `src/app/app/app-shell/AppShell.tsx`, `src/app/app/menu-bar/actions/app-menu-action-type.ts`, `src/app/app/menu-bar/actions/app-menu-handler.ts`, `src/app/app/menu-bar/use-menubar-viewmodel.ts`, `src/app/app/menu-bar/MenuBar.tsx`, `src/app/app/ribbon/actions/app-ribbon-action-type.ts`, `src/app/app/ribbon/actions/app-ribbon-handler.ts`, `src/app/app/ribbon/use-ribbon-viewmodel.ts`, `src/app/app/ribbon/Ribbon.tsx`, `src/app/app/status-bar/use-status-bar-viewmodel.ts`, and `src/app/app/status-bar/StatusBar.tsx`.
- [X] T034 [P] [US2] Remediate catalog action contracts, handlers, viewmodels, components, and controllers in `src/app/catalog/actions/catalog-action-type.ts`, `src/app/catalog/actions/catalog-handler.ts`, `src/app/catalog/bulk-add-dialog/`, `src/app/catalog/catalog-details-card/`, `src/app/catalog/catalog-page/`, `src/app/catalog/catalogs-card/`, `src/app/catalog/create-dialog/`, and `src/app/catalog/tokens-card/`.
- [X] T035 [P] [US2] Remediate template action contracts, handlers, viewmodels, components, and controllers in `src/app/template/actions/template-action-type.ts`, `src/app/template/actions/template-handler.ts`, `src/app/template/create-template-dialog/`, `src/app/template/groups-card/`, `src/app/template/mappings-card/`, `src/app/template/template-catalogs-card/`, `src/app/template/template-details-card/`, `src/app/template/template-page/`, `src/app/template/templates-card/`, and `src/app/template/variables-card/`.
- [X] T036 [P] [US2] Remediate theme action contracts, handlers, viewmodels, components, and controllers in `src/app/theme/actions/theme-action-type.ts`, `src/app/theme/actions/theme-handler.ts`, `src/app/theme/create-theme-dialog/`, `src/app/theme/editor-previews-card/`, `src/app/theme/theme-details-card/`, `src/app/theme/theme-page/`, `src/app/theme/theme-palette-card/`, `src/app/theme/theme-variables-card/`, and `src/app/theme/themes-card/`.
- [X] T037 [P] [US2] Move any discovered component-, handler-, or gateway-owned business rules into policy-owned operations or validations in `src/domain/operations/`, `src/domain/ui/`, and `src/domain/state/`.
- [X] T038 [P] [US2] Add or update typed boundary models for remediated action payloads, workflow status, or component UI state in `src/model/`.
- [X] T039 [P] [US2] Keep replaceable external details behind existing or new seams in `src/gateway/` and `electron/` when remediated component workflows touch files, windows, pointers, previews, queues, or IPC.
- [X] T040 [US2] Update `specs/003-ui-component-compliance/component-inventory.md` and `specs/003-ui-component-compliance/canonical-patterns.md` with remediation evidence for every workflow changed in US2.

**Checkpoint**: User Stories 1 and 2 should both work independently.

---

## Phase 5: User Story 3 - Standardize App Workflows While Reducing Component Complexity (Priority: P2)

**Goal**: Make touched app workflows consistent with newer canonical patterns while reducing complex conditions, unnecessary nested viewmodel data, duplicated logic, unclear names, and inconsistent state ownership.

**Independent Test**: The remediated common, shell, catalog, template, and theme workflows preserve intended product capability while using one consistent interaction model and explicit state ownership.

### Tests for User Story 3

- [X] T041 [P] [US3] Add or update convention coverage for PascalCase component filenames, kebab-case non-component modules, one primary component export, and canonical action-contract ownership in `test/architecture/component-workflow-compliance.test.ts`.
- [X] T042 [P] [US3] Add or update workflow tests for repeated action, cancellation or close behavior, stale input, and external-detail failure in `src/app/common/`, `src/app/app/`, `src/app/catalog/`, `src/app/template/`, and `src/app/theme/`.
- [X] T043 [P] [US3] Add or update policy and state tests for coordinated component UI state ownership in `src/domain/ui/`, `src/domain/state/`, and `src/model/`.

### Implementation for User Story 3

- [X] T044 [P] [US3] Standardize local-only versus coordinated component UI state ownership in `src/app/common/eyedropper-overlay/`, `src/app/common/styled-tooltip/`, `src/app/app/app-shell/`, `src/app/app/menu-bar/`, `src/app/app/ribbon/`, and `src/app/app/status-bar/`.
- [X] T045 [P] [US3] Standardize catalog component UI state, callback names, event forwarding, and viewmodel result shapes in `src/app/catalog/bulk-add-dialog/`, `src/app/catalog/catalog-details-card/`, `src/app/catalog/catalog-page/`, `src/app/catalog/catalogs-card/`, `src/app/catalog/create-dialog/`, and `src/app/catalog/tokens-card/`.
- [X] T046 [P] [US3] Standardize template component UI state, callback names, event forwarding, and viewmodel result shapes in `src/app/template/create-template-dialog/`, `src/app/template/groups-card/`, `src/app/template/mappings-card/`, `src/app/template/template-catalogs-card/`, `src/app/template/template-details-card/`, `src/app/template/template-page/`, `src/app/template/templates-card/`, and `src/app/template/variables-card/`.
- [X] T047 [P] [US3] Standardize theme component UI state, callback names, event forwarding, and viewmodel result shapes in `src/app/theme/create-theme-dialog/`, `src/app/theme/editor-previews-card/`, `src/app/theme/theme-details-card/`, `src/app/theme/theme-page/`, `src/app/theme/theme-palette-card/`, `src/app/theme/theme-variables-card/`, and `src/app/theme/themes-card/`.
- [X] T048 [P] [US3] Remove complex conditions, unnecessary nested objects, misleading names, and duplicated workflow helpers from touched `src/app/**` component and viewmodel files.
- [X] T049 [P] [US3] Update shared policy/state/model ownership for any coordinated UI state introduced during standardization in `src/domain/ui/`, `src/domain/state/`, and `src/model/`.
- [X] T050 [US3] Update `specs/003-ui-component-compliance/component-inventory.md`, `specs/003-ui-component-compliance/canonical-patterns.md`, and `specs/003-ui-component-compliance/contracts/component-workflow-boundaries.md` with final standardization evidence.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [X] T051 [P] Update final validation guidance in `specs/003-ui-component-compliance/quickstart.md`, `specs/003-ui-component-compliance/plan.md`, and `specs/003-ui-component-compliance/contracts/inventory-and-enforcement.md`.
- [X] T052 [P] Synchronize directive wording in `AGENTS.md` with final component workflow rules and enforcement expectations.
- [X] T053 [P] Remove obsolete deferred markers, temporary scaffolding, stale action contracts, and duplicate workflow helpers from touched `src/app/**`, `src/domain/**`, `src/model/**`, `src/gateway/**`, and `electron/**` files.
- [X] T054 Run focused validation commands from `specs/003-ui-component-compliance/quickstart.md`, including common, shell, catalog, template, theme, and architecture workflow tests.
- [X] T055 Run final validation with `npm run lint` and `npm test`, then record the results in `specs/003-ui-component-compliance/component-inventory.md`.
- [X] T056 Confirm every unchecked `Todo.md` component item and directly related inconsistent workflow has final evidence-backed classification in `specs/003-ui-component-compliance/component-inventory.md`.
- [X] T057 Confirm directive synchronization, enforcement updates, canonical-pattern decisions, and failure-path validation have no known drift in `AGENTS.md`, `test/architecture/component-workflow-compliance.test.ts`, `test/architecture/layer-boundaries.test.ts`, and `specs/003-ui-component-compliance/contracts/*.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories.
- **User Stories (Phases 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational; delivers MVP value by producing a complete evidence-backed inventory and canonical-pattern baseline.
- **User Story 2 (P1)**: Starts after Foundational and uses US1 evidence when available; remediates confirmed flow violations and remains independently testable by representative end-to-end workflow traces.
- **User Story 3 (P2)**: Starts after Foundational and after canonical patterns are stable enough from US1/US2; standardizes complexity and state ownership across touched workflows.

### Within Each User Story

- Add or update tests before finalizing implementation where practical.
- Use `Todo.md` as the minimum authoritative inventory and include directly related inconsistent workflows.
- Prefer current constitution, completed `002` remediation, newer git-history evidence, and current compliant implementations over older behavior that merely works.
- Keep component events routed through named viewmodel callbacks and validated actions.
- Keep handlers translation-focused with one focused controller use-case call per action case.
- Keep state writes and business rules inside policy-owned operations, validations, or state units.
- Keep typed model and boundary translation responsibilities intact.
- Finish enforcement and directive synchronization before marking the story complete.

### Parallel Opportunities

- **Setup**: `T003-T004` can run in parallel after `T001-T002` start.
- **Foundational**: `T008-T012` can run in parallel after `T006-T007` define the enforcement direction.
- **US1**: `T017-T021` can run in parallel by app area after inventory fields are established.
- **US2**: `T032-T039` can run in parallel by app area and layer after tests `T025-T031` are drafted.
- **US3**: `T044-T049` can run in parallel by app area once canonical state ownership is agreed.
- **Polish**: `T051-T053` can run in parallel before final serial validation `T054-T057`.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup.
2. Complete Foundational enforcement and evidence structure.
3. Complete User Story 1 classification and canonical-pattern evidence.
4. Validate inventory completeness and directive synchronization.
5. Stop and review before remediation tasks change application behavior.

### Incremental Delivery

1. Establish evidence and enforcement foundations.
2. Classify inventory and canonical patterns through User Story 1.
3. Remediate required action-flow violations through User Story 2.
4. Standardize state ownership, naming, and complexity through User Story 3.
5. Run focused validation, full lint, full tests, and final drift checks.

## Notes

- `[P]` tasks mean different files or app areas and no dependency on incomplete task outputs.
- Every task names the file or path group it changes.
- Older behavior should not be preserved solely because it works.
- Any discovered exception must be documented, enforced, and synchronized before final validation.
- Final validation cannot be marked complete until every unchecked `Todo.md` component item and directly related inconsistency has evidence-backed classification.
