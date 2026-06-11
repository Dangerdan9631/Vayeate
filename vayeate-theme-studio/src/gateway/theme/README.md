# Theme gateway

Persists themes under `data/themes/` and debounces rapid save requests so file writes do not flood the filesystem during editing.

## Modules

| File | Role |
|------|------|
| `theme-gateway.ts` | Save, load, delete, and list themes as `<name>-<version>.theme.json`; validates with `themeSchema`. |
| `debounced-theme-persist-gateway.ts` | Schedules theme persist callbacks after a short delay; cancels superseded pending writes. |

## Call flow

```
Operation → ThemeGateway → FileSystemService → Electron IPC
Operation → DebouncedThemePersistGateway (timer) → caller-supplied persist callback
```

## Boundaries

- **In scope:** path conventions, JSON serialization, zod parsing, debounced persist scheduling.
- **Out of scope:** theme edit rules, color resolution, undo — see `src/domain/theme/` and related operations.

For gateway-layer conventions see the parent [README](../README.md).
