# Template Validations

Pre-mutation validations for the Template business domain.

## Placement

- Path: `src/domain/validations/Template/template-validations`
- Layer: Domain layer
- Role bucket: `validations`
- Domain bucket: `Template`

## Contents

- Subfolders: None
- Files: `validate-can-lock-template.ts`, `validate-can-remove-variable.ts`, `validate-is-mapping-orphan-for-template.ts`, `validate-is-template-mapping-complete.ts`, `validate-is-template-name-valid.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

