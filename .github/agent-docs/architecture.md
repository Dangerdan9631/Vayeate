# Architecture Reference

## Root extension surface

- Manifest and contribution contract: `package.json`
- Published themes: `themes/*.json`
- Extension host launch profile: `.vscode/launch.json`

## Standalone Theme Studio surface

- App root: `vayeate-theme-studio/`
- **Model** (`src/model/`): Zod schemas and types. No dependencies on app, domain, or gateway. Files: schemas.ts, theme.ts, template.ts, catalog.ts, preview-types.ts, semantic-token.ts, etc.
- **Domain** (`src/domain/`; must not depend on `src/app/`): controllers, core, operations, state, validations, utils.
  - **`domain/state/`**: AppState types and reducers. Depends on model only.
  - **`domain/utils/`**: Pure domain logic — theme engine, color, tokenizer, scope resolution, etc. Depends on model only.
  - **`domain/core/`**: UndoManagerV2 and UndoProcessor. Depends on model and state.
  - **`domain/validations/`**: Pure validators. Depends on model and state. Must NOT depend on operations, controllers, or gateway.
  - **`domain/operations/`**: Wraps gateway/services calls + setState. May depend on model, state, and `gateway/services`. Must NOT depend on `gateway/data`, controllers, or app. Files are organized into card-aligned subdirectories mirroring the controller structure (e.g. `theme-list/`, `palette/`); each subdirectory exports via its own `index.ts`.
  - **`domain/controllers/`**: Compose operations + validations only. Must NOT depend on gateway (directly). Must NOT import from `gateway/services/` or `gateway/data/`. Files are organized into card-aligned subdirectories (e.g. `theme-list/`, `palette/`, `variables/`); each subdirectory exports via its own `index.ts`. Only `shared-flows.ts`, the test file, and the root `index.ts` remain at the controller domain root.
  - Shared helper flows within a controller domain live in `<domain>-controller/shared-flows.ts` (not `_helpers.ts`).
- **Gateway** (`src/gateway/`; must not depend on `src/domain/`): per-area gateways (theme, template, catalog, config, preview, catalog sync) and `services/` (IPC). Gateways persist via `FileSystemService`; `gateway/data/` is reserved (empty aside from `.gitkeep`). Architecture tests still treat `gateway/data` and `gateway/services` as independent layers.
- **App** (`src/app/`): Actions, handlers, viewmodels, and UI. Must not depend on gateway; uses state and domain only.
  - **`app/actions/`**: `AppActionV2` discriminated union + `ActionQueue`. Depends on model only.
  - **`app/handlers/`**: Per-domain handler files (`app-handler.ts`, `catalog-handler.ts`, `template-handler.ts`, `theme-handler.ts`) + `handler-registry.ts`. Routes actions to controllers. Must NOT depend on gateway, operations, validations, or state directly.
    - `handler-types.ts` defines `HandlerDeps` and domain-scoped `Extract` type aliases (`AppAction`, `CatalogAction`, `TemplateAction`, `ThemeAction`).
  - **`app/viewmodel/`**: Custom hooks that derive display data from state.
  - **`app/ui/`**: React components, pages, and context providers. `AppContext.tsx` is a lean provider (~150 lines); it no longer contains the action processor switch.
- Core (domain): undo only.
  - undo manager: `vayeate-theme-studio/src/domain/core/undo-manager-v2.ts`
  - undo processor: `vayeate-theme-studio/src/domain/core/undo-processor.ts` (currently NOOP; full undo action types deferred)
- Utils (domain): theme engine, color, tokenizer, scope, merge, etc.
  - color math and contrast: `vayeate-theme-studio/src/domain/utils/color.ts`
  - generation logic: `vayeate-theme-studio/src/domain/utils/theme-generator.ts`
  - export safety: `vayeate-theme-studio/src/domain/utils/theme-exporter.ts`
  - scope resolution: `vayeate-theme-studio/src/domain/utils/scope-resolver.ts`
  - tokenizer: `vayeate-theme-studio/src/domain/utils/tokenizer.ts`
  - theme-parser: `vayeate-theme-studio/src/domain/utils/theme-parser.ts`
  - template-catalog-merge: `vayeate-theme-studio/src/domain/utils/template-catalog-merge.ts`
  - theme-template-merge, semantic-token, color-clustering: `vayeate-theme-studio/src/domain/utils/`
  - logger, version: `vayeate-theme-studio/src/domain/utils/`
- Catalog sync: `vayeate-theme-studio/src/gateway/catalog/token-sync-gateway.ts`
- UI and Electron:
  - main editor shell: `vayeate-theme-studio/src/app/ui/App.tsx`
  - components: `vayeate-theme-studio/src/app/ui/components/`
  - Electron main/preload: `vayeate-theme-studio/electron/`

## Dependency Rules (enforced by ts-arch)

| Module | May depend on | Must NOT depend on |
|--------|--------------|-------------------|
| `model/` | nothing | everything |
| `gateway/services/` | model | domain, app, gateway/data |
| `domain/state/` | model | gateway, domain/*, app |
| `domain/utils/` | model | gateway, domain (except utils-internal), app |
| `domain/core/` | model, state | gateway, operations, controllers, app |
| `domain/validations/` | model, state | gateway, operations, controllers, app |
| `domain/operations/` | model, state, gateway/services | gateway/data, controllers, app |
| `domain/controllers/` | model, operations, validations | gateway, state (direct), core, app |
| `app/actions/` | model | domain, gateway |
| `app/handlers/` | controllers | operations, gateway, validations, state |
| `app/viewmodel/` | model, state, app/ui/context | controllers, operations, gateway |
| `app/ui/` | viewmodel, actions, handlers, model | domain (except through viewmodel), gateway |

## Data Flow

```
UI dispatch(action) → ActionQueue.enqueue → AppContext processor → handler-registry → domain handler → Controller → Operations
                                                                                                                        ↓
                                                               setState / persist / undo (via operations)
                                                                                                                        ↓
UI ← ViewModel ← State (setState/setWindowState apply the appropriate reducer)
```

## State and reducers

- **Single app state**: There is one `AppState` value. React holds it via one `useReducer` (or equivalent) that simply replaces state with the next value; it does not interpret update types.
- **Multiple reducers**: Each slice of state has its own reducer (e.g. `appStateReducer`, `windowStateReducer`). Each reducer has signature `(state: AppState, update: X) => AppState` and is responsible for updating only its portion of `AppState`; it still accepts and returns the whole `AppState`.
- **Never combine**: Do not create a combined reducer or a single dispatch that routes to different reducers based on update type.
- **Caller uses the right reducer**: Each caller knows what it is updating and holds the appropriate setter (e.g. `setState` for `AppStateUpdate`, `setWindowState` for `WindowStateUpdate`).

## Data artifacts

- Templates: `vayeate-theme-studio/data/templates/`
- Themes: `vayeate-theme-studio/data/themes/`
- Catalogs: `vayeate-theme-studio/data/catalogs/`
