# Tasks: Constitution Compliance Remediation

**Input**: Design documents from `/specs/002-constitution-compliance-remediation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories),
research.md, data-model.md, contracts/

**Tests**: Include the tests and enforcement updates required by the
constitution. If code changes touch an existing architecture rule, dependency
boundary, naming convention, documented exception, DI seam, controller-use-case boundary,
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

- [X] T001 Review and pin the remediation scope in `specs/002-constitution-compliance-remediation/spec.md`, `specs/002-constitution-compliance-remediation/plan.md`, and `specs/002-constitution-compliance-remediation/contracts/use-case-boundaries.md`
- [X] T002 Identify the initial violation inventory and map each one to a target seam in `test/architecture/layer-boundaries.test.ts`, `src/domain/operations/action-queue/enqueue-action-queue-operation.ts`, `src/domain/operations/background-queue/enqueue-background-queue-action-operation.ts`, and `src/domain/operations/app-operations/initialize-window-callbacks-operation.ts`
- [X] T003 [P] Record the required enforcement and structure updates in `specs/002-constitution-compliance-remediation/contracts/enforcement-and-structure.md`, `specs/002-constitution-compliance-remediation/quickstart.md`, and `AGENTS.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user-story checkpoint or final validation may be claimed
until this phase is complete. Preparatory tests, seam adapters, and enforcement
updates may be completed early only when they do not depend on unfinished
focused controller use-case alignment.

- [X] T004 Create typed inner-owned queue and lifecycle boundary contracts in `src/domain/operations/action-queue/`, `src/domain/operations/background-queue/`, and `src/model/`
- [X] T005 [P] Introduce supporting plain workflow models and operation-port seams for focused controller use cases in `src/domain/operations/catalog-operations/`, `src/domain/operations/template-operations/`, `src/domain/operations/theme-operations/`, and `src/domain/operations/app-operations/`
- [X] T006 [P] Refactor outer-edge DI and bootstrap ownership in `src/main.tsx`, `src/app/app/app-shell/AppProvider.tsx`, `src/app/core/action-queue/action-processor.ts`, and `src/app/core/background-queue/background-queue.ts`
- [X] T007 [P] Establish adapter implementations for the new inner-owned seams in `src/app/core/action-queue/`, `src/app/core/background-queue/`, `src/gateway/services/window-service.ts`, and `electron/`
- [X] T008 Update architectural enforcement for the new steady state in `test/architecture/layer-boundaries.test.ts`
- [X] T009 Reduce baseline duplication and clarify module ownership in `src/app/core/`, `src/app/common/`, `src/domain/utils/`, and `src/app/**/actions/`

**Checkpoint**: Foundation ready; user stories can now be implemented without breaking the constitution

---

## Phase 3: User Story 1 - Deliver Constitution-Compliant Authoring Flows (Priority: P1) 🎯 MVP

**Goal**: Split catalog, template, and theme workflow ownership into focused controller use cases that orchestrate operation ports while preserving current authoring behavior.

**Independent Test**: Inspect one representative catalog flow, one template flow, and one theme flow and verify each enters through a named action, delegates through app translation, and completes in one focused controller use case without handler-, service-, gateway-, or component-owned business scripting.

### Tests for User Story 1

- [X] T010 [P] [US1] Add operation-port and domain-policy tests for focused authoring flows in `src/domain/catalog-create-dialog-operations.test.ts`, `src/domain/catalog-token-operations.test.ts`, `src/domain/template-utils.test.ts`, and `src/domain/baseline-policy.test.ts`
- [X] T011 [P] [US1] Update renderer workflow and routing coverage for authoring flows in `src/app/catalog/catalog-flow-routing.test.ts`, `src/app/template/template-flow-routing.test.ts`, and `src/app/theme/theme-renderer-workflows.test.tsx`
- [X] T012 [P] [US1] Extend architecture coverage for handler-, component-, service-, gateway-owned business workflow regressions and unfocused controller use cases in `test/architecture/layer-boundaries.test.ts`

### Implementation for User Story 1

