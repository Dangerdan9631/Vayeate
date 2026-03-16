# Technical Implementation Specification

## 1. Purpose

This document defines implementation-level behavior for:

1. Converting a theme configuration into VS Code theme files
2. Parsing catalogs from remote sources
3. Color-space conversion and contrast algorithms
4. Required libraries/frameworks
5. Preview rendering and text tagging from TextMate grammars

This specification is normative for implementation in `vayeate-theme-studio`.

## 2. Technology Stack

## 2.1 Runtime and Language

- Language: TypeScript (strict mode)
- Runtime: Node.js (LTS)
- UI framework: React 18
- Build/dev server: Vite
- Test runner: Vitest

## 2.2 Required Libraries

### Required (already aligned with current workspace)

- `react`
- `react-dom`
- `vscode-textmate`
- `vscode-oniguruma`

### Required for color algorithms (add if not present)

- `culori` (OKLab/OKLCH conversion support)

Rationale: `culori` provides deterministic conversion functions and avoids ad hoc color math drift.

## 2.3 Optional Utility Libraries

- `zod` for runtime schema validation
- `fast-deep-equal` for deterministic change detection in persistence/versioning decisions

## 2.4 Application Architecture

The app uses a strictly layered architecture enforced by `ts-arch` tests:

- **`src/model/`** — Zod schemas and types; no dependencies.
- **`src/gateway/`** — I/O boundary (`data/` for file repositories, `services/` for Electron IPC wrappers); depends only on model.
- **`src/domain/`** — Business logic; must not depend on `src/app/`.
  - `state/` — AppState types and reducers (depends on model only).
  - `utils/` — Pure domain helpers: color math, theme generation, tokenizer, etc. (depends on model only).
  - `core/` — UndoManagerV2 and UndoProcessor (depends on model + state).
  - `validations/` — Pure input/state validators (depends on model + state).
  - `operations/` — Atomic units: setState + gateway/services calls (the only layer that may use gateway/services).
  - `controllers/` — Compose operations + validations; must NOT import gateway directly.
- **`src/app/`** — UI and routing; must not depend on gateway.
  - `actions/` — `AppActionV2` union + `ActionQueue`.
  - `handlers/` — Per-domain handler files + `handler-registry.ts`; routes each action to a controller; must NOT import gateway, operations, validations, or state directly.
  - `viewmodel/` — State → UI derivation hooks.
  - `ui/` — React components and context providers. `AppContext.tsx` is a lean provider (~150 lines).

All user-triggered mutations flow through the `ActionQueue`. `AppContext` delegates to `createActionProcessor` (handler-registry), which routes by action prefix to the correct domain handler (exhaustive switch), which invokes a controller.

---

## 3. Theme Configuration -> VS Code Theme File

## 3.1 Inputs

- Template version (variables + mappings)
- Theme version (dark/light assignments)
- Catalog references (for editor token universe)
- Output configuration (`darkFileName`, `lightFileName`, `outputDir`)

## 3.2 Output Files

- One JSON file for `dark`
- One JSON file for `light`

Each output MUST include at minimum:

- `name`: `<Theme Name> (dark|light)`
- `type`: `dark` or `light`
- `semanticHighlighting`: `true`
- `colors`: object map
- `semanticTokenColors`: object map
- `tokenColors`: array for TextMate scopes

## 3.3 Generation Pipeline

1. Load active template and theme versions.
2. Validate mutability/consistency state (generation allowed even from locked versions, but inputs must be valid).
3. Canonicalize mappings by tuple `(target, editorKey, variableType, variableId)`.
4. Build resolution groups keyed by `(target, editorKey)`.
5. Resolve per variant:
   - Dark: explicit dark assignments only
   - Light: explicit light assignment else `useDark` fallback
6. Apply contrast policies where configured.
7. Build VS Code payload objects (`colors`, `semanticTokenColors`, `tokenColors`).
8. Serialize deterministically (stable key order + formatting policy).
9. Write to output targets atomically.

## 3.4 Mapping-to-Output Rules

