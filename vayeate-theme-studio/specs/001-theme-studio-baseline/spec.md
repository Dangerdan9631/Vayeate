# Feature Specification: Theme Studio Baseline

**Feature Branch**: `[001-theme-studio-baseline]`

**Created**: 2026-06-06

**Status**: Complete

**Input**: User description: "Review the existing code base and create a comprehensive initial specification for the existing implementation. Do not modify the code, only capture the functionality."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Maintain Token Catalogs (Priority: P1)

A user manages reusable token catalogs that act as the source material for later template and theme work. The user can create catalogs, inspect versioned catalog contents, add or remove tokens, maintain semantic token registries, and manage remote catalog sources when the catalog is synchronized from external references.

**Why this priority**: Catalogs are foundational. Templates and themes depend on catalog data being available, versioned, and trustworthy.

**Independent Test**: Create a new catalog, add or import token entries, update catalog metadata, and confirm the resulting version can be reloaded and selected later.

**Acceptance Scenarios**:

1. **Given** the user is on the catalog workspace, **When** they create a new catalog with a valid unique name, **Then** the system creates an initial version and makes it available for selection.
2. **Given** a manual catalog is selected, **When** the user adds, edits, removes, searches, or bulk-adds token entries, **Then** the catalog contents reflect those edits and remain available after reload.
3. **Given** a remote catalog is selected, **When** the user manages source definitions and runs synchronization, **Then** the catalog refreshes its token content from the configured sources and reports the resulting state.
4. **Given** a catalog has older locked versions, **When** the user reverts to an earlier version or deletes a version, **Then** the version list and active selection update without corrupting the remaining catalog history.

---

### User Story 2 - Assemble Reusable Templates (Priority: P1)

A user builds templates that combine selected catalog versions with groups, variables, and token-to-variable mappings. The template acts as the structural bridge between raw tokens and editable theme assignments.

**Why this priority**: Templates define the editable design surface for themes. Without template composition, the application cannot turn catalogs into usable theme authoring inputs.

**Independent Test**: Create a template, include one or more catalog versions, define groups and variables, assign mappings for token coverage, and confirm the template can be reopened with the same structure.

**Acceptance Scenarios**:

1. **Given** one or more catalogs exist, **When** the user creates a template and includes catalog versions, **Then** the template records those selections and exposes the corresponding token mappings.
2. **Given** a template is editable, **When** the user adds or removes groups, color variables, contrast variables, or mapping assignments, **Then** the template state updates and remains persisted.
3. **Given** a template contains semantic token mappings, **When** the user adds or edits semantic variants, modifiers, or language-specific variants, **Then** those mappings remain grouped with the correct base semantic token.
4. **Given** a template version is finalized, **When** the user locks or deletes a version, **Then** the template history reflects the action and later editing respects the locked state.

---

### User Story 3 - Create, Tune, and Export Themes (Priority: P1)

A user creates a theme from a template, adjusts color and contrast assignments for dark and light variants, applies palette-wide changes, and generates exportable theme files for downstream use.

**Why this priority**: Theme authoring and export are the primary outcome of the product. This is where the application turns template structure into finished deliverables.

**Independent Test**: Create a theme, bind it to a template version, edit assignment values, increment or preserve versions as needed, run generation, and verify that paired theme outputs are produced.

**Acceptance Scenarios**:

1. **Given** a theme exists without a template, **When** the user selects a template and version, **Then** the theme loads the corresponding assignment surface and preview controls.
2. **Given** a theme has editable assignments, **When** the user changes color or contrast values, toggles reuse of dark values for light mode, or applies grouped palette actions, **Then** the theme persists those updates and reflects them in the current editing session.
3. **Given** a user wants to branch a theme revision, **When** they increment the version, **Then** a new editable version is created without overwriting the earlier one.
4. **Given** a theme has a valid template and assignments, **When** the user runs generation, **Then** the system produces dark and light export files and reports success or failure.

---

### User Story 4 - Validate Themes with Interactive Previews (Priority: P2)

A user validates theme decisions by previewing tokenized sample files in synchronized dark and light editor previews, selecting which theme tokens drive the preview chrome, and inspecting resolved color behavior for individual tokens.

**Why this priority**: Previewing reduces guesswork and lets users evaluate whether a theme behaves correctly before export.

