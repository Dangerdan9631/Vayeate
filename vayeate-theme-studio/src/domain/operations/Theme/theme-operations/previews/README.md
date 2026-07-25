# Previews

Policy-owned domain operations for the Theme business domain.

## Placement

- Path: `src/domain/operations/Theme/theme-operations/previews`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `load-previews-operation.ts`, `open-in-app-preview-operation.ts`, `open-theme-preview-host-operation.ts`, `resolve-editor-preview-scope-map-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

