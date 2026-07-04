# Undo

App-layer infrastructure for the Undo domain.

## Placement

- Path: `src/app/core/Undo/undo`
- Layer: App layer
- Role bucket: `core`
- Domain bucket: `Undo`

## Contents

- Subfolders: None
- Files: `history-go-to-controller.ts`, `redo-controller.ts`, `undo-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

