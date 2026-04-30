# Vayeate Theme Studio — code maintainer audit

Scope: `vayeate-theme-studio/src/**` and `vayeate-theme-studio/electron/**` (560 TypeScript modules from the generated checklist). Compared to `.cursor/rules/` (`app-architecture.mdc`, `layer-app.mdc`, `layer-domain.mdc`, `layer-electron.mdc`, `layer-gateway.mdc`, `controller.mdc`, `operation.mdc`, `validation.mdc`, `viewmodel.mdc`, `component.mdc`, `state.mdc`, `gateway.mdc`, `service.mdc`, `model.mdc`).

## app-architecture.mdc

### Filename does not match exported operation [app-architecture.mdc, lines 74-79]
- **File:** `vayeate-theme-studio/src/domain/operations/undo-operations/sync-undo-menu-state-operation.ts`
- **Violation:** The file name describes `sync-undo-menu-state`, but the primary export is `LoadUndoHistoryOperation`. The architecture rule requires non-component modules to use kebab-case filenames that match the primary export or module concept.
- **Suggested fix:** Rename the file to `load-undo-history-operation.ts`, or rename the exported class and any references so the filename and primary export describe the same operation.

## component.mdc

### Inline fallback handler on JSX event prop [component.mdc, lines 10-12]
- **File:** `vayeate-theme-studio/src/app/template/mappings-card/MappingsCard.tsx`
- **Violation:** `SemanticBlockRows` is rendered with `onRemoveMapping={onRemoveMapping ?? (() => {})}`. The component rule requires each event prop on JSX to receive a named function rather than an inline arrow.
- **Suggested fix:** Hoist the fallback to a named function or precomputed named callback before the JSX, then pass that identifier through `onRemoveMapping`.

## layer-gateway.mdc

### Theme gateway owns domain orchestration instead of edge mapping [layer-gateway.mdc, lines 15-18]
- **File:** `vayeate-theme-studio/src/gateway/theme/theme-gateway.ts`
- **Violation:** `ThemeGateway.generateTheme(...)` imports domain utilities (`generateThemePair`, `assertValidThemeFileName`, `toSafeFileName`, `stringifyTheme`) and performs theme-generation orchestration, filename validation, and export serialization before writing files. The gateway layer rule limits gateways to service abstraction plus parse/serialize edge work, not domain business logic.
- **Suggested fix:** Move the theme-generation workflow into a domain operation that loads the theme/template, computes the dark/light outputs, validates filenames, and then calls thin gateway methods for persistence. Keep `ThemeGateway` focused on loading, saving, listing, deleting, and simple parse/serialize responsibilities.

## service.mdc

### Service depends on a gateway instead of system primitives [service.mdc, lines 10-25]
- **File:** `vayeate-theme-studio/src/gateway/services/debounced-theme-persist-service.ts`
- **Violation:** `DebouncedThemePersistService` injects `ThemeGateway` and calls `themeGateway.saveTheme(...)`. The service rule defines services as system-integration units called by gateways or operations; depending on a gateway reverses that layer boundary.
- **Suggested fix:** Move the debounce orchestration up into an operation, or refactor this class so it depends on lower-level system primitives such as `FileSystemService` and model serialization rather than calling `ThemeGateway`.