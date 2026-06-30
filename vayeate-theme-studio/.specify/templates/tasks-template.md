---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

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

- [ ] T001 Create or extend feature folders inside the existing layered app
      structure with visible use-case or business-capability ownership
- [ ] T002 Verify the plan's constitution check and record any approved
      architecture exception or temporary outer-layer compromise
- [ ] T003 [P] Identify required directive, test, refactor, or enforcement
      updates for the touched rule surface

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can
be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Establish or update typed request, response, state, or parsing
      boundaries in `src/model/**`
- [ ] T005 [P] Establish or update focused policy units, invariants,
      validations, and mutation seams in `src/domain/**`
- [ ] T006 [P] Establish or update app-layer action, handler, controller, and
      viewmodel seams in `src/app/**`
- [ ] T007 [P] Establish or update gateway/service or Electron integration seams
      in `src/gateway/**` or `electron/**`
- [ ] T008 Add or update required architecture/convention tests for the touched
      rule surface
- [ ] T009 Remove or reduce any known duplication, god object growth, boundary
      leak, or misleading naming introduced by the touched area

**Checkpoint**: Foundation ready; user stories can now be implemented without
breaking the constitution

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1

- [ ] T010 [P] [US1] Add or update policy-layer tests for the application action
      or invariant when practical
- [ ] T011 [P] [US1] Add or update adapter/integration tests covering the user
      journey and boundary translation
- [ ] T012 [P] [US1] Add or update architecture/convention coverage if this
      story changes a protected rule or exception

### Implementation for User Story 1

- [ ] T013 [P] [US1] Implement app-layer translation changes in `src/app/**`
- [ ] T014 [P] [US1] Implement domain or policy changes in `src/domain/**`
- [ ] T015 [P] [US1] Implement gateway/model/Electron changes in the required
      files
- [ ] T016 [US1] Connect the end-to-end queue -> controller -> validation ->
      operation or use-case flow
- [ ] T017 [US1] Refine naming, cohesion, and control flow in touched files so
      the story remains independently testable and layer-compliant

**Checkpoint**: User Story 1 should be fully functional and independently
testable

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2

- [ ] T018 [P] [US2] Add or update policy-layer tests for the application action
      or invariant when practical
- [ ] T019 [P] [US2] Add or update adapter/integration tests covering the user
      journey and boundary translation
- [ ] T020 [P] [US2] Add or update architecture/convention coverage if this
      story changes a protected rule or exception

### Implementation for User Story 2

- [ ] T021 [P] [US2] Implement app-layer translation changes in `src/app/**`
- [ ] T022 [P] [US2] Implement domain or policy changes in `src/domain/**`
- [ ] T023 [P] [US2] Implement gateway/model/Electron changes in the required
      files
- [ ] T024 [US2] Connect the end-to-end queue -> controller -> validation ->
      operation or use-case flow
- [ ] T025 [US2] Refine naming, cohesion, and control flow in touched files so
      the story remains independently testable and layer-compliant

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3

- [ ] T026 [P] [US3] Add or update policy-layer tests for the application action
      or invariant when practical
- [ ] T027 [P] [US3] Add or update adapter/integration tests covering the user
      journey and boundary translation
- [ ] T028 [P] [US3] Add or update architecture/convention coverage if this
      story changes a protected rule or exception

### Implementation for User Story 3

- [ ] T029 [P] [US3] Implement app-layer translation changes in `src/app/**`
- [ ] T030 [P] [US3] Implement domain or policy changes in `src/domain/**`
- [ ] T031 [P] [US3] Implement gateway/model/Electron changes in the required
      files
- [ ] T032 [US3] Connect the end-to-end queue -> controller -> validation ->
      operation or use-case flow
- [ ] T033 [US3] Refine naming, cohesion, and control flow in touched files so
      the story remains independently testable and layer-compliant

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Update docs and quickstart guidance
- [ ] TXXX Run lint, relevant Vitest suites, and architecture/convention tests
- [ ] TXXX If directives changed, update the matching directive artifacts and
      keep them synchronized with enforcement
- [ ] TXXX Remove temporary scaffolding and confirm no layer-boundary,
      dependency-direction, or clean-code regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational; should deliver MVP value on
  its own
- **User Story 2 (P2)**: Starts after Foundational; may integrate with US1 but
  must remain independently testable
- **User Story 3 (P3)**: Starts after Foundational; may integrate with earlier
  stories but must remain independently testable

### Within Each User Story

- Add or update policy tests before finalizing implementation where practical
- Preserve queue-driven action flow into controllers and policy units
- Keep state writes and business logic inside policy-owned units
- Keep typed model and boundary translation responsibilities intact
- Improve names, remove duplication, and reduce complexity in touched code
- Finish enforcement and directive sync before marking the story complete

### Parallel Opportunities

- Tasks marked `[P]` may run in parallel when they touch different files
- App, domain, and gateway/model implementation work can often proceed in
  parallel once the data flow is agreed
- Architecture/directive updates can run in parallel with implementation, but
  must land in the same change set

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
- Every task should name the exact file path it changes
- Avoid tasks that hide architecture impact behind vague wording
- If a rule changes, the task list must say which directive artifact and which
  test will be updated
