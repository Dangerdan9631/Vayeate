# Plan: Vayeate Theme Studio Architecture Cleanup

**TL;DR**: Restructure the Theme Studio app into strictly layered, ts-arch-enforced modules. Split the 600-line action processor into per-domain handlers, make controllers pure operation+validation compositors, centralize all UI state through the action queue, implement command-based undo, and update all agent documentation.

## Guiding Principles

- **Every layer has one job** — UI events, action routing, orchestration, atomic logic, I/O abstraction.
- **Boilerplate is fine** — a one-liner controller wrapping a one-liner operation is acceptable if it keeps the boundary clean.
- **ts-arch enforces everything** — if a rule isn't tested, it will drift.
- **One action = one behavior** — no conditional branching based on optional fields.
- **All user-triggered events flow through the action queue** — no component-owned side effects.

## Target Architecture

```
model/              → Pure types & schemas (ZERO deps)
gateway/            → I/O boundary (depends on model ONLY)
  data/             → Repositories (file I/O)
  services/         → IPC bridges (renderer ↔ main)
domain/
  state/            → State types & reducers (depends on model ONLY)
  utils/            → Pure domain logic (depends on model ONLY)
  core/             → UndoManagerV2 + UndoProcessor (depends on model + state)
  validations/      → Pure validators (depends on model + state)
  operations/       → Atomic units: setState + service calls (depends on state + gateway/services)
  controllers/      → Compose operations + validations (depends on operations + validations; NEVER gateway)
app/
  actions/          → Action type union + ActionQueue (depends on model)
  handlers/         → Per-domain action → controller routing (depends on controllers; NEVER operations/gateway)
  viewmodel/        → State → UI derivation hooks (depends on model + domain/state)
  ui/
    context/        → AppContext (lean), slice contexts, UndoContext
    components/     → React components
    pages/          → Page components
    utils/          → UI utilities (eyedropper, etc.)
```

### Dependency Rules (will be enforced by ts-arch)

| Module | May depend on | Must NOT depend on |
|--------|--------------|-------------------|
| `model/` | nothing | everything |
| `gateway/data/` | model | domain, app, gateway/services |
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

---

## Phase 1: Handler Extraction

*Goal: Eliminate the 600-line switch in AppContext.tsx. No behavior changes.*

### Steps

1. **Create handler type infrastructure** — `app/handlers/handler-types.ts`
   - Define `HandlerDeps` interface: `{ setState, getState, setStoreState, setUiState }`
   - Define type-extracted action subsets using `Extract<AppActionV2, { type: `CATALOG_${string}` }>` for each domain
   - Export `ActionHandler<T>` type alias: `(action: T, deps: HandlerDeps) => Promise<void>`

2. **Create per-domain handler files** (*parallel with each other*)
   - `app/handlers/app-handler.ts` — handles `APP_*` actions (app lifecycle, menus, window chrome)
   - `app/handlers/catalog-handler.ts` — handles `CATALOG_*` actions
   - `app/handlers/template-handler.ts` — handles `TEMPLATE_*` actions
   - `app/handlers/theme-handler.ts` — handles `THEME_*` actions
   - Each file: import its domain's controller, exhaustive switch on its action subset
   - Copy the existing case logic verbatim from AppContext

3. **Create handler registry** — `app/handlers/handler-registry.ts`
   - Import all per-domain handlers
   - Export `createActionProcessor(deps: HandlerDeps)` that routes by action type prefix to the correct handler
   - This replaces `createActionProcessorV2` in AppContext

4. **Slim down AppContext.tsx**
   - Remove all controller/operation imports
   - Remove the 600-line `createActionProcessorV2` function
   - Import `createActionProcessor` from handler registry
   - AppContext retains: state reducers, `useReducer`, context providers, window event listeners, queue setup
   - Target: AppContext.tsx under 150 lines

### Relevant files
- [AppContext.tsx](vayeate-theme-studio/src/app/ui/context/AppContext.tsx) — extract switch cases from `createActionProcessorV2` (lines 58–800)
- [action-types.ts](vayeate-theme-studio/src/app/actions/action-types.ts) — add Extract type aliases for each domain

### Verification
- All existing tests pass (`npm run test`)
- AppContext.tsx is under 200 lines
- Each handler file has an exhaustive switch (TypeScript error if a case is missing)
- Build succeeds (`npm run build`)

---

## Phase 2: Action Cleanup

*Goal: One action = one behavior. No overloaded actions. All events through processor.*

### Steps

