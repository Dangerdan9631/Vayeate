# Theme gateway

Persists themes under `data/themes/` and debounces rapid save requests so file writes do not flood the filesystem during editing.

## Modules

| File | Role |
|------|------|
| `theme-gateway.ts` | Save, load, delete, and list themes as `<name>-<version>.theme.json`; validates with `themeSchema`. |
| `debounced-theme-persist-gateway.ts` | Debounces theme saves, then enqueues the latest theme on keyed `data_io`; cancels superseded pending writes. |

## Call flow

```
Operation → ThemeGateway → compact serialization → FileSystemService → Electron IPC
Operation → DebouncedThemePersistGateway (timer) → keyed data_io job → ThemeGateway
```

## Boundaries

- **In scope:** path conventions, compact internal JSON serialization, zod parsing, and debounced keyed persist scheduling.
- **Out of scope:** theme edit rules, color resolution, undo — see `src/domain/theme/` and related operations.

For gateway-layer conventions see the parent [README](../README.md).
