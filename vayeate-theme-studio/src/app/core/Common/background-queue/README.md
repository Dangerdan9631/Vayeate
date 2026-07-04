# Background Queue

App-layer infrastructure for the Common domain.

## Placement

- Path: `src/app/core/Common/background-queue`
- Layer: App layer
- Role bucket: `core`
- Domain bucket: `Common`

## Contents

- Subfolders: `controllers`
- Files: `background-queue-resolver.ts`, `background-queue-type.ts`, `background-queue.ts`, `continuation-handler.ts`, `data-io-background-queue.ts`, `deferred-background-queue.ts`, `ibackground-queue.ts`, `keyed-data-io-queue.ts`, `main-background-queue.ts`, `pooled-queue.ts`, `queued-work.ts`, `serial-queue.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

