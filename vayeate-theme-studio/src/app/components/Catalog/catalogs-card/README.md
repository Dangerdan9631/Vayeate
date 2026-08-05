# Catalogs Card

React components and component-local UI helpers for the Catalog UI domain.

## Placement

- Path: `src/app/components/Catalog/catalogs-card`
- Layer: App layer
- Role bucket: `components`
- Domain bucket: `Catalog`

## Contents

- Subfolders: None
- Files: `CatalogsCard.tsx`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

