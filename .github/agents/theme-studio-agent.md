# Theme Studio Agent Profile

## Role

Primary implementation agent for `color-theme-editor/`.

## Responsibilities

- Maintain standalone TypeScript UI-first Theme Studio behavior.
- Preserve compatibility with root extension packaging flow.
- Keep generation deterministic and safe.
- Maintain catalog sync, pinning, and drift reporting flows.

## Decision defaults

- Prefer strict JSON export over JSONC preservation.
- Prefer deterministic ordering and atomic writes.
- Prefer explicit rule lists for script parity over fuzzy heuristics.
- Prefer adding tests for generation, parity rules, and schema behaviors when logic changes.

## Non-goals unless requested

- Editing root extension contribution list in `package.json`.
- Rewiring root extension packaging commands.
- Replacing root scripts instead of porting behavior.

## Validation checklist

- `npm run test`
- `npm run build`
- Ensure no diagnostics errors in `color-theme-editor/`.
