## Plan: Dynamic TextMate Previews + Border-Only Always-On Dual Preview

We’ll unify the preview system around filesystem-driven TextMate tokenization and simplified always-on rendering. Preview sources will come from `color-theme-editor/previews/<language>/`, where each language folder contains one TextMate grammar file and one or more non-grammar sample files. The app will discover these folders at runtime, tokenize sample content server-side, and render all samples in both dark and light panes.

In parallel, the preview frame UX will be simplified: one persisted selector controls only the outer preview border color (the IDE chrome accent), while the editor content area always uses generated theme values (`editor.background`, `editor.foreground`, token/semantic color mappings).

**Steps**
1. Extend v2 contracts in [color-theme-editor/src/domain/types.ts](color-theme-editor/src/domain/types.ts):
   - add preview source/token payload types for discovered languages, sample files, tokenized lines, and token spans;
   - extend `Theme` with optional `preview.borderVariableId` for persisted frame border selection.
2. Implement preview source discovery in a new core module (for example [color-theme-editor/src/core/preview-source-v2.ts](color-theme-editor/src/core/preview-source-v2.ts)):
   - scan [color-theme-editor/previews](color-theme-editor/previews),
   - treat each immediate subdirectory as one language source,
   - require exactly one grammar file per language (`*.tmLanguage`, `*.tmLanguage.json`, `*.plist`),
   - treat all remaining non-hidden files as preview samples,
   - return deterministic, sorted language/sample ordering.
3. Implement TextMate tokenization in a new core module (for example [color-theme-editor/src/core/textmate-tokenizer-v2.ts](color-theme-editor/src/core/textmate-tokenizer-v2.ts)) using `vscode-textmate` + `vscode-oniguruma` with cached grammar registry instances.
4. Add v2 preview endpoints in [color-theme-editor/vite-api-v2.ts](color-theme-editor/vite-api-v2.ts):
   - discover/list preview languages and sample metadata,
   - return batched tokenized sample content,
   - enforce path boundaries so all preview reads stay under [color-theme-editor/previews](color-theme-editor/previews).
5. Add client API wrappers in [color-theme-editor/src/ui/api/themeStudioApi-v2.ts](color-theme-editor/src/ui/api/themeStudioApi-v2.ts) for preview discovery and token retrieval.
6. Refactor [color-theme-editor/src/ui/ThemeTabV2.tsx](color-theme-editor/src/ui/ThemeTabV2.tsx):
   - remove `showDark`, `showLight`, and sample/language selection state plus all related checkbox controls,
   - always render both dark and light previews,
   - always include all discovered preview samples,
   - hydrate/persist `theme.preview.borderVariableId`,
   - rename selector label to “Preview frame border variable.”
7. Update preview frame styling in [color-theme-editor/src/ui/ThemeTabV2.tsx](color-theme-editor/src/ui/ThemeTabV2.tsx):
   - map selected border variable to wrapper `border` color only,
   - do not apply wrapper background/text overrides from preview selector values.
8. Refactor [color-theme-editor/src/ui/preview/PreviewPane.tsx](color-theme-editor/src/ui/preview/PreviewPane.tsx):
   - consume server-provided token spans/scopes instead of regex tokenization,
   - keep editor area coloring driven by generated theme keys and token/semantic mapping logic.
9. Remove or repurpose static sample registry in [color-theme-editor/src/ui/preview/samples.ts](color-theme-editor/src/ui/preview/samples.ts) so filesystem-driven previews are the single source of truth.
10. Add/update tests under [color-theme-editor/tests](color-theme-editor/tests):
   - preview folder contract validation,
   - deterministic discovery ordering,
   - tokenization stability snapshots,
   - scope-to-theme color resolution fallback behavior,
   - theme preview metadata persistence for `preview.borderVariableId`,
   - always-on dual preview behavior (both variants + all samples, no toggles).
11. Update docs in [color-theme-editor/README.md](color-theme-editor/README.md) with:
   - `previews/<language>/` structure contract,
   - grammar file expectations,
   - sample file behavior,
   - preview rendering behavior (always-on dark/light + border-only frame accent).

**Verification**
- Run `npm run test` in [color-theme-editor](color-theme-editor).
- Run `npm run build` in [color-theme-editor](color-theme-editor).
- Manual checks:
  - Create/update a language folder in [color-theme-editor/previews](color-theme-editor/previews) with one grammar and sample files; confirm auto-discovery and rendering.
  - Confirm preview always shows both dark and light panes and all discovered samples.
  - Set frame border variable, save theme, reload, and confirm persistence in `themes-config/*.theme.json`.
  - Confirm border selector affects only outer frame border color.
  - Confirm editor content colors continue to come from generated theme values and syntax token mappings.

**Decisions**
- Tokenization runs server-side in v2 Vite API.
- One grammar file per language directory; non-grammar files are preview samples.
- Preview language/sample discovery is directory-driven (no hardcoded registry).
- Foreground preview selector is removed.
- Persist only `preview.borderVariableId` for preview frame appearance.
