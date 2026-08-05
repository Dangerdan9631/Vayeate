# Common

App-layer infrastructure for the Common domain.

## Placement

- Path: `src/app/core/Common`
- Layer: App layer
- Role bucket: `core`
- Domain bucket: `Common`

## Contents

- Subfolders: `action-queue`, `background-queue`, `bootstrap`, `undo`
- Files: None

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

