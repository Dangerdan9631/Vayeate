# Domain Model (DDD)

## Purpose

This document defines the domain model for Vayeate Theme Studio using Domain-Driven Design principles. It establishes bounded contexts, aggregates, entities, value objects, domain services, invariants, and context relationships for the application lifecycle: catalog -> template -> theme -> preview/generation/export.

## Ubiquitous Language

- Artifact: A versioned domain object managed by the application (Catalog, Template, Theme).
- Version: An immutable snapshot identified by semantic version text.
- Locked Version: A version that cannot be edited directly.
- Active Version: The selected mutable or immutable version loaded in a page context.
- Mapping: A binding from an editor token key to a template variable.
- Editor Token: The raw value defined in a catalog that is used as a token in the output theme.
- Variable: A template-defined parameter used by themes (color or contrast).
- Assignment: A theme-provided value for a variable in a variant (dark/light).
- Comparison Source: The editor token/key used as the contrast reference baseline.
- Comparison Method: Contrast policy operator (lessThan, equalTo, greaterThan).
- Evaluated Value: Final resolved value used in preview or generated output.

## Bounded Contexts

## 1) Catalog Management Context

### Responsibility

Manage editor token catalogs from manual entry or remote sync, including versioning, locking, selection, and deletion eligibility.

### Aggregate

- Catalog Aggregate

### Entities

- Catalog
  - catalogId
  - name
  - sourceType (manual | remote)
- CatalogVersion
  - version
  - locked
  - createdAt
  - updatedAt

### Value Objects

- CatalogKeySet
  - colors[]
  - semanticTokens[]
  - textMateScopes[]
- SourceUrlList
- CatalogSelection
  - catalogId + version

### Domain Services

- CatalogSyncService
  - Fetches remote sources
  - Extracts keys
  - Normalizes, deduplicates, sorts, merges
- CatalogVersioningPolicy
  - Determines in-place mutation vs new version creation
- CatalogDeletionPolicy
  - Validates delete eligibility

### Invariants

- Manual catalogs allow key edits.
- Remote catalogs do not allow direct key add/remove (keys change via sync).
- Locked catalog versions are immutable.
- All key sets are normalized, deduplicated, and deterministically ordered.

## 2) Template Authoring Context

### Responsibility

Define reusable variable models and mappings from catalog keys into template variables, including contrast comparison source definition.

### Aggregate

- Template Aggregate

### Entities

- Template
  - templateId
  - name
- TemplateVersion
  - version
  - locked
  - catalogRefs[]

### Value Objects

- VariableDefinition
  - variableId
  - variableType (color | contrast)
  - label
- ContrastVariableDefinition
  - variableId
  - targetRatio
  - comparisonSourceKey
  - comparisonSourceTarget (colors | semanticTokens | textMateScopes)
- MappingDefinition
  - target
  - editorKey
  - variableType
  - variableId
- CoverageSummary
  - mapped
  - unmapped
  - invalid

### Domain Services

- TemplateNormalizationService
  - Canonicalizes mappings and removes invalid entries
- TemplateCoverageService
  - Computes mapped/unmapped token coverage
- TemplateVersioningPolicy
  - Applies lock and version evolution rules
- TemplateReferenceUpdateService
  - Reconciles mapping state when catalog references change

### Invariants

- Locked template versions are immutable.
- Mapping entries with invalid target/editorKey are not persisted.
- Contrast-only invalid states are rejected where color pairing is required.
- Comparison source must resolve to a valid key in context.

## 3) Theme Composition Context

### Responsibility

Assign values to template variables per variant, enforce assignment and contrast policies, and manage theme lifecycle.

### Aggregate

- Theme Aggregate

### Entities

- Theme
  - themeId
  - name
  - templateRef
- ThemeVersion
  - version
  - locked
  - outputConfig

### Value Objects

- VariantAssignmentSet
  - dark assignments[]
  - light assignments[]
- VariableAssignment
  - variableId
  - value
- ContrastEvaluationPolicy
  - method (lessThan | equalTo | greaterThan)
  - threshold
  - minLightness? (HSL)
  - maxLightness? (HSL)
- ThemeRenameIntent
  - newName
  - collisionStrategy

### Domain Services

- AssignmentValidationService
  - Validates hex, numeric contrast values, useDark fallback
- VariantResolutionService
  - Resolves explicit and inherited values for dark/light
- ThemeVersioningPolicy
  - Handles locked edit behavior and version creation
- ThemeTemplateMigrationService
  - Handles template variable set changes (added/removed/renamed/orphaned)

### Invariants

- Locked theme versions are immutable.
- Light variant resolves explicit assignments before useDark fallback.
- Invalid assignments are not eligible for successful generation.
- Template reference identity remains stable for deterministic resolution.

## 4) Generation and Export Context

### Responsibility

Resolve mappings and assignments into deterministic VS Code theme payloads and write artifacts to configured boundaries.

### Aggregate

- GenerationJob Aggregate (process-scoped)

### Entities

- GenerationJob
  - jobId
  - themeRef
  - status
- GeneratedThemeArtifact
  - variant
  - payload
  - filePath

