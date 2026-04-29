---
activation: ai-decided
description: Use when authoring, modifing, or interacting with react components
---

# Component

## Contract

- **PascalCase** functional components; **one** exported component function per file; **PascalCase** filename stem matching the exported component name (e.g. `ThemeDetailsCard.tsx` exports `ThemeDetailsCard`).
- Each event prop references a **named function** (`onClick={onMenuThemeToggleClick}`), not an inline arrow on the JSX element.
- **User and lifecycle** events (clicks, inputs, **mount load**, **cleanup unload**) → call a named callback returned by the viewmodel; no direct controller/operation calls from handlers.
- Components do not call `useAppDispatch()` for component interactions; viewmodels expose named action callbacks and own action construction/dispatch.
- Read state through **viewmodels** only. Component files may contain UI/DOM logic needed to render and wire controls. Business-facing presentation logic, derived guards, validation messages, and action dispatch callbacks belong in the viewmodel.

**Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When you change filename or export rules above, update those `describe` blocks and vice versa.**

## Anti-patterns

- `useStore(...)` subscriptions or other direct store reads inside component files (use viewmodel).
- Payloads that duplicate state (pass only user input + ids).

## Good / bad

```tsx
// BAD — resolves controller inline
onClick={() => void container.resolve(SaveController).run()}

// BAD — inline handler on event prop
onClick={() => dispatch({ type: 'THEME_SAVE_BUTTON_ON_CLICK' })}

// GOOD — named handler calls viewmodel callback
function onThemeSaveButtonClick() {
  viewModel.onThemeSaveButtonClick();
}
// ...
onClick={onThemeSaveButtonClick}
```
