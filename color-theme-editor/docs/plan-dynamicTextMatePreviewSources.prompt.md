## Plan: Dynamic TextMate Preview Sources

We’ll replace static preview samples with a filesystem-driven preview source under [color-theme-editor/previews](color-theme-editor/previews). Each language folder will be discovered at runtime, its TextMate grammar loaded once, and every non-grammar file tokenized with that grammar on the server. The UI will render all discovered samples (no per-language toggles), using token scopes to resolve colors from the current generated theme. This aligns with your requested directory model, keeps preview behavior deterministic, and avoids heavy browser-side grammar engines.

**Steps**
1. Add preview source contracts in [color-theme-editor/src/domain/types.ts](color-theme-editor/src/domain/types.ts) for discovered language packs, sample files, tokenized lines, and token spans (`scope` + text range).
2. Implement preview discovery in a new core module (for example [color-theme-editor/src/core/preview-source-v2.ts](color-theme-editor/src/core/preview-source-v2.ts)):
   - scan [color-theme-editor/previews](color-theme-editor/previews),
   - treat subfolders as languages,
   - detect exactly one grammar file per language (`*.tmLanguage`, `*.tmLanguage.json`, `*.plist`),
   - treat all remaining non-hidden files as preview samples,
   - return deterministic sorted output.
3. Implement TextMate tokenization service in a new core module (for example [color-theme-editor/src/core/textmate-tokenizer-v2.ts](color-theme-editor/src/core/textmate-tokenizer-v2.ts)) using `vscode-textmate` + `vscode-oniguruma`, with cached grammar registry.
4. Add v2 API endpoints in [color-theme-editor/vite-api-v2.ts](color-theme-editor/vite-api-v2.ts):
   - list/discover preview languages + sample metadata,
   - return tokenized sample content (batched),
   - enforce path safety inside [color-theme-editor/previews](color-theme-editor/previews) only.
5. Add client API wrappers in [color-theme-editor/src/ui/api/themeStudioApi-v2.ts](color-theme-editor/src/ui/api/themeStudioApi-v2.ts) for preview discovery and token fetch.
6. Refactor preview UI data flow:
   - remove static imports from [color-theme-editor/src/ui/preview/samples.ts](color-theme-editor/src/ui/preview/samples.ts) (or replace with fetched model),
   - update [color-theme-editor/src/ui/ThemeTabV2.tsx](color-theme-editor/src/ui/ThemeTabV2.tsx) to load all discovered previews and always render all of them,
   - update [color-theme-editor/src/ui/preview/PreviewPane.tsx](color-theme-editor/src/ui/preview/PreviewPane.tsx) to render server token spans instead of regex tokenization.
7. Keep your earlier UX constraints in the same pass:
   - preview always shows both dark and light panes,
   - no sample/language checkboxes,
   - preview frame selector controls border color only and persists on theme (if already planned in prior step set).
8. Add tests under [color-theme-editor/tests](color-theme-editor/tests):
   - preview directory contract validation,
   - grammar/sample discovery ordering,
   - tokenization stability snapshots,
   - scope→theme color resolution fallback behavior.
9. Update docs in [color-theme-editor/README.md](color-theme-editor/README.md) with the new [color-theme-editor/previews](color-theme-editor/previews) folder contract and expected file layout.

**Verification**
- `npm run test` in [color-theme-editor](color-theme-editor)
- `npm run build` in [color-theme-editor](color-theme-editor)
- Manual:
  - add a new language folder in [color-theme-editor/previews](color-theme-editor/previews), include grammar + sample files, confirm auto-discovery and rendering;
  - edit theme values and confirm previews update with scope-driven syntax colors in both dark/light panes.

**Decisions**
- Tokenization runs server-side (Vite API), not in-browser.
- One grammar file per language folder; all non-grammar files in that folder are preview samples.
- Directory-driven discovery is the source of truth (no hardcoded sample registry).
