# Tokens

Policy-owned domain operations for the Catalog business domain.

## Placement

- Path: `src/domain/operations/Catalog/catalog-operations/tokens`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Catalog`

## Contents

- Subfolders: None
- Files: `add-plain-token-to-catalog-operation.ts`, `append-tokens-to-catalog-operation.ts`, `deduplicate-bulk-tokens-operation.ts`, `merge-semantic-selectors-into-catalog-operation.ts`, `remove-semantic-token-list-item-operation.ts`, `remove-token-from-catalog-operation.ts`, `set-catalog-new-semantic-token-selector-text-operation.ts`, `set-catalog-new-token-key-operation.ts`, `set-catalog-tokens-search-text-operation.ts`, `update-semantic-token-registry-entry-operation.ts`, `update-token-key-in-catalog-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

