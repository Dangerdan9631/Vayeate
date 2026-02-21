## DRAFT — Plan: Theme Studio Requirements

Build a TypeScript UI-first app in a top-level [color-theme-editor](color-theme-editor) folder that is fully standalone from the existing VS Code theme plugin, while outputting generated theme files to [themes](themes). The app (code, config, tests, and docs) must live under [color-theme-editor](color-theme-editor) and must not require changing plugin packaging/manifest flow in root [package.json](package.json). The plan reuses proven color/contrast logic already present in this repo, keeps extension packaging untouched, and defines a strict JSON export pipeline. Key decisions reflected: full VS Code key coverage, template save/load as workspace JSON files, custom preview fed by [examples](examples), perceptual palette distance via OKLab/OKLCH Delta E, and strict JSON theme output.

**Steps**
1. Define product requirements doc (functional, non-functional, data model, acceptance criteria) in [color-theme-editor/docs](color-theme-editor/docs), and define the standalone project layout ([color-theme-editor/src](color-theme-editor/src), [color-theme-editor/docs](color-theme-editor/docs), [color-theme-editor/templates](color-theme-editor/templates), [color-theme-editor/package.json](color-theme-editor/package.json)). Reference plugin theme contract in [package.json](package.json#L14-L122) and [themes/vayeate-color-theme.json](themes/vayeate-color-theme.json) only as output targets, not as app runtime dependencies.  
2. Specify canonical “configurable element catalog” ingestion: VS Code Theme Color registry + semantic token registry + token scope guidance from links already documented in [README.md](README.md#L69-L73); add sync/update policy and version pinning rules.  
3. Define core domain schemas: `ThemeTemplate`, `ColorVariable`, `ContrastPolicy`, `ElementBinding`, `PaletteEntry`, `GeneratedTheme`, and `PreviewSession`; require template persistence as JSON files under [color-theme-editor/templates](color-theme-editor/templates).  
4. Define palette-generation requirements: seed colors in, complementary/analogous options out, enforce minimum perceptual distance using `DeltaE` in OKLab/OKLCH, plus fallback behavior when constraints cannot be satisfied.  
5. Define contrast-derivation engine requirements by porting algorithm behavior from [scripts/fix-contrast.js](scripts/fix-contrast.js#L15-L484) and [scripts/generate-light-themes.js](scripts/generate-light-themes.js#L106-L622), with explicit rules for text/background/semantic/token categories.  
6. Define dual-output generation flow: produce dark and light themes from bound variables + contrast ratios; require generated element colors be computed outputs (not raw palette values) and export as strict JSON into [themes](themes), with configurable output file names that match plugin naming conventions.  
7. Define preview requirements: custom in-app preview using language samples from [examples](examples), including at least TS/JSON/MD/PS1/Rust coverage and side-by-side light/dark render states.  
8. Define compatibility and safety constraints: keep existing extension packaging and launch behavior unchanged in [.vscode/launch.json](.vscode/launch.json#L1-L14) and [package.json](package.json#L127-L130); add non-destructive write rules, deterministic generation guarantees, and an explicit boundary that app code executes only from [color-theme-editor](color-theme-editor).  
9. Define phased delivery requirements: Phase 1 (requirements + schema + core engine), Phase 2 (UI bindings + preview), Phase 3 (catalog sync + validation + polish), each with clear completion gates.

**Standalone Boundary Requirements**
- All source code, docs, scripts, tests, and build config for the new tool must exist under [color-theme-editor](color-theme-editor).  
- Root plugin files (including [package.json](package.json), [themes](themes), [scripts](scripts)) are treated as read-only integration surfaces, except writing generated theme outputs to [themes](themes).  
- The app must run independently of VS Code extension host and can be developed/run/tested without invoking plugin packaging commands.  
- The app must support workspace-relative configuration so output target defaults to [themes](themes) at repository root.

**Verification**
- Requirements completeness review: every user ask maps to at least one acceptance criterion.  
- Traceability check: each feature maps to a schema entity and at least one generation/preview workflow step.  
- Compatibility check: generated JSON themes load in VS Code Extension Host flow documented in [README.md](README.md#L54-L63).  
- Determinism check: same template + inputs always produce byte-equivalent JSON output (stable ordering/formatting rules defined in requirements).
- Boundary check: no required runtime dependency from app code to plugin root except filesystem output path for [themes](themes).

**Decisions**
- UI-first app, not CLI-first.  
- Full configurable key coverage (not curated-only MVP).  
- Template save/load as workspace JSON files.  
- Preview via custom renderer using [examples](examples).  
- Palette distinctness uses perceptual Delta E (OKLab/OKLCH).  
- Theme export format is strict JSON (not JSONC preservation).
- App and documentation are fully contained in [color-theme-editor](color-theme-editor), separate from plugin implementation.
