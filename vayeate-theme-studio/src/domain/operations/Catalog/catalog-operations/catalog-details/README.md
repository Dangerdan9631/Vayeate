# Catalog Details

Policy-owned domain operations for the Catalog business domain.

## Placement

- Path: `src/domain/operations/Catalog/catalog-operations/catalog-details`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Catalog`

## Contents

- Subfolders: None
- Files: `bump-catalog-version-for-edit-operation.ts`, `load-catalog-operation.ts`, `lock-catalog-operation.ts`, `lock-head-catalog-if-unlocked-operation.ts`, `revert-catalog-operation.ts`, `save-catalog-operation.ts`, `sync-catalog-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

