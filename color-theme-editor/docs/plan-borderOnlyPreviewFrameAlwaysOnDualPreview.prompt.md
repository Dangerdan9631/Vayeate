## Plan: Border-Only Preview Frame + Always-On Dual Preview

We’ll update the v2 Theme preview so the selected “primary IDE” variable colors only the outer preview frame border, while the inner editor surface always uses generated theme values (`editor.background`, `editor.foreground`, token/semantic colors). In parallel, we’ll simplify preview UX by removing dark/light and language/sample toggles and always rendering both dark + light with all samples. We’ll persist only the border-variable selection in each theme JSON for continuity across reloads.

**Steps**
1. Extend v2 theme schema in [color-theme-editor/src/domain/types.ts](color-theme-editor/src/domain/types.ts) with optional `preview.borderVariableId` (and remove/avoid foreground preview metadata).
2. Update theme creation/hydration flow in [color-theme-editor/src/ui/App_v2.tsx](color-theme-editor/src/ui/App_v2.tsx) so new/existing themes support optional preview metadata without migration breaks.
3. Refactor preview state in [color-theme-editor/src/ui/ThemeTabV2.tsx](color-theme-editor/src/ui/ThemeTabV2.tsx):
   - remove `showDark`, `showLight`, sample-selection state and related handlers/UI checkboxes,
   - keep a single saved selector for preview frame border variable.
4. Change frame styling in [color-theme-editor/src/ui/ThemeTabV2.tsx](color-theme-editor/src/ui/ThemeTabV2.tsx) so selected variable maps to wrapper `border` color only; do not set wrapper background/text color from this selector.
5. Keep inner editor rendering owned by [color-theme-editor/src/ui/preview/PreviewPane.tsx](color-theme-editor/src/ui/preview/PreviewPane.tsx) so editor area always reflects generated theme values and syntax highlighting color resolution.
6. Update label text in [color-theme-editor/src/ui/ThemeTabV2.tsx](color-theme-editor/src/ui/ThemeTabV2.tsx) from “background variable” to “preview frame border variable” for clarity.
7. Add/update focused tests in [color-theme-editor/tests](color-theme-editor/tests) for preview metadata persistence and fixed rendering behavior (both variants + all samples, no toggle-driven branches).

**Verification**
- Run `npm run test` in [color-theme-editor](color-theme-editor).
- Run `npm run build` in [color-theme-editor](color-theme-editor).
- Manual checks:
  - Set border variable, save theme, reload, confirm border color selector persists via `themes-config/*.theme.json`.
  - Confirm preview always shows both dark/light panes and all sample languages.
  - Confirm editor content colors still come from generated theme keys (not frame selector).

**Decisions**
- Remove foreground preview selector entirely.
- Persist only `preview.borderVariableId` in v2 theme files.
- Use border-only frame coloring to represent the IDE “chrome” accent around the editor preview.