1. **Split overloaded actions** — analyze and split each action that has conditional behavior based on optional fields:
   - `CATALOG_TOKENS_TOKEN_KEY_TEXT_ON_CHANGE` → split into `CATALOG_TOKENS_EXISTING_TOKEN_KEY_TEXT_ON_COMMIT` (edit existing, with required `key` + `tokenType`) and `CATALOG_TOKENS_NEW_TOKEN_KEY_TEXT_ON_CHANGE` (set new token key input)
   - `TEMPLATE_MAPPING_TOKEN_GROUP_LIST_ON_COMMIT` → split into `TEMPLATE_MAPPING_EXISTING_TOKEN_GROUP_LIST_ON_COMMIT` (with required `tokenKey` + `tokenType`) and `TEMPLATE_MAPPING_TOKEN_GROUP_SELECTION_ON_COMMIT` (UI selection)
   - `TEMPLATE_MAPPING_TOKEN_COLOR_VARIABLE_LIST_ON_COMMIT` → split into per-purpose actions (existing token assignment vs. filter selection)
   - `TEMPLATE_MAPPING_TOKEN_CONTRAST_VARIABLE_LIST_ON_COMMIT` → same pattern
   - `TEMPLATE_MAPPING_SEMANTIC_TOKEN_ADD_VARIANT_BUTTON_ON_CLICK` → require semantic type (remove conditional on `action.tokenKey ?? action.semanticType`)
   - `TEMPLATE_MAPPING_SEMANTIC_TOKEN_MODIFIER_LIST_ON_COMMIT` → require tokenKey
   - `TEMPLATE_MAPPING_SEMANTIC_TOKEN_LANGUAGE_LIST_ON_COMMIT` → require tokenKey
   - `TEMPLATE_MAPPING_SEMANTIC_TOKEN_VARIANT_REMOVE_BUTTON_ON_CLICK` → require tokenKey or variantId
   - `TEMPLATE_GROUP_ADD_BUTTON_ON_CLICK` → require name (not optional)
   - `TEMPLATE_GROUP_REMOVE_BUTTON_ON_CLICK` → require groupId
   - `TEMPLATE_VARIABLES_ADD_VARIABLE_BUTTON_ON_CLICK` → require key
   - `TEMPLATE_VARIABLES_GROUP_LIST_ON_COMMIT` → require variableKey
   - `TEMPLATE_VARIABLES_REMOVE_BUTTON_ON_CLICK` → require key
   - `TEMPLATE_VARIABLES_CONTRAST_SOURCE_LIST_ON_COMMIT` → require contrastVariableKey
   - `THEME_PALETTE_SWATCH_GROUP_SELECT_CHECKBOX_ON_TOGGLE` → split into `_FULL_SELECT` and `_GROUP_SELECT` variants
   - All theme variable actions with optional `ref` → require ref

2. **Make no-op actions real** — for each of the 18 no-ops, add handler logic:
   - **Form text no-ops** (`TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE`, `TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE`): Add state fields to track form input values; handler calls controller to set them
   - **Color picker/eyedropper button clicks** (6 actions): Handler sets an "open picker" state flag; component reads flag to show/hide picker
   - **Text on-change without commit** (8 actions): Handler stores draft value in state for potential validation display
   - **ColorScheme toggle** (`APP_BAR_THEME_CHECKBOX_ON_TOGGLE`): ~~localStorage removed (hotfix: persists to `data/config.json` via `config:save`/`config:loadSync` IPC; `ColorSchemeContext` standalone mode no longer persists).~~ Remaining: extract direct `window.electronAPI?.saveConfig` call in handler into `gateway/services/config-service.ts` → `domain/operations/app-operations/saveColorScheme.ts` → controller → handler calls controller. Remove or simplify `ColorSchemeContext` standalone fallback.

3. **Update components to dispatch new action types** — for each split action, update the dispatching component to use the correct specific action type

4. **Update viewmodels** — update dispatch wrappers to match new action types

### Relevant files
- [action-types.ts](vayeate-theme-studio/src/app/actions/action-types.ts) — modify AppActionV2 union
- All handler files from Phase 1 — update switch cases
- All components that dispatch split/changed actions
- [ColorSchemeContext.tsx](vayeate-theme-studio/src/app/ui/context/ColorSchemeContext.tsx) — migrate to processor-handled
- [app-state.ts](vayeate-theme-studio/src/domain/state/app-state.ts) — add color scheme, form draft, picker state fields
- [reducer.ts](vayeate-theme-studio/src/domain/state/reducer.ts) — add reducer cases for new state fields