### colors target

- Output path: `colors[editorKey] = resolvedColor`
- If contrast exists without valid comparison source in group context, emit blocking generation error.

### semanticTokens target

- Output path: `semanticTokenColors[editorKey] = { foreground: resolvedColor }`
- If no color is resolved, omit key and emit warning diagnostic.

### textMateScopes target

- Output path: append to `tokenColors`:
  - `scope: editorKey` (string or array when grouped)
  - `settings.foreground: resolvedColor`

## 3.5 Deterministic Serialization Policy

- Encoding: UTF-8
- Newline: LF
- Trailing newline: required
- JSON indentation: 2 spaces
- Object keys sorted ascending lexicographically
- `tokenColors` sorted by `scope` (string compare on joined scope expression)

## 3.6 Atomic Write Policy

For each output file:

1. Write to `<target>.tmp`
2. fsync temp file
3. Replace target file atomically (rename)
4. On failure, preserve prior target and emit `E-EXPORT-002`

---

## 4. Remote Catalog Parsing

## 4.1 Supported Source Types

- Raw JSON/JSONC text documents
- Markdown/HTML-like docs with key examples in:
  - backticks: `` `editor.foreground` ``
  - `<code>editor.foreground</code>`

## 4.2 Extraction Pipeline

1. Fetch each URL with timeout and retry policy.
2. Normalize line endings to `\n`.
3. Extract candidate tokens from:
   - Backtick regex: ``/`([^`]+)`/g``
   - Code-tag regex: `/\<code\>(.*?)\<\/code\>/gis`
4. Parse token candidates using classifier rules.
5. Classify candidate into one of:
   - `colors`
   - `semanticTokens`
   - `textMateScopes`
6. Normalize each key:
   - trim whitespace
   - collapse internal whitespace where invalid
   - reject empty strings
7. Deduplicate per key set.
8. Sort ascending lexicographically.
9. Merge with existing catalog keys.
10. If merged key set differs, create next version.

## 4.3 Key Classification Heuristics

- `colors`: matches common VS Code color-key shape (dot-delimited identifiers)
- `semanticTokens`: dot-delimited semantic token style (e.g., `variable.readonly`, `function.defaultLibrary`)
- `textMateScopes`: comma-separated or dot-chain scope selectors (`keyword.control`, `entity.name.function`)

If ambiguous:

- Prefer configured source mapping hints (if provided)
- Else classify as `textMateScopes` only when selector characters indicate scope syntax
- Otherwise classify as `colors`

## 4.4 Remote Error Handling

- Fetch failure per URL -> warning unless all URLs fail
- All URLs fail -> blocking sync error
- Parse failure for individual snippets -> warning with source offset
- Persist only valid normalized keys

---

## 5. Color Space and Contrast Algorithms

## 5.1 Canonical Color Input Rules

Accepted input:

- `#RRGGBB` only (case-insensitive)

Rejected input:

- shorthand (`#RGB`)
- alpha variants
- named colors

Persist canonical format:

- lowercase hex `#rrggbb`

## 5.2 Conversion Functions

Implement these pure functions:

- `hexToRgb(hex) -> {r,g,b}` in [0,255]
- `rgbToHex({r,g,b}) -> #rrggbb`
- `rgbToLinearSrgb({r,g,b}) -> {r,g,b}` in [0,1]
- `linearSrgbToRelativeLuminance({r,g,b}) -> number`
- `hexToOklab(hex) -> {L,a,b}` via `culori`
- `oklabToHex({L,a,b}) -> #rrggbb` via `culori`
- `rgbToHsl({r,g,b}) -> {h,s,l}` with `l` in [0,1]

## 5.3 WCAG Contrast Ratio

Given foreground luminance $L_f$ and background luminance $L_b$:

$$
\text{contrast} = \frac{\max(L_f, L_b) + 0.05}{\min(L_f, L_b) + 0.05}
$$

Use full precision internally; round only for display (2 decimals).

## 5.4 Contrast Comparison Policy

