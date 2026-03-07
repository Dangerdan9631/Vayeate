# Directive Update Report

## Backfill: 9ed086a9 UI Scaffold

# Directive Review

## Recommended durable updates

- **`.cursor/rules/00-agent-governance.mdc`** — In the bullet that lists durable instruction sources, change `AGENT.md` to `AGENTS.md`.
  - **Reason:** The repo's entrypoint is `AGENTS.md` (this file exists and is referenced in `AGENTS.md` and workspace rules). There is no `AGENT.md`. The governance rule should name the actual file so paths stay accurate.
  - **Confidence:** high

- **`.cursor/rules/10-directive-maintenance.mdc`** — In the review-order list, change step 5 from "`AGENT.md` if present" to "`AGENTS.md` if present".
  - **Reason:** Same as above; keeps the maintenance policy aligned with the real filename.
  - **Confidence:** high

## Updates explicitly not recommended

- **No new rules or skills for "UI scaffold" from 9ed086a9.** The commit added initial UI (e.g. `app.ts`, `tabs.ts`, styles); it did not change any directive files. Current guidance already covers UI/editor work. Adding scaffold-specific instructions would be one-off and redundant.
- **No change to "Read first" table or architecture map.** No path or workflow update is needed for this commit.
- **No new test-layer mapping.** The test-with-changes rule already covers UI.

## Redundancies or stale references

- **Stale filename `AGENT.md`:** Used in two rule files and in `.cursor/commands/refresh-directives.md`. Same fix there if commands are in scope.
- **Overlap between governance and maintenance:** Fixing both to `AGENTS.md` removes the inconsistency.

## Suggested patch plan

1. **`.cursor/rules/00-agent-governance.mdc`** — Replace so it says `AGENTS.md` instead of `AGENT.md` in the list of durable instruction sources.
2. **`.cursor/rules/10-directive-maintenance.mdc`** — In the numbered review list, change step 5 to "`AGENTS.md` if present".
3. **(Optional)** In **`.cursor/commands/refresh-directives.md`**, change "`AGENT.md` if present" to "`AGENTS.md` if present".
4. **No edits** to `agents/`, `skills/`, or `AGENTS.md` for this backfill.

---

## Backfill: ce47992b Add catalog model

# Directive Review

## Recommended durable updates
- `.cursor/rules/00-agent-governance.mdc` — Change `AGENT.md` to `AGENTS.md` in durable instruction sources. Confidence: high.
- `.cursor/rules/10-directive-maintenance.mdc` — Step 5: "`AGENTS.md` if present". Confidence: high.
- `.cursor/commands/refresh-directives.md` — Required inputs: "`AGENTS.md` if present". Confidence: high.

## Updates explicitly not recommended
- No new rules or skills for Add catalog model; model layer already covered. No change to AGENTS.md schema row or catalog-sync skill.

## Redundancies or stale references
- Stale `AGENT.md` in three files (same as prior backfill). Prior report already recommended fixes.

## Suggested patch plan
1. 00-agent-governance.mdc: replace AGENT.md with AGENTS.md.
2. 10-directive-maintenance.mdc: step 5 to AGENTS.md if present.
3. refresh-directives.md: AGENTS.md if present.
4. No other edits for this backfill.

---

## Backfill: 5c6b5d3 Add template and theme model types
Recommended: None. Model layer already described. Not recommended: commit-specific details. Patch plan: None.

## Backfill: 001623c Add parsers
Recommended: None. Parsers/brands in model layer. Not recommended: add parsers/brands to architecture. Patch plan: None.

## Backfill: 9231c7a Add zod and refactor model exports to schemas
Recommended: None. Zod/schemas.ts matches Model layer rule. Not recommended: install-script details. Patch plan: None.

## Backfill: 8246a6e Electron and React integration
Recommended: None. Architecture/action-queue rules already reflect this. Not recommended: one-off file list. Patch plan: None.

