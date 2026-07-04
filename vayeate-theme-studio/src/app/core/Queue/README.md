# Queue

App-layer action and background queue infrastructure.

## Placement

- Path: `src/app/core/Queue`
- Layer: App layer
- Role bucket: `core`
- Domain bucket: `Queue`

## Contents

- Subfolders: `action-queue`, `background-queue`
- Files: None

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.
