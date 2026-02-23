# Normative Behaviors Specification

## 1. Purpose

This document defines **normative** behavior for Vayeate Theme Studio across:

1. Normative contracts
2. Deterministic rulebook
3. UI interaction contracts
4. Error and diagnostics catalog

This spec is authoritative for implementation and tests.

## 2. Normative Language

The terms **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

## 3. Scope

In scope:

- Catalog, Template, Theme, Preview, and Export runtime behavior
- Contract-level request/response semantics
- Storage and serialization determinism
- UI state transition and validation behavior
- Error identity and diagnostics payload shape

Out of scope:

- Packaging/publishing mechanics outside Theme Studio
- Non-functional SLOs and telemetry dashboards

---

## 4. Normative Contracts

## 4.1 Contract Model

All commands and queries MUST conform to this envelope.

### 4.1.1 Command Request

- `commandId: string` (UUID or deterministic ID)
- `timestamp: string` (ISO-8601 UTC)
- `actor: { type: "user" | "system", id: string }`
- `payload: object`

### 4.1.2 Command Result

- `status: "accepted" | "rejected" | "failed"`
- `artifactRef?: { type, id, version }`
- `events: DomainEvent[]`
- `diagnostics: Diagnostic[]`

### 4.1.3 Query Request/Response

- Query responses MUST be side-effect free.
- Query responses MUST be deterministically ordered (see §5).

## 4.2 Command Contracts (Authoritative)

| Command | Preconditions | Effects | Success Result | Rejection Conditions |
|---|---|---|---|---|
| `CreateCatalog` | name valid; sourceType present | Creates catalog + v1 unlocked | returns `artifactRef` | name collision (`E-NAME-001`) |
| `UpdateManualCatalogKeys` | catalog source=`manual`; version mutable | Upserts/removes keys; persists immediately | updated version ref | locked (`E-LOCK-001`), invalid key (`E-CATALOG-001`) |
| `SyncRemoteCatalog` | catalog source=`remote`; source URL valid | fetch/normalize keys; MAY create new version on key-set change | sync summary | remote fetch/parse failures (`E-REMOTE-*`) |
| `LockCatalogVersion` | target exists and unlocked | sets locked=true | locked version ref | already locked (`E-LOCK-002`) |
| `RenameCatalog` | new name valid/non-colliding | updates display identity only | renamed artifact ref | collision (`E-NAME-001`) |
| `DeleteCatalogVersion` | deletion policy satisfied | removes targeted version only | delete receipt + fallback selection | policy block (`E-DELETE-*`) |
| `CreateTemplate` | name valid; catalog refs valid | creates template + v1 unlocked | artifact ref | name collision, invalid refs |
| `UpdateTemplateMappings` | version mutable | validates/canonicalizes mappings | updated version ref | invalid mapping (`E-TEMPLATE-002`) |
| `SetTemplateContrastSource` | variable type = contrast; source key resolvable | persists comparison source assignment | updated ref | unresolved source (`E-CONTRAST-003`) |
| `LockTemplateVersion` | exists and unlocked | sets locked=true | locked ref | already locked |
| `RenameTemplate` | valid/non-colliding | updates display identity | renamed ref | collision |
| `DeleteTemplateVersion` | deletion policy satisfied | removes targeted version only | delete receipt | policy block |
| `CreateTheme` | template version valid | creates theme + v1 unlocked | artifact ref | invalid template ref |
| `UpdateThemeAssignments` | version mutable | validates and persists per variant | updated ref | invalid assignment (`E-THEME-001`) |
| `SetContrastPolicy` | contrast variable exists | sets method/threshold/lightness bounds | updated ref | invalid bounds (`E-CONTRAST-004`) |
| `MigrateThemeToTemplateVersion` | target template version exists | executes migration rules (§4.5) | migration report | blocked unresolved conflicts (`E-MIGRATE-*`) |
| `LockThemeVersion` | exists and unlocked | sets locked=true | locked ref | already locked |
| `RenameTheme` | valid/non-colliding | updates display identity | renamed ref | collision |
| `DeleteThemeVersion` | deletion policy satisfied | removes targeted version only | delete receipt | policy block |
| `GenerateThemeArtifacts` | theme state valid | resolves + serializes deterministic outputs | artifact checksums + payload paths | validation failures (`E-GEN-*`) |

## 4.3 Persistence Schema Contracts

