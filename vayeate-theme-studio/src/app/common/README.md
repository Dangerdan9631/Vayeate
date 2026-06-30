# Common (app)

Shared UI components and utilities used across multiple app domains. Each feature folder owns its presentation, viewmodels, actions, handlers, and controllers while reusing the same mutation pipeline as domain-specific screens.

## Features

| Folder | Role |
|--------|------|
| **styled-tooltip** | Global styled tooltip that replaces native `title` / `aria-label` hints with a positioned overlay. |
| **eyedropper-overlay** | Full-screen color picker over a captured display snapshot, with zoom, loupe, and commit routing back to the originating control. |
| **tristate-checkbox** | Accessible tri-state checkbox control (`all` / `some` / `none`) for bulk-selection UI. |

## Organization

Feature folders follow the standard app-layer layout:

- **Components** (`*.tsx`) — render UI and call viewmodel callbacks.
- **Viewmodels** (`use-*-viewmodel.ts`) — subscribe to UI stores, build actions, expose presentation state.
- **Actions / handlers** — typed action unions, guards, coalescers, and routing to controllers.
- **Controllers** — one entry point per action type; delegate to domain operations.
- **Utilities** — pure helpers colocated with the feature (e.g. `eyedropper-utils.ts` for canvas math and zoom).

## Boundaries

- **In scope:** cross-cutting presentation, shared interaction flows, and app-layer orchestration for these controls.
- **Out of scope:** business rules and state mutation — those live in `src/domain/`; system capture and IPC in `src/gateway/`.
- **Consumers:** mount shared components from the app shell or domain screens; open the eyedropper via `OpenEyedropperOverlayController` from feature controllers.

For full app-layer conventions, see [../README.md](../README.md) and the project root [AGENTS.md](../../AGENTS.md).
