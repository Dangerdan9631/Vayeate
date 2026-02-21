# AGENTS.md

This file is the repo-level AI agent entrypoint for Vayeate.

## Purpose

Use this file to route an AI coding agent to the right instruction files, architecture docs, and task playbooks.

## Agent file conventions used in this repo

- `AGENTS.md` (this file): top-level routing, boundaries, and quick-start navigation.
- `.github/copilot-instructions.md`: GitHub Copilot-specific coding rules and behavior.
- `.github/agents/*.md`: custom agent profiles for subsystem ownership.
- `.github/skills/*.md`: reusable task playbooks (“skills”) for common workflows.
- `.github/agent-docs/*.md`: detailed architecture/functionality/edge-case/convention references.

## Compatibility target

- Primary: GitHub Copilot (VS Code + Copilot agent workflows).
- Secondary: generic coding agents that recognize `AGENTS.md` conventions.

## Repository boundaries

- Root extension/plugin files are the published product surface.
- `color-theme-editor/` is a standalone tool workspace and should remain independently runnable/testable.
- Do not alter root packaging flow in `package.json` unless explicitly requested.
- Generated theme output writes to `themes/` are allowed.

## Required reads for agents

1. `.github/copilot-instructions.md`
2. `.github/agents/theme-studio-agent.md`
3. `.github/agents/task-completion-hook.md`
4. `.github/agent-docs/architecture.md`
5. `.github/agent-docs/functionality.md`
6. `.github/agent-docs/edge-cases.md`
7. `.github/agent-docs/conventions.md`

## Which file to read first

| Task type | Read first | Then read |
|---|---|---|
| Theme generation or contrast logic changes | `.github/skills/theme-generation.md` | `color-theme-editor/src/core/generator.ts`, `color-theme-editor/src/core/color.ts`, `.github/agent-docs/edge-cases.md` |
| Catalog pin/sync/drift changes | `.github/skills/catalog-sync.md` | `color-theme-editor/src/core/catalog-sync.ts`, `color-theme-editor/catalog/pin.json`, `.github/agent-docs/functionality.md` |
| UI/editor behavior changes | `.github/agents/theme-studio-agent.md` | `color-theme-editor/src/ui/App.tsx`, `.github/agent-docs/architecture.md` |
| Schema/model changes | `.github/agent-docs/architecture.md` | `color-theme-editor/src/domain/types.ts`, `.github/agent-docs/conventions.md` |
| Safety/path/output behavior changes | `.github/agent-docs/edge-cases.md` | `color-theme-editor/src/core/exporter.ts`, `.github/skills/safe-change-validation.md` |
| Repo-level documentation or process updates | `.github/copilot-instructions.md` | `AGENTS.md`, `.github/agent-docs/conventions.md`, `.github/agents/task-completion-hook.md` |
| Unknown / mixed task | `AGENTS.md` | `.github/copilot-instructions.md`, relevant `.github/skills/*.md`, then target module files |

## Skills index

- `.github/skills/theme-generation.md`
- `.github/skills/catalog-sync.md`
- `.github/skills/safe-change-validation.md`

## High-level architecture map

- Root VS Code extension artifacts:
  - `package.json`
  - `themes/`
  - `.vscode/launch.json`
- Standalone Theme Studio app:
  - `color-theme-editor/src/core/*`
  - `color-theme-editor/src/ui/*`
  - `color-theme-editor/src/domain/types.ts`
  - `color-theme-editor/catalog/*`

## Minimum validation before handoff

From `color-theme-editor/`:

- `npm run test`
- `npm run build`

If touching root extension behavior, also validate extension host launch assumptions via `.vscode/launch.json` and root README testing flow.