**Independent Test**: Load a theme with a template, assign preview token references, browse sample files, and verify that preview panes update consistently for both modes.

**Acceptance Scenarios**:

1. **Given** preview samples are available, **When** the user opens a generated theme workspace, **Then** the system shows synchronized dark and light preview panes based on tokenized sample content.
2. **Given** the user changes preview token references such as foreground, background, tab, selection, or menu colors, **When** those selections are updated, **Then** the preview chrome and code samples immediately reflect the chosen mappings.
3. **Given** the user inspects an individual preview token, **When** they hover its rendered output, **Then** the system reveals the resolved mapping context needed to understand the displayed color result.

---

### User Story 5 - Continue Work Safely in a Desktop Editing Session (Priority: P3)

A user expects the desktop application to preserve editing continuity through autosave, undo history, color-scheme preference, and standard desktop window controls.

**Why this priority**: These capabilities are supporting behavior rather than the core authoring workflow, but they are necessary for sustained day-to-day use.

**Independent Test**: Make edits across the application, use undo and redo, close and reopen the app, and confirm that configuration and persisted data remain intact.

**Acceptance Scenarios**:

1. **Given** the user has made changes in an editable workspace, **When** they pause or navigate within the app, **Then** the system preserves those changes without requiring a manual save action.
2. **Given** the user has editing history, **When** they invoke undo, redo, or jump to an earlier history frame, **Then** the active workspace returns to the selected state.
3. **Given** the user uses application menus or title-bar controls, **When** they toggle color scheme, reload the app, open developer tools, or manage the window state, **Then** the application responds through its desktop shell controls.

---

## Constitution Alignment *(mandatory)*

### Application Action and Boundary Impact

- **Primary application action or use case**: Author versioned theme assets by progressing from catalogs to templates to generated theme exports.
- **Queue entry points**: Catalog, template, and theme page interactions; dialog submissions; menu actions; preview configuration changes; app bootstrap and reload flows.
- **Policy ownership**: Catalog validation and synchronization rules, template composition rules, theme generation rules, versioning rules, lock behavior, orphan detection, and undo history management.
- **App/adapters touched**: Desktop shell, menu bar, tabbed workspaces, create dialogs, details cards, token and mapping editors, palette editor, variables editor, preview panes, and overlay-based eyedropper interactions.
- **External details touched**: Local project files, exported theme files, remote source fetches for synchronized catalogs, screen capture for eyedropper support, and desktop window integration.
- **Model touch points**: Catalog records, source definitions, template records, mapping entries, color and contrast assignments, preview sample metadata, app configuration, and undo snapshots.

### Dependency and Exception Check

- **Inward dependency preserved**: User interactions drive named application actions while persisted files, remote fetches, screenshots, and desktop APIs remain replaceable outer details behind gateways and services.
- **Documented architecture exception used**: None.
- **Directive/test sync required**: None for this baseline specification because it documents current behavior rather than introducing a new implementation.
- **Refactoring expected while implementing**: None in scope for this specification effort; future work should continue separating policy, UI orchestration, and external adapters along the existing boundaries.

### Edge Cases

