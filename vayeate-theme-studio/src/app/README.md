# App

Renderer UI boundary. Code here turns user and lifecycle events into typed actions and delegates mutation through controllers.

## Placement

- Path: `src/app`
- Layer: App layer

## Contents

- Subfolders: `actions`, `components`, `controllers`, `core`, `viewmodel`
- Files: None

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

