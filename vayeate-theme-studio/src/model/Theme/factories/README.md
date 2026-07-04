# Factories

Pure models and schemas for the Theme domain.

## Placement

- Path: `src/model/Theme/factories`
- Layer: Model layer
- Role bucket: `model`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `theme-factory.ts`

## Rules

- Keep models pure TypeScript and zod schemas.
- Do not import app, domain operations, gateways, services, Electron, or React.
- Parse untrusted or persisted data at boundaries and keep business rules outside models.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

