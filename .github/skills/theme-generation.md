# Skill: Theme Generation

## When to use

- Updating generation strategies, contrast behavior, or binding behavior.

## Steps

1. Inspect `src/core/generator.ts` and related tests.
2. Validate parity assumptions against root scripts as needed.
3. Implement minimal change with deterministic output preserved.
4. Add or update generator-focused tests.
5. Run `npm run test` and `npm run build`.

## Watch-outs

- Keep `copyFromDark` semantics consistent for light output.
- Avoid introducing non-deterministic ordering in output.
- Preserve output path safety boundaries.
