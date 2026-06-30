# Config gateway

Reads and writes application settings at `data/config.json`. Provides defaults when the file is missing or invalid so startup behavior matches Electron preload.

## Modules

| File | Role |
|------|------|
| `config-gateway.ts` | `load` and `save` for `AppConfig`; falls back to `{ colorScheme: 'dark' }` on read errors. |

## Call flow

```
Operation → ConfigGateway → FileSystemService → Electron IPC
```

## Boundaries

- **In scope:** wire shape, JSON parse/serialize, default config when file is absent or malformed.
- **Out of scope:** when or why config changes — see domain operations that call this gateway.

For gateway-layer conventions see the parent [README](../README.md).
