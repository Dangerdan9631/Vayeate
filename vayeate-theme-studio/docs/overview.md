## Overview

Vayeate Theme Studio is a standalone local application for authoring, previewing, and exporting VS Code color themes with deterministic output. Its primary goal is to give theme authors a reliable end-to-end workflow to define reusable templates that can be used to define a minimal set of parameters to output production-ready dark and light theme JSON files, while keeping generation behavior reproducible and explainable and maintaining consistent visibility and readability quality.

The application is designed to solve three core problems:

1. **Managing complexity of theme authoring** — VS Code themes can be complex to author directly as JSON, especially when trying to maintain consistency across dark and light variants. Theme Studio abstracts this complexity by providing a structured approach to defining themes through catalogs and templates.
2. **Simplifying theme authoring workflows** — VS Code themes define many fine-grained color tokens, and it can be difficult to keep track of how they relate to each other and to the overall design. Theme Studio provides a visual interface for defining catalogs of keys that can be included in a theme, templates to capture the relationships between these keys and provide a minimal control surface for changing values, and to allow users to see how their changes affect the overall look and feel of the theme in real time.
3. **Ensuring deterministic output** — Theme Studio is designed to produce consistent and repeatable output and managing output between versions. By defining a clear pipeline for how themes are generated from source definitions, Theme Studio ensures that the output is stable and predictable, minimizing the risk of accidental drift and making it easier for theme authors to maintain their themes over time.

At a system level, Theme Studio operates as a deterministic pipeline:

- Catalogs define valid themeable editor keys, and track external sources of these keys for changes.
- Templates map those keys to a reduced set of typed variables (color and contrast) that describe their relationship.
- Themes assign dark/light values to template variables.
- The generator resolves mappings and readability rules and emits VS Code-compatible dark/light payloads.
- The exporter writes stable JSON files to the allowed output boundary.
- The preview subsystem continuously renders tokenized samples for both variants.

The intended outcome is a safe local toolchain that preserves an authoritative model, minimizes accidental drift, and enables repeatable theme production and updates from source definitions to generated artifacts.

## Goals and Non-Goals

### Goals

1. **Provide a complete end-to-end theme pipeline** — Support the full flow from catalogs to templates to themes to generated VS Code JSON output for both dark and light variants.
2. **Maintain deterministic generation behavior** — Ensure identical source inputs produce byte-stable generated files, including deterministic ordering and serialization. Additive changes to source inputs should not cause unrelated output changes.
3. **Reduce authoring complexity through structured abstractions** — Use catalogs and templates to model token relationships so theme authors can control many output keys through a smaller, intentional variable surface.
4. **Enable safe, local-first operation** — Keep authoring and generation workflows local to the workspace with constrained output boundaries and predictable file write behavior.
5. **Improve confidence before export** — Provide always-on preview capabilities that render representative language samples in parallel dark/light views so visual regressions are detected early.

### Non-Goals

1. **Redesigning root extension packaging or manifest flow** — The root extension contribution and packaging surface is not part of Theme Studio scope.
2. **Building a general-purpose design system or graphics editor** — The application is focused on structured VS Code theme authoring rather than freeform visual design tooling.
3. **Supporting unconstrained filesystem writes** — Output is intentionally limited to approved theme generation destinations rather than arbitrary export locations.
4. **Acting as a cloud-hosted collaboration platform** — The target is a standalone local workflow, not multi-tenant hosting, account systems, or remote shared editing.
5. **Guaranteeing accessibility compliance for all possible user-authored values** — The tool provides contrast-aware mechanisms and preview support, but final authored value quality remains user-controlled.

## Cross-Cutting Rules

### Rule IDs

- **R-PERSIST-1 (Immediate persistence)** — Any user modification to a catalog, template, or theme is persisted immediately to the active artifact state. Persistence may be debounced for UX responsiveness, but no explicit save step is required.
- **R-LOCK-1 (Lockability + mutability model)** — Locking applies to versioned artifacts. A locked version is immutable. Editing a locked version creates a new editable version according to entity-specific versioning rules.
- **R-MUTATE-1 (Source/type constraints)** — Mutations are constrained by entity type and source:
	- Manual catalogs: keys are editable.
	- Remote catalogs: direct key add/remove is not allowed; key changes occur through sync. Source URLs/settings are editable.
	- Templates/themes: field-level edits are allowed only when the selected version is mutable under `R-LOCK-1`.
- **R-DELETE-1 (Deletion eligibility)** — Deletion is permitted only when policy checks pass for the targeted entity/version (for example: protected, in-use, required baseline, or lock constraints). Rejected deletions return clear diagnostics and do not mutate stored state.

### Lockability and Mutability Matrix

