---
name: add-app-action
description: Add a new user-triggerable app action to AppAction and optionally wire handler/controller.
---

# Add App Action

Use this skill when:
- the user or task asks to add a new app action
- adding a new UI-triggered event
- adding a new member to AppAction

## What to do

1. **AppAction**: In `vayeate-theme-studio/src/app/actions/app-action.ts` and the matching per-domain enum file (`actions/app/app-action-type.ts`, `actions/catalog/catalog-action-type.ts`, `actions/template/template-action-type.ts`, or `actions/theme/theme-action-type.ts`), add a member to the correct enum with the string value matching the naming convention from the Action Queue rule: `<CONTEXT>_<SUBCONTEXT>_<IDENTIFIER>_<CONTROL>_<ACTION>`. Add the corresponding union member to `AppAction` as `{ type: XxxActionType.YourMember; ...payload }`. Use types from `../../model/schemas` where applicable (e.g. `CatalogName`, `Version`, `HexColor`, `TokenKey`). Dispatch sites and handler `switch` cases use the enum member, not a string literal.

2. **One action = one behavior**: Do not use optional fields to branch to different behaviors within one action type. If you need different behaviors, add separate action types.

3. **If implementing the handler**: Add an exhaustive `switch` case using the enum member (e.g. `case CatalogActionType.CatalogDetailsSaveCatalog:`) in the correct domain handler file (`app-handler.ts`, `catalog-handler.ts`, `template-handler.ts`, or `theme-handler.ts`). The handler invokes a controller. Follow the Action Queue rule: controller composes operations; add reducer cases in `reducer.ts` for state updates. Name controller functions by the action (e.g. `saveCatalog`), not by the UI event.

## References

- Action Queue rule (`.cursor/rules/vayeate-theme-studio-action-queue.mdc`) for naming convention and control types
- Architecture rule (`.cursor/rules/vayeate-theme-studio-architecture.mdc`)
- Handler files: `vayeate-theme-studio/src/app/handlers/`
