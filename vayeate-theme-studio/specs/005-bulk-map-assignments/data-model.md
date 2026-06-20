# Data Model: Bulk Template Mapping Assignments

## Mapping Identity

Represents one real mapping inside the active template.

| Field | Type | Rules |
|---|---|---|
| `tokenType` | Token type | Must identify a supported persisted mapping type |
| `tokenKey` | String | Must be non-empty and pair with `tokenType` to identify at most one mapping |

The virtual semantic wildcard base has no persisted identity and is excluded.

## Mapping Selection

Transient UI state scoped to the selected template reference.

| Field | Type | Rules |
|---|---|---|
| `selectedMappingIds` | Ordered unique mapping identities | No duplicates; cleared on template change or unload |

Selection changes do not mutate or persist a template and do not participate in
undo history. Ordering is retained for deterministic display and processing but
does not change assignment results.

### State transitions

- `unselected -> selected`: user selects a real editable mapping.
- `selected -> unselected`: user deselects the mapping.
- `one or more selected -> empty`: user clears selection or template context changes.
- `selected -> removed`: target resolution discovers the mapping no longer exists.

## Mapping Assignment Request

A discriminated request carrying one assignment kind and one requested value.

| Variant | Value | Meaning |
|---|---|---|
| Group | Group name or null | Assign or clear the mapping group |
| Color variable | Color-variable key or null | Assign or clear color; clearing an orphan removes it |
| Contrast variable | Contrast-variable key or null | Assign or clear contrast |

The requested non-null value must exist in the active template's corresponding
group or variable collection.

## Resolved Mapping Target Set

The current mappings matching selected identities after stale identities are
discarded.

Validation rules:

- The active template exists and is editable.
- Every target is a real persisted mapping.
- At least one target remains for mutation.
- Each mapping identity appears once.
- The assignment value is valid for the template.

## Bulk Assignment Change Set

The result of applying one assignment request to the resolved target set.

| Field | Meaning |
|---|---|
| Before template | Complete active template before the action |
| After template | Complete next template after all target changes |
| Changed identities | Targets whose persisted state differs |
| Removed identities | Orphan mappings removed by clearing color |

The change set is either complete or absent. If no target changes, the request is
a no-op and is not saved or recorded. A completed change set is saved once,
refreshes template references once, and creates one undo entry.

## Relationships

- One mapping selection belongs to one active template context.
- One assignment request applies to one resolved target set.
- One bulk change set contains zero or more changed mapping identities and is
  represented by one template before/after transition in undo history.
