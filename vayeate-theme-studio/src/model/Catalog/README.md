# Catalog

Pure models and schemas for the Catalog domain.

## Placement

- Path: `src/model/Catalog`
- Layer: Model layer
- Role bucket: `model`
- Domain bucket: `Catalog`

## Contents

- Subfolders: `schema`
- Files: `catalog-source-undo.ts`, `catalog-undo-lifecycle.ts`

## Rules

- Keep models pure TypeScript and zod schemas.
- Do not import app, domain operations, gateways, services, Electron, or React.
- Parse untrusted or persisted data at boundaries and keep business rules outside models.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

