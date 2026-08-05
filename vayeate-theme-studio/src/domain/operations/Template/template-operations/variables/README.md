# Variables

Policy-owned domain operations for the Template business domain.

## Placement

- Path: `src/domain/operations/Template/template-operations/variables`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Template`

## Contents

- Subfolders: None
- Files: `set-template-add-group-name-operation.ts`, `set-template-add-variable-name-operation.ts`, `set-template-variables-search-text-operation.ts`, `update-variable-group-ref-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

