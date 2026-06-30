---
name: modify-operation
description: Operation contract, execute patterns, DI conventions, caller restrictions, and documented exceptions. Use when authoring, modifying, or interacting with operations
---

# Operation

## Contract

**Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When you change class/file naming here, update `*-operation.ts: one exported class…` and vice versa.** AST checks also enforce **no disallowed `this.<OtherOperation>.execute`** under `src/domain/**` (`describe('domain *-operation.ts: operations do not call disallowed operation .execute')`).

- Suffix **`Operation`**; **one public** method **`execute(...)`** with explicit inputs. Private helper methods are allowed when they support the same atomic operation.
- **tsyringe** **`@singleton()`**; inject gateways, services, and store classes as **concrete types** — no string or symbol tokens except documented infrastructure interface registrations. Currently `EnqueueActionQueueOperation` may inject the token-registered action queue interface with `@inject("IActionQueue")`; do not introduce other string/symbol tokens without updating the architecture rules.
- May call **gateways** and **services**; **must not** call another operation unless a documented exception below applies.
- **Exception:** `InitializeWindowCallbacksOperation` may inject controller classes solely to register `WindowService.init(...)` callbacks for renderer window/global-input events. Keep this exception narrow: registration only, no additional orchestration logic, and no copying this pattern to other operations without updating the architecture rules.
- **Exception:** `EnqueueActionQueueOperation` is the action-queue adapter: it may inject the token-registered `IActionQueue` interface with `@inject("IActionQueue")` and bridge controller outcomes back into the action queue by enqueueing app actions. `EnqueueBackgroundQueueActionOperation` is the background-queue adapter. These adapter operations may import app-core queue types/classes solely to enqueue work; they are not precedent for ordinary domain-to-app imports.
- **Exception:** operations may inject and call `EnqueueBackgroundQueueActionOperation` only to enqueue asynchronous background work; it must not be used for domain-operation orchestration.
- **Exception:** theme color-variable operations may call `SetThemeOperation` and `ApplyThemeStateAndSchedulePersistOperation` as the established state/persist helper pair after constructing a complete next `Theme`; this does not permit general operation-to-operation orchestration.
- Prefer **inputs from controller** over reading store state inside `execute` when practical (keep reusable).

## Scope

- **One** logical atomic change; one primary entity (batch OK when inherently single action, e.g. token set).

## Callers

- **Controllers** only (not handlers, components, or other operations). Each controller **must not** call another controller — same "no chaining peers" idea as operations ([controller.mdc](controller.mdc)).
- **Exceptions:** `InitializeWindowCallbacksOperation` is allowed to bridge system callbacks to controller entry points as described above. `EnqueueActionQueueOperation` and `EnqueueBackgroundQueueActionOperation` are allowed as the narrow queue adapters described above, including controller-originated follow-up actions that must re-enter the action queue. Theme color-variable operations may use the documented theme state/persist helper pair described above.

## Good / bad

| Good | Bad |
|------|-----|
| `DeleteCatalogOperation.execute({ catalogId })` | Operation calls `otherOp.execute` |
| Operation uses store method after gateway load | Controller writes store state |
