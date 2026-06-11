# Legacy shared state

Zustand vanilla stores and state shapes for cross-cutting or not-yet-migrated concerns. New domain-specific state should prefer `src/domain/<business-domain>/state/` or `src/domain/ui/<flow>/state/`; this folder remains the home for shared legacy stores until migrated.

## Layout

| Folder | Role |
|--------|------|
| `data/` | Persisted entity caches — themes, templates, and app configuration. |
| `ui/` | Editor and shell UI state — tabs, dialogs, pane selections, queues, window geometry, and overlays. |
| `undo-stack/` | Undo stack identity, menu snapshot, and per-tab context for history navigation. |

Each concept is split into a `*-state.ts` module (types and initial values) and a `*-store.ts` module (`@singleton()` store class with immer-backed mutations).

## Store contract

- Built with `createStore(...)` and `immer(...)` from zustand.
- Expose `api` for React subscriptions via viewmodels and `getStore()` for domain reads and writes.
- Mutation methods live on the object returned by `getStore()`; only **operations** call those methods.
- Controllers and validations may read snapshots; they must not mutate store state.

Pure selectors and helpers colocated in `*-state.ts` or `*-store.ts` operate on state shapes without mutating stores.

## Boundaries

- No React imports in this folder.
- Queue observability stores (`action-queue-ui-store`, `background-queue-ui-store`) are updated only from their queue implementations, not from normal operations or UI.
- Entity data in `data/` stores is authoritative in memory; persistence is handled by operations through gateways.

For full zustand conventions and consumer access rules, see [AGENTS.md](../../../AGENTS.md) and `.agents/skills/modify-state/SKILL.md`.
