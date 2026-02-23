# Theme Studio Requirements (Phase 1 Baseline)

## Product intent

Build a standalone TypeScript UI-first app under `color-theme-editor/` that can generate deterministic strict JSON VS Code themes into `../themes/` without changing root extension packaging or launch behavior.

## Functional requirements

1. Template model supports workspace JSON save/load in `color-theme-editor/templates/`.
2. Generator supports dual output (`dark`, `light`) from one template.
3. Output format is strict JSON with deterministic ordering/formatting.
4. Contrast policies are split:
   - Dark output follows fixer/validator-style policy.
   - Light output follows current light-generator policy.
5. Palette derivation supports complementary and analogous candidates.
6. Palette filtering enforces minimum perceptual distance using OKLab Delta E.
7. Preview session model supports side-by-side light/dark states and sample file references.

## Non-functional requirements

1. Determinism: identical inputs produce byte-equivalent JSON outputs.
2. Safety: writes to output files use non-destructive temporary write + atomic replace.
3. Boundary: runtime/build/test dependencies remain under `color-theme-editor/` only.
4. Compatibility: generated JSON loads in extension host flow documented in `../README.md`.

## Integration surfaces (read-only except output write)

- `../package.json` (theme contribution contract and packaging flow)
- `../.vscode/launch.json` (extension host launch behavior)
- `../themes/*.json` (generation targets)
- `../examples/*` (preview content fixtures)
- `../scripts/fix-contrast.js` and `../scripts/generate-light-themes.js` (algorithm source behavior)

## Acceptance criteria (Phase 1)

1. Project boots independently with local package scripts.
2. Domain schemas are implemented as typed contracts.
3. Contrast target resolvers exist for dark and light policies.
4. Deterministic JSON serializer exists and is tested.
5. Palette distance utilities exist and are tested.
6. Atomic export helper exists and validates output naming patterns.

## Delivery phases

- Phase 1: requirements, schema, core generation/contrast/export contracts.
- Phase 2: UI binding editor and custom preview renderer over `../examples`.
- Phase 3: catalog sync/versioning policy, validation workflows, and polish.