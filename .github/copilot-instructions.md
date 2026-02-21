# Copilot Instructions

This repository contains two connected but distinct surfaces:

1. Root VS Code extension theme package.
2. Standalone Theme Studio app in `color-theme-editor/`.

## Scope and boundaries

- Implementing new tooling features for the color theme editor in `color-theme-editor/`.
- Treat root extension packaging and manifest flow as stable unless explicitly asked to modify.
- Allowed cross-boundary write path from Theme Studio: `themes/*.json` outputs.

## Coding conventions

- Keep changes focused and minimal.
- Preserve existing naming and file structure.
- Prefer deterministic generation and stable JSON output.
- Avoid broad refactors unrelated to the task.

## Architecture pointers

- Domain contracts: `color-theme-editor/src/domain/types.ts`
- Core engine: `color-theme-editor/src/core/`
- UI/editor: `color-theme-editor/src/ui/`
- Catalog pin/snapshot/report: `color-theme-editor/catalog/`
- Legacy parity references: `scripts/fix-contrast.js`, `scripts/generate-light-themes.js`

## Agent workflow

1. Read relevant module + nearby tests.
2. Implement minimal patch.
3. Update docs when behavior changes.
4. Run validation in `color-theme-editor/`:
   - `npm run test`
   - `npm run build`
5. Run task completion hook in `.github/agents/task-completion-hook.md`.

## Files to consult for deeper guidance

- `AGENTS.md`
- `.github/agents/theme-studio-agent.md`
- `.github/agents/task-completion-hook.md`
- `.github/agent-docs/*.md`
- `.github/skills/*.md`
