# Bulk Mapping Assignment Contract

## Selection contract

1. Only real mappings in an editable active template can enter selection.
2. Selecting or deselecting is a UI-originated action routed through the normal
   mappings-card action flow.
3. Selection is represented by stable token-type and token-key identities.
4. Search, variable filters, grouping, collapsing, and virtualization do not
   change selection.
5. Changing or unloading the active template clears selection.
6. Selection changes never save template data or create undo history.

## Presentation contract

1. Every visible selected row has an accessible selected indicator.
2. The mappings card exposes the total selected count, including hidden rows.
3. The user can clear all selection in one interaction.
4. Group, color-variable, and contrast-variable bulk controls are available only
   when at least one mapping is selected and the active template is editable.
5. Virtual wildcard bases and read-only mappings expose no selectable mutation
   target.

## Assignment action contract

The UI action contains only the selected assignment kind and requested value.
The controller reads current selection and template snapshots; payloads do not
duplicate derivable application state.

For a bulk assignment:

1. Resolve selected identities against the current active template.
2. Remove stale identities from transient selection.
3. Stop without mutation when no valid targets remain.
4. Validate the requested non-null group or variable reference.
5. Build one complete next template using shared mapping-assignment policy.
6. Preserve row-edit behavior that removes an orphan mapping when its color
   assignment is cleared.
7. Stop without save or history when the next template equals the current one.
8. Save and refresh the complete next template once.
9. Record one completed template undo entry.

## Atomicity and failure contract

- No target mutation is externally visible until the complete next template is
  valid.
- Validation failure changes no mapping and records no history.
- Persistence failure must not leave a partially assigned target set or a false
  completed undo entry.
- Undo restores every changed or removed mapping from the action in one step.
- Redo reapplies every change or removal in one step.

## Routing contract

```text
Mapping selection or bulk control
  -> mappings-card viewmodel callback
  -> mappings-card action queue entry
  -> mappings-card handler
  -> focused controller
  -> validation and mapping-selection/assignment operations
  -> existing template save/ref refresh and undo boundaries
```

Controllers do not call controllers or mutate stores. Components do not derive
or dispatch raw store state. Operations own all state transitions and assignment
rules.
