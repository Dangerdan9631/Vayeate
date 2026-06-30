# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See
`.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

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

**Performance Goals**: Preserve responsive renderer interactions and avoid
blocking the action queue or main window lifecycle

**Constraints**: Respect established layer boundaries, inward dependency
direction, use-case or policy ownership of mutation, typed boundary translation,
replaceable-detail seams, and clean-code quality expectations

**Scale/Scope**: Prefer focused feature slices that reveal business capability
or application action clearly within the existing repository layout

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] Work is placed in the correct layer: `electron/`, `src/app/`,
      `src/domain/`, `src/gateway/`, or `src/model/`
- [ ] Source dependencies still point inward toward policy, with no volatile
      framework, transport, storage, or vendor detail leaking into core policy
- [ ] The primary application action or use case is explicit, and adapters stay
      translation-focused rather than owning business policy
- [ ] Controllers only orchestrate validations and operations; policy-owned
      units own state mutation, invariants, and business rules
- [ ] Persisted or runtime-parsed data uses typed model definitions and
      boundary translation; stores remain read-only outside policy-owned
      mutation units
- [ ] Any rule, exception, boundary, naming, or DI change includes matching
      updates to project directives and the relevant architecture/convention
      tests
- [ ] The design reduces or at least does not add duplication, god objects,
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

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., direct lifecycle controller call] | [must use documented exception] | [queue path unavailable during shell init/cleanup] |
| [e.g., outer detail kept temporarily] | [migration must stay incremental] | [moving it inward safely requires a separate extraction step] |
