# Functionality Reference

## Theme template workflow

- Edit template metadata, variables, and bindings in UI.
- Save/load workspace templates via local API endpoints.
- Persist preview session state into template JSON.

## Generation workflow

- Generate dark + light outputs from one template.
- Respect strategy semantics: `raw`, `deriveContrast`, `copyFromDark`.
- Export strict JSON with deterministic formatting.
- Apply safe write rules (atomic temp-write + rename).

## Preview workflow

- Side-by-side dark/light preview.
- Sample files from `examples/` (TS/JSON/MD/PS1/Rust).
- Output summary preview before write.

## Catalog workflow

- Maintain pinned source URLs and version policy.
- Sync local+remote snapshot.
- Validate snapshot quality and show drift warnings.
- Use catalog-driven key insertion and full-coverage binding generation.

## Action routing workflow

- All user-triggered mutations flow through the `ActionQueue` in `app/actions/`.
- `AppContext` wires the queue to `createActionProcessor` from `handler-registry.ts`.
- `handler-registry.ts` routes each action to the correct domain handler by prefix (`APP_`, `CATALOG_`, `TEMPLATE_`, `THEME_`).
- Each domain handler (`app-handler.ts`, etc.) routes to the appropriate controller via an exhaustive switch.
- Controllers compose validations and operations to fulfill the action.

## Undo workflow (infrastructure ready; full undo deferred)

- `UndoManagerV2` manages named stacks (one per page/artifact version) with LRU in-memory caching and on-disk persistence.
- `UndoProcessor` applies and reverts `UndoAction` frames. Currently, only `NOOP` is handled.
- `performUndo`, `performRedo`, and `performHistoryGoTo` operations and their controller wrappers are implemented and tested.
- `clearPersistedUndo` is called on app load/unload (via app controller).
- Full undo (domain-specific `UndoAction` types, `applyProcessor`/`revertProcessor`, frame pushes from mutative controllers) is deferred.

## Form state workflow

- All form inputs that dispatch actions are backed by `AppState` fields in the relevant state slice.
- Reducer cases in `reducer.ts` update these fields via `AppStateUpdate` discriminated union.
- No component maintains a local `useState` for values that flow through the action queue.