| Entity | Mutable when unlocked | Mutable when locked | Automatic version behavior on edit |
|---|---|---|---|
| Catalog (manual) | Yes | No | Edit locked version creates new unlocked version (`R-LOCK-1`) |
| Catalog (remote) | Source URLs/settings only (keys via sync) | No | Sync may create a new version when discovered key sets change (`R-MUTATE-1`) |
| Template | Yes | No | Edit locked version creates new unlocked version (`R-LOCK-1`) |
| Theme | Yes | No | Edit locked version creates new unlocked version (`R-LOCK-1`) |

### Deletion Eligibility Summary

- Deletion requests for catalog/template/theme artifacts must satisfy `R-DELETE-1`.
- When deletion is valid, only the targeted entity/version is removed.
- When deletion is invalid, no partial deletion is performed.

## User Scenarios

### Catalog-Focused Scenarios

1. **Create a new catalog consisting of manually entered editor tokens**
	- A user creates a catalog with source type set to manual.
	- The user enters editor tokens across colors, semantic tokens, and TextMate scopes.
	- The system validates token format, normalizes token names, removes duplicates, and persists the catalog according to `R-PERSIST-1` and `R-MUTATE-1`.

2. **Update a manual token catalog**
	- A user selects an existing manual catalog version and edits token lists by adding, removing, or correcting entries.
	- The system re-validates and normalizes all edited token sets deterministically.
	- Persistence and version behavior follow `R-PERSIST-1` and `R-LOCK-1`.

3. **Lock a manual token catalog**
	- A user marks a specific manual catalog version as locked after review.
	- Mutability and subsequent edit behavior follow `R-LOCK-1`.
	- Any attempted post-lock edits persist according to `R-PERSIST-1` only on the new editable version.

4. **Create a new catalog importing tokens from a remote source**
	- A user creates a catalog with source type set to remote and provides one or more source URLs.
	- The system fetches remote documents and extracts token candidates from supported patterns.
	- The system normalizes, deduplicates, and sorts extracted tokens, then persists the initial catalog according to `R-PERSIST-1` and `R-MUTATE-1`.

5. **Re-sync a remote catalog**
	- A user triggers sync for an existing remote catalog.
	- The system re-fetches configured sources, merges newly discovered tokens with existing key sets, and preserves deterministic ordering.
	- Sync mutation and persistence behavior follow `R-MUTATE-1` and `R-PERSIST-1`.

6. **View the tokens in a catalog**
	- A user opens a catalog and inspects token groups by target category.
	- The system presents the stored, normalized token lists exactly as persisted for the selected version.
	- The user can review key coverage before deciding to map tokens in templates or perform further updates.

7. **Select a catalog for view or modification**
	- A user browses available catalogs and versions, then selects one as the active working context.
	- The system loads the selected catalog deterministically and exposes only actions allowed by `R-MUTATE-1` and `R-LOCK-1`.
	- The user proceeds with read-only inspection or permitted edit operations based on those constraints.

8. **Delete a catalog version**
	- A user targets a specific catalog version for deletion.
	- Deletion eligibility follows `R-DELETE-1`.
	- Successful deletion removes only the targeted version; failure leaves stored state unchanged.

### Template-Focused Scenarios

9. **Create a new template from selected catalog versions**
	- A user creates a template and selects one or more catalog versions as its token source.
	- The system records catalog references in deterministic `name@version` form.
	- The template starts with an empty mapping surface ready for variable and token mapping, with persistence governed by `R-PERSIST-1`.

10. **Add and manage template variables**
	- A user adds typed variables for color and contrast with stable identifiers and labels.
	- The system validates variable identity uniqueness and required fields.
	- The user can update labels without breaking existing mappings that rely on variable IDs, with mutability/persistence governed by `R-LOCK-1` and `R-PERSIST-1`.

11. **Map catalog tokens to template variables**
	- A user selects catalog tokens by target type (`colors`, `semanticTokens`, `textMateScopes`) and maps each to a template variable.
	- The system enforces valid mapping shapes and highlights empty or invalid mapping entries during normalization.
	- The resulting mapping set is stored deterministically for repeatable generation behavior.

12. **Maintain paired color and contrast mappings**
	- A user configures contrast-aware mappings for keys that require readability control.
	- The system ensures expected color/contrast pairing rules are satisfied per mapping.
	- Invalid mapping states without a color assignment are surfaced and blocked before generation.
    - Missing contrast assignments are considered valid and default to non-contrast-aware behavior.

13. **Lock a template version for stable downstream usage**
	- A user locks a reviewed template version that is ready for theme consumption.
	- Mutability and subsequent edit behavior follow `R-LOCK-1`.
	- Persisted edit behavior follows `R-PERSIST-1`.

