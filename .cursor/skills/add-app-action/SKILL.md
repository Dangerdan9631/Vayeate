---
name: add-app-action
description: Add a new user-triggerable app action to AppActionV2 and optionally wire processor/controller.
---

# Add App Action

Use this skill when:
- the user or task asks to add a new app action
- adding a new UI-triggered event
- adding a new member to AppActionV2

## What to do

1. **AppActionV2**: Add a new union member to `AppActionV2` in `vayeate-theme-studio/src/actions/action-types.ts` with the exact `type` string and payload. Use the naming convention from the Action Queue rule: `<CONTEXT>_<SUBCONTEXT>_<IDENTIFIER>_<CONTROL>_<ACTION>`. Use types from `../model/schemas` where applicable (e.g. `CatalogName`, `Version`, `HexColor`, `TokenKey`).

2. **If implementing the handler**: Follow the Action Queue rule: add processor case in AppContext, invoke controller; controller composes operations; add reducer cases in app-state for state updates. Name controller functions by the action (e.g. `saveCatalog`), not by the UI event.

## References

- Action Queue rule (`.cursor/rules/vayeate-theme-studio-action-queue.mdc`) for naming convention and control types
- Architecture rule (`.cursor/rules/vayeate-theme-studio-architecture.mdc`)