For theme-level comparison methods:

- `lessThan`: pass if `contrast < threshold`
- `equalTo`: pass if `abs(contrast - threshold) <= 0.005`
- `greaterThan`: pass if `contrast > threshold`

## 5.5 HSL Lightness Bounds

When optional bounds are set:

- validate `0 <= minL <= maxL <= 1`
- evaluated output color MUST satisfy `minL <= l <= maxL`
- if violated, emit blocking validation for generation

## 5.6 Color Adjustment Strategy

When contrast correction is required:

1. Keep hue and chroma as stable as possible (operate in OKLab/OKLCH).
2. Iteratively adjust lightness component `L`.
3. Use bounded binary search over `L` in [0,1], max 20 iterations.
4. Select nearest color that satisfies comparison method and optional HSL bounds.
5. If no feasible solution exists, return blocking diagnostic.

---

## 6. Preview Rendering with TextMate Tagging

## 6.1 Inputs

- Grammar file per language (`.tmLanguage`, `.tmLanguage.json`, `.plist`)
- Sample text files
- Active resolved dark/light theme payloads

## 6.2 Grammar Discovery Rules

Per language folder:

- exactly one grammar file is required
- at least one non-hidden sample file is required
- folder traversal order is lexicographic ascending
- sample order is lexicographic ascending

## 6.3 Tokenization Engine Setup

- Use `vscode-oniguruma` WASM loader before grammar parse.
- Initialize `Registry` from `vscode-textmate` with grammar loader callback.
- Cache grammars per language ID.

## 6.4 Line-by-Line Tokenization

Algorithm:

1. Initialize `ruleStack = INITIAL`.
2. For each line in sample text:
   - call `grammar.tokenizeLine(line, ruleStack)`
   - collect `tokens`
   - update `ruleStack` from result
3. Convert token offsets to span model:
   - `[startIndex, endIndex, scopes[]]`
4. Insert explicit unscoped spans where gaps exist.

## 6.5 Span Tagging Model

Each rendered span MUST include:

- raw text
- scope chain
- resolved editor key (if mapped)
- mapped variable ID (if mapped)
- authored input value
- evaluated output value
- fallback path used (if any)
- contrast diagnostics (if policy applied)

## 6.6 Color Resolution in Preview

For each span, resolve foreground by fallback chain:

1. matching TextMate token color rule
2. matching semantic token color rule
3. `editor.foreground`

Always render both dark and light outputs side-by-side.

## 6.7 Incremental Update Behavior

- Assignment edits trigger debounced recomputation for affected spans.
- Full retokenization is required only when grammar/sample changes.
- Variant color updates SHOULD reuse cached token spans and only rerun style resolution.

---

## 7. Diagnostics and Error Mapping

## 7.1 Generation Errors

- Contrast mapping without valid color source -> blocking
- Invalid assignment format -> blocking
- Unresolved required variable -> blocking

## 7.2 Catalog Sync Errors

- Remote URL fetch fail -> warning or blocking if all fail
- Extracted key invalid -> warning with source snippet

## 7.3 Preview Errors

- Missing grammar file -> blocking for that language
- Multiple grammar files -> blocking for that language
- Tokenization failure -> language-level blocking with fallback plain-text render option (optional)

---

## 8. Module Structure (current)

- `src/domain/core/` — undo only
  - `undo-manager-v2.ts`
  - `undo-processor.ts`
- `src/domain/utils/` — theme engine, color, tokenizer, scope, merge, logger, version
  - `theme-generator.ts`, `theme-exporter.ts`, `theme-parser.ts`, `theme-template-merge.ts`, `template-catalog-merge.ts`
  - `color.ts`, `color-clustering.ts`
  - `scope-resolver.ts`, `semantic-token.ts`, `tokenizer.ts`
  - `logger.ts`, `version.ts`
- Catalog sync and IPC: `src/gateway/services/` (e.g. `catalog-sync.ts`)

Each module SHOULD expose pure functions where possible and keep side effects isolated to I/O boundaries.
