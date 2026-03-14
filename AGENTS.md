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
- `vayeate-theme-studio/` is a standalone tool workspace and should remain independently runnable/testable.
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
| Theme generation or contrast logic changes | `.github/skills/theme-generation.md` | `vayeate-theme-studio/src/core/theme-generator.ts`, `vayeate-theme-studio/src/core/color.ts`, `.github/agent-docs/edge-cases.md` |
| Catalog pin/sync/drift changes | `.github/skills/catalog-sync.md` | `vayeate-theme-studio/src/services/catalog-sync.ts`, `vayeate-theme-studio/data/catalogs/`, `.github/agent-docs/functionality.md` |
| UI/editor behavior changes | `.github/agents/theme-studio-agent.md` | `vayeate-theme-studio/src/ui/App.tsx`, `.github/agent-docs/architecture.md` |
| Schema/model changes | `.github/agent-docs/architecture.md` | `vayeate-theme-studio/src/model/schemas.ts`, `vayeate-theme-studio/src/model/`, `.github/agent-docs/conventions.md` |
| Safety/path/output behavior changes | `.github/agent-docs/edge-cases.md` | `vayeate-theme-studio/src/core/theme-exporter.ts`, `.github/skills/safe-change-validation.md` |
| Repo-level documentation or process updates | `.github/copilot-instructions.md` | `AGENTS.md`, `.github/agent-docs/conventions.md`, `.github/agents/task-completion-hook.md` |
| Unknown / mixed task | `AGENTS.md` | `.github/copilot-instructions.md`, relevant `.github/skills/*.md`, then target module files |
| Adding or changing app actions / action types | `vayeate-theme-studio/src/actions/action-types.ts` (canonical list = `AppActionV2` union), `.cursor/rules/vayeate-theme-studio-action-queue.mdc` | `.cursor/skills/add-app-action/SKILL.md` when adding a new action |
| Adding or modifying Theme Studio operations | `.cursor/rules/vayeate-theme-studio-operations.mdc` | `.cursor/skills/add-or-modify-operation/SKILL.md`, `.cursor/rules/vayeate-theme-studio-architecture.mdc` |
| App changes that mutate state or files (undoable work) | `.cursor/rules/vayeate-theme-studio-undo.mdc` | Existing operations/controllers/viewmodels, `.cursor/rules/vayeate-theme-studio-architecture.mdc` |
| Undo / UndoManagerV2 (implement or refactor the manager) | `.cursor/skills/undo-manager-v2/SKILL.md` | `vayeate-theme-studio/src/utils/undo-stack.ts`, `vayeate-theme-studio/src/ui/context/UndoContext.tsx` when implementing or migrating |

## Skills index

- `.github/skills/theme-generation.md`
- `.github/skills/catalog-sync.md`
- `.github/skills/safe-change-validation.md`

Cursor skills (vayeate-theme-studio):

- `.cursor/skills/add-app-action/SKILL.md`
- `.cursor/skills/add-or-modify-operation/SKILL.md`
- `.cursor/skills/undo-manager-v2/SKILL.md`

## High-level architecture map

- Root VS Code extension artifacts:
  - `package.json`
  - `themes/`
  - `.vscode/launch.json`
- Standalone Theme Studio app:
  - `vayeate-theme-studio/src/core/*`
  - `vayeate-theme-studio/src/ui/*`
  - `vayeate-theme-studio/src/model/*`
  - `vayeate-theme-studio/data/*`
  - `vayeate-theme-studio/src/services/catalog-sync.ts`

## Minimum validation before handoff

From `vayeate-theme-studio/`:

- `npm run test`
- `npm run build`

If touching root extension behavior, also validate extension host launch assumptions via `.vscode/launch.json` and root README testing flow.
