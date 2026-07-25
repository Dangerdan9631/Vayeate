# Common

Platform and runtime services for the Common domain.

## Placement

- Path: `src/gateway/services/Common`
- Layer: Gateway layer
- Role bucket: `services`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `clustering-service.ts`, `clustering-worker.ts`, `file-system-service.ts`, `log-service-types.ts`, `log-service.ts`, `scope-resolver-service.ts`, `scope-resolver-worker.ts`, `screenshot-service-types.ts`, `screenshot-service.ts`, `textmate-tokenizer-service.ts`, `theme-preview-host-service.ts`, `web-service.ts`, `window-service.ts`

## Rules

- Keep system integration, persistence adapters, worker lifecycle, and wire conversion in the gateway layer.
- Gateways and services do not decide business outcomes; operations do.
- Validate boundary data with model schemas before returning domain models.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