### Verification
- TypeScript compilation succeeds (exhaustive switches catch any missed cases)
- All existing tests pass
- No conditional branching on optional fields in any handler case
- Manual verification: each UI interaction still works end-to-end

---

## Phase 3: Controller/Operation Boundary

*Goal: Controllers ONLY compose operations + validations. All service/gateway calls inside operations. No direct service calls from controllers.*

### Steps

1. **Audit all controllers for direct service calls** — search for any `import` from `gateway/services/` in controller files
   - Currently: controllers like `saveCatalog`, `createCatalog`, etc. may call services directly
   - For each found call: extract into an operation if one doesn't exist, or reuse existing

2. **Create missing operations** — for each service call found in controllers that isn't already an operation:
   - Create a new operation file in the appropriate `operations/` subdirectory
   - The operation wraps the service call + any associated setState
   - Follow existing pattern: `export async function operationName(setState: SetState, ...params) { ... }`

3. **Refactor controllers** — replace direct service calls with operation calls

4. **Audit controllers for direct state access** — controllers should receive state via `getState()` parameter, not import state modules directly. Verify this pattern.

5. **Move `_helpers.ts` logic** — controller helpers that compose operations are really sub-controllers. Either:
   - Inline them into the controller files that use them, OR
   - Rename to be explicit about their role (e.g., `catalog-controller/shared-flows.ts`)

### Relevant files
- All files in `domain/controllers/*/` — audit and refactor
- All files in `domain/operations/*/` — create missing operations
- `domain/controllers/*/_helpers.ts` — refactor or restructure

### Verification
- `grep -r "gateway/services" src/domain/controllers/` returns zero matches
- `grep -r "gateway/data" src/domain/controllers/` returns zero matches
- ts-arch test passes: controllers must not depend on gateway
- All existing tests pass

---

## Phase 4: Undo System (Infrastructure Verification)

*Goal: Verify the undo infrastructure exists and is tested. Full command-based undo with action types and controller integration is deferred until after all other phases are complete.*

> **Scope note**: The undo manager, processor, operations, and controller all exist. Nothing pushes frames to the stack yet. Full undo (defining domain-specific `UndoAction` types, implementing real `applyProcessor`/`revertProcessor`, and wiring push calls into mutative controllers) is **deferred post-plan**.

### Steps — COMPLETED

1. ~~**Define undo action types**~~ — **DEFERRED** — `UndoAction` union currently contains only `UndoActionNoop`. Real action types (`REPLACE_CATALOG`, `REPLACE_TEMPLATE`, `REPLACE_THEME`, etc.) will be added in a follow-on effort after this plan is complete.

2. ~~**Implement UndoProcessor**~~ — **DEFERRED** — `createUndoProcessor` in `undo-processor.ts` handles only `NOOP`. Real `applyProcessor`/`revertProcessor` logic is deferred.

3. ~~**Create undo-aware operation wrappers**~~ — **DEFERRED** — No `withUndo` wrappers or before/after snapshot captures in operations yet.

4. ~~**Integrate into controllers**~~ — **DEFERRED** — No undo frame pushes from any controller.

5. **Verify undo infrastructure** — ✅ Done
   - `UndoManagerV2`: stacks, frames, LRU, persistence adapter all tested (`undo-manager-v2.test.ts`)
   - `performUndo` / `performRedo` / `performHistoryGoTo` operations tested (`undo-operations.test.ts`)
   - `performUndo` / `performRedo` / `performHistoryGoTo` controller wrappers tested (`undo-controller.test.ts`)
   - `createUndoProcessor` NOOP behaviour tested (`undo-processor.test.ts`) — **added in this phase**

### Relevant files
- [undo-manager-v2.ts](vayeate-theme-studio/src/domain/core/undo-manager-v2.ts) — fully implemented
- [undo-processor.ts](vayeate-theme-studio/src/domain/core/undo-processor.ts) — NOOP stub; real actions deferred
- [undo-processor.test.ts](vayeate-theme-studio/src/domain/core/undo-processor.test.ts) — added in this phase
- [undo-controller/](vayeate-theme-studio/src/domain/controllers/undo-controller/) — wires operations; verified

### Verification — PASSED
- All 495 tests pass (`npm run test`)
- `undo-processor.test.ts` 5/5 — `createUndoProcessor` applyProcessor/revertProcessor do not throw and do not call `setState` for NOOP

---

## Phase 5: Form State & UI State Centralization

