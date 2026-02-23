# Vayeate Theme Studio UI Specification

## 1. Purpose and Scope

This document defines the user interface specification for the standalone `vayeate-theme-studio` application.

It is implementation-oriented and uses a standardized component system for a clean new application surface. Legacy UI compatibility is not a goal.

### In Scope

- Information architecture and page structure
- Layout primitives and composition rules
- Reusable UI components and behavior contracts
- Validation, persistence, lock/mutability, and deletion UX behaviors
- Search, diagnostics, and preview interactions
- Accessibility and interaction quality requirements

### Out of Scope

- Root extension packaging/manifest behavior
- Styling token values (color palette/theme system internals)
- Final pixel-perfect visual design assets

## 2. Product UI Principles

1. Deterministic by default: ordering, rendering, and outputs are stable for identical inputs.
2. Persist continuously: valid edits auto-save without explicit save actions.
3. Explain state clearly: lock state, invalid state, and persistence status are always visible.
4. Prefer local context: operations and search are scoped to the active page context.
5. Minimize ambiguity: every critical action has explicit confirmation, diagnostics, and post-action state.

## 3. UI Ubiquitous Language

- Artifact: A versioned object managed by the UI (`Catalog`, `Template`, `Theme`).
- Active Context: The currently loaded page (`Catalog`, `Template`, `Theme`) and selected artifact/version.
- Pane: A vertical or horizontal layout region with independent scroll ownership.
- Card: A bounded content container with title, body, and optional actions.
- Section: Logical grouping inside a card.
- Inline Status: Non-blocking status signal near data (valid, invalid, locked, stale, persisted).
- Blocking Error: Error state that prevents completion of a user action.
- Evaluated Value: Final resolved value shown in preview/export diagnostics.

## 4. Information Architecture

## 4.1 Global App Shell

- Persistent top app header
  - App title
  - Active artifact summary
  - Global persistence indicator
- Primary navigation tabs
  - `Catalogs`
  - `Templates`
  - `Themes`

## 4.2 Navigation Rules

- User may switch pages at any time.
- Unsaved manual save prompts are not used (autosave model).
- If persistence queue has failed items, page switch is allowed but visible warning remains persistent until resolved.

## 4.3 Page-Scoped Search Rule

- Search input belongs to each page, not global shell.
- Query applies only to active page data model.
- No cross-page result aggregation.

## 5. Layout System

## 5.1 Layout Primitives

- `AppShell`: global frame and navigation
- `PageFrame`: page title + toolbar + content region
- `SplitColumns`: multi-column layout container
- `Stack`: vertical flow with controlled spacing
- `Card`: section container
- `CardHeader`: title, metadata, actions
- `CardBody`: content area
- `ActionBar`: grouped actions with primary/secondary hierarchy

## 5.2 Column Rules

### Default desktop composition

- Two-column pages: `35/65` or `40/60`
- Three-column pages (theme-heavy): `33/33/34`

### Responsive behavior

- Breakpoint <= tablet: collapse to single column stack
- Preserve semantic order on collapse: selector -> editor -> diagnostics/preview

### Scroll ownership

- Each column has independent vertical scroll when content exceeds viewport.
- Headers and action bars remain sticky within column where practical.

## 5.3 Card Rules

- All interactive groups live inside cards.
- Card headers must include context label and item count (when list-like).
- Empty states are rendered inside cards, not as page-level blank text.

## 6. Component Specification

## 6.1 Tabs

### Purpose

Switch among top-level bounded UI contexts.

### Required behavior

- Single active tab
- Keyboard navigation (`Left/Right`, `Home/End`, `Enter/Space`)
- Active tab state persists per session

### States

- Default, Hover, Focus, Active, Disabled

## 6.2 Column Containers

### Purpose

Organize selection, editing, and diagnostics areas.

### Required behavior

- Supports resizable gutters (optional)
- Honors collapse behavior by breakpoint
- Retains scroll position per page

## 6.3 Cards

### Purpose

Provide structured and scannable editing modules.

### Required behavior

- Header with title
- Optional subtitle/metadata row
- Optional header actions
- Body with consistent spacing rhythm

