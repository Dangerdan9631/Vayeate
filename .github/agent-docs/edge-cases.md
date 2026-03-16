# Edge Cases Reference

## Generation and binding edge cases

- Missing variable IDs in bindings: skip safely, avoid crashes.
- `copyFromDark` with missing dark reference key: fallback to configured strategy path.
- Background-like keys: avoid forcing contrast-derivation where raw value is expected.
- V2 contrast mappings require a paired color mapping for the same target/key; contrast-only mappings should fail generation with a clear error.
- V2 contrast derivation for UI color keys should only run when a known foreground/background pairing exists; otherwise keep the source color unchanged.
- Full coverage insertion: preserve deterministic ordering and avoid duplicate target/key bindings.

## Export edge cases

- Reject output filenames that do not match expected pattern.
- Reject output directories outside `../themes` boundary.
- Always use atomic write to prevent partial outputs.

## Catalog edge cases

- Remote fetch failures: keep local snapshot flow working with warnings.
- Drift detection with sparse remote data: treat as warning, not hard failure.
- Invalid pin URLs or policy values: reject at save time with explicit error.

## Determinism edge cases

- Repeated generation for same template must remain byte-equivalent.
- Keep key ordering stable and avoid non-deterministic iteration over object maps.

## Undo edge cases

- The undo infrastructure (`UndoManagerV2`, `UndoProcessor`) is fully implemented and tested, but real `UndoAction` types (beyond `NOOP`) are deferred. Do not push frames in mutative controllers yet — the processor will no-op all frames.
- `clearPersistedUndo` is called on app load and unload via the app controller; this is intentional and must not be removed.

## Form state edge cases

- Form inputs tied to actions must be backed by `AppState` fields, not component-local `useState`. If a field value is needed by a controller, it must have been placed into state by a prior action.
- Draft text values for uncommitted inputs should be stored in the appropriate state slice so they survive re-renders without losing user input.
