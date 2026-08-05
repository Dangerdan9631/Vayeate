# Catalog

Gateway facades and wire conversion for the Catalog domain.

## Placement

- Path: `src/gateway/gateway/Catalog`
- Layer: Gateway layer
- Role bucket: `gateway`
- Domain bucket: `Catalog`

## Contents

- Subfolders: `catalog`
- Files: None

## Rules

- Keep system integration, persistence adapters, worker lifecycle, and wire conversion in the gateway layer.
- Gateways and services do not decide business outcomes; operations do.
- Validate boundary data with model schemas before returning domain models.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

