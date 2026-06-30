# Implementation Plan: Theme Studio Baseline

**Branch**: `[001-theme-studio-baseline]` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-theme-studio-baseline/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See
`.specify/templates/plan-template.md` for the execution workflow.

## Summary

Document the current implementation as a layered Electron desktop application
that supports versioned token catalogs, reusable templates, interactive theme
authoring, preview-driven validation, and paired theme export artifacts. The
plan preserves the existing repository structure, treats persisted JSON assets
and generated theme files as the primary external contracts, and centers future
implementation work around the catalog-to-template-to-theme authoring flow.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: React 19, Vite 6, Electron 41, tsyringe, zustand,
zod, Vitest, ESLint

**Storage**: Local JSON files for catalogs, templates, themes, previews, and
app config; generated export files for light and dark themes; in-memory
renderer and undo state during active sessions

**Testing**: Vitest, Testing Library, linting, architecture/convention tests,
and policy-layer tests that can run without real volatile details where practical

**Target Platform**: Electron desktop application

**Project Type**: Layered desktop app with renderer-facing adapters,
policy/domain code, external-system adapters, and Electron main-process edges

**Performance Goals**: Preserve responsive renderer interactions, keep
long-running I/O and generation work off direct UI event paths, and avoid
blocking the action queue or main window lifecycle

**Constraints**: Respect established layer boundaries, inward dependency
direction, use-case or policy ownership of mutation, typed boundary translation,
replaceable-detail seams, and clean-code quality expectations

**Scale/Scope**: Baseline planning for the full current application surface,
with future work expected to land as smaller use-case slices within the
existing layered repository layout

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
specs/[###-feature]/
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
└── architecture/        # Convention and architecture tests when present
```

**Structure Decision**: Extend the existing layered Electron app structure
while making the business capability or application action visible inside the
touched folders. Do not introduce alternate top-level structures unless the
constitution is amended first.

## Phase 0 Research Summary

- Persisted data contracts should be treated as first-class design artifacts,
  because the application’s primary external interfaces are local JSON assets
  and generated theme files rather than HTTP endpoints.
- Future implementation work should preserve the existing queue-backed mutation
  model: direct UI handlers trigger actions, controllers orchestrate policy,
  and I/O or generation work runs through background or data queues.
- Validation should focus on end-to-end authoring flows, persisted artifact
  correctness, and renderer responsiveness, with policy-layer tests covering
  invariant-heavy operations where practical.

## Phase 1 Design Output

- `research.md` captures the major architectural and artifact decisions for the
  baseline.
- `data-model.md` describes the persisted and runtime entities that define the
  authoring workflow.
- `contracts/persisted-artifacts.md` documents catalog, template, theme, and
  config file expectations.
- `contracts/generated-theme-exports.md` documents the exported dark/light
  theme artifact expectations.
- `quickstart.md` defines the validation path for future implementation and QA
  work against the current application behavior.

## Post-Design Constitution Check

- [x] Layer placement remains explicit: desktop shell details stay in
      `electron/`, UI orchestration stays in `src/app/`, policy and state
      mutation stay in `src/domain/`, external adapters stay in `src/gateway/`,
      and typed data contracts stay in `src/model/`.
- [x] Persisted JSON, remote fetch, screenshot capture, and desktop APIs are
      modeled as replaceable details behind gateway or service boundaries.
- [x] The dominant use case is explicit: author and export versioned theme
      assets from catalog and template inputs.
- [x] The plan does not require architecture exceptions, DI rule changes, or
      top-level structural changes.
- [x] The planned validation approach exercises user workflows without moving
      business policy into adapters or UI layers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., direct lifecycle controller call] | [must use documented exception] | [queue path unavailable during shell init/cleanup] |
| [e.g., outer detail kept temporarily] | [migration must stay incremental] | [moving it inward safely requires a separate extraction step] |