## 6.4 Data Lists / Tables

### Purpose

Render version lists, tokens, mappings, variables, and search results.

### Required behavior

- Deterministic ordering
- Sort indicator if sortable
- Inline status badges
- Empty and loading states

## 6.5 Form Inputs

### Inputs required

- Text input
- Search input
- Select/dropdown
- Multi-select list
- Checkbox/toggle
- Numeric input
- Color input pair (hex + picker)

### Shared rules

- Label is mandatory
- Help text optional
- Validation message shown inline under field
- Invalid field must include machine-readable state (`aria-invalid`)

## 6.6 Action Buttons

### Types

- Primary (one per local action group)
- Secondary
- Tertiary/text
- Destructive

### Rules

- Destructive actions require confirmation
- Disabled state includes reason tooltip or helper text

## 6.7 Inline Status Indicators

### Status values

- `Persisted`
- `Saving`
- `Save Failed`
- `Locked`
- `Invalid`
- `Orphaned`
- `Stale`

### Rules

- Always text + icon (not color alone)
- `Save Failed` includes retry affordance

## 6.8 Dialogs

### Use cases

- Deletion confirmation
- Rename conflict resolution
- Lock operation confirmation

### Rules

- Focus trap required
- Escape closes only non-destructive confirmations
- Primary button text must reflect action (e.g., `Delete Version`)

## 6.9 Banners / Toasts

### Banners

Persistent page-level messages for blocking or high-priority state.

### Toasts

Short-lived feedback for successful non-blocking actions.

### Rule

Critical persistence errors use banners, not toasts.

## 6.10 Tooltips

### Purpose

Provide contextual diagnostics without requiring page transition.

### Preview tooltip content contract

- Editor key/scope
- Mapped variable
- Authored input value
- Evaluated value
- Fallback path
- Contrast diagnostics (when applicable)

## 7. Cross-Cutting Interaction Rules

## 7.1 Persistence UX

- Valid edits auto-save after short debounce.
- Saving state appears inline and in global persistence indicator.
- Save failure shows persistent banner + local inline status.
- Retry mechanism available at artifact and global levels.
- No silent conflict resolution; deterministic last-write ordering is preserved.

## 7.2 Lock / Mutability UX

- Locked artifact versions are visibly read-only.
- Editing a locked version starts a new editable version flow.
- UI must show source of mutability constraints (lock vs remote source policy).

## 7.3 Deletion UX

- Deletion action gated by eligibility check.
- Ineligible deletion displays reasons before confirmation.
- On success, selection moves to deterministic fallback item.
- On rejection, selection and state remain unchanged.

## 7.4 Rename UX

- Rename supports catalog/template/theme.
- Name collisions are prevented with inline validation.
- Reference-impact summary is shown before submit.

## 8. Page Specifications

## 8.1 Catalogs Page

### Layout

- Left column: Catalog and version selector
- Right column: Catalog editor/details

### Required cards

1. Catalog Selector Card
2. Catalog Metadata Card
3. Key Sets Card (`colors`, `semanticTokens`, `textMateScopes`)
4. Source Configuration Card (remote only)
5. Sync/Lock/Delete Action Card

### Key interactions

- Create manual catalog
- Create remote catalog
- Sync remote catalog
- Lock version
- Delete version
- Rename catalog
- Page-scoped search over catalog keys and versions

### Validation/feedback

- Duplicate keys normalized and highlighted before persistence
- Remote key edit controls disabled with explicit reason

## 8.2 Templates Page

### Layout

- Left column: Template/version selector + catalog refs
- Middle column: Mapping editor
- Right column: Variables and diagnostics

### Required cards

1. Template Selector Card
2. Catalog References Card
3. Variables Card
4. Mappings Card
5. Coverage and Variable Usage Card
6. Lock/Delete/Rename Action Card

### Key interactions

- Add/edit/remove variables
- Assign contrast comparison source at template level
- Create/update mappings
- Modify catalog refs and view invalid/orphaned mappings
- Lock version
- Rename template
- Page-scoped search over variables and mappings

### Validation/feedback

- Invalid mapping rows marked inline
- Comparison source unresolved state blocks generation readiness

