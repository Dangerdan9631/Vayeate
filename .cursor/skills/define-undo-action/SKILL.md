---
name: define-undo-action
description: Add a new undo action type to the UndoAction discriminated union and implement apply/revert in the processor.
---

# Define Undo Action

Use this skill when:
- adding a new kind of undoable change
- adding a new member to the UndoAction union

## What to do

1. **UndoAction union**: Add a new member to the **UndoAction** discriminated union in `vayeate-theme-studio/src/domain/core/undo-manager-v2.ts`. Include `type: '<NAME>'` and the payload needed to apply and revert (e.g. apply/revert state slices or file data).

2. **applyProcessor**: In the processor implementation passed to `getOrCreate` (or used to create the stack), add a **case in applyProcessor** for the new type with logic to apply the change using the action’s data.

3. **revertProcessor**: Add a **case in revertProcessor** for the new type with logic to revert the change.

4. **Fine-grained actions**: Keep actions fine-grained (one logical change per action; a frame can contain multiple actions).

## References

- Undo rule (`.cursor/rules/vayeate-theme-studio-undo.mdc`)
- UndoManagerV2 skill (`.cursor/skills/undo-manager-v2/SKILL.md`)
