# Architecture Reference

## Root extension surface

- Manifest and contribution contract: `package.json`
- Published themes: `themes/*.json`
- Extension host launch profile: `.vscode/launch.json`

## Standalone Theme Studio surface

- App root: `vayeate-theme-studio/`
- **Model** (`src/model/`): Zod schemas and types. No dependencies on app, domain, or gateway. Files: schemas.ts, theme.ts, template.ts, catalog.ts, preview-types.ts, semantic-token.ts, etc.
- **Domain** (`src/domain/`; must not depend on `src/app/`): controllers, core, operations, state, utils. May depend on model and gateway.
- **Gateway** (`src/gateway/`; must not depend on `src/domain/`): data (repositories) and services (IPC). gateway/data and gateway/services depend only on model and do not depend on each other.
- **App** (`src/app/`): UI, viewmodels, actions. Must not depend on gateway; uses state and domain only.
- Core (domain): undo only.
  - undo manager: `vayeate-theme-studio/src/domain/core/undo-manager-v2.ts`
  - undo processor: `vayeate-theme-studio/src/domain/core/undo-processor.ts`
- Utils (domain): theme engine, color, tokenizer, scope, merge, etc.
  - color math and contrast: `vayeate-theme-studio/src/domain/utils/color.ts`
  - generation logic: `vayeate-theme-studio/src/domain/utils/theme-generator.ts`
  - export safety: `vayeate-theme-studio/src/domain/utils/theme-exporter.ts`
  - scope resolution: `vayeate-theme-studio/src/domain/utils/scope-resolver.ts`
  - tokenizer: `vayeate-theme-studio/src/domain/utils/tokenizer.ts`
  - theme-parser: `vayeate-theme-studio/src/domain/utils/theme-parser.ts`
  - template-catalog-merge: `vayeate-theme-studio/src/domain/utils/template-catalog-merge.ts`
  - theme-template-merge, semantic-token, color-clustering: `vayeate-theme-studio/src/domain/utils/`
  - logger, version: `vayeate-theme-studio/src/domain/utils/`
- Catalog sync: `vayeate-theme-studio/src/gateway/services/catalog-sync.ts`
- UI and Electron:
  - main editor shell: `vayeate-theme-studio/src/app/ui/App.tsx`
  - components: `vayeate-theme-studio/src/app/ui/components/`
  - Electron main/preload: `vayeate-theme-studio/electron/`

## Data artifacts

- Templates: `vayeate-theme-studio/data/templates/`
- Themes: `vayeate-theme-studio/data/themes/`
- Catalogs: `vayeate-theme-studio/data/catalogs/`