14. **Inspect template coverage and variable usage**
	- A user reviews template coverage to identify unmapped catalog tokens.
	- The user inspects variable usage to identify unused variables.
	- The system provides deterministic results that guide cleanup before theme authoring.

15. **Modify catalog references in a template**
    - A user updates the catalog version references for a template to point to newer versions, adds, or removes a catalog version.
    - The system identifies tokens that are mapped in the template, but do not exist in any catalog source and flags them as invalid.
    - The system identifies tokens that are already mapped in the template and maintains the existing mapping.
    - The system identifies tokens that are new to the template and adds them as unmapped entries.
	- Versioning and persistence behavior follow `R-LOCK-1` and `R-PERSIST-1`.

### Theme-Focused Scenarios

16. **Create a new theme from a selected template version**
	- A user creates a theme and selects a specific template version as the source contract.
	- The system initializes dark and light assignment surfaces from the template variable set.
	- The theme stores a stable `templateRef` so generation always resolves against the intended template version, with persistence governed by `R-PERSIST-1`.

17. **Edit dark and light theme assignments**
	- A user updates variable values in dark and light variants.
	- The system validates assignment values by type (hex color, numeric contrast value, or `useDark` for light fallback).
	- Invalid values are surfaced immediately and are excluded from successful resolution.
	- Persisted edit behavior follows `R-PERSIST-1`.

18. **Use light fallback inheritance from dark assignments**
	- A user sets light assignment values to `useDark` for variables that should mirror dark behavior.
	- During light resolution, the system applies explicit light values first and falls back to dark only for `useDark` entries.
	- The resulting light payload remains deterministic and minimizes duplicate authoring effort.

19. **Preview a theme before generation**
	- A user opens preview for an in-progress theme.
	- The system renders both dark and light outputs across discovered language samples using deterministic ordering.
	- The user validates readability and token appearance before writing generated artifacts.

20. **Generate theme artifacts from current assignments**
	- A user triggers generation for the active theme.
	- The system resolves mappings by `(target, editorKey)` groups, applies contrast rules, and builds VS Code-compatible dark/light payloads.
	- Re-running generation with unchanged effective inputs emits byte-equivalent outputs so diffs remain intentional.
	- Hard generation errors (for example, invalid contrast-only mapping states) stop output and return actionable diagnostics.

21. **Export generated themes to approved output paths**
	- A user confirms output file names and target directory for generated variants.
	- The system writes deterministic JSON artifacts only to approved output boundaries.
	- The user receives stable output files suitable for extension-host consumption and source control diffing.

22. **Clone an existing theme for variant experimentation**
	- A user clones an existing theme configuration to explore alternative palettes or contrast settings.
	- The system creates a new theme identity with copied assignments and template reference.
	- The user iterates safely without modifying the original theme baseline, following `R-PERSIST-1` and `R-LOCK-1` for subsequent edits.

23. **Delete a theme configuration**
	- A user chooses a theme configuration that is no longer needed.
	- Deletion eligibility follows `R-DELETE-1`.
	- Successful deletion removes only the targeted theme and updates selection/list views deterministically.

24. **Select a theme for continued editing**
	- A user browses available themes and selects one as the active working context.
	- The system loads persisted assignments, file naming, preview preferences, and template reference exactly as stored.
	- Any subsequent modifications follow `R-PERSIST-1`, `R-LOCK-1`, and `R-MUTATE-1`.

### Preview-Focused Scenarios

25. **Discover preview sources from workspace assets**
	- A user opens preview tooling for the current workspace.
	- The system discovers language folders and validates that each contains exactly one grammar file and at least one non-hidden sample file.
	- The discovery result is returned in deterministic language and sample order.

26. **Render side-by-side dark and light preview panes**
	- A user previews an in-progress theme without running generation export.
	- The system resolves both dark and light outputs and renders them simultaneously.
	- The user compares both variants in one view to catch readability or palette drift quickly.

27. **Tokenize samples with state continuity**
	- A user opens a multi-line sample where syntax context carries across lines.
	- The system tokenizes line-by-line while preserving TextMate rule stack continuity.
	- Rendered token spans remain stable and deterministic, including unscoped text gaps.

28. **Inspect all discovered language samples in fixed order**
	- A user reviews preview output across all available language/sample fixtures.
	- The system iterates languages and samples in deterministic sorted order.
	- Repeated preview sessions present the same ordering for reliable visual regression review.

29. **Use template/theme preview border customization**
	- A user configures preview border behavior through the designated preview variable reference.
	- The system resolves border styling from the configured variable when present.
	- The preview frame reflects configured emphasis consistently across both variants.