*Goal: All form state managed through AppState. No component-local form state for user inputs that flow through the action queue.*

### Steps

1. **Identify component-local state** that should be centralized:
   - `ColorSchemeContext` — theme preference (light/dark); ~~localStorage replaced with `data/config.json` IPC (hotfix)~~; remaining: simplify or remove standalone fallback mode
   - Template group name input (currently local in GroupsCard)
   - Template variable name input (currently local in component)
   - Any other local `useState` that represents a form field the user can submit

2. **Add state fields** to `AppState` (or appropriate sub-state):
   - `ui.colorScheme: 'light' | 'dark'`
   - `templates.addGroupName: string`
   - `templates.addVariableName: string`
   - Draft text fields for text inputs that currently have no server-side storage
   - Picker/eyedropper open state flags: `themes.isColorPickerOpen`, `themes.colorPickerContext`, etc.

3. **Add reducer cases** for each new field

4. **Create operations** for setting each new field

5. **Create controller methods** for orchestrating form-related flows

6. **Wire handlers** to call the correct controllers

7. **Simplify or remove** `ColorSchemeContext` — either:
   - Remove entirely; color scheme is just a field in AppState read via `useAppState`
   - Or keep as a thin read-only context that derives from AppState

8. **Update components** — replace local `useState` with state from context; dispatch actions instead of calling local handlers

### Relevant files
- [ColorSchemeContext.tsx](vayeate-theme-studio/src/app/ui/context/ColorSchemeContext.tsx) — migrate or remove
- [app-state.ts](vayeate-theme-studio/src/domain/state/app-state.ts) — add fields
- [ui-state.ts](vayeate-theme-studio/src/domain/state/ui-state.ts) — add fields
- [reducer.ts](vayeate-theme-studio/src/domain/state/reducer.ts) — add cases
- Components: `GroupsCard.tsx`, `ThemePaletteCard.tsx`, others with local form state

### Verification
- `ColorSchemeContext` either removed or simplified to read-only
- No component has local `useState` for a value that gets dispatched through the action queue
- All tests pass

---

## Phase 6: ts-arch Test Enforcement

*Goal: Comprehensive ts-arch tests that enforce the full dependency matrix. Any boundary violation fails the build.*

### Steps

1. **Fix existing tests** — the current `app.architecture.test.ts` has a pattern `'^(?!src/app/context/AppContext).*'` that doesn't match the actual path `src/app/ui/context/AppContext`. Fix it.

