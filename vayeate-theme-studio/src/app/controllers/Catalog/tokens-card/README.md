# Tokens Card

Controller entry points that orchestrate validations and operations for the Catalog UI domain.

## Placement

- Path: `src/app/controllers/Catalog/tokens-card`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Catalog`

## Contents

- Subfolders: None
- Files: `add-catalog-semantic-token-selector-controller.ts`, `add-new-token-controller.ts`, `remove-semantic-token-list-item-controller.ts`, `remove-token-controller.ts`, `set-catalog-new-semantic-token-selector-text-controller.ts`, `set-catalog-new-token-key-controller.ts`, `set-catalog-tokens-search-text-controller.ts`, `update-semantic-token-registry-text-controller.ts`, `update-token-key-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