30. **Handle invalid preview source layouts safely**
	- A user attempts preview when a language folder has missing grammar, multiple grammars, or no samples.
	- The system rejects invalid source layouts with clear diagnostics and does not attempt unsafe path traversal.
	- Valid sources continue to render once layout issues are corrected.

31. **Refresh preview after theme assignment changes**
	- A user edits theme variable assignments while the preview is open.
	- The system re-resolves generated preview data and re-renders affected samples deterministically.
	- The user gets immediate feedback for iterative tuning without leaving the preview workflow, while assignment persistence follows `R-PERSIST-1`.
    - Immediate feedback can be debounced to prevent excessive re-rendering during rapid edits while still providing timely visual updates.

### Cross-Entity Lifecycle Scenarios

32. **Rename a catalog with collision-safe identity handling**
	- A user renames a catalog while preserving version history.
	- The system validates name uniqueness and rejects collisions with deterministic error messaging.
	- Any references that depend on catalog identity are updated deterministically, and persistence follows `R-PERSIST-1`.

33. **Rename a template with downstream reference safety**
	- A user renames a template used by one or more themes.
	- The system validates collisions and preserves stable identity semantics required by template references.
	- Dependent theme/template references are updated or preserved according to identity rules, with changes persisted by `R-PERSIST-1`.

34. **Rename a theme without breaking generated artifact intent**
	- A user renames a theme currently used for preview and generation.
	- The system updates display metadata while preserving stable internal identity required for selection and mutation behavior.
	- Collision checks, persistence, and mutability handling follow `R-PERSIST-1` and `R-LOCK-1`.

35. **Apply lockable/mutable/auto-versioned behavior consistently**
	- A user attempts edits across unlocked and locked catalog/template/theme versions.
	- The system enforces the lockability and mutability matrix exactly, including source-specific constraints.
	- Locked edits trigger deterministic new-version creation per `R-LOCK-1`, while disallowed mutations follow `R-MUTATE-1`.

36. **Persist edits immediately with autosave failure handling**
	- A user makes rapid successive edits across supported entities.
	- The system autosaves according to `R-PERSIST-1`, allows debounce for responsiveness, and guarantees write ordering consistency.
	- On persistence failure, the system surfaces explicit error state, preserves last known durable state, and prevents silent divergence.

37. **Delete entities with explicit eligibility and post-delete selection rules**
	- A user requests deletion of a catalog version, template/version, or theme.
	- The system evaluates protections and eligibility using `R-DELETE-1` before mutating state.
	- After successful deletion, active selection deterministically moves to the nearest valid fallback context; on rejection, selection remains unchanged.

### Additional Template and Theme Scenarios

38. **Assign contrast comparison source in template variables**
	- A user configures a contrast variable with a comparison source editor token in the template.
	- The system validates that the source token is resolvable for the variable’s mapping context.
	- Invalid or missing comparison-source references are surfaced before generation and persisted under `R-PERSIST-1`.

39. **Configure theme-level contrast comparison method and bounds**
	- A user sets contrast evaluation method per variant (`lessThan`, `equalTo`, `greaterThan`) with a target threshold value.
	- The user optionally defines minimum and maximum lightness bounds in HSL space for evaluated output.
	- The system applies method, threshold, and bounds deterministically during variant resolution and reports out-of-policy evaluations.

40. **Handle theme updates when template variable sets change**
	- A user switches a theme to a newer template version with added, removed, renamed, or orphaned variables.
	- The system preserves assignments for stable matches, marks unresolved assignments explicitly, and initializes new required assignments deterministically.
	- Generation/preview readiness reflects unresolved state until required assignments are resolved, and all state changes persist via `R-PERSIST-1`.

41. **Edit theme colors with synchronized hex input and color picker**
	- A user changes a color variable using hex input or a color picker control.
	- The system keeps both inputs synchronized, normalizes values to canonical format, and validates invalid/intermediate states.
	- Accepted values persist immediately via `R-PERSIST-1` and trigger deterministic preview refresh behavior.

### Additional Discovery and Diagnostics Scenarios

42. **Search within the currently loaded page context**
	- A user enters a search query from the active page (`catalog`, `template`, or `theme`).
	- The system searches only the data scope of that page and returns deterministic results for that context.
	- Search result navigation remains within the active page context and respects `R-MUTATE-1` and `R-LOCK-1`.

43. **Inspect preview tooltips with mapping and evaluation diagnostics**
	- A user hovers a token span in preview output.
	- The tooltip shows editor key/scope, mapped variable, authored input value, evaluated output value details.
	- When contrast rules apply, the tooltip also includes comparison source, method, threshold, and constraint diagnostics used for evaluation.