### 4.3.1 Common Artifact Shape

Every artifact persisted representation MUST contain:

- `id: string`
- `name: string`
- `versions: VersionRecord[]`
- `activeVersion: string`
- `createdAt: string`
- `updatedAt: string`

Every `VersionRecord` MUST contain:

- `version: string`
- `locked: boolean`
- `createdAt: string`
- `updatedAt: string`
- `content: object` (context-specific payload)

### 4.3.2 Required Ordering

Arrays in persisted payloads MUST be sorted deterministically:

1. `target` order: `colors`, `semanticTokens`, `textMateScopes`
2. `editorKey` ascending (binary-safe lexical)
3. `variableId` ascending
4. `version` semantic ascending unless explicitly requested descending in query responses

### 4.3.3 Rename Semantics

Rename operations MUST NOT change internal IDs (`catalogId`, `templateId`, `themeId`).
References MUST remain by ID, never by name.

## 4.4 Versioning and Locking Contracts

- Locked versions are immutable (`R-LOCK-1`).
- Editing locked versions MUST create a new unlocked version.
- Manual catalog key edits MAY mutate active unlocked version.
- Remote catalog key changes MUST occur only through sync.
- Template/theme edits MUST enforce mutability gate before persist.
- All accepted edits MUST persist immediately (`R-PERSIST-1`), with debounced IO allowed.

## 4.5 Theme Migration Contract (Template Version Changes)

When migrating theme to a new template version:

- Added variable: create `unassigned` state per variant.
- Removed variable: mark prior assignments as `orphaned`; exclude from generation.
- Renamed variable: retain assignment only when explicit rename map exists.
- Changed variable type: old assignment invalidated; require reassignment.
- Migration result MUST include: `added[]`, `removed[]`, `renamed[]`, `orphaned[]`, `invalidated[]`.
- Generation MUST reject unresolved required assignments.

---

## 5. Deterministic Rulebook

## 5.1 Normalization Rules

### 5.1.1 Keys and Names

- Keys MUST be trimmed and preserved case-sensitively.
- Empty keys MUST be rejected.
- Duplicate keys (same target + key) MUST be deduplicated by last-write-wins in memory, then persisted once.
- Artifact names MUST be trimmed; internal whitespace normalized to single spaces for collision checks.

### 5.1.2 Mapping Canonicalization

A mapping is canonical by tuple `(target, editorKey, variableId)`.
Non-canonical duplicates MUST collapse to one persisted record.

## 5.2 Serialization Rules

- JSON output MUST use UTF-8, LF newlines, trailing newline present.
- Object key ordering MUST be stable and deterministic.
- Generated output for equivalent effective input graph MUST be byte-equivalent.
- File naming MUST be deterministic from configured output names.

## 5.3 Contrast Evaluation Rules

### 5.3.1 Inputs

- `comparisonSource` (template-defined editor key)
- `method`: `lessThan | equalTo | greaterThan`
- `threshold` (numeric ratio)
- optional `minLightness`, `maxLightness` (HSL, inclusive)

### 5.3.2 WCAG Ratio

Relative luminance and contrast ratio MUST follow WCAG 2.x formula.
Rounding MUST occur only at final display layer; internal comparisons use full precision.

### 5.3.3 Method Semantics

- `lessThan`: evaluated contrast `< threshold`
- `equalTo`: absolute delta `<= 0.005` from threshold
- `greaterThan`: evaluated contrast `> threshold`

### 5.3.4 Lightness Bounds

If provided:

- `minLightness <= maxLightness` MUST hold.
- Evaluated color lightness MUST satisfy inclusive bounds.
- Bound violations produce blocking validation for generation.

---

## 6. UI Interaction Contracts

## 6.1 Page State Machine (Catalog/Template/Theme)

States:

- `loading`
- `ready.readonly`
- `ready.editable`
- `saving`
- `saveFailed`
- `deleting`
- `error.blocking`

Transitions:

- Load success -> `ready.readonly|editable` based on mutability gate
- Valid edit in editable state -> `saving` -> `ready.editable`
- Persist failure -> `saveFailed` (last durable state remains visible)
- Retry success from `saveFailed` -> prior `ready.*`
- Lock action in editable -> `ready.readonly`
- Edit intent on locked -> auto-create new unlocked version -> `ready.editable`

## 6.2 Component Behavior Matrix

