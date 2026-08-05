# Catalog

Controller entry points that orchestrate validations and operations for the Catalog UI domain.

## Placement

- Path: `src/app/controllers/Catalog`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Catalog`

## Contents

- Subfolders: `bulk-add-dialog`, `catalog-details-card`, `catalog-page`, `catalogs-card`, `create-dialog`, `tokens-card`
- Files: None

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