- What happens when a persisted catalog, template, theme, or config file is missing or malformed? The system falls back gracefully, omits invalid entries from active workflows, or shows empty state instead of crashing the session.
- How does the system handle missing or outdated references? Templates and themes can surface orphaned mappings or variables when referenced catalogs or template structures no longer align with the current selection.
- What happens if the user repeats a mutating action while queue work is still pending? Background and data operations are serialized or queued so user-visible state remains coherent.
- What happens if external detail work fails after policy validation succeeds? The system keeps the editing session active and reports the failure through status or result messaging rather than silently discarding the attempted operation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide three primary work areas for catalogs, templates, and themes within a single desktop application session.
- **FR-002**: The system MUST persist catalogs as named, versioned records that can be listed, loaded, created, deleted, reverted, and selected independently.
- **FR-003**: The system MUST support both manual catalogs and remote catalogs, with manual catalogs allowing direct token maintenance and remote catalogs allowing source-based synchronization behavior.
- **FR-004**: The system MUST let users search, add, edit, remove, and bulk-add catalog token entries, including semantic token registry data where applicable.
- **FR-005**: The system MUST validate catalog creation and editing inputs so invalid names, duplicate names, or invalid source combinations do not become persisted catalog state.
- **FR-006**: The system MUST preserve locked catalog versions as non-editable baselines while allowing users to create or restore editable working versions from version history.
- **FR-007**: The system MUST persist templates as named, versioned records that can be created, loaded, deleted, locked, and selected independently of themes.
- **FR-008**: The system MUST let users include or exclude catalog versions in a template and update included catalog versions when newer versions are available.
- **FR-009**: The system MUST let users manage template groups, color variables, contrast variables, and token mappings, including grouping and filtering behaviors that help users navigate large templates.
- **FR-010**: The system MUST support semantic token mappings with base tokens, modifier variants, optional language variants, and wildcard-style variant structures.
- **FR-011**: The system MUST preserve template integrity by surfacing missing references or orphaned mappings instead of silently dropping them.
- **FR-012**: The system MUST persist themes as named, versioned records that can be created, loaded, deleted, incremented to a new version, and selected independently.
- **FR-013**: The system MUST let a theme bind to a selected template version and derive its editable assignment surface from that template relationship.
- **FR-014**: The system MUST let users edit dark and light color assignments, contrast assignments, and per-variable reuse of dark values for light mode.
- **FR-015**: The system MUST provide grouped selection and palette-based editing tools so users can adjust multiple color assignments together, including hue shifting, clustering, direct color entry, color picking, and screen-sampled color capture.
- **FR-016**: The system MUST let users designate which mapped theme tokens drive preview-specific UI roles such as editor foreground, editor background, line numbers, tabs, scrollbars, selections, and menus.
- **FR-017**: The system MUST render synchronized dark and light sample previews using tokenized example files so users can evaluate the effect of theme assignments before export.
- **FR-018**: The system MUST generate paired exportable theme outputs for dark and light variants and report whether generation succeeded or failed.
- **FR-019**: The system MUST preserve in-progress edits through automatic persistence behavior rather than requiring manual save commands for routine authoring changes.
- **FR-020**: The system MUST provide undo, redo, and history frame navigation for user actions that participate in the editing history model.
- **FR-021**: The system MUST preserve basic application preferences and shell behavior, including color scheme selection, desktop window controls, reload actions, and access to developer tools.
- **FR-022**: The system MUST keep file storage, remote fetches, screenshot capture, and desktop shell integration behind boundary adapters so core authoring workflows remain independent from those volatile details.

### Key Entities *(include if feature involves data)*

- **Catalog**: A versioned token source definition containing token entries, optional remote sources, token classifications, and semantic token registries.
- **Catalog Source**: A remote source reference that describes where synchronized catalog data comes from and what token family it contributes.
- **Template**: A versioned composition record that selects catalog versions and defines groups, variables, and mapping rules for theme authoring.
- **Mapping**: A link between a token and the color or contrast variables that should govern its output behavior.
- **Theme**: A versioned authoring record that binds to a template and stores preview-role selections plus all color and contrast assignments needed for generation.
- **Color Assignment**: A theme value pairing for one color variable, including dark and light values and reuse behavior across modes.
- **Contrast Assignment**: A theme value pairing for one contrast variable, including target values, comparison direction, and optional min/max guardrails.
- **Preview Sample**: A tokenized example file used to show how theme assignments render across supported language samples.
- **Undo Frame**: A named point-in-time editing snapshot that allows the user to move backward or forward through authoring history.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can create a new catalog, template, and theme from an empty authoring session and reach an export-ready theme workflow in under 10 minutes using only the in-app controls.
- **SC-002**: 100% of valid generated theme actions produce exactly two export artifacts, one dark and one light, or return an explicit failure message.
- **SC-003**: A user can reload the application after making edits and recover the last persisted catalog, template, and theme states without re-entering routine changes.
- **SC-004**: A user can inspect both dark and light preview results for the same sample set in one session and verify that preview-role token assignments update both panes immediately after selection changes.

## Assumptions

- This specification describes the current desktop application behavior as implemented today, not an aspirational future redesign.
- Local project files are the system of record for catalogs, templates, themes, previews, exports, and basic app configuration.
- Theme export produces paired dark and light deliverables intended for downstream use outside the authoring tool.
- Undo history, autosave behavior, and queue-backed processing are expected to protect editing continuity across normal single-user desktop use.
