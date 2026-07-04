# Actions

Files related to Actions.

## Placement

- Path: `src/app/actions`
- Layer: App layer
- Role bucket: `actions`

## Contents

- Subfolders: `Catalog`, `Common`, `Template`, `Theme`
- Files: None

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

