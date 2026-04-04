# Copilot Instructions

This repository contains two connected but distinct surfaces:

1. Root VS Code extension theme package.
2. Standalone Theme Studio app in `vayeate-theme-studio/`.

## Scope and boundaries

- Implementing new tooling features for the color theme editor in `vayeate-theme-studio/`.
- Treat root extension packaging and manifest flow as stable unless explicitly asked to modify.
- Allowed cross-boundary write path from Theme Studio: `themes/*.json` outputs.

## Coding conventions

- Keep changes focused and minimal.
- Preserve existing naming and file structure.
- Prefer deterministic generation and stable JSON output.
- Avoid broad refactors unrelated to the task.

## Architecture pointers

- Models/schemas: `vayeate-theme-studio/src/model/`
- Domain core (undo): `vayeate-theme-studio/src/domain/core/` (undo-manager-v2, undo-processor). Domain utils (theme engine, color, tokenizer, etc.): `vayeate-theme-studio/src/domain/utils/`
- Action routing — **handlers** (not AppContext): per-domain `*-handler.ts` under `vayeate-theme-studio/src/app/{app,catalog,template,theme}/actions/`; `AppAction` union, `ActionQueue`, and `handler-registry.ts` live under `vayeate-theme-studio/src/app/app/actions/`
- UI/editor: orthogonal features under `vayeate-theme-studio/src/app/{app,catalog,common,template,theme}/` (`components/`, `viewmodel/`, `context/` per feature); `AppContext.tsx` is a lean provider under `src/app/app/context/`
- Gateway: `vayeate-theme-studio/src/gateway/` (theme/template/catalog/config/preview gateways), `vayeate-theme-studio/src/gateway/services/` (IPC)
- Catalogs and sync: `vayeate-theme-studio/data/catalogs/`, `vayeate-theme-studio/src/gateway/catalog/token-sync-gateway.ts`
- Legacy parity references: `scripts/fix-contrast.js`, `scripts/generate-light-themes.js`

## Agent workflow

1. Read relevant module + nearby tests.
2. Implement minimal patch.
3. Update docs when behavior changes.
4. Run validation in `vayeate-theme-studio/`:
   - `npm run test`
   - `npm run build`
5. Run task completion hook in `.github/agents/task-completion-hook.md`.

## Files to consult for deeper guidance

- `AGENTS.md`
- `.github/agents/theme-studio-agent.md`
- `.github/agents/task-completion-hook.md`
- `.github/agent-docs/*.md`
- `.github/skills/*.md`
