# Common

Pure models and schemas for the Common domain.

## Placement

- Path: `src/model/Common`
- Layer: Model layer
- Role bucket: `model`
- Domain bucket: `Common`

## Contents

- Subfolders: `schema`
- Files: `app-ui.ts`, `background-queue.ts`, `data-path-keys.ts`, `dialog-result.ts`, `eyedropper.ts`, `format-semantic-selector.ts`, `geometry.ts`, `merge-semantic-selector-into.ts`, `parse-semantic-selector.ts`, `point.ts`, `rect.ts`, `semantic-selector-types.ts`, `semantic-token-constants.ts`, `styled-tooltip.ts`, `undo-action-types.ts`, `undo-history.ts`, `validation-result.ts`, `window-state-event.ts`

## Rules

- Keep models pure TypeScript and zod schemas.
- Do not import app, domain operations, gateways, services, Electron, or React.
- Parse untrusted or persisted data at boundaries and keep business rules outside models.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

