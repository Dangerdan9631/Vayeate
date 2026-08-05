# Template Operations

Policy-owned domain operations for the Template business domain.

## Placement

- Path: `src/domain/operations/Template/template-operations`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Template`

## Contents

- Subfolders: `groups`, `mappings`, `mappings-semantic`, `template-details`, `template-list`, `variables`, `variables-color`, `variables-contrast`, `variables-style`
- Files: `group-names-in-use-from-template-operation.ts`, `merge-assignments-from-template-operation.ts`, `referenced-color-var-keys-from-template-operation.ts`, `referenced-contrast-var-keys-from-template-operation.ts`, `referenced-style-var-keys-from-template-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

