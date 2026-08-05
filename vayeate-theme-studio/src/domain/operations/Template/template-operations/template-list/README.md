# Template List

Policy-owned domain operations for the Template business domain.

## Placement

- Path: `src/domain/operations/Template/template-operations/template-list`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Template`

## Contents

- Subfolders: None
- Files: `create-template-operation.ts`, `delete-template-operation.ts`, `load-template-refs-operation.ts`, `refresh-template-refs-and-select-operation.ts`, `refresh-template-refs-operation.ts`, `set-selected-template-ref-operation.ts`, `set-template-create-dialog-open-operation.ts`, `set-template-create-form-name-operation.ts`, `set-template-is-creating-operation.ts`, `set-template-refs-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

