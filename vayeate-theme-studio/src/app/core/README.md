# Core

Files related to Core.

## Placement

- Path: `src/app/core`
- Layer: App layer
- Role bucket: `core`

## Contents

- Subfolders: `Common`, `Queue`, `Undo`
- Files: None

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

