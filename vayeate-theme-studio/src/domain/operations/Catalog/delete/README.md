# Delete

Policy-owned domain operations for the Catalog business domain.

## Placement

- Path: `src/domain/operations/Catalog/delete`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Catalog`

## Contents

- Subfolders: None
- Files: `get-catalog-refs-operation.ts`, `load-catalog-for-display-operation.ts`, `refresh-catalog-refs-and-select-operation.ts`, `set-catalog-operation.ts`, `set-selected-catalog-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

