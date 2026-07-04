# Template

Pure models and schemas for the Template domain.

## Placement

- Path: `src/model/Template`
- Layer: Model layer
- Role bucket: `model`
- Domain bucket: `Template`

## Contents

- Subfolders: `factories`, `schema`
- Files: `template-mapping-assignment.ts`, `template-undo-lifecycle.ts`, `template-variable-kind.ts`

## Rules

- Keep models pure TypeScript and zod schemas.
- Do not import app, domain operations, gateways, services, Electron, or React.
- Parse untrusted or persisted data at boundaries and keep business rules outside models.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