### Value Objects

- ResolutionGraph
  - grouped by (target, editorKey)
- ContrastComputationResult
  - inputColor
  - comparisonSource
  - method
  - threshold
  - evaluatedColor
  - diagnostics
- ExportTarget
  - outputDir
  - darkFileName
  - lightFileName

### Domain Services

- ThemeGenerationService
  - Produces deterministic dark/light payloads
- ContrastResolutionService
  - Applies source + method + threshold + optional HSL bounds
- DeterministicSerializationService
  - Stable key ordering and byte-equivalent output
- ExportPolicyService
  - Enforces allowed path and write safety constraints

### Invariants

- Same effective input graph yields byte-equivalent output.
- Generation fails on hard invalid mapping/contrast states.
- Export mutates only eligible output targets.

## 5) Preview and Diagnostics Context

### Responsibility

Discover preview sources, tokenize samples, render dark/light previews, and provide diagnostics including tooltip explanations.

### Aggregate

- PreviewSession Aggregate

### Entities

- PreviewSession
  - sessionId
  - themeRef
  - activeSourceSet
- PreviewSource
  - language
  - grammarFile
  - sampleFiles[]

### Value Objects

- TokenSpan
  - start
  - end
  - scopes[]
- ResolvedSpanStyle
  - editorKey
  - mappedVariable
  - inputValue
  - evaluatedValue
  - fallbackPath
- ContrastTooltipDiagnostics
  - comparisonSource
  - comparisonMethod
  - threshold
  - lightnessBounds
  - result

### Domain Services

- PreviewDiscoveryService
  - Validates grammar/sample contracts and ordering
- TokenizationService
  - Stateful TextMate tokenization
- PreviewRenderingService
  - Deterministic dual-pane render
- PreviewTooltipService
  - Produces tooltip model for a selected span

### Invariants

- Preview always resolves both dark and light views.
- Language/sample traversal is deterministic.
- Invalid source layouts are rejected with diagnostics.

## 6) Page-Scoped Search Context

### Responsibility

Provide search inside the currently loaded application page only: catalog, template, or theme.

### Aggregate

- SearchSession Aggregate

### Value Objects

- SearchScope
  - catalogPage | templatePage | themePage
- SearchQuery
- SearchResultSet
  - groupedBySection
  - deterministicOrder

### Domain Services

- PageScopedSearchService
  - Applies query to active page scope only
- SearchNavigationService
  - Navigates within current page context

### Invariants

- No cross-page/global search expansion.
- Results are deterministic within scope.
- Navigation honors lock/mutate constraints of the active context.

## Cross-Cutting Policies

- Persistence Policy
  - All valid edits are auto-persisted.
  - Debounced write is allowed, but no explicit save is required.
  - Persistence failures surface explicit error state and preserve last durable state.
- Lock and Mutability Policy
  - Locked versions are immutable.
  - Editing locked artifacts creates a new editable version per context policy.
- Deletion Policy
  - Deletion is policy-gated and never partial on rejection.
  - Successful delete updates active selection deterministically.
- Naming and Identity Policy
  - Rename operations are collision-checked.
  - Internal identity and external references remain consistent after rename.

## Context Map (High-Level)

- Catalog Management -> Template Authoring
  - Catalog key sets and versions are consumed by templates.
- Template Authoring -> Theme Composition
  - Template variables/mappings define the assignment contract for themes.
- Theme Composition -> Generation and Export
  - Theme assignments + template mappings drive generation/export.
- Theme Composition -> Preview and Diagnostics
  - Theme resolution outputs are consumed by preview rendering.
- Active Page (Catalog/Template/Theme) -> Page-Scoped Search
  - Search operates only over the active page model.

## Aggregate Consistency Boundaries

- Catalog Aggregate boundary: catalog version + key sets + source metadata.
- Template Aggregate boundary: template version + variables + mappings + catalog refs.
- Theme Aggregate boundary: theme version + assignment sets + output config.
- PreviewSession boundary: discovered sources + token spans + diagnostics for one resolved theme state.

## Domain Events (Suggested)

- CatalogCreated
- CatalogVersionLocked
- CatalogSynced
- TemplateCreated
- TemplateVersionLocked
- TemplateCatalogRefsChanged
- ThemeCreated
- ThemeAssignmentUpdated
- ThemeRenamed
- ThemeGenerationRequested
- ThemeGenerated
- PreviewSourcesDiscovered
- PreviewSpanInspected
- ArtifactDeletionRejected
- ArtifactDeleted

## Anti-Corruption Boundaries

- Remote source parsing is isolated from core catalog model via CatalogSyncService normalization.
- VS Code grammar/tokenization integration is isolated behind Preview services.
- File-system write semantics are isolated behind ExportPolicyService and serialization services.

## Implementation Guidance

- Keep use cases thin; enforce business rules in aggregates/services.
- Prefer immutable value objects for mappings, assignments, and diagnostics payloads.
- Ensure deterministic ordering at every boundary crossing (storage, generation, preview, search).
- Keep rule and policy naming aligned with the scenario document for traceability.
