# App Shell

Controller entry points that orchestrate validations and operations for the Common UI domain.

## Placement

- Path: `src/app/controllers/Common/app-shell`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `force-reload-window-controller.ts`, `handle-keyboard-shortcut-controller.ts`, `load-app-controller.ts`, `reload-window-controller.ts`, `set-color-scheme-controller.ts`, `toggle-color-scheme-controller.ts`, `toggle-dev-tools-controller.ts`, `unload-app-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

