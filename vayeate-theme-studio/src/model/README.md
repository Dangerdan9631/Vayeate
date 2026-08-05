# Model

Pure domain model boundary. Code here defines TypeScript value types and zod schemas used across layers.

## Placement

- Path: `src/model`
- Layer: Model layer

## Contents

- Subfolders: `Catalog`, `Common`, `Template`, `Theme`
- Files: None

## Rules

- Keep models pure TypeScript and zod schemas.
- Do not import app, domain operations, gateways, services, Electron, or React.
- Parse untrusted or persisted data at boundaries and keep business rules outside models.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

