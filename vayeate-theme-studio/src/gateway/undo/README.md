# Undo gateway

Implements undo stack persistence under `data/.undo/`. Each stack is stored as a sanitized JSON file keyed by stack id.

## Modules

| File | Role |
|------|------|
| `undo-gateway.ts` | Extends `UndoPersistencePort`; save, load, delete, list, and clear persisted undo stacks. |

## Call flow

```
Undo operation → UndoGateway → FileSystemService → Electron IPC
```

## Boundaries

- **In scope:** stack file paths, id sanitization, JSON payload I/O, bulk clear of persisted stacks.
- **Out of scope:** undo entry shape, replay logic, stack selection — see `src/domain/operations/undo-operations/`.

For gateway-layer conventions see the parent [README](../README.md).