## Backfill: 8b1ba37 Update dependencies and add testing support
Recommended: None. Theme-studio rules added in this commit; rules/** is agnostic. Not recommended: duplicate rules or Vitest details. Patch plan: None.

## Backfill: c5b0c33 Add catalog page — None. Fits existing layers. Patch: None.
## Backfill: ee2cbcd Catalog Sync — None. catalog-sync skill exists. Patch: None.
## Backfill: 4aa80a8 Sync Catalog — None. Logger/utils implementation detail. Patch: None.
## Backfill: 54caf59 Logging — None. Cross-cutting; no dedicated directive. Patch: None.
## Backfill: 5d2b06f Fix sync version — None. Single-file bugfix. Patch: None.
## Backfill: a6691c1 Bulk import — None. Feature-specific. Patch: None.
## Backfill: c781376 Scrolling — None. CSS-only. Patch: None.
## Backfill: 560df23 Template Page — Optional: mention template flow in architecture. Patch: optional.
## Backfill: 23029d9 Theme tab — Optional: mention theme flow in architecture. Patch: optional.
## Backfill: 0c20274 Previews — Optional: add preview-controller and src/core/ to architecture. Patch: optional.

## Backfill: a8dd60d Delay color picker — None. Patch: None.
## Backfill: dec11f0 Contrast — None. theme-generation skill covers color.ts. Patch: None.
## Backfill: 4656c8 Tweak contrast — None. Patch: None.
## Backfill: 70265f Filters — None. Patch: None.
## Backfill: 8dd8b3 Sorting — None. Patch: None.
## Backfill: 067f48 Template Groups — Optional: mention GroupsCard in architecture. Patch: optional.
## Backfill: 6bb8ba Move storage to data dir — Ensure data/ for catalogs/templates/themes in docs. Patch: grep stale paths.
## Backfill: 27ef42 Theme Export — None if theme-generation skill documents theme-exporter. Patch: None.
## Backfill: 8344eb Remove Color Theme Studio — Confirm no color-theme-editor refs in .cursor/ or .github/. Patch: grep and fix.
## Backfill: ee3af6 Optimistic SAVE_THEME — None. Patch: None.

---

## Backfill: a8dd60d Delay color picker assignment
**Recommended:** None. **Not recommended:** UI timing detail; no directive impact. **Redundancies:** None. **Patch plan:** None.

## Backfill: dec11f0 Contrast
**Recommended:** None. **Not recommended:** Contrast logic in color/scope-resolver; theme-generation skill already references color.ts. **Redundancies:** None. **Patch plan:** None.

## Backfill: 4656c8 Tweak contrast
**Recommended:** None. **Not recommended:** Refinement of contrast; same as dec11f0. **Redundancies:** None. **Patch plan:** None.

## Backfill: 70265f Filters
**Recommended:** None. **Not recommended:** Card filters and template data; no path/workflow change to directives. **Redundancies:** None. **Patch plan:** None.

## Backfill: 8dd8b3 Sorting
**Recommended:** None. **Not recommended:** Sort order in cards; implementation detail. **Redundancies:** None. **Patch plan:** None.

## Backfill: 067f48 Template Groups
**Recommended:** Optional: mention GroupsCard / template groups in theme-studio-agent or architecture if not already. **Not recommended:** Commit-level detail. **Redundancies:** None. **Patch plan:** Optional architecture/agent doc tweak.

## Backfill: 6bb8ba Move storage to data dir
**Recommended:** Ensure architecture/agent-docs and skills reference `vayeate-theme-studio/data/` for catalogs, templates, themes (not legacy paths). **Not recommended:** One-off file list. **Redundancies:** Check for any remaining color-theme-editor or old storage paths. **Patch plan:** Grep for storage path refs; update if stale.

## Backfill: 27ef42 Theme Export
**Recommended:** None if theme-generation skill and theme-exporter path are already documented. **Not recommended:** Export flow is feature-specific. **Redundancies:** None. **Patch plan:** None.

## Backfill: 8344eb Remove Color Theme Studio
**Recommended:** Already applied in commit (architecture, conventions, agents, skills, AGENTS.md updated). Verify no stray color-theme-editor refs remain in rules/ or .cursor/. **Not recommended:** No further broad edits. **Redundancies:** Remove any lingering color-theme-editor or dual-workspace wording. **Patch plan:** Grep for "color-theme-editor" and "Color Theme Studio"; fix if found.

## Backfill: ee3af6 Optimistic state update for SAVE_THEME
**Recommended:** None. **Not recommended:** Single-context optimistic update; no durable guidance. **Redundancies:** None. **Patch plan:** None.

---

## Backfill batch: 22 commits (29602438 … 6074bfbc)

===DELTA===
## Backfill: Stop reloading theme after save (29602438)
- commit: 296024389b3791b868beadf928773d6b9ac52865
- subject: Stop reloading theme after save
- composer_id: bd432403-ecd0-465c-9946-5b9507b70ed0
- files_changed: vayeate-theme-studio/src/ui/context/AppContext.tsx (1 file, +5/-26)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Post-save behavior change only; no path/workflow impact on directives. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Debounce persistence and precompute resolved token colors (6b470b4e)
- commit: 6b470b4e711a6f53d3741989f4c9f10a0c66581f
- subject: Debounce persistence and precompute resolved token colors
- composer_id: 5cabe570-298c-4c67-93a8-522cfd32f134
- files_changed: docs/theme_page_snappier_ui_16dac0f2.plan.md, EditorPreviewsCard.tsx, AppContext.tsx (3 files, +230/-35)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Plan doc is session artifact; debounce/precompute are implementation details. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Start Maximized (6d541218)
- commit: 6d5412180d0e83ab06df7da79fe0dc09e8845d29
- subject: Start Maximized
- composer_id: 14a3d37b-c343-463b-8e1c-5c6691fe53b1
- files_changed: vayeate-theme-studio/electron/main.ts (1 file, +4)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Electron window option only; no directive impact. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Create Vayeate v2 template/theme (c087cacf)
- commit: c087cacf852d982397501c1ef0947acdb3611641
- subject: Create Vayeate v2 template/theme
- composer_id: b131744e-20e0-49df-809c-2ff21417fdfc
- files_changed: data/templates/vayeate-v2-1.0.0.template.json, data/themes/vayeate-v2-1.0.0.theme.json (2 files, +4581)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Data-only; architecture already references data/templates and data/themes. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Add grouping to variables (b25cbcd4)
- commit: b25cbcd4ae05e8b0983d6a162dfb070990bb4ecf
- subject: Add grouping to variables
- composer_id: 64f3406a-3a33-40f4-84ca-c645932f89db
- files_changed: template/theme data, scope-resolver.test, theme-generator.test, template-repository.test, schemas, GroupsCard, ThemeVariablesCard, VariablesCard, TemplatesPage, ThemesPage, use-template-viewmodel(+test), use-theme-viewmodel(+test) (15 files, +5458/-28)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** Optional: ensure theme-studio-agent or architecture mentions variable grouping / GroupsCard if not already. **Not recommended:** Schema/UI detail; no path change. **Redundancies:** None. **Patch plan:** Optional doc tweak.

===

===DELTA===
## Backfill: Implement theme save error handling and UI feedback (e9763995)
- commit: e9763995d9426427a2584d1d72b071eb23281acc
- subject: Implement theme save error handling and UI feedback
- composer_id: 11616ee5-39d8-4b33-810a-a840be4d5d74
- files_changed: template/theme data, electron/main.ts, action-types, theme-repository.test, schemas(+test), app-state(+test), AppContext, ThemesPage, styles.css, use-theme-viewmodel (13 files, +288/-137)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Error-handling flow is feature-specific; edge-cases doc may already cover save failures. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Enhance contrast assignment functionality invertComparison (c45c2f69)
- commit: c45c2f69ea345e454761a64ea3041d5e07caefc7
- subject: Enhance contrast assignment functionality invertComparison
- composer_id: 11616ee5-39d8-4b33-810a-a840be4d5d74
- files_changed: theme json, scope-resolver(+test), theme-generator(+test), schemas, ThemeVariablesCard, styles.css, use-theme-viewmodel(+test) (10 files, +236/-48)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Reverted in 89ec9446; no durable guidance from reverted feature. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Revert invertComparison (89ec9446)
- commit: 89ec9446ae54fbc27f42062aac5784ba15e3cf52
- subject: Revert invertComparison
- composer_id: 11616ee5-39d8-4b33-810a-a840be4d5d74
- files_changed: theme json, scope-resolver(+test), theme-generator(+test), schemas, ThemeVariablesCard, styles.css, use-theme-viewmodel(+test) (10 files, +48/-236)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Revert only; no new guidance. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Update theme JSON light contrast (196ecabf)
- commit: 196ecabf539d19938d4e6d0cfb6def8d0768a669
- subject: Update theme JSON light contrast
- composer_id: 11616ee5-39d8-4b33-810a-a840be4d5d74
- files_changed: vayeate-theme-studio/data/themes/vayeate-v2-1.0.1.theme.json (1 file, +49/-10)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Theme data only; no directive impact. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Add Vayeate V2 themes and update package.json (f6b905b9)
- commit: f6b905b915337b79fefdc2a07426d99e8db2ffd1
- subject: Add Vayeate V2 themes and update package.json
- composer_id: 11616ee5-39d8-4b33-810a-a840be4d5d74
- files_changed: package.json, themes/vayeate-v2-*.json, data/templates 1.0.2–1.0.4, data/themes 1.0.1–1.0.4, theme-controller, scope-resolver(+test), theme-generator(+test), theme-repository.test, schemas, app-state.test, EditorPreviewsCard(+test), ThemesPage, use-theme-viewmodel(+test) (23 files, +14585/-42)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Root package.json and themes/ are already in AGENTS.md boundaries; no new paths. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Update theme files and improve color handling (f1a7d469)
- commit: f1a7d469b07b195763dc10cf0512fcca5a2fd5e9
- subject: Update theme files and improve color handling
- composer_id: 11616ee5-39d8-4b33-810a-a840be4d5d74
- files_changed: example.yml, themes, data/catalogs vayeate-tokens-1.0.1, data/templates 1.0.5–1.0.11, data/themes, color(+test), schemas(+test), EditorPreviewsCard, GroupsCard, MappingsCard, ThemeVariablesCard, VariablesCard (28 files, +35445/-134)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Color normalization (8-digit hex) is implementation; theme-generation skill already references color.ts. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Highlight error variables (8cdd3b60)
- commit: 8cdd3b608a5d9d9bd6c85966ea829968c17d0f0c
- subject: Highlight error variables
- composer_id: 3038916b-0bbb-4b7c-9a4f-4b3aff263d18
- files_changed: vayeate-v2-light-color-theme.json, vayeate-v2-1.0.10.theme.json, ThemeVariablesCard.tsx, styles.css (4 files, +19/-4)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** UI styling for error state; no path/workflow change. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Virtualize previews (c7569395)
- commit: c7569395d767747703fddbe14f1c74cfbc43669c
- subject: Virtualize previews
- composer_id: 5cabe570-298c-4c67-93a8-522cfd32f134
- files_changed: package-lock.json, package.json, EditorPreviewsCard.tsx, styles.css (4 files, +207/-59)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Performance implementation in EditorPreviewsCard; no directive impact. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Persist tab state (e14137e6)
- commit: e14137e63e595072fb758692f412517136a136bf
- subject: Persist tab state
- composer_id: f45513eb-c7e8-43a9-9a2c-95453ffc1ccd
- files_changed: ContentArea.test.tsx, ContentArea.tsx, styles.css (3 files, +155/-10)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Tab persistence is UX detail; architecture already covers UI. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Add new remote source (763cd38c)
- commit: 763cd38c31697ad86725cc4ee27f70d54194f1c7
- subject: Add new remote source
- composer_id: 7a757b08-f0b8-402e-be85-ade3777c189e
- files_changed: vayeate-theme-studio/data/catalogs/vscode-docs1-1.0.0.json, vscode-docs1-1.0.1.json (2 files, +847)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Catalog data only; catalog-sync skill covers data/catalogs. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Faster tab switching (a478a0ee)
- commit: a478a0ee651c3c2079ed4b01da3c7d15fbddfe63
- subject: Faster tab switching
- composer_id: 3038916b-0bbb-4b7c-9a4f-4b3aff263d18
- files_changed: App.tsx, AppContext.tsx, slice-contexts.tsx, use-catalog-viewmodel, use-template-viewmodel, use-theme-viewmodel (6 files, +104/-16)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Slice-contexts and viewmodel loading are implementation details; no path change. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Support Color Registry Tokens (8fb43479)
- commit: 8fb43479aefb191f037b89e8485e9b03f57b8e63
- subject: Support Color Registry Tokens
- composer_id: bda4a774-70f6-4766-aed2-55f8358f8a55
- files_changed: data/catalogs/vs-code-color-registry-1.0.0.json, schemas(+test), catalog-sync(+test), CatalogDetailsCard(+test) (7 files, +1359/-13)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** Optional: if catalog-sync skill or functionality doc does not mention color registry vs semantic/textmate token types, add a short note. **Not recommended:** Schema/catalog-sync changes are already under catalog-sync skill. **Redundancies:** None. **Patch plan:** Optional skill/functionality doc update.

===

===DELTA===
## Backfill: Parsing Semantic Tokens (094e8d7b)
- commit: 094e8d7bce6d6208b7f882f9e8c6e6ba2d31e00d
- subject: Parsing Semantic Tokens
- composer_id: 01f8e7aa-b728-4998-b08f-f2a864c9e45a
- files_changed: catalogs, migrate-catalogs-semantic.cjs, catalog-controller, semantic-token(+test), theme-generator.test, catalog-repository.test, schemas, catalog-sync(+test), app-state.test, CatalogDetailsCard(+test), MappingsCard, TokensCard(+test), AppContext, CatalogsPage(+test), TemplatesPage, use-catalog-viewmodel(+test), use-template-viewmodel (31 files, +6983/-57)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** Optional: add semantic-token.ts and token-type distinction (semantic vs textmate vs color registry) to catalog-sync skill or functionality doc if missing. **Not recommended:** No path renames; schema already in architecture. **Redundancies:** None. **Patch plan:** Optional doc update.

===

===DELTA===
## Backfill: Rename textmate tokens (9b46feb9)
- commit: 9b46feb965143264c32776a1b1fd0a9c07186462
- subject: Rename textmate tokens
- composer_id: 94f48a31-3193-4f33-9647-aceef6438390
- files_changed: catalogs vayeate-tokens, templates, migrate-token-to-textmate.cjs, scope-resolver.test, theme-generator(+test), schemas(+test), catalog-sync(+test), theme-parser(+test), BulkAddDialog, CatalogDetailsCard(+test), EditorPreviewsCard.test, MappingsCard(+test), TokensCard(+test), use-catalog-viewmodel, use-template-viewmodel(+test) (38 files, +2295/-2272)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Token rename and migration script are one-time/schema evolution; catalog-sync and schemas already documented. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Add textmate grammar catalogs (3a207d31)
- commit: 3a207d31c67232b5b022c2992dc4e65263acac5d
- subject: Add textmate grammar catalogs
- composer_id: c0480436-5553-4603-9ef3-ad65d7a276d4
- files_changed: Test-1.0.0 removed, many data/catalogs/*.json added (dotnet-csharp, microsoft-typescript, textmate-*, vs-code-semantic-token-registry), vscode-docs1 updated; schemas(+test), catalog-sync(+test), CatalogDetailsCard(+test) (41 files, +11276/-881)
- touched_directive_file: false
- notes: Backfill entry.

===REVIEW===
**Recommended:** None. **Not recommended:** Catalog data expansion; catalog-sync skill and data/catalogs path already in place. **Redundancies:** None. **Patch plan:** None.

===

===DELTA===
## Backfill: Add template groups on catalog import (cd071c11)
- commit: cd071c11b9c249c18e6647c3457d8db97ecced1d
- subject: Add template groups on catalog import
- composer_id: 5b98dc96-27af-4042-8489-320d6e1ac90b
- files_changed: .cursor/agents/directive-maintainer.md, .cursor/commands/refresh-directives.md, .cursor/hooks.json, .cursor/hooks/*.py, .cursor/rules/00-agent-governance.mdc, .cursor/rules/10-directive-maintenance.mdc, .cursor/skills/maintain-directives/SKILL.md, .cursor/state/*, .cursor/tools/review_directives.py, .cursor-plugin/, cursor-directive-maintainer/, data/templates/test-1.0.1.template.json, use-template-viewmodel(+test) (17 files)
- touched_directive_file: true
- notes: Backfill entry. Introduced directive-maintainer workflow and template groups on import.

===REVIEW===
**Recommended:** Confirm .cursor/rules and 10-directive-maintenance.mdc reference AGENTS.md (not AGENT.md) per prior report; no new directive edits from this commit. **Not recommended:** Do not add commit-specific detail to governance. **Redundancies:** Ensure maintain-directives skill and refresh-directives command stay aligned with 10-directive-maintenance.mdc. **Patch plan:** Apply any outstanding AGENT.md→AGENTS.md fixes if still present; otherwise none.

===

===DELTA===
## Backfill: Update catalog button (6074bfbc)
- commit: 6074bfbc7e46a38984d8d5e7a8516f9e1ad8693d
- subject: Update catalog button
- composer_id: 2241bbff-6811-46f7-bcac-f16333a9d25b
- files_changed: .cursor-plugin/plugin.json removed, cursor-directive-maintainer/README.md removed; TemplateCatalogsCard(+test), TemplateCatalogsCard.tsx, TemplatesPage, styles.css, use-template-viewmodel(+test) (8 files, +361/-41)
- touched_directive_file: false
- notes: Backfill entry. Plugin surface removed; catalog-update UI in Theme Studio.

===REVIEW===
**Recommended:** None. **Not recommended:** Plugin removal and catalog-update UI are product changes; no durable instruction change. **Redundancies:** If any directive still references .cursor-plugin or cursor-directive-maintainer, remove or update. **Patch plan:** Grep for "cursor-directive-maintainer" or ".cursor-plugin"; fix refs if any.

---

## Session review (session-directive-deltas.md)

**Scope:** `.cursor/rules/**`, `.cursor/agents/**`, `.cursor/skills/**`, `AGENTS.md`.

**Structural/architectural notes from deltas:**
- Repo is single-app (vayeate-theme-studio only); Color Theme Studio removed (8344eb).
- Storage/data artifacts: `vayeate-theme-studio/data/{catalogs,templates,themes}/` (6bb8ba).
- Plugin surface removed; catalog-update UI lives in Theme Studio (6074bfbc).
- Directive-maintainer workflow and maintain-directives skill live under `.cursor/`.

**Applied updates:**
1. **`.cursor/agents/directive-maintainer.md`** — Replaced `AGENT.md` with `AGENTS.md` in description and required inputs (aligns with repo entrypoint).
2. **`.cursor/skills/maintain-directives/SKILL.md`** — Replaced `AGENT.md` with `AGENTS.md` in description and inputs list.
3. **`.cursor/rules/vayeate-theme-studio-architecture.mdc`** — Added convention: data artifacts in repo live under `vayeate-theme-studio/data/{catalogs,templates,themes}/` (concrete, testable path; matches .github/agent-docs/architecture.md and deltas).

**Verified no change needed:**
- `.cursor/rules/00-agent-governance.mdc` and `10-directive-maintenance.mdc` already reference `AGENTS.md`.
- `.cursor/commands/refresh-directives.md` already references `AGENTS.md`.
- No remaining references to `color-theme-editor`, `cursor-directive-maintainer`, or `.cursor-plugin` in directive content.
- No duplicate or obsolete guidance identified; 10-directive-maintenance and maintain-directives skill are complementary (policy vs procedure).
