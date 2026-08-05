# Variables

Policy-owned domain operations for the Theme business domain.

## Placement

- Path: `src/domain/operations/Theme/theme-operations/variables`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `set-theme-variables-search-text-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

