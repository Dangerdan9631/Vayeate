# Action Queue

App-layer infrastructure for the Common domain.

## Placement

- Path: `src/app/core/Common/action-queue`
- Layer: App layer
- Role bucket: `core`
- Domain bucket: `Common`

## Contents

- Subfolders: `controllers`
- Files: `action-coalesce.ts`, `action-coalescing-policy.ts`, `action-priority-policy.ts`, `action-processor.ts`, `action-queue.ts`, `app-action.ts`, `use-app-dispatch.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

