# Undo

Gateway facades and wire conversion for the Common domain.

## Placement

- Path: `src/gateway/gateway/Common/undo`
- Layer: Gateway layer
- Role bucket: `gateway`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `undo-gateway.ts`

## Rules

- Keep system integration, persistence adapters, worker lifecycle, and wire conversion in the gateway layer.
- Gateways and services do not decide business outcomes; operations do.
- Validate boundary data with model schemas before returning domain models.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

