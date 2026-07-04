# Ui

Zustand state shapes and stores for the Common business domain.

## Placement

- Path: `src/domain/state/Common/ui`
- Layer: Domain layer
- Role bucket: `state`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `action-queue-ui-state.ts`, `action-queue-ui-store.ts`, `background-queue-ui-state.ts`, `background-queue-ui-store.ts`, `eyedropper-ui-state.ts`, `eyedropper-ui-store.ts`, `styled-tooltip-ui-state.ts`, `styled-tooltip-ui-store.ts`, `ui-state.ts`, `ui-store.ts`, `window-state.ts`, `window-store.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

