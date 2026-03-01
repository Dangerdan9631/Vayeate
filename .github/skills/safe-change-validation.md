# Skill: Safe Change + Validation

## When to use

- Any code change in `vayeate-theme-studio/`.

## Steps

1. Read target module and adjacent tests first.
2. Implement smallest viable patch.
3. Update docs when behavior changes.
4. Run:
   - `npm run test`
   - `npm run build`
5. Check diagnostics and resolve introduced errors.

## Watch-outs

- Avoid unrelated refactors.
- Respect repo boundaries and root packaging stability.
- Keep generated output deterministic.
