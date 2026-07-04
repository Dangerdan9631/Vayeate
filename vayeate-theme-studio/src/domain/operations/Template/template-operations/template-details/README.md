# Template Details

Policy-owned domain operations for the Template business domain.

## Placement

- Path: `src/domain/operations/Template/template-operations/template-details`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Template`

## Contents

- Subfolders: None
- Files: `bump-template-version-for-edit-operation.ts`, `load-template-operation.ts`, `load-template-snapshot-operation.ts`, `lock-template-operation.ts`, `save-template-operation.ts`, `set-template-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

