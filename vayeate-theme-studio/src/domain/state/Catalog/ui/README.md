# Ui

Zustand state shapes and stores for the Catalog business domain.

## Placement

- Path: `src/domain/state/Catalog/ui`
- Layer: Domain layer
- Role bucket: `state`
- Domain bucket: `Catalog`

## Contents

- Subfolders: None
- Files: `bulk-add-dialog-state.ts`, `bulk-add-dialog-store.ts`, `catalog-ui-state.ts`, `catalog-ui-store.ts`, `create-catalog-dialog-state.ts`, `create-catalog-dialog-store.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

