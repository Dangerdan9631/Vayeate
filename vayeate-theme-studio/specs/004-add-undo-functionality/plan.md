# Implementation Plan: Add Undo Functionality

**Branch**: `[004-add-undo-functionality]` | **Date**: 2026-06-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-add-undo-functionality/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See
`.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add trustworthy undo, redo, and ordered history navigation for completed
user-originated state-changing actions, with independent history stacks per
active tab and template/catalog/theme reference context. The implementation
approach is to align existing undo primitives with the current constitution:
keep history policy in domain/application operations, make history participation
explicit for state-changing workflows, record entries only after successful
reversible changes, persist stack information to disk as it changes, generate
action-owned before/after diffs instead of whole-state snapshots, prune undone
entries when a new entry is recorded, keep renderer summaries read-only, and
clear persisted undo state on startup so history remains per-session.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: React 19, Vite 6, Electron 41, tsyringe, zustand,
zod, Vitest, ESLint

**Storage**: Disk-backed session undo history plus renderer/domain state for
active summaries and loaded stack data. Undo stack information is persisted as
it changes, may be released from memory for performance, and is cleared on app
startup so prior-session history is never restored.

**Testing**: Vitest, Testing Library, linting, architecture/convention tests,
renderer workflow tests, gateway or adapter tests for stack persistence and
startup clearing, and policy-layer undo tests that run without real filesystem,
Electron, or service details where practical

**Target Platform**: Electron desktop application

**Project Type**: Layered desktop app with renderer-facing adapters,
policy/domain code, external-system adapters, and Electron main-process edges

**Performance Goals**: Preserve responsive renderer interactions, keep undo and
redo availability updates visible within the active user workflow, support at
least 20 consecutive undoable actions per context, support ordered history-list
selection without visible stalls, and avoid blocking action queues or main-window
lifecycle behavior

**Constraints**: Respect established layer boundaries, inward dependency
direction, use-case or policy ownership of mutation, typed boundary translation,
replaceable-detail seams, disk-backed per-session undo retention, startup
clearing, action-generated before/after diffs, active-context identity based on
existing `*Ref` types, read-only renderer summaries, and clean-code quality
expectations

**Scale/Scope**: Cross-cutting undo enablement across representative app shell,
catalog, template, and theme workflows, plus directly related common workflows
needed for whole-app consistency. Existing undo manager, stack, controller, menu,
gateway, and store code must be reviewed and either aligned or replaced where it
conflicts with per-session, disk-backed, context-scoped undo.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Work is placed in the correct layer: `electron/`, `src/app/`,
      `src/domain/`, `src/gateway/`, or `src/model/`
- [x] Source dependencies still point inward toward policy, with no volatile
      framework, transport, storage, or vendor detail leaking into core policy
- [x] The primary application action or use case is explicit, and adapters stay
      translation-focused rather than owning business policy
- [x] Controllers only orchestrate validations and operations; policy-owned
      units own state mutation, invariants, and business rules
- [x] Persisted or runtime-parsed data uses typed model definitions and
      boundary translation; stores remain read-only outside policy-owned
      mutation units
- [x] Any rule, exception, boundary, naming, or DI change includes matching
      updates to project directives and the relevant architecture/convention
      tests
- [x] The design reduces or at least does not add duplication, god objects,
      hidden side effects, confusing names, or generic escape-hatch modules

## Project Structure

### Documentation (this feature)

```text
specs/004-add-undo-functionality/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── undo-history-contract.md
│   └── undo-workflow-integration.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
electron/
├── main.ts
├── ipc-handlers.ts
├── preload.ts
└── ...

src/
├── app/
│   ├── app/
│   ├── catalog/
│   ├── common/
│   ├── core/
│   │   ├── undo/
│   │   └── ...
│   ├── template/
│   └── theme/
├── domain/
│   ├── core/
│   ├── operations/
│   │   └── undo-operations/
│   ├── state/
│   │   └── undo-stack/
│   └── ...
├── gateway/
│   ├── undo/
│   └── ...
├── model/
└── main.tsx

