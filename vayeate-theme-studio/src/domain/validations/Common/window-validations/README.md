# Window Validations

Pre-mutation validations for the Common business domain.

## Placement

- Path: `src/domain/validations/Common/window-validations`
- Layer: Domain layer
- Role bucket: `validations`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `validate-can-maximize-window.ts`, `validate-can-minimize-window.ts`, `validate-can-restore-window.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

