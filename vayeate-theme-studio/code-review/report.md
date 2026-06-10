# Vayeate Theme Studio - code maintainer audit

Scope: `.cursor/rules/**`. Each rule was compared against the implementation files listed beneath `vayeate-theme-studio/code-review/checklist.md`. Unreferenced implementation files: none.

Focused architecture validation also passed with `npm test -- --run test/architecture/layer-boundaries.test.ts test/architecture/component-workflow-compliance.test.ts`.

## controller.mdc

### App load controller chains another controller [controller.mdc, lines 15-16, 31]
- **File:** `vayeate-theme-studio/src/app/app/app-shell/controllers/load-app-controller.ts`
- **Violation:** `LoadAppController` injects `InitializeWindowCallbacksController` and calls `this.initializeWindowService.run()` during `run()`. The controller rule requires controllers to compose validations and operations only and must not call another controller's `run`.
- **Suggested fix:** Move window callback initialization behind a domain operation or port-owned operation and inject that operation into `LoadAppController`; alternatively dispatch a separate lifecycle action that routes independently to the window-callback controller instead of chaining controllers.

### Window callback registration invokes keyboard shortcut controller [controller.mdc, lines 15-16, 31]
- **File:** `vayeate-theme-studio/src/app/app/window/controllers/initialize-window-callbacks-controller.ts`
- **Violation:** `InitializeWindowCallbacksController` injects `HandleKeyboardShortcutController` and calls `this.handleKeyboardShortcut.run(event)` from the `onGlobalKeyDown` callback. The controller rule forbids controller-to-controller chaining, and the architecture exception for adapting renderer window/global-input callbacks is scoped to `InitializeWindowCallbacksOperation`, not this app controller.
- **Suggested fix:** Restore the documented operation boundary: register `WindowCallbacksPort.initialize(...)` from an operation that may adapt global-input callbacks to existing controller entry points under the named exception, or route `onGlobalKeyDown` into a validated app-shell action handled by the normal action queue.