## 8.3 Themes Page

### Layout

- Left column: Theme/version selector + metadata
- Middle column: Assignment editor
- Right column: Diagnostics and preview controls

### Required cards

1. Theme Selector Card
2. Theme Metadata Card
3. Variant Assignment Card (`dark`, `light`)
4. Contrast Policy Card (method/threshold/HSL bounds)
5. Output Configuration Card
6. Actions Card (Generate/Export/Clone/Delete/Lock/Rename)

### Key interactions

- Assign variable values per variant
- Set `useDark` fallback for light values
- Configure contrast comparison method (`lessThan`, `equalTo`, `greaterThan`) and threshold
- Optionally set HSL min/max lightness bounds
- Migrate when template version variable set changes
- Rename/clone/delete theme
- Page-scoped search over theme variables and assignments

### Validation/feedback

- Hex and picker values stay synchronized
- Invalid/intermediate values are shown inline without silent coercion
- Orphaned assignments are explicitly flagged after template reference changes

## 8.4 Embedded Preview Region (Themes Page)

Preview is implemented only inside the `Themes` page. It is not a dedicated top-level page.

### Layout

- Optional top controls row (sample/language filters, diagnostics toggles)
- Dual-pane preview region (`dark` and `light` side-by-side)
- Diagnostics side panel (optional)

### Required cards

1. Preview Source Discovery Card
2. Rendered Preview Card (dual pane)
3. Tooltip/Diagnostics Card (optional dedicated surface)

### Key interactions

- Inspect token span diagnostics via tooltip
- Switch sample file within current page context
- Observe live preview refresh on assignment updates

### Validation/feedback

- Invalid preview source layouts are surfaced clearly
- Rendering order is deterministic across sessions

## 9. Specialized Behavior Specifications

## 9.1 Template Variable Set Change Migration

When a theme points to a new template version:

- Added variable -> create unassigned required slot
- Removed variable -> mark prior assignment orphaned
- Renamed variable (when mapping relation can be inferred) -> preserve assignment
- Unresolved mappings -> mark generation/preview readiness as blocked until resolved

## 9.2 Color Editing Contract (Hex + Picker)

- Both controls bind to one canonical color value.
- Picker updates hex in real time.
- Hex updates picker when parseable.
- Canonical persisted format is uppercase or lowercase consistently (single policy).
- Invalid values remain visible in field but do not overwrite last valid persisted value.

## 9.3 Contrast Diagnostics Contract

When contrast policies are active, diagnostics must surface:

- Comparison source token/key
- Comparison method
- Threshold
- Optional HSL min/max bounds
- Evaluated result and pass/fail status

## 10. Accessibility Requirements

## 10.1 Keyboard and Focus

- Full keyboard operability for all controls
- Visible focus ring on all interactive components
- Deterministic tab order within each page
- Dialog focus trap and return-to-trigger on close

## 10.2 Semantics and Announcements

- Inputs use explicit labels
- Inline errors linked to fields via accessible descriptions
- Save status and blocking errors announced for assistive technologies

## 10.3 Visual Accessibility

- Do not rely on color alone for state communication
- Use icon + text for statuses
- Ensure readable spacing and scalable typography

## 11. Performance and Responsiveness Requirements

- UI actions should provide immediate feedback (<100ms acknowledgment where possible)
- Autosave may be debounced, but status must update promptly
- Preview refresh may be debounced for rapid edits while preserving perceived immediacy
- Large lists support efficient rendering patterns as needed

## 12. Acceptance Checklist

A compliant implementation must demonstrate:

1. Standardized reusable components (tabs, cards, columns, forms, dialogs, statuses, tooltips)
2. Deterministic ordering and behavior in lists, generation, and preview
3. Page-scoped search only (no global search aggregation)
4. Correct lock/mutability/deletion behavior and user feedback
5. Immediate persistence UX with robust failure handling
6. Contrast source/method/threshold/HSL controls with diagnostics
7. Theme-template migration handling for added/removed/renamed/orphaned variables
8. Synchronized hex/picker editing with validation and normalization
9. Accessible keyboard/focus/error behavior across all pages
