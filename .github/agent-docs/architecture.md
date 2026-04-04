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
  - **`app/actions/`**: `AppAction` discriminated union (`app-action.ts`), `ActionQueue`, `handler-registry.ts` (`ActionProcessor`), per-domain handler classes (`*-handler.ts`), and `handler-types.ts`. Handlers route to controllers only; they must NOT depend on gateway, operations, or validations. `handler-types.ts` holds domain-scoped `Extract` aliases (`AppAction`, `CatalogAction`, `TemplateAction`, `ThemeAction`) and `ActionHandler<T>`. Slice `*StateSetter` / `*StateGetter` classes are registered from `AppContext.tsx` and injected into controllers as needed.
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
| `app/actions/` | model, controllers | gateway, operations, validations |
| `app/viewmodel/` | model, state, app/ui/context | controllers, operations, gateway |
| `app/ui/` | viewmodel, actions, handlers, model | domain (except through viewmodel), gateway |

## Data Flow

```
UI dispatch(action) → ActionQueue.enqueue → AppContext processor → handler-registry → domain handler → Controller → Operations
                                                                                                                        ↓
                                                               slice setters / persist / undo (via operations)
                                                                                                                        ↓
UI ← ViewModel ← State (each slice setter applies its slice reducer)
```

## State and reducers

- **Single app state**: One `AppState` aggregate: `catalogs`, `templates`, `themes`, `appConfig`, `undoStack`, `ui`, `window` (no top-level `store`). React holds it via one `useReducer` that replaces state wholesale.
- **Per-slice reducers and setters**: No root `AppStateSetter` / `AppStateGetter` or monolithic `AppStateUpdate`. Each slice has its own update union, reducer function, and `*StateSetter` / `*StateGetter` classes in the same `*-state-reducer.ts` module. Catalog, template, and theme slices own ref maps (`catalogMap`, `templateMap`, `themeMap`).
- **`AppConfig` vs `AppConfigState`**: Gateway uses schema `AppConfig`; runtime slice is `AppConfigState`; operations map at load/save.
- **Undo**: `AppState.undoStack` holds `UndoStackState`.
- **Never combine**: No single dispatch that routes every update type; callers use the slice API that matches their writes.

## Data artifacts

- Templates: `vayeate-theme-studio/data/templates/`
- Themes: `vayeate-theme-studio/data/themes/`
- Catalogs: `vayeate-theme-studio/data/catalogs/`
