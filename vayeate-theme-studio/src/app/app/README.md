# App UI domain

Root application chrome: shell layout, providers, menu bar, ribbon tabs, status bar, and window controls. Feature pages (catalog, template, theme) mount inside the shell content area.

## Layout

```
app/
├── actions/           # Root app action union and AppActionHandler
├── app-shell/         # App entry, providers, shell layout, lifecycle controllers
├── menu-bar/          # Title bar, dropdown menus, undo/history/view actions
├── ribbon/            # Primary tab navigation (catalogs, templates, themes)
├── status-bar/        # Action and background queue progress
└── window/            # Shared Electron window chrome controllers
```

## Mutation flow

User and lifecycle signals from shell components enter the action queue via viewmodel callbacks. `AppActionHandler` delegates to feature handlers (`AppShellHandler`, `AppMenuHandler`, `AppRibbonHandler`, plus shared overlay handlers). Handlers route to controllers; controllers run validations and operations.

App shell load/unload is dispatched from `useAppShellViewModel` on first mount and cleanup. Window system callbacks are registered once during `LoadAppController` via `InitializeWindowCallbacksController`.

## Key modules

| Module | Role |
|--------|------|
| `AppProvider` | Supplies action-queue `dispatch` through React context |
| `ColorSchemeProvider` | Syncs persisted color scheme to `data-theme` on the document root |
| `AppShell` | Composes menu bar, ribbon, content area, status bar, and global overlays |
| `ContentArea` | Lazy-mounts tab pages while keeping inactive panels in the DOM |
| `useAppShellViewModel` | Active tab selector and shell page lifecycle actions |
