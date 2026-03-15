# Skill: Theme Generation

## When to use

- Updating generation strategies, contrast behavior, or binding behavior in the Theme Studio app (`vayeate-theme-studio/`).

## Steps

1. Inspect `vayeate-theme-studio/src/domain/core/theme-generator.ts` and `vayeate-theme-studio/src/domain/core/color.ts` and related tests.
2. Validate parity assumptions against root scripts as needed.
3. Implement minimal change with deterministic output preserved.
4. Add or update generator-focused tests.
5. Run `npm run test` and `npm run build`.

## Watch-outs

- Keep `useDarkForLight` (dark-used-for-light) semantics consistent for light output.
- Avoid introducing non-deterministic ordering in output.
- Preserve output path safety boundaries.
