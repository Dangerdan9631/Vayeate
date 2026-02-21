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
- Baseline app shell and tests.