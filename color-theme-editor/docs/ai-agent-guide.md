# AI Agent Guide

This guide helps an AI agent quickly navigate and work safely in the Vayeate Theme Studio workspace.

Repo-level standard agent conventions are defined in:

- [AGENTS.md](../../AGENTS.md)
- [.github/copilot-instructions.md](../../.github/copilot-instructions.md)

## Mission and boundaries

- Primary tool scope is [color-theme-editor](color-theme-editor).
- Root extension packaging is an integration surface only (read-only), except generated theme output writes to [themes](themes).
- Do not change root extension manifest/packaging flow in [package.json](package.json) unless explicitly asked.

## Agent-relevant files

- Planning prompt and requirements seed:
  - [.github/prompts/plan-vayeateThemeStudio.prompt.md](.github/prompts/plan-vayeateThemeStudio.prompt.md)
- Theme Studio requirements and architecture:
  - [color-theme-editor/docs/requirements.md](color-theme-editor/docs/requirements.md)
  - [color-theme-editor/docs/architecture.md](color-theme-editor/docs/architecture.md)
- Catalog pin and sync artifacts:
  - [color-theme-editor/catalog/pin.json](color-theme-editor/catalog/pin.json)
  - [color-theme-editor/catalog/snapshot.json](color-theme-editor/catalog/snapshot.json)
  - [color-theme-editor/catalog/remote-snapshot.json](color-theme-editor/catalog/remote-snapshot.json)
  - [color-theme-editor/catalog/report.json](color-theme-editor/catalog/report.json)

## VS Code rules and workspace behavior

- Workspace-level settings used by this repo:
  - [.vscode/settings.json](.vscode/settings.json)
  - [.vscode/launch.json](.vscode/launch.json)
- Shared VS Code preference references (human settings baseline):
  - [settings/VSCode/settings.json](settings/VSCode/settings.json)
  - [settings/VSCode/keybindings.json](settings/VSCode/keybindings.json)

### Practical rules for agents

- Respect existing formatting and code style in touched files.
- Keep edits focused; avoid unrelated refactors.
- Prefer deterministic output paths and stable JSON serialization.
- Validate with local scripts after changes.

## Project map for implementation

- Domain schemas: [color-theme-editor/src/domain/types.ts](color-theme-editor/src/domain/types.ts)
- Core generation logic: [color-theme-editor/src/core/generator.ts](color-theme-editor/src/core/generator.ts)
- Color math and contrast helpers: [color-theme-editor/src/core/color.ts](color-theme-editor/src/core/color.ts)
- Export safety and atomic writes: [color-theme-editor/src/core/exporter.ts](color-theme-editor/src/core/exporter.ts)
- Catalog sync and pin handling: [color-theme-editor/src/core/catalog-sync.ts](color-theme-editor/src/core/catalog-sync.ts)
- Script parity key rules: [color-theme-editor/src/core/parity-rules.ts](color-theme-editor/src/core/parity-rules.ts)
- UI app entry and controls: [color-theme-editor/src/ui/App.tsx](color-theme-editor/src/ui/App.tsx)
- Catalog-driven coverage heuristics: [color-theme-editor/src/ui/state/bindingCoverage.ts](color-theme-editor/src/ui/state/bindingCoverage.ts)

## Agent skills (task playbooks)

### 1) Safe code change skill

1. Read touched module + adjacent tests.
2. Implement minimal patch.
3. Run `npm run test` and `npm run build` in [color-theme-editor](color-theme-editor).
4. Check diagnostics before finalizing.

### 2) Theme generation skill

1. Update template/binding logic in [color-theme-editor/src/ui/App.tsx](color-theme-editor/src/ui/App.tsx) and core modules.
2. Validate strategy behavior in [color-theme-editor/src/core/generator.ts](color-theme-editor/src/core/generator.ts).
3. Verify deterministic output with tests.

### 3) Catalog sync skill

1. Edit pin settings in UI or [color-theme-editor/catalog/pin.json](color-theme-editor/catalog/pin.json).
2. Run catalog sync via UI/API.
3. Inspect drift/validation in [color-theme-editor/catalog/report.json](color-theme-editor/catalog/report.json).

### 4) Full coverage binding skill

1. Ensure catalog snapshot exists.
2. Use `Apply full coverage` flow in UI.
3. Confirm generated bindings are deterministic and tests still pass.

## Validation commands

From [color-theme-editor](color-theme-editor):

- `npm run test`
- `npm run build`

## Non-goals unless requested

- Editing root extension contribution list in [package.json](package.json).
- Rewriting root scripts under [scripts](scripts) instead of porting behavior into standalone modules.
- Changing extension host launch behavior in [.vscode/launch.json](.vscode/launch.json).