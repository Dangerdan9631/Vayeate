# Plan: Convert Gateway Services to @singleton() Classes with DI

## TL;DR
Convert all 10 exported service objects/functions in `gateway/services/` into tsyringe `@singleton()` classes. Update all importing operations, `main.tsx`, and related tests to inject the classes via constructor instead of importing the module-level const.

---

## Pattern Reference

**From (module const):**
```
export const catalogService = { loadCatalog: async (...) => { ... } }
```

**To (@singleton class):**
```
@singleton()
export class CatalogService {
  private getAPI() { ... }
  async loadCatalog(...) { ... }
}
```

**Operation consumer change:**
- Remove direct import of service const
- Add `CatalogService` (or relevant class) to constructor
- Replace `catalogService.method()` with `this.catalogService.method()`

**Test change:**
- Replace `vi.mock('./catalog-service')` + setting `catalogService.method = vi.fn()` with
  `container.registerInstance(CatalogService, { method: vi.fn() } as any)` in `beforeEach`

---

## Services to Convert

| File | Current Export | New Class | Decorator | Injects |
|------|---------------|-----------|-----------|---------|
| `catalog-service.ts` | `catalogService` const | `CatalogService` | `@singleton()` | — |
| `theme-service.ts` | `themeService` const | `ThemeService` | `@singleton()` | — |
| `template-service.ts` | `templateService` const | `TemplateService` | `@singleton()` | — |
| `config-service.ts` | `configService` const | `ConfigService` | `@singleton()` | — |
| `window-service.ts` | `windowService` const | `WindowService` | `@singleton()` | — |
| `undo-manager-v2-service.ts` | `undoManagerV2Service` const | `UndoManagerV2Service` | `@singleton()` | — |
| `preview-service.ts` | `previewService` const | `PreviewService` | `@singleton()` | — |
| `catalog-sync.ts` | `syncCatalogTokens` fn | `CatalogSyncService` | `@singleton()` | `CatalogService` |
| `log-service.ts` | `sendLog` fn | `LogService` | `@singleton()` | — |
| `eyedropper-service.ts` | functions | `EyedropperService` | `@singleton()` | — |

---

## Phase 1: Entity Services — Catalog, Theme, Template

### Step 1.1: Convert service files
- `catalog-service.ts`: `CatalogService` class; `getAPI()` → private method; all methods become class methods
- `theme-service.ts`: `ThemeService` class
- `template-service.ts`: `TemplateService` class

### Step 1.2: Update catalog operations (~6 files)
Each: add `CatalogService` to constructor, replace `catalogService.X()` with `this.catalogService.X()`
- `catalog-operations/catalog-details/loadCatalog.ts`
- `catalog-operations/catalog-details/saveCatalog.ts`
- `catalog-operations/catalog-details/createCatalog.ts` (or catalog-list, verify)
- `catalog-operations/catalog-details/deleteCatalog.ts` (or catalog-list, verify)
- `catalog-operations/catalog-list/loadCatalogRefs.ts`
- `catalog-operations/catalog-details/syncCatalog.ts` — also add `CatalogSyncService` (see Phase 3)

### Step 1.3: Update theme operations (~6 files)
Each: inject `ThemeService` in constructor
- `theme-operations/theme-details/loadTheme.ts`
- `theme-operations/theme-details/saveTheme.ts`
- `theme-operations/theme-list/createTheme.ts` (verify path)
- `theme-operations/theme-details/deleteTheme.ts` (verify path)
- `theme-operations/theme-list/loadThemeRefs.ts`
- `theme-operations/theme-details/generateTheme.ts`

### Step 1.4: Update template operations (~4+ files)
Each: inject `TemplateService` in constructor; grep for all usages first
- `template-operations/template-list/loadTemplateRefs.ts`
- `template-operations/template-list/deleteTemplate.ts` (verify path)
- `template-operations/template-list/createTemplate.ts` (verify path)
- `template-operations/template-list/refreshTemplateRefs.ts`
- Plus any `loadTemplate.ts`, `saveTemplate.ts` found via grep

### Step 1.5: Update tests for Phase 1
- `catalog-operations.test.ts`: service mock → `container.registerInstance(CatalogService, ...)`
- Any test that mocks `themeService` or `templateService`

---

## Phase 2: Infrastructure Services — Window, Config, UndoManagerV2, Preview

### Step 2.1: Convert service files
- `window-service.ts`: `WindowService` class; keep `WindowStateEvent` type export; event listener methods (`onWindowState`, `onWindowResize`, `onWindowMove`) become class methods
- `config-service.ts`: `ConfigService` class
- `undo-manager-v2-service.ts`: `UndoManagerV2Service` class
- `preview-service.ts`: `PreviewService` class

### Step 2.2: Update window operations (~8 files)
Each: inject `WindowService` in constructor
- `window-operations/closeWindow.ts`, `dragWindow.ts`, `toggleDevTools.ts`, `maximizeWindow.ts`, `minimizeWindow.ts`, `restoreWindow.ts`, `reloadWindow.ts`, `reloadWindowForce.ts`

