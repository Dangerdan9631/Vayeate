# Implementation Plan: Bulk Template Mapping Assignments

**Branch**: `[005-bulk-map-assignments]` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-bulk-map-assignments/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See
`.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add explicit multi-selection to the Template mappings card and apply group,
color-variable, or contrast-variable assignments to the selected mapping set as
one atomic, undoable action. Stable mapping identities live in transient
template UI state. Components expose selection and bulk controls through the
existing action queue; focused controllers coordinate validation and persistence;
domain operations own selection mutation, target resolution, assignment rules,
and complete next-template construction. Existing single-row assignment
behavior remains available and shares the same assignment policy.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: React 19, Vite 6, Electron 41, tsyringe, zustand,
zod, Vitest, ESLint

**Storage**: Transient renderer/domain state for mapping selection; existing
template file persistence and disk-backed per-session undo history for completed
bulk edits

**Testing**: Vitest, Testing Library, linting, architecture/convention tests,
and policy-layer tests that can run without real volatile details where practical

**Target Platform**: Electron desktop application

**Project Type**: Layered desktop app with renderer-facing adapters,
policy/domain code, external-system adapters, and Electron main-process edges

**Performance Goals**: Keep selection feedback responsive with at least 500
mappings, apply one assignment to at least 100 selected mappings without a
visible stall, and avoid blocking the action queue or main window lifecycle

**Constraints**: Respect established layer boundaries and queue flow; state
updates only in operations; selection payloads contain stable token identities;
bulk edits are all-or-nothing; successful changes create one template undo
entry; no-op and failed actions create none; virtual wildcard rows and
non-latest template versions are not selectable

**Scale/Scope**: Template mappings card only. Support real theme, TextMate, and
semantic mappings, including semantic variants. Bulk deletion and semantic-key
editing are out of scope. Target at least 500 displayed mappings and 100 selected
targets.

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
specs/005-bulk-map-assignments/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
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
│   └── template/mappings-card/
│       ├── actions/
│       ├── controllers/
│       ├── MappingRow.tsx
│       ├── SemanticVariantListRow.tsx
│       ├── MappingsCard.tsx
│       └── use-mappings-card-viewmodel.ts
├── domain/
│   ├── operations/template-operations/mappings/
│   ├── state/ui/
│   └── validations/template-validations/
├── gateway/
│   └── <existing template and undo persistence only>
├── model/
└── main.tsx

test/
└── architecture/        # Convention and architecture tests when present
```

**Structure Decision**: Extend the existing mappings-card feature subtree and
template mapping operations. Keep transient selection in the existing Template
UI store. Introduce a typed mapping identity and discriminated assignment model
only if existing primitives cannot express the operation without ambiguous
parallel parameters. Reuse existing template save, ref-refresh, and undo
boundaries; no Electron or gateway change is expected.

## Phase 0 Research Summary

- Selection uses stable `{ tokenType, tokenKey }` identities and is scoped to
  the active template reference, not to rendered row instances.
- Hidden rows remain selected through search, filter, and collapse changes;
  selection clears on template-context change or unload.
- Explicit bulk controls appear when mappings are selected. Existing row-level
  controls continue to edit one mapping, avoiding context-dependent row control
  behavior.
- One focused bulk-assignment controller coordinates current-template lookup,
  editability validation, next-version construction, save/ref refresh, and one
  undo record. Domain operations construct the full next template before any
  store or persistence mutation.
- Group, color, and contrast assignments use one discriminated assignment
  request and shared policy. Clearing color from an orphan mapping preserves the
  established removal behavior.
- Stale selected identities are discarded during target resolution. A request
  with no remaining targets is a no-op; invalid requested references reject the
  complete action.

## Phase 1 Design Output

- `research.md` records selection, UI, atomicity, compatibility, undo, and
  stale-target decisions.
- `data-model.md` defines mapping identity, transient selection, assignment
  request, resolved target set, and bulk change set.
- `contracts/bulk-mapping-assignment-contract.md` defines selection and bulk
  assignment behavior across the UI-to-policy flow.
- `quickstart.md` defines focused policy, routing, renderer, undo, failure-path,
  architecture, lint, and performance validation.

## Post-Design Constitution Check

- [x] UI events enter through named mappings-card viewmodel callbacks, actions,
      the action queue, handler, and focused controllers.
- [x] Selection and template mutation occur only in operations; controllers and
      validations read snapshots and coordinate.
- [x] Assignment policy is shared by single-target and bulk-target workflows,
      reducing existing group/color/contrast duplication.
- [x] Stable plain models cross app/domain boundaries without React, Zustand,
      persistence, or Electron types leaking into policy.
- [x] Existing save and undo adapters remain replaceable external details; no
      new gateway or architecture exception is introduced.
- [x] Tests cover policy invariants, UI routing and visibility, atomic failure,
      undo/redo, context clearing, and architecture conventions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
