# Architecture Reference

## Root extension surface

- Manifest and contribution contract: `package.json`
- Published themes: `themes/*.json`
- Extension host launch profile: `.vscode/launch.json`

## Standalone Theme Studio surface

- App root: `vayeate-theme-studio/`
- Models and schemas: `vayeate-theme-studio/src/model/` (schemas.ts, theme.ts, template.ts, catalog.ts)
- Core engine:
  - color math and contrast: `vayeate-theme-studio/src/core/color.ts`
  - generation logic: `vayeate-theme-studio/src/core/theme-generator.ts`
  - export safety: `vayeate-theme-studio/src/core/theme-exporter.ts`
  - scope resolution: `vayeate-theme-studio/src/core/scope-resolver.ts`
  - tokenizer: `vayeate-theme-studio/src/core/tokenizer.ts`
- Catalog sync: `vayeate-theme-studio/src/services/catalog-sync.ts`
- UI and Electron:
  - main editor shell: `vayeate-theme-studio/src/ui/App.tsx`
  - components: `vayeate-theme-studio/src/ui/components/`
  - Electron main/preload: `vayeate-theme-studio/electron/`

## Data artifacts

- Templates: `vayeate-theme-studio/data/templates/`
- Themes: `vayeate-theme-studio/data/themes/`
- Catalogs: `vayeate-theme-studio/data/catalogs/`
