# Data Model: Theme Studio Baseline

## Overview

The application revolves around versioned authoring artifacts. Catalogs define
token sources, templates define reusable mapping structure, and themes define
editable assignments plus generated outputs.

## Entities

### Catalog

**Purpose**: A versioned token source used as the foundation for templates.

**Core fields**:

- `name`: unique catalog identifier using alphanumeric characters and hyphens
- `version`: semantic version string
- `type`: `manual` or `remote`
- `locked`: whether the version is non-editable
- `sources`: zero or more remote source definitions
- `tokens`: theme, textmate, or semantic token entries
- `semanticTokenTypes`: available semantic base types
- `semanticTokenModifiers`: available semantic modifiers
- `semanticTokenLanguages`: available semantic languages

**Validation rules**:

- Name must match the shared catalog naming convention.
- Version must match semantic version formatting.
- Remote source type and token type combinations must remain valid.
- Invalid persisted catalogs are ignored rather than trusted blindly.

**Relationships**:

- A catalog can have many versions.
- A template can reference multiple catalog versions.

### Catalog Source

**Purpose**: A remote input definition for synchronized catalogs.

**Core fields**:

- `url`: remote source location
- `type`: remote source family
- `tokenType`: token family contributed by the source

**Validation rules**:

- URL must be a valid HTTP URL.
- Source type must be compatible with the selected token family.

### Token

**Purpose**: A single token entry used in catalogs and mappings.

**Core fields**:

- `key`: token identifier
- `type`: `theme`, `textmate token`, or `semantic token`

**Validation rules**:

- Token keys must match the shared token selector pattern.

### Template

**Purpose**: A versioned composition artifact that organizes tokens into a
theme-authoring structure.

**Core fields**:

- `name`: unique template identifier
- `version`: semantic version string
- `locked`: whether the version is non-editable
- `catalogRefs`: selected catalog versions
- `mappings`: token-to-variable assignments
- `colorVariables`: editable color variable definitions
- `contrastVariables`: editable contrast variable definitions
- `groups`: optional user-defined grouping labels
- `semanticTokenModifiers`: reusable semantic modifier values
- `semanticTokenLanguages`: reusable semantic language values

**Validation rules**:

- Name and version follow the shared conventions.
- Variables and mappings must use typed keys.
- Lock behavior prevents ongoing edits to finalized versions.

**Relationships**:

- References many catalog versions.
- Owns many mappings, color variables, contrast variables, and groups.
- A theme references one template version at a time.

### Catalog Reference

**Purpose**: A link from a template to one specific catalog version.

**Core fields**:

- `name`
- `version`

### Mapping

**Purpose**: Connect a token to a color variable, contrast variable, and
optional group.

**Core fields**:

- `token`: referenced token identity
- `colorVariableRef`: optional color variable key
- `contrastVariableRef`: optional contrast variable key
- `groupRef`: optional grouping label

**Validation rules**:

- Mappings can become orphaned when source tokens disappear; that state must be
  visible to the user instead of silently removed.
- Semantic mappings support base selectors, modifier variants, language
  variants, and wildcard variants.

### Color Variable

**Purpose**: A named editable color slot used by one or more mappings.

**Core fields**:

- `key`: variable identifier
- `groupRef`: optional grouping label

### Contrast Variable

**Purpose**: A named editable contrast rule used by one or more mappings.

**Core fields**:

- `key`: variable identifier
- `comparisonSourceRef`: referenced color variable used as the comparison basis
- `groupRef`: optional grouping label

### Theme

**Purpose**: A versioned theme-authoring artifact that binds a template to
editable assignments and preview settings.

**Core fields**:

- `name`: unique theme identifier
- `version`: semantic version string
- `templateRef`: selected template version or null
- preview-role token references for editor and chrome surfaces
- `colorAssignments`: per-color-variable dark and light values
- `contrastAssignments`: per-contrast-variable dark and light values
- `applyPaletteToDark`: whether palette-wide edits affect dark values
- `applyPaletteToLight`: whether palette-wide edits affect light values
- `paletteClusterCountK`: palette clustering size
- `paletteClusterGroupIds`: selected palette grouping scope

**Validation rules**:

- Name and version follow shared conventions.
- Generated export requires a template reference plus resolvable assignments.
- Missing assignment structure should surface as an editing or generation issue.

**Relationships**:

- References one template version.
- Owns many color assignments and contrast assignments.
- Produces two generated theme outputs.

### Color Assignment

**Purpose**: Stores editable light and dark color values for a single color
variable.

**Core fields**:

- `colorRef`: color variable key
- `dark`: optional dark value
- `light`: optional light value
- `useDarkForLight`: whether the dark value should be reused for light mode

### Contrast Assignment

**Purpose**: Stores editable contrast rules for a single contrast variable.

**Core fields**:

- `contrastVariableRef`: contrast variable key
- `dark`: optional dark-mode rule
- `light`: optional light-mode rule
- `useDarkForLight`: whether the dark rule should be reused for light mode

### Contrast Assignment Value

**Purpose**: Defines one side of a contrast rule.

**Core fields**:

- `value`: target contrast value
- `comparisonMethod`: less than, equal to, or greater than
- `min`: optional lower bound
- `max`: optional upper bound

### Preview Sample

**Purpose**: Represents a tokenized source example rendered in theme previews.

**Core fields**:

- `language`: sample language or family
- `fileName`: sample file name
- `lines`: tokenized line content with scopes

**Relationships**:

- Consumed by a theme preview session.
- Does not own persisted theme data but validates it visually.

### App Config

**Purpose**: Persist simple session-independent application preferences.

**Core fields**:

- `colorScheme`: `light` or `dark`

### Undo Frame

**Purpose**: Captures a named editing snapshot inside the undo stack.

**Core fields**:

- `id`: unique frame identifier
- `description`: user-visible history label

## State Transitions

### Catalog Lifecycle

1. Created at an initial version.
2. Edited or synchronized while unlocked.
3. Optionally locked as a stable version.
4. May be reverted from an older version into a new working state.
5. May be deleted by version.

### Template Lifecycle

1. Created at an initial version.
2. Updated by changing included catalogs, variables, groups, or mappings.
3. Locked when ready for stable reuse.
4. May be deleted by version.

### Theme Lifecycle

1. Created at an initial version.
2. Bound to a template version.
3. Edited through assignments, palette tools, and preview-role selections.
4. Incremented to create a new version.
5. Generated into dark and light export artifacts.
6. May be deleted by version.
