# Catalog

Pre-mutation validations for the Catalog business domain.

## Placement

- Path: `src/domain/validations/Catalog/catalog`
- Layer: Domain layer
- Role bucket: `validations`
- Domain bucket: `Catalog`

## Contents

- Subfolders: None
- Files: `validate-can-bulk-add-tokens.ts`, `validate-can-lock-catalog.ts`, `validate-can-update-catalog-source.ts`, `validate-catalog-name-is-unique.ts`, `validate-catalog-name-is-valid.ts`, `validate-sync-catalog.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