test/
├── architecture/
└── <renderer-or-domain-workflow-tests>
```

**Structure Decision**: Preserve the existing layered Electron app structure and
the current app/domain/model boundaries. Use existing undo-related folders as
evidence and migration targets, including the current undo gateway where it can
serve write-through session persistence, but do not preserve placeholder-only
action behavior, whole-state snapshots, or cross-session hydration.

## Phase 0 Research Summary

- Undo history remains per-session, but stack information is written to disk as
  it changes and prior-session persisted state is cleared on startup.
- Undo stacks are selected by a stable context key composed from active tab and
  existing template, catalog, and theme reference values.
- Undo entries are recorded only after a completed user-originated action
  changes visible state and can be reversed consistently.
- Undo entries store action-generated before/after diffs rather than whole
  application state snapshots.
- Undone entries remain redoable until a new undoable action is recorded in that
  context; recording a new action prunes the undone branch while preserving
  earlier undo history.
- Ordered history-list selection is in scope and moves the active context to the
  state immediately after the selected item by undoing or redoing intervening
  entries in order.
- Undo policy belongs in domain/application operations; components, handlers,
  gateways, and renderer summaries remain translators or read-only views.
- Final validation must include success and failure paths for representative
  app shell, catalog, template, and theme workflows, plus enforcement for
  session-only and policy-owned history rules.

## Phase 1 Design Output

- `research.md` records the decisions for disk-backed per-session retention,
  startup clearing, ref-scoped context keys, action-generated before/after
  diffs, recording completed reversible actions, redo and history-list
  navigation, branch pruning, policy-owned reversal, renderer summary ownership,
  and validation strategy.
- `data-model.md` defines undo context, undoable action, undo entry, undo stack,
  history position, availability summary, transition result, and workflow
  participation.
- `contracts/undo-history-contract.md` documents stack identity, disk-backed
  per-session retention, startup clearing, ordering, redo, list navigation,
  availability, and failure rules.
- `contracts/undo-workflow-integration.md` documents how existing workflows join
  undo through named action, handler, controller, and policy-owned operation
  flow.
- `quickstart.md` defines planning, implementation, and final validation
  scenarios and commands.

## Post-Design Constitution Check

- [x] Touched work remains in existing layers: renderer-facing commands,
      menus, tabs, and summaries in `src/app/**`; undo policy and state
      transitions in `src/domain/**`; runtime models in `src/model/**` when
      needed; and undo disk persistence in `src/gateway/**`.
- [x] The design preserves inward dependency direction by keeping undo policy
      independent of React, Electron, and filesystem details; gateway
      persistence is replaceable and does not own history policy.
- [x] The primary use case is explicit: undo, redo, or navigate completed
      user-originated state changes for the active tab and `*Ref` content
      context.
- [x] Controllers orchestrate active-context reads, validations, and
      policy-owned operations; mutation and history rules stay in operations or
      focused policy units.
- [x] Runtime undo context, entry, stack, before/after diff, and availability
      data are represented through typed model/state shapes; renderer summaries
      stay read-only.
- [x] The design requires directive and enforcement updates for undo/redo
      participation, context-key ownership, branch pruning, history-list
      navigation, failure-path recording, write-through persistence, startup
      clearing, and per-session retention.
- [x] The design reduces existing drift by resolving placeholder undo actions,
      cross-session hydration, whole-state snapshot risks, and any workflow
      bypasses discovered while making actions undoable.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|

## Final Validation Notes

- Final validation for this feature must include `npm run lint`, relevant
  renderer workflow tests, focused undo policy/domain tests, and relevant
  architecture/convention enforcement.
- Focused validation must include at least one app shell workflow, one catalog
  workflow, one template workflow, and one theme workflow that records,
  reverses, and redoes completed state changes.
- Failure-path validation must prove invalid, canceled, interrupted, failed, and
  pending actions do not create incorrect undo entries.
- History-list validation must prove selecting an entry moves to the state
  immediately after that entry and that new actions after undo prune redoable
  branch entries.
- Persistence validation must prove stack changes are written to disk before
  in-memory data for those entries is eligible for release.
- Session validation must prove undo history survives context switching during
  one open app session, can be reloaded from active-session disk-backed history
  when memory is released, and is unavailable after startup clearing.
- Do not mark final validation complete until cross-session hydration is
  prevented and startup clearing of persisted undo state is validated.
