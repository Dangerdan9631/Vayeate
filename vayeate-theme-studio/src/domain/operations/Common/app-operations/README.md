# App Operations

Policy-owned domain operations for the Common business domain.

## Placement

- Path: `src/domain/operations/Common/app-operations`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `close-menus-operation.ts`, `hide-styled-tooltip-operation.ts`, `initialize-log-service-operation.ts`, `load-app-config-operation.ts`, `open-menu-operation.ts`, `reposition-styled-tooltip-operation.ts`, `save-app-config-operation.ts`, `set-color-scheme-operation.ts`, `set-ui-active-tab-operation.ts`, `show-styled-tooltip-operation.ts`, `tear-down-window-service-operation.ts`, `types.ts`, `window-callbacks-port.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

