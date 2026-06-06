# Contract: Generated Theme Exports

## Purpose

This contract defines the expected outputs produced when a user generates a
theme from a selected theme version and template version.

## Export Location

- Generated files are written beneath the dedicated export prefix used by the
  desktop application.

## Export Count

- A successful generation produces exactly two artifacts:
  - one dark theme export
  - one light theme export

## Export Identity

- Both files derive their identity from the selected theme name.
- Export naming must remain safe for downstream file use.
- Light and dark outputs must remain distinguishable from one another.

## Export Content Expectations

Each generated artifact must contain:

- a display name derived from the theme name
- a declared mode of either dark or light
- a complete map of theme color entries resolved from theme-token mappings
- grouped textmate token color rules
- semantic token color entries

## Resolution Rules

- Theme-token mappings populate general color entries.
- Textmate token mappings are grouped into token-color rules by shared color
  assignment.
- Semantic token mappings resolve to semantic token color entries.
- Contrast-aware mappings must reflect the resolved contrast rule outcome for
  the selected mode.
- Light-mode values may reuse dark-mode values when the corresponding theme
  setting requests it.

## Failure Contract

- If the selected theme version cannot be loaded, the selected template version
  cannot be loaded, or required data cannot be resolved, generation must return
  a failure message instead of partial success.
- A generation failure must not terminate the editing session or corrupt the
  existing theme artifact.

## Baseline Verification Coverage

- Export naming safety and paired dark/light generation are verified in
  `src/domain/baseline-policy.test.ts`.
- Theme generation entry points, template selection, and paired export
  interaction states are exercised in
  `src/app/theme/theme-renderer-workflows.test.tsx`.
- Preview-resolution assumptions that feed export correctness are covered in
  `src/domain/session-and-preview-baseline.test.ts`.
