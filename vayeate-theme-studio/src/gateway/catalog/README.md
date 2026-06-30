# Catalog gateway

Facades for catalog persistence and remote token synchronization. Operations call these gateways when catalogs must be saved, loaded, listed, or refreshed from upstream VS Code sources.

## Modules

| File | Role |
|------|------|
| `catalog-gateway.ts` | CRUD over `data/catalogs/<name>-<version>.json`; validates wire JSON with `catalogSchema`. |
| `token-sync-gateway.ts` | Fetches remote source URLs and delegates parsing to `parse-synced-catalog-tokens`. |
| `parse-synced-catalog-tokens.ts` | Pure conversion from fetched source text to catalog tokens and semantic registry metadata. |

## Call flow

```
Operation → CatalogGateway → FileSystemService → Electron IPC
Operation → TokenSyncGateway → WebService → fetchUrl IPC
                ↓
         parseSyncedCatalogTokens (shape only)
```

## Boundaries

- **In scope:** path conventions, JSON serialization, zod parsing, remote fetch orchestration, token extraction from registry/grammar formats.
- **Out of scope:** catalog business rules, duplicate-name checks, undo — see `src/domain/catalog/` and related operations.

For gateway-layer conventions see the parent [README](../README.md).