2. **Add handler boundary tests**:
   - `app/handlers/` must not depend on `domain/operations/`
   - `app/handlers/` must not depend on `gateway/`
   - `app/handlers/` must not depend on `domain/validations/`
   - `app/handlers/` must not depend on `domain/state/` (runtime; type imports are OK but ts-arch can't distinguish — use best judgment)

3. **Add controller boundary tests**:
   - `domain/controllers/` must not depend on `gateway/` (NEW — currently violated)
   - `domain/controllers/` must not depend on `app/`
   - `domain/controllers/` must not depend on `domain/core/` (undo manager accessed through operations)

4. **Add operation boundary tests**:
   - `domain/operations/` must not depend on `gateway/data/` (only services)
   - `domain/operations/` must not depend on `domain/controllers/`
   - `domain/operations/` must not depend on `app/`

5. **Add viewmodel boundary tests**:
   - `app/viewmodel/` must not depend on `domain/controllers/`
   - `app/viewmodel/` must not depend on `domain/operations/`
   - `app/viewmodel/` must not depend on `gateway/`

6. **Add UI boundary tests**:
   - `app/ui/components/` must not depend on `domain/controllers/`
   - `app/ui/components/` must not depend on `domain/operations/`
   - `app/ui/components/` must not depend on `gateway/`

7. **Add intra-domain isolation tests**:
   - `domain/utils/` must not depend on `domain/operations/`, `domain/controllers/`, `domain/core/`
   - `domain/state/` must not depend on anything in `domain/` except model
   - `domain/validations/` must not depend on `domain/operations/`, `domain/controllers/`

8. **Keep cycle-free test** — existing `architecture-cycle.test.ts` stays

### Relevant files
- [app.architecture.test.ts](vayeate-theme-studio/test/app.architecture.test.ts) — fix + expand
- [domain.architecture.test.ts](vayeate-theme-studio/test/domain.architecture.test.ts) — expand
- [gateway.architecture.test.ts](vayeate-theme-studio/test/gateway.architecture.test.ts) — keep
- [model.architecture.test.ts](vayeate-theme-studio/test/model.architecture.test.ts) — keep
- [architecture-cycle.test.ts](vayeate-theme-studio/test/architecture-cycle.test.ts) — keep
- New: `test/handler.architecture.test.ts`, `test/viewmodel.architecture.test.ts`

### Verification
- `npm run test` passes with all new rules
- Intentionally break a boundary → test fails
- All rules from the dependency matrix table are covered

---

## Phase 7: Documentation & Agent Rules Update

*Goal: All agent instruction files reflect the new architecture. An agent reading any entrypoint gets correct guidance.*

### Steps

1. **Update `.github/copilot-instructions.md`** — reflect new handler layer, updated architecture pointers

2. **Update `AGENTS.md`** — update routing table (handler tasks → handler files), architecture map, layer dependency list

3. **Update `.github/agent-docs/architecture.md`** — full rewrite of layer descriptions, dependency rules, data flow diagram

4. **Update `.github/agent-docs/conventions.md`** — add handler conventions, action naming conventions (no overloaded actions), controller rules (no gateway imports)

5. **Update `.github/agent-docs/edge-cases.md`** — add notes about undo integration, form state centralization

6. **Update `.github/agent-docs/functionality.md`** — reflect undo capabilities, centralized form state

7. **Update `.cursor/rules/vayeate-theme-studio-architecture.mdc`** — full rewrite with new layers

8. **Update `.cursor/rules/vayeate-theme-studio-action-queue.mdc`** — reflect handler pattern, no-op elimination, action splitting rules

9. **Update `.cursor/rules/vayeate-theme-studio-operations.mdc`** — reinforce that operations are the ONLY place for gateway calls

10. **Update `.cursor/rules/vayeate-theme-studio-undo.mdc`** — document command-based undo pattern

11. **Update `.cursor/rules/ts-arch.mdc`** — add the full dependency matrix as reference

12. **Update or create `.cursor/skills/` files** — update add-app-action skill to reference handlers instead of AppContext

13. **Update `vayeate-theme-studio/docs/` files** — technical-implementation.md, overview.md as needed

### Verification
- An agent reading AGENTS.md → copilot-instructions.md → architecture.md gets a consistent, correct picture
- No doc references AppContext as the action processing location
- All routing tables point to correct files

---

## Phase Execution Order & Dependencies

```
Phase 1: Handler Extraction ─────────────────────┐
                                                   │
Phase 2: Action Cleanup ──── depends on Phase 1 ──┤
                                                   │
Phase 3: Controller/Op Boundary ── parallel w/ 2 ──┤
                                                   │
Phase 4: Undo System ──── depends on Phase 3 ──────┤
                                                   │
Phase 5: Form State ──── depends on Phase 2 ───────┤
                                                   │
Phase 6: ts-arch ──── depends on Phases 1-5 ───────┤
                                                   │
Phase 7: Documentation ──── depends on all ────────┘
```

- Phases 2 and 3 can run in parallel after Phase 1
- Phase 4 depends on Phase 3 (clean operation boundary needed for undo wrapping)
- Phase 5 depends on Phase 2 (no-ops converted to real actions first)
- Phase 6 should run last among code phases (validates everything)
- Phase 7 last (documents the final state)

---

## Decisions

- **Handlers use type-extracted action subsets** — `Extract<AppActionV2, { type: `CATALOG_${string}` }>` — for exhaustive type checking per handler
- **Command-based undo** — each undo action carries `before`/`after` values; more boilerplate but precise
- **Controllers never call gateway directly** — all I/O through operations
- **All UI events go through action queue** — no component-owned side effects (ColorScheme, form inputs)
- **Prefer boilerplate for clarity** — one-liner controller that wraps a one-liner operation is OK

## Scope Boundaries

**Included:**
- All structural changes to `vayeate-theme-studio/src/`
- ts-arch tests in `vayeate-theme-studio/test/`
- All agent docs in `.github/`, `.cursor/`, `vayeate-theme-studio/docs/`
- Undo system completion
- Form state centralization
- ColorScheme migration (localStorage → disk IPC hotfix done; proper layering in Phase 2)

**Excluded:**
- Root extension packaging (`package.json`, `themes/` generation pipeline)
- Electron main process (`electron/main.ts`, `electron/preload.ts`) — minimal `config:save`/`config:loadSync` IPC added as hotfix for localStorage removal; no further structural changes
- Domain business logic changes (color math, theme generation, catalog sync)
- New features — this is purely restructuring + completing existing scaffolding
- UI redesign — component appearance stays the same
