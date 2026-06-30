# Domain core

Shared undo-history primitives used across catalog, template, and theme flows. This folder holds stack mechanics, diff processors, persistence scheduling, and the multi-stack manager — not UI state or disk I/O adapters.

## Modules

| Module | Role |
|--------|------|
| `undo-stack-types.ts` | Shared types, defaults, and `createFrameId` for undo frames and manager configuration. |
| `undo-stack.ts` | In-memory undo stack: push, undo, redo, go-to, coalescing, and capped persist snapshots. |
| `undo-processor.ts` | Routes each undo diff to a registered handler by `actionType`. |
| `undo-stack-persist-scheduler.ts` | Coalesces and enqueues background persist jobs per stack id. |
| `undo-manager-v2.ts` | LRU-managed collection of stacks with optional persistence hydration and flush. |

## Typical flow

Operations record edits through `undoManagerV2.getOrCreate(contextKey, { processor })`, then `stack.push(entry)`. Undo/redo operations call `stack.undo()` / `stack.redo()`; the active processor applies or reverts diffs. When a persistence adapter is configured, stack changes schedule debounced writes via the persist scheduler.

Gateway-layer adapters implement `UndoPersistenceAdapter` for load/save/clear. Domain code should depend on these interfaces and the shared `undoManagerV2` singleton rather than duplicating stack logic.

## Boundaries

- **In scope:** frame lists, transition results, processor dispatch, LRU eviction, persist scheduling.
- **Out of scope:** React/UI undo menus, zustand undo summary stores, zod model schemas (`src/model/undo-history`), and raw file/IPC access (gateways and `src/domain/operations/undo-operations/`).
