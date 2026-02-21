# Architecture Reference

## Root extension surface

- Manifest and contribution contract: `package.json`
- Published themes: `themes/*.json`
- Extension host launch profile: `.vscode/launch.json`

## Standalone Theme Studio surface

- App root: `color-theme-editor/`
- Domain models: `color-theme-editor/src/domain/types.ts`
- Core engine:
  - color math and contrast: `color-theme-editor/src/core/color.ts`
  - generation logic: `color-theme-editor/src/core/generator.ts`
  - export safety: `color-theme-editor/src/core/exporter.ts`
  - catalog sync: `color-theme-editor/src/core/catalog-sync.ts`
  - parity key rules: `color-theme-editor/src/core/parity-rules.ts`
- UI and API wiring:
  - main editor shell: `color-theme-editor/src/ui/App.tsx`
  - local API client: `color-theme-editor/src/ui/api/themeStudioApi.ts`

## Data artifacts

- Templates: `color-theme-editor/templates/*.template.json`
- Catalog pin and cache:
  - `color-theme-editor/catalog/pin.json`
  - `color-theme-editor/catalog/snapshot.json`
  - `color-theme-editor/catalog/remote-snapshot.json`
  - `color-theme-editor/catalog/report.json`
