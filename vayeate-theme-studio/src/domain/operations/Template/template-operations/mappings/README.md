# Mappings

Policy-owned domain operations for the Template business domain.

## Placement

- Path: `src/domain/operations/Template/template-operations/mappings`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Template`

## Contents

- Subfolders: None
- Files: `apply-mapping-assignment-operation.ts`, `clear-template-mapping-selection-operation.ts`, `remove-mapping-from-template-operation.ts`, `set-mapping-color-ref-operation.ts`, `set-mapping-contrast-ref-operation.ts`, `set-mapping-group-ref-operation.ts`, `set-mapping-ignored-operation.ts`, `set-mapping-style-ref-operation.ts`, `set-template-mapping-color-variable-filter-operation.ts`, `set-template-mapping-contrast-variable-filter-operation.ts`, `set-template-mapping-search-text-operation.ts`, `set-template-mapping-selection-batch-operation.ts`, `set-template-mapping-style-variable-filter-operation.ts`, `set-template-mapping-token-group-selection-operation.ts`, `toggle-template-mapping-selection-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

