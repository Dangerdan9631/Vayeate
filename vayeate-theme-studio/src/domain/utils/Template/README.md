# Template

Pure domain helpers for the Template business domain.

## Placement

- Path: `src/domain/utils/Template`
- Layer: Domain layer
- Role bucket: `utils`
- Domain bucket: `Template`

## Contents

- Subfolders: None
- Files: `group-names-in-use-from-template.ts`, `is-mapping-orphan-for-template.ts`, `is-template-mapping-complete.ts`, `referenced-color-var-keys-from-template.ts`, `referenced-contrast-var-keys-from-template.ts`, `referenced-style-var-keys-from-template.ts`, `template-stack-id.ts`, `theme-template-merge.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

