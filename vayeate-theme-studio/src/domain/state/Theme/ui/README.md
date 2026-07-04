# Ui

Zustand state shapes and stores for the Theme business domain.

## Placement

- Path: `src/domain/state/Theme/ui`
- Layer: Domain layer
- Role bucket: `state`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `theme-create-dialog-state.ts`, `theme-create-dialog-store.ts`, `theme-preview-state.ts`, `theme-preview-store.ts`, `theme-ui-state.ts`, `theme-ui-store.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

