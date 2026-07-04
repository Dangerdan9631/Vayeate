# Eyedropper Overlay

Controller entry points that orchestrate validations and operations for the Common UI domain.

## Placement

- Path: `src/app/controllers/Common/eyedropper-overlay`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `close-eyedropper-overlay-controller.ts`, `eyedropper-overlay-mouse-move-controller.ts`, `eyedropper-overlay-viewport-size-change-controller.ts`, `eyedropper-overlay-wheel-scroll-controller.ts`, `open-eyedropper-overlay-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