### Step 2.3: Update app operations
- `app-operations/saveColorScheme.ts`: inject `ConfigService`
- `app-operations/toggleColorScheme.ts`: inject `ConfigService`

### Step 2.4: Update undo operation
- `undo-operations/clearPersistedUndo.ts`: inject `UndoManagerV2Service`; replace `undoManagerV2.configure({ persistence: undoManagerV2Service })` with `undoManagerV2.configure({ persistence: this.undoManagerV2Service })`

### Step 2.5: Update preview operation
- `theme-operations/previews/loadPreviews.ts`: inject `PreviewService`

### Step 2.6: Update tests for Phase 2
- `app-operations.test.ts`: mock `configService` → `container.registerInstance(ConfigService, ...)`
- `toggleColorScheme.test.ts`: same pattern

### Step 2.7: Check WindowService event listener usage
- Grep for `windowService.onWindowState`, `onWindowResize`, `onWindowMove` in UI components/hooks; update those callers to `container.resolve(WindowService)` or inject via context

---

## Phase 3: CatalogSyncService

### Step 3.1: Create CatalogSyncService class in catalog-sync.ts
- Add `@singleton()` class `CatalogSyncService` that injects `CatalogService`
- Single method: `sync(sources: CatalogSource[]): Promise<SyncCatalogResult>`
- Internally calls: `syncCatalogTokens(sources, (url) => this.catalogService.fetchUrl(url))`
- Keep all parse helper functions at module level (no change to them)
- Keep `syncCatalogTokens` exported for the `.test.ts` which tests it directly

### Step 3.2: Update syncCatalog.ts operation
- Remove import of `catalogService` and `syncCatalogTokens`
- Inject `CatalogSyncService` in constructor
- Remove optional `fetchUrl` param (testing will mock `CatalogSyncService` instead)
- Call `this.catalogSyncService.sync(catalog.sources)`

### Step 3.3: Update catalog-operations.test.ts
- Replace `vi.mock('...catalog-sync', ...)` with `container.registerInstance(CatalogSyncService, { sync: vi.fn() })`

---

## Phase 4: Utility Services — LogService, EyedropperService

### Step 4.1: Convert log-service.ts
- `LogService` class with `send(level: RendererLogLevel, tag: string, args: string[]): void`
- Keep `RendererLogLevel` type export

### Step 4.2: Convert eyedropper-service.ts
- `EyedropperService` class with:
  - `isAvailable(): boolean`
  - `getScreenSourcesWithBounds(): Promise<ScreenSourcesWithBounds>`
- Keep `ScreenSourcesWithBounds` and `ScreenSourceProvider` type exports

### Step 4.3: Update main.tsx
- Replace direct `sendLog()` calls with `container.resolve(LogService).send(...)`
- Replace eyedropper function imports with `container.resolve(EyedropperService)`
- Ensure `reflect-metadata` import precedes any container.resolve calls (already in main.tsx)

---

## Relevant Files

### Services (all in `vayeate-theme-studio/src/gateway/services/`)
- `catalog-service.ts`, `theme-service.ts`, `template-service.ts`, `config-service.ts`
- `window-service.ts`, `undo-manager-v2-service.ts`, `preview-service.ts`
- `catalog-sync.ts`, `log-service.ts`, `eyedropper-service.ts`

### Operations to update
- `catalog-operations/catalog-details/loadCatalog.ts`, `saveCatalog.ts`, `syncCatalog.ts`
- `catalog-operations/catalog-list/loadCatalogRefs.ts`, `createCatalog.ts`, `deleteCatalog.ts`
- `theme-operations/theme-details/loadTheme.ts`, `saveTheme.ts`, `generateTheme.ts`, `deleteTheme.ts`
- `theme-operations/theme-list/loadThemeRefs.ts`, `createTheme.ts`
- `theme-operations/previews/loadPreviews.ts`
- `template-operations/template-list/loadTemplateRefs.ts`, `deleteTemplate.ts`, `createTemplate.ts`, `refreshTemplateRefs.ts`
- `app-operations/saveColorScheme.ts`, `toggleColorScheme.ts`
- `window-operations/*.ts` (8 files)
- `undo-operations/clearPersistedUndo.ts`

### Entry point
- `vayeate-theme-studio/src/main.tsx`

### Tests
- `catalog-operations.test.ts`, `app-operations.test.ts`, `toggleColorScheme.test.ts`

---

## Verification

1. After each phase: `npm run test` from `vayeate-theme-studio/`
2. After all phases: `npm run build` from `vayeate-theme-studio/`
3. Manual smoke test: launch app, create/load a catalog, theme, template; open/close window; perform undo/redo

## Decisions
- All services use `@singleton()` (one shared instance, consistent with how existing service objects behaved)
- `catalog-sync.ts` parse helpers remain module-level functions; only a thin `CatalogSyncService` wrapper class is added
- `LogService` and `EyedropperService` converted for full consistency even though only used in `main.tsx`
- Tests updated in same phase as the service they cover
- No abstraction interfaces introduced — direct class injection, consistent with existing operations pattern
