# Vayeate Theme Studio (Standalone)

This project is a standalone UI-first TypeScript application that generates VS Code theme files into the repository-level `themes/` directory.

## Scope

- All app code, docs, tests, and config stay under `color-theme-editor/`.
- Root extension packaging flow in `../package.json` is read-only and unchanged.
- The only expected write surface outside this folder is `../themes/*.json` output files.

## Development

```bash
cd color-theme-editor
npm install
npm run dev
```

## Quality checks

```bash
npm run test
npm run build
```

## Preview sources contract (v2)

Theme preview content is filesystem-driven from `color-theme-editor/previews/`.

- Directory shape: `previews/<language>/`
- Each language directory must contain exactly one TextMate grammar file:
	- `*.tmLanguage`
	- `*.tmLanguage.json`
	- `*.plist`
- Every other non-hidden file in the same directory is treated as a preview sample.
- Language folders and sample files are discovered and rendered in deterministic sorted order.

## Preview rendering behavior (v2)

- Tokenization runs server-side through the v2 API using `vscode-textmate` + `vscode-oniguruma`.
- The UI always renders both dark and light preview panes.
- All discovered preview samples are always included (no sample/language toggles).
- `theme.preview.borderVariableId` persists one selector for preview frame border color.
- The border selector affects only the outer frame border (IDE chrome accent).
- Editor content colors continue to come from generated theme values and token/semantic mappings.

## AI Agent navigation

- Agent guide: [color-theme-editor/docs/ai-agent-guide.md](color-theme-editor/docs/ai-agent-guide.md)
- Includes:
	- relevant agent/prompt files,
	- VS Code workspace rule files,
	- project module map,
	- repeatable agent skills/playbooks,
	- validation and safety boundaries.

## Status

Phase 1 foundations are implemented:

- Core domain schema types.
- Contrast policy model (dark/light split).
- Deterministic JSON export helper.
- Palette utilities with perceptual (OKLab) distance checks.
- Baseline tests.

Phase 2 implementation has started:

- Template metadata and variable editor.
- Binding management controls.
- Template JSON import/export from the UI.
- Workspace template save/load through local dev API endpoints under `templates/`.
- One-click generation to `../themes` with output path boundary checks.
- Preview session state (sample selection + light/dark toggles) persisted in template JSON.
- Pre-write output summary panel to inspect existing vs generated files before writing.
- Custom side-by-side dark/light preview.
- Preview sample ingestion from repository `examples` for TypeScript, JSON, Markdown, PowerShell, and Rust.
- Catalog-driven binding controls for adding snapshot color/semantic/scope keys into template bindings.
- One-click `Apply full coverage` action that auto-generates deterministic missing bindings for all catalog keys.

Phase 3 kickoff is implemented:

- Pinned catalog source metadata in `catalog/pin.json`.
- Catalog snapshot/report generation from repository `themes/*.json`.
- Upstream registry ingestion from pinned source URLs with normalized key extraction.
- Merged local + remote snapshot output with cached remote snapshot artifact.
- Drift warnings for remote-only and local-only catalog entries.
- Catalog pin editor in UI for pinned version and source URL updates.
- Generator strategy parity improvements for `raw`, `deriveContrast`, and `copyFromDark` in dark/light output paths.
- Script-parity toolbar background contrast capping in dark generation flow.
- Catalog validation checks (required keys, duplicates, formatting).
- Local dev API endpoints for catalog status and sync.
- UI panel to run sync and inspect snapshot/report health.
- Heuristic mapping for full-coverage bindings (category, variable, strategy) with deterministic ordering.
- Golden-style determinism regression tests for repeated generation output stability.