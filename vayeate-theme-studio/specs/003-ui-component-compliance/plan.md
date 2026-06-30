# Implementation Plan: UI Component Compliance Remediation

**Branch**: `[003-ui-component-compliance]` | **Date**: 2026-06-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-ui-component-compliance/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See
`.specify/templates/plan-template.md` for the execution workflow.

## Summary

Review and remediate the remaining unchecked component workflow inventory from
`Todo.md` and directly related inconsistent app workflows so common, shell,
catalog, template, and theme component interactions converge on the newer
canonical viewmodel callback, validated action, handler, focused controller use
case, and policy-owned operation flow. The implementation approach is
evidence-first: classify every unchecked item, avoid churn-only rewrites for
already aligned components, use git history and current compliant flows to
choose newer patterns when multiple working patterns exist, and apply targeted
remediation where component, handler, viewmodel, controller, state,
failure-path, naming, behavior, or enforcement drift is confirmed.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: React 19, Vite 6, Electron 41, tsyringe, zustand,
zod, Vitest, ESLint

**Storage**: Local files plus renderer/main-process state as applicable

**Testing**: Vitest, Testing Library, linting, architecture/convention tests,
renderer workflow tests, and focused policy-layer tests that can run without
real volatile details where practical

**Target Platform**: Electron desktop application

**Project Type**: Layered desktop app with renderer-facing adapters,
policy/domain code, external-system adapters, and Electron main-process edges

**Performance Goals**: Preserve responsive renderer interactions, avoid
blocking action queues or main-window lifecycle behavior, and keep repeated
component actions predictable while remediation is applied consistently across
the app

**Constraints**: Respect established layer boundaries, inward dependency
direction, use-case or policy ownership of mutation, typed boundary translation,
replaceable-detail seams, clean-code quality expectations, and the prior
`002` remediation's completed queue and lifecycle decisions

**Scale/Scope**: Cross-cutting component-focused remediation of unchecked
common, app shell, catalog, template, and theme entries from `Todo.md` plus
directly related inconsistent app workflows, delivered as small slices that
classify evidence first and change confirmed inconsistencies even when older
behavior currently works

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
specs/003-ui-component-compliance/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── component-workflow-boundaries.md
│   └── inventory-and-enforcement.md
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
│   ├── common/
│   ├── app/
│   ├── catalog/
│   ├── template/
│   └── theme/
├── domain/
│   ├── <business-domain>/
│   ├── operations/
│   ├── ui/
│   └── state/
├── gateway/
│   ├── services/
│   └── <domain>/
├── model/
└── main.tsx

test/
├── architecture/
└── <renderer-or-domain-workflow-tests>
```

**Structure Decision**: Preserve the existing layered Electron app structure and
the component folders already present under `src/app/**`. For each touched
workflow, keep components and handlers as translators, viewmodels as named UI
coordination entry points, controllers as focused use cases, and policy or
mutation behavior behind domain operations or explicit policy units. Do not
create alternate top-level structures or new generic escape hatches for this
work.

## Phase 0 Research Summary

- The remaining todo checklist should be treated as a compliance inventory, not
  as automatic proof that every unchecked item still needs code changes.
- The safest remediation flow is evidence-first classification, followed by
  targeted changes only where component workflow ownership actually violates
  the constitution.
- Non-trivial component interactions should keep the existing callback to
  action to handler to controller flow; handlers must not absorb branching
  policy and components must not own business decisions.
- Component UI state ownership should be explicit but proportionate: local-only
  visual state may remain local, while shared or cross-workflow state needs an
  owned store or policy-facing state unit.
- Enforcement updates are mandatory when the review exposes missing tests for
  component-owned business logic, action-contract drift, handler branching,
  controller granularity, naming, or directive drift.

## Phase 1 Design Output

- `research.md` records the decisions for evidence-first classification,
  component workflow boundaries, state ownership, failure-path validation, and
  enforcement synchronization.
- `data-model.md` defines the planning entities: compliance inventory item,
  component workflow, viewmodel callback, validated action contract, handler
  route, focused controller use case, component UI state, and compliance
  evidence.
- `contracts/component-workflow-boundaries.md` documents the required component
  interaction flow and the responsibilities of components, viewmodels, actions,
  handlers, controllers, policy operations, and external details.
- `contracts/inventory-and-enforcement.md` documents how unchecked `Todo.md`
  items are classified, what evidence is required, and when enforcement or
  directives must be updated.
- `quickstart.md` defines the validation path for planning, implementation, and
  final compliance checks.

## Post-Design Constitution Check

- [x] Touched work remains in existing layers: renderer-facing component flow in
      `src/app/**`, policy and mutation in `src/domain/**`, external details in
      `src/gateway/**` or `electron/**`, and typed boundary models in
      `src/model/**` when required.
- [x] The design preserves inward dependency direction by keeping components,
      handlers, services, gateways, and Electron wiring free of business policy.
- [x] The primary use case is explicit: classify and remediate component
      workflows so non-trivial interactions follow one canonical named callback,
      validated action, handler route, focused controller use case, and
      policy-owned operation flow across the app.
- [x] No architecture exception is planned; discovered exceptions must be
      justified in the inventory and synchronized with enforcement before they
      can remain.
- [x] The design requires directive and test updates whenever the review changes
      or clarifies rules for component flow, naming, local state, handler
      routing, controller granularity, or action-contract ownership.
- [x] The design reduces duplication, unclear naming, hidden side effects,
      older inconsistent behavior, complex component conditions, unnecessary
      nested viewmodel data, and generic escape-hatch drift in touched code.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|

## Final Validation Notes

- Final validation for this remediation must include `npm run lint`, relevant
  renderer workflow tests, relevant policy/domain tests for remediated behavior,
  and architecture/convention enforcement.
- Focused validation must include at least one common component, one shell
  component, one catalog component, one template component, and one theme
  component from the unchecked inventory.
- Do not mark final validation complete until every unchecked `Todo.md`
  component item and directly related inconsistent workflow is classified and
  backed by evidence, all confirmed violations or pattern conflicts are
  remediated or explicitly deferred with rationale, failure paths are covered
  for remediated workflow categories, and enforcement plus directive
  synchronization are complete.
