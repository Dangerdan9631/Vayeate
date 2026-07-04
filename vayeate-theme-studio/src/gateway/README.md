# Gateway

External integration boundary. Code here wraps persistence, IPC, browser APIs, workers, and wire-to-model conversion.

## Placement

- Path: `src/gateway`
- Layer: Gateway layer

## Contents

- Subfolders: `gateway`, `services`
- Files: None

## Rules

- Keep system integration, persistence adapters, worker lifecycle, and wire conversion in the gateway layer.
- Gateways and services do not decide business outcomes; operations do.
- Validate boundary data with model schemas before returning domain models.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

