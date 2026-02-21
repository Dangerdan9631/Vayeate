# Architecture (Phase 1)

## Module layout

- `src/domain/types.ts`: canonical schema contracts.
- `src/core/color.ts`: color math and perceptual distance utilities.
- `src/core/contrast-policy.ts`: target policies for token/semantic categories.
- `src/core/palette.ts`: seed-to-palette derivation and distance filtering.
- `src/core/json.ts`: deterministic JSON serialization.
- `src/core/exporter.ts`: output path rules and atomic file writes.
- `src/core/generator.ts`: template-to-theme pair generation contract.
- `src/ui/*`: standalone UI shell (Phase 2 expands).

## Pipeline

1. Load template JSON from workspace.
2. Resolve variables and element bindings.
3. Build dark + light color outputs.
4. Apply per-mode contrast targets.
5. Serialize with deterministic ordering.
6. Write output files atomically to `../themes`.

## Determinism rules

1. Stable key sorting at all object depths.
2. Stable array ordering where order is semantically meaningful.
3. Stable newline/indent (`2` spaces, trailing newline).

## Safety rules

1. Reject output filenames outside expected theme naming pattern.
2. Resolve output paths relative to repository root only.
3. Write to `*.tmp` then rename.