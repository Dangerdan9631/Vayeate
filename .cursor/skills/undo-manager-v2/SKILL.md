---
name: undo-manager-v2
description: Design and guidance for UndoManagerV2 (state, stacks, frames, actions, operations, scoping). Use when implementing or modifying the undo manager or adding undo support to a feature.
---

# UndoManagerV2

Use this skill when:
- implementing or modifying UndoManagerV2
- adding undo support to a feature that will use UndoManagerV2

## Prerequisites

Read before implementing:
- Architecture rule (`.cursor/rules/vayeate-theme-studio-architecture.mdc`) for where undo fits (operations/controllers add to undo stack)
- Undo rule (`.cursor/rules/vayeate-theme-studio-undo.mdc`) for how to utilize the stack when making app changes

## Design specification

### State

- The undo manager maintains its own state in the application.
- HashMap of history stacks keyed by stack identifier.

### Persistence

- **Location**: `.undo` in app data dir (V2 uses a dedicated subdir or naming to avoid clashing with legacy); one JSON file per stack (key = sanitized stack id).
- **On every stack change** (push, undo, redo, goto): persist full stack (up to disk limit) and current pointer to that stack’s file.

### In-memory vs disk

- **DEFAULT_STACK_COUNT** (e.g. 5): Only this many stacks are kept in memory (LRU); others are loaded from disk on getOrCreate.
- **Per stack**: In-memory frame limit = existing max size (e.g. 20). When exceeded, oldest frames are trimmed from memory but remain on disk. On-disk frame limit is configurable (default 999). When an operation (undo/goto) needs frames not in memory, the manager loads them from disk.

### Lifecycle

- Manager exposes a method to delete all persisted undo files (and clear in-memory stacks). An operation calls it and is invoked from the app controller’s load and unload (so clear on load and unload).

### Stack config

- Max size of each stack (in memory) is configurable in code; default 20. Disk limit is separate (default 999).

### Stack structure

- Each stack is a double-linked list of frames plus a pointer to the current frame.

### Frame

- **Description**: Short (1–5 words, guidance only).
- **Identifier**: Globally unique and chronologically sortable — order between any two frames is derivable from IDs.
- **Apply actions**: List of actions that redo the frame (details necessary to re-apply the change).
- **Undo actions**: List of actions that undo the frame (typically the value that existed before the action was executed).
- Actions are fine-grained (single value change). The list of actions as a whole is applied or reverted atomically as one logical step.

### Actions

- Support **app state** and **file system**.
- **App state**: Apply/undo actions describe state deltas as usual.
- **File system**: Undo app state first, then persist that undone state to disk. For file deletions: persist file contents before the delete; the undo action recreates the file with those contents.

### Stack operations

- **push**: Add a provided frame to the stack. Removes all frames above the current stack pointer (they can no longer be redone).
- **goto(id)**: Apply or revert frames one at a time to go from the current stack frame to the frame with the given identifier.
- **undo**: Revert a single stack frame and move the frame pointer.
- **redo**: Re-apply a single stack frame and move the frame pointer.
- **list**: Return the identifier and description of all frames on the stack plus the current stack pointer.

### Manager API

- **getOrCreate(stackId)**: Get or create a stack for a given identifier. Each identifier is unique for a given app context. One stack per app page, per catalog version, per template version, per theme version.

## Relationship to current code

The app currently uses the legacy undo stack (`vayeate-theme-studio/src/utils/undo-stack.ts`, `vayeate-theme-studio/src/ui/context/UndoContext.tsx`). UndoManagerV2 is the target design for new implementation. When implementing, this skill is the spec; existing undo-stack and UndoContext can be consulted for current behavior and migration points.

## References

- Undo rule (`.cursor/rules/vayeate-theme-studio-undo.mdc`)
- Architecture rule (`.cursor/rules/vayeate-theme-studio-architecture.mdc`)
- Current implementation: `vayeate-theme-studio/src/utils/undo-stack.ts`, `vayeate-theme-studio/src/ui/context/UndoContext.tsx`