- [X] T013 [P] [US1] Refactor catalog authoring controllers into focused controller use cases that orchestrate operation ports in `src/app/catalog/catalog-details-card/controllers/`, `src/app/catalog/tokens-card/controllers/`, `src/app/catalog/bulk-add-dialog/controllers/`, and `src/domain/operations/catalog-operations/`
- [X] T014 [P] [US1] Refactor template authoring controllers into focused controller use cases that orchestrate operation ports in `src/app/template/groups-card/controllers/`, `src/app/template/variables-card/controllers/`, `src/app/template/mappings-card/controllers/`, `src/app/template/template-catalogs-card/controllers/`, and `src/domain/operations/template-operations/`
- [X] T015 [P] [US1] Refactor theme authoring controllers into focused controller use cases that orchestrate operation ports in `src/app/theme/theme-details-card/controllers/`, `src/app/theme/theme-palette-card/controllers/`, `src/app/theme/theme-variables-card/controllers/`, and `src/domain/operations/theme-operations/`
- [X] T016 [US1] Rewire action-handler-to-controller-use-case flow for catalog, template, and theme entry points in `src/app/catalog/actions/catalog-handler.ts`, `src/app/template/actions/template-handler.ts`, `src/app/theme/actions/theme-handler.ts`, and the touched action-type modules under `src/app/**/actions/`
- [X] T017 [US1] Remove remaining handler-, component-, service-, or gateway-owned mutation ordering and naming drift from touched authoring flow files in `src/app/catalog/**`, `src/app/template/**`, and `src/app/theme/**`

**Checkpoint**: User Story 1 should be fully functional and independently testable

---

## Phase 4: User Story 2 - Keep External Details Replaceable (Priority: P1)

**Goal**: Replace queue, continuation, persistence, and lifecycle leaks with inward-owned seams and outer-boundary orchestration that keeps policy independent from renderer and shell infrastructure.

**Independent Test**: Review queue-backed and lifecycle-backed flows and verify domain code no longer imports app-layer queue classes, continuation helpers, queue enums, or window controllers while behavior remains intact.

### Tests for User Story 2

- [X] T018 [P] [US2] Add policy and seam tests for queue and lifecycle boundary contracts in `src/domain/session-and-preview-baseline.test.ts`, `src/app/core/queues/baseline-queues.test.ts`, and `src/main.test.tsx`
- [X] T019 [P] [US2] Add adapter and integration coverage for shell, queue, and outer-detail failure orchestration in `test/electron/ipc-handlers.test.ts`, `test/electron/preload.test.ts`, and any touched queue or failure-path tests under `src/app/core/`
- [X] T020 [P] [US2] Strengthen architecture coverage so domain-to-app queue and lifecycle imports fail in `test/architecture/layer-boundaries.test.ts`

### Implementation for User Story 2

- [X] T021 [P] [US2] Replace domain queue dependencies with inward-owned ports and models in `src/domain/operations/action-queue/enqueue-action-queue-operation.ts`, `src/domain/operations/background-queue/*.ts`, `src/domain/catalog/operations/*.ts`, and `src/domain/operations/**/load-*.ts`
- [X] T022 [P] [US2] Move lifecycle callback translation to the outer boundary in `src/domain/operations/app-operations/initialize-window-callbacks-operation.ts`, `src/app/app/window/controllers/*.ts`, `src/app/app/app-shell/controllers/handle-keyboard-shortcut-controller.ts`, and `src/gateway/services/window-service.ts`
- [X] T023 [P] [US2] Refactor persistence and preview continuation behavior behind replaceable seams in `src/domain/operations/theme-operations/theme-details/*.ts`, `src/domain/operations/template-operations/template-details/*.ts`, `src/domain/operations/catalog-operations/catalog-details/*.ts`, `src/gateway/theme/*.ts`, and `src/gateway/preview/preview-gateway.ts`
- [X] T024 [US2] Rewire outer-edge composition and DI ownership for queue and lifecycle seams in `src/main.tsx`, `src/app/app/app-shell/AppProvider.tsx`, `src/app/core/action-queue/*.ts`, and `src/app/core/background-queue/*.ts`
- [X] T025 [US2] Remove touched string-token indirection and document any remaining justified infrastructure seam in `src/main.tsx`, `src/app/core/background-queue/background-queue.ts`, `specs/002-constitution-compliance-remediation/contracts/use-case-boundaries.md`, and `specs/002-constitution-compliance-remediation/plan.md`

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Remove Structural Drift and Stale Escape Hatches (Priority: P2)

**Goal**: Consolidate duplicate action-contract paths, narrow generic escape-hatch modules, and align enforcement and documentation with the desired steady-state structure.

**Independent Test**: Inspect the touched repository structure and enforcement rules and verify that each affected feature has one authoritative action-contract path, generic buckets no longer hide business-specific ownership, and tests encode the compliant structure.

### Tests for User Story 3

