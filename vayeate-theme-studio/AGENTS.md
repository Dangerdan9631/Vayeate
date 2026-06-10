<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
`specs/004-add-undo-functionality/plan.md`

For undo functionality, every completed state-changing reversible controller
under `src/app/**` must record via `RecordCatalogUndoOperation`,
`RecordTemplateUndoOperation`, `RecordThemeUndoOperation`, or
`RecordUndoEntryOperation` unless explicitly excluded with evidence in
`test/architecture/undo-controller-exclusions.ts` (enforced by
`test/architecture/undo-controller-coverage.test.ts`). Classify
non-state-changing or non-reversible actions with evidence rather than leaving
controllers unclassified. Undo stacks are per-session, disk-backed while the
app is open, cleared on startup, and scoped by active tab plus existing
template, catalog, and theme `*Ref` values. Do not preserve placeholder undo
action behavior, whole-application undo snapshots, cross-session history
restoration, or workflow bypasses solely because they currently exist. Do not
mark final validation complete until universal controller coverage is enforced,
representative app shell, catalog, template, and theme workflows can undo and
redo completed changes from action-generated before/after diffs, ordered
history-list selection returns to the state immediately after the selected item,
every active context's history list begins with a baseline opened item that
reverts all recorded actions when selected, new actions after undo prune
redoable branch entries, stack changes are written to disk, startup clears
prior-session persisted state, context switching restores the correct stack,
failure paths avoid incorrect history entries, renderer summaries remain
read-only, and enforcement plus directive synchronization are complete in
`tasks.md`. Representative workflow evidence includes app shell undo/redo/history
commands, catalog token-key edits, template variable and group additions, theme
variable edits, and theme palette color assignments.
<!-- SPECKIT END -->