| Condition | Input Fields | Destructive Actions | Lock Action | Rename | Generate |
|---|---|---|---|---|---|
| Unlocked + mutable | enabled | policy-gated | enabled | enabled | enabled if valid |
| Locked | disabled | policy-gated | disabled | enabled | enabled if valid |
| Remote catalog key list | disabled | policy-gated | enabled | enabled | n/a |
| Save failed | disabled during retry | disabled | disabled | disabled | disabled |

## 6.3 Validation Timing

- Field syntax validation: on change.
- Cross-field/domain validation: on blur and on affected dependency change.
- Blocking validation: MUST prevent generation/export and MUST display inline + summary.
- Non-blocking warnings: MAY allow persist but MUST show diagnostics.
- Hex input and color picker MUST remain synchronized bidirectionally.

## 6.4 Persistence UX Contract

- No manual save button.
- Persist indicator states: `Persisted`, `Saving…`, `Save failed`.
- Save failure MUST preserve local intent for retry and show explicit remediation action.
- Any accepted mutation MUST enter persistence queue immediately.

## 6.5 Search Contract (Page-Scoped Only)

- Search scope MUST be current page only (`Catalog` | `Template` | `Theme`).
- No global cross-page expansion.
- Results MUST be deterministic and grouped by page section.
- Search navigation MUST NOT change active page.

---

## 7. Error and Diagnostics Catalog

## 7.1 Diagnostic Payload Contract

Each diagnostic MUST include:

- `id: string` (stable)
- `severity: "error" | "warning" | "info"`
- `scope: "catalog" | "template" | "theme" | "preview" | "generation" | "export"`
- `message: string`
- `details?: string`
- `fieldPath?: string`
- `artifactRef?: { type, id, version }`
- `remediation?: string`

## 7.2 Canonical Error IDs

### 7.2.1 Naming/Identity

- `E-NAME-001` Name collision
- `E-NAME-002` Invalid name format
- `E-IDENT-001` Missing artifact reference

### 7.2.2 Lock/Mutability

- `E-LOCK-001` Version is locked and immutable
- `E-LOCK-002` Version already locked
- `E-MUTATE-001` Mutation not allowed for source type

### 7.2.3 Catalog

- `E-CATALOG-001` Invalid editor key
- `E-CATALOG-002` Duplicate key set conflict
- `E-REMOTE-001` Remote fetch failed
- `E-REMOTE-002` Remote parse failed
- `E-REMOTE-003` Remote schema unsupported

### 7.2.4 Template

- `E-TEMPLATE-001` Invalid variable definition
- `E-TEMPLATE-002` Invalid mapping tuple
- `E-CONTRAST-003` Comparison source unresolved

### 7.2.5 Theme / Contrast

- `E-THEME-001` Invalid assignment value
- `E-CONTRAST-001` Invalid method
- `E-CONTRAST-002` Invalid threshold
- `E-CONTRAST-004` Invalid lightness bounds
- `E-CONTRAST-005` Contrast evaluation unsatisfied

### 7.2.6 Migration / Deletion / Generation

- `E-MIGRATE-001` Unmapped required variable
- `E-MIGRATE-002` Rename map conflict
- `E-DELETE-001` Protected artifact/version
- `E-DELETE-002` Artifact in use by downstream reference
- `E-GEN-001` Blocking validation present
- `E-GEN-002` Deterministic serialization failure
- `E-EXPORT-001` Output path not allowed
- `E-EXPORT-002` File write failed

## 7.3 Display Rules

- Blocking errors MUST be shown in:
  - inline field region (if field-bound)
  - page-level summary panel
- Warnings SHOULD be inline and MAY be summarized.
- Diagnostics in preview tooltip MUST include input value, evaluated value, fallback path, and contrast metadata when applicable.

---

## 8. Conformance Checklist

An implementation is conformant only if all are true:

1. Command/query/persistence envelopes in §4 are implemented.
2. Versioning/locking behavior follows §4.4 and migration follows §4.5.
3. Determinism rules in §5 produce byte-equivalent outputs for equivalent input graphs.
4. UI state machine and validation timing in §6 are enforced.
5. Errors use IDs and payload shape from §7.
6. Page search is scoped-only per §6.5.
7. Rename, delete, and persist behavior match policy references (`R-PERSIST-1`, `R-LOCK-1`, `R-MUTATE-1`, `R-DELETE-1`).