- [X] T026 [P] [US3] Add or update convention coverage for duplicate action-contract paths and generic escape-hatch misuse in `test/architecture/layer-boundaries.test.ts` and any new architecture test files under `test/architecture/`
- [X] T027 [P] [US3] Update workflow-routing tests impacted by action-contract consolidation in `src/app/catalog/catalog-flow-routing.test.ts`, `src/app/template/template-flow-routing.test.ts`, and `src/app/theme/theme-renderer-workflows.test.tsx`
- [X] T028 [P] [US3] Update documentation validation paths in `specs/002-constitution-compliance-remediation/quickstart.md` and `specs/002-constitution-compliance-remediation/contracts/enforcement-and-structure.md`

### Implementation for User Story 3

- [X] T029 [P] [US3] Consolidate duplicate or stale action-contract modules in `src/app/app/components/app-shell/actions/app-shell-action-type.ts`, `src/app/theme/components/**/actions/*.ts`, and the canonical action modules under `src/app/app/`, `src/app/theme/`, `src/app/template/`, and `src/app/catalog/`
- [X] T030 [P] [US3] Relocate touched business-specific helpers out of generic buckets in `src/domain/utils/`, `src/app/core/`, and `src/app/common/` where ownership is currently obscured
- [X] T031 [P] [US3] Align naming and one-module-one-responsibility boundaries in `src/app/**/controllers/`, `src/domain/operations/**`, and `src/gateway/**`
- [X] T032 [US3] Update the managed architecture and delivery directives in `AGENTS.md`, `specs/002-constitution-compliance-remediation/contracts/*.md`, and any touched Spec Kit artifacts if rule wording or structure guidance changes
- [X] T033 [US3] Remove any remaining baseline exception logic and verify the final structure against enforcement in `test/architecture/layer-boundaries.test.ts` and the touched source paths from this story

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T034 [P] Update final remediation guidance and validation notes in `specs/002-constitution-compliance-remediation/quickstart.md`, `specs/002-constitution-compliance-remediation/research.md`, and `specs/002-constitution-compliance-remediation/plan.md`
- [X] T035 Run final lint, relevant Vitest suites, and architecture/convention tests via `package.json` scripts after all required implementation and test tasks are complete, then confirm the expected commands in `specs/002-constitution-compliance-remediation/quickstart.md`
- [X] T036 Confirm directive synchronization has no drift in `AGENTS.md`, `test/architecture/layer-boundaries.test.ts`, and `specs/002-constitution-compliance-remediation/contracts/*.md`
- [X] T037 Remove temporary scaffolding and confirm no layer-boundary, dependency-direction, or clean-code regressions remain across `src/app/`, `src/domain/`, `src/gateway/`, `src/model/`, and `electron/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories
- **User Stories (Phases 3-5)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational; delivers the MVP by shaping catalog, template, and theme workflow ownership into focused controller use cases
- **User Story 2 (P1)**: Starts after Foundational; can proceed in parallel with later US1 cleanup once the shared seam design is agreed, but remains independently testable
- **User Story 3 (P2)**: Starts after Foundational and after the canonical action and seam directions are stable from US1 and US2

### Within Each User Story

- Add or update tests before finalizing implementation where practical
- Preserve callback -> action -> handler -> controller-use-case flow
- Keep state writes and business logic inside operation ports and domain policy, with focused controller use cases orchestrating those ports rather than handlers, components, services, or gateways
- Keep typed model and boundary translation responsibilities intact
- Improve names, remove duplication, and reduce complexity in touched code
- Finish enforcement and directive sync before marking the story complete

### Parallel Opportunities

- **Setup**: `T003` can run while `T001-T002` are being finalized
- **Foundational**: `T005-T007` can run in parallel after `T004`; `T008-T009` can overlap once the seam direction is fixed
- **US1**: `T010-T012` can run in parallel; `T013-T015` can run in parallel by capability area before `T016-T017`
- **US2**: `T018-T020` can run in parallel; `T021-T023` can run in parallel by seam type before `T024-T025`
- **US3**: `T026-T028` can run in parallel; `T029-T031` can run in parallel by structure area before `T032-T033`

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
5. Keep every increment constitution-compliant and cleaner than before

## Notes

- `[P]` tasks mean different files and no blocking dependency
- Every task names the exact file path or path group it changes
- Tests are mandatory here because the constitution and plan require enforcement updates for touched rules
- If a rule changes, the task list explicitly includes the directive artifacts and tests that must be updated
