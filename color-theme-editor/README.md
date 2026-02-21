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