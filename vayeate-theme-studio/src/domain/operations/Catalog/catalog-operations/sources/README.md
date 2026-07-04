# Sources

Policy-owned domain operations for the Catalog business domain.

## Placement

- Path: `src/domain/operations/Catalog/catalog-operations/sources`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Catalog`

## Contents

- Subfolders: None
- Files: `add-source-to-catalog-operation.ts`, `clear-catalog-new-source-data-operation.ts`, `remove-source-at-index-operation.ts`, `set-catalog-new-source-token-type-operation.ts`, `set-catalog-new-source-type-operation.ts`, `set-catalog-new-source-url-operation.ts`, `update-source-token-type-in-catalog-operation.ts`, `update-source-type-in-catalog-operation.ts`, `update-source-url-in-catalog-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

