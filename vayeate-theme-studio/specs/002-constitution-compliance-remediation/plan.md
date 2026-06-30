# Implementation Plan: Constitution Compliance Remediation

**Branch**: `[002-constitution-compliance-remediation]` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-constitution-compliance-remediation/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See
`.specify/templates/plan-template.md` for the execution workflow.

## Summary

Refactor the existing catalog, template, theme, queue, and app lifecycle flows
so constitutional compliance becomes the steady state instead of a baseline
exception. The work removes domain-to-app dependencies, concentrates workflow
orchestration into focused controller use cases, moves DI and delivery wiring to
the outer edge, consolidates stale duplicate contracts, and upgrades enforcement so
inward-boundary violations and handler-, service-, gateway-, or component-owned
business scripts are caught by tests instead of tolerated.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: React 19, Vite 6, Electron 41, tsyringe, zustand,
zod, Vitest, ESLint

**Storage**: Local files plus renderer/main-process state as applicable

**Testing**: Vitest, Testing Library, linting, architecture/convention tests,
and policy-layer tests that can run without real volatile details where practical

**Target Platform**: Electron desktop application

**Project Type**: Layered desktop app with renderer-facing adapters,
policy/domain code, external-system adapters, and Electron main-process edges

**Performance Goals**: Preserve responsive renderer interactions, keep queue
processing behavior predictable, and avoid blocking the action queue or main
window lifecycle while refactoring internal orchestration

**Constraints**: Respect established layer boundaries, inward dependency
direction, controller use-case orchestration, operation-port ownership, typed boundary translation,
replaceable-detail seams, and clean-code quality expectations

**Scale/Scope**: Broad cross-cutting remediation of touched authoring and shell
flows, implemented as behavior-preserving slices that converge on one compliant
architecture model

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Work is placed in the correct layer: `electron/`, `src/app/`,
      `src/domain/`, `src/gateway/`, or `src/model/`
- [x] Source dependencies still point inward toward policy, with no volatile
      framework, transport, storage, or vendor detail leaking into core policy
- [x] The primary application action or use case is explicit, and adapters stay
      translation-focused rather than owning business policy
- [x] Controllers are focused use cases that orchestrate validations and
      operation ports; operations expose policy-facing ports and own mutation and
      business-rule execution while services abstract frameworks and gateways
      adapt to services
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
specs/002-constitution-compliance-remediation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── enforcement-and-structure.md
│   └── use-case-boundaries.md
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
│   └── <ui-domain-or-feature>/
├── domain/
│   ├── <business-domain>/
│   ├── ui/
│   └── state/
├── gateway/
│   ├── services/
│   └── <domain>/
├── model/
└── main.tsx

test/
└── architecture/
```

**Structure Decision**: Preserve the existing top-level layered structure while
making application-action ownership more visible inside touched capability
folders. Keep focused controller use cases visible inside `src/app/`, introduce
inward-facing operation ports inside `src/domain/`, keep translation and callback entry points in `src/app/` or
`electron/`, and keep volatile integration details behind `src/gateway/` or
outer-edge bootstrap code.

## Phase 0 Research Summary

- Queue scheduling, continuation, and lifecycle callback translation should be
  modeled as inward-owned boundary seams rather than app-layer types imported by
  domain policy.
- Mixed or bloated controller scripts should be collapsed into focused controller
  use cases that orchestrate operation ports for validation flow and follow-up
  behavior for one logical action, with mutation rules kept behind operation
  ports.
- Dependency wiring should move toward explicit outer-edge composition and away
  from service-locator access or string-token indirection in touched flows.
- Architecture and convention tests must stop whitelisting baseline violations
  and instead encode the compliant steady state directly.
- Duplicate or stale action-contract paths should be consolidated so the codebase
  has one authoritative action-definition path per touched feature.

## Phase 1 Design Output

- `research.md` records the remediation decisions, rationale, and rejected
  alternatives for boundary seams, workflow ownership, DI composition, and
  enforcement.
- `data-model.md` defines the architectural entities that govern the compliant
  design, including application actions, controller use cases, operation ports,
  services, gateways, boundary contracts, and enforcement artifacts.
- `contracts/use-case-boundaries.md` documents the allowed callback-to-action-to-
  controller-use-case flow and the operation-port boundaries that replace
  app-layer leaks.
- `contracts/enforcement-and-structure.md` documents the repository structure,
  enforcement expectations, and duplicate-contract cleanup rules for the
  remediation.
- `quickstart.md` defines the validation path for behavior-preserving
  implementation and compliance verification.

## Post-Design Constitution Check

- [x] Touched work remains in the existing layered structure, with UI and shell
      entry points kept in `src/app/` or `electron/`, policy in `src/domain/`,
      integrations in `src/gateway/`, and typed boundary models in `src/model/`
      or plain internal domain models.
- [x] The design removes current domain imports of app-layer queue, lifecycle,
      and controller details and replaces them with inward-facing seams or
      outer-boundary orchestration.
- [x] The dominant use cases are explicit: dispatch a named action, execute one
      focused controller use case, orchestrate operation ports, and translate the
      result through gateways and services without moving business rules out of
      operations/domain policy.
- [x] No ongoing architecture exception is planned; the baseline exceptions are
      targeted for removal rather than retention.
- [x] The design requires matching updates to architecture/convention tests and
      managed directives wherever a former tolerated shortcut is eliminated.
- [x] The planned refactor reduces duplication, service-locator drift,
      handler-, service-, gateway-, or component-owned business scripts, and
      generic escape-hatch modules.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|

## Final Validation Notes

- Final validation for this remediation is the combination of `npm run lint`
  plus `npm test`, with focused attention on:
  `test/architecture/layer-boundaries.test.ts`,
  `src/app/catalog/catalog-flow-routing.test.ts`,
  `src/app/template/template-flow-routing.test.ts`,
  `src/app/theme/theme-renderer-workflows.test.tsx`,
  `src/app/core/queues/baseline-queues.test.ts`,
  `test/electron/ipc-handlers.test.ts`,
  `test/electron/preload.test.ts`, and `src/main.test.tsx`.
- Renderer composition is expected to register both background-queue and
  window-callback seams explicitly at the outer edge before bootstrapping the
  app.
