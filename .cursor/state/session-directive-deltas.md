# Session Directive Deltas

This file is a structured scratchpad for the current Cursor session.

Capture:
- file changes with possible instruction impact
- user corrections
- path or workflow changes
- additions, deletions, renames
- repeated mistakes that may justify durable guidance

Do not store:
- giant raw chat dumps
- full code patches
- one-off preferences that are not reusable

---

## Backfill: UI Scaffold (9ed086a9)
- commit: 9ed086a9e50b8f2b9efb0249b3ba70da2e7fec2a
- subject: UI Scaffold
- composer_id: 3038916b-0bbb-4b7c-9a4f-4b3aff263d18
- files_changed: vayeate-theme-studio/dist/..., src/main.ts, style.css, src/ui/app.ts, src/ui/styles.css, src/ui/tabs.ts (8 files, +211/-9)
- touched_directive_file: false
- notes: Initial UI scaffold; app.ts, tabs, styles. Session transcript available for this composer.

## Backfill: Add catalog model (ce47992b)
- commit: ce47992b47b8a5d0a5dafac733b9c0e9f2bad1cf
- subject: Add catalog model
- composer_id: 3038916b-0bbb-4b7c-9a4f-4b3aff263d18
- files_changed: vayeate-theme-studio/src/model/catalog.ts | 24 ++++++++++++++++++++++++ 2 files changed, 39 insertions(+)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Add template and theme model types (5c6b5d3)
- commit: 5c6b5d3e701b7d562d911a73aa8dedeaad5593ed
- subject: Add template and theme model types
- composer_id: a088d861-b9e2-45a8-8865-96925baa95e9
- files_changed: vayeate-theme-studio/src/model/catalog.ts | template.ts | theme.ts | token.ts (4 files, 76 insertions, 15 deletions)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Add parsers (001623c)
- commit: 001623c672007811e3532d758e499ffea1afd668
- subject: Add parsers
- composer_id: a088d861-b9e2-45a8-8865-96925baa95e9
- files_changed: vayeate-theme-studio/src/model/brands.ts, catalog.ts, template.ts, theme.ts, token.ts (5 files, 206 insertions, 22 deletions)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Add zod dependency and refactor model exports to use schemas (9231c7a)
- commit: 9231c7ac709ad9e218d30b39f620374a022abe64
- subject: Add zod dependency and update install scripts; refactor model exports to use schemas
- composer_id: a088d861-b9e2-45a8-8865-96925baa95e9
- files_changed: package.json, model/*.ts, schemas.ts (9 files, 263 insertions, 270 deletions)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Enhance Vayeate Theme Studio with Electron and React (8246a6e)
- commit: 8246a6ea78d22d78fcc1f8b088865540444834fd
- subject: Enhance Vayeate Theme Studio with Electron support and React integration
- composer_id: 2c3f85ec-58ff-4c46-b255-5ad9cf7d18bc
- files_changed: electron/, src/actions, controllers, data, services, state, ui, viewmodel (33 files, +5277/-195)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Update dependencies and add testing support (8b1ba37)
- commit: 8b1ba376e8065d2c5ff1d21d6065829438f73503
- subject: Update dependencies and add testing support in Vayeate Theme Studio
- composer_id: 2c3f85ec-58ff-4c46-b255-5ad9cf7d18bc
- files_changed: vayeate-theme-studio/.cursor/rules/*.mdc, package.json, vitest.config.ts, *.test.ts (15 files, +1984/-24)
- touched_directive_file: true
- notes: Backfill entry.

## Backfill: Add catalog page (c5b0c33)
- commit: c5b0c3355678f1cea6a9c647623bef449aeb2498
- subject: Add catalog page
- composer_id: 2c3f85ec-58ff-4c46-b255-5ad9cf7d18bc
- files_changed: vayeate-theme-studio (31 files, +1481/-3154)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Catalog Sync (ee2cbcd)
- commit: ee2cbcd3c15815e6897c765932c2a27dba947c6f
- subject: Catalog Sync
- composer_id: 3c6a1e97-504f-4cac-8eee-6a8e955a3373
- files_changed: action-types, model, catalog-sync, CatalogDetailsCard, AppContext, viewmodel (11 files, +618/-44)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Sync Catalog (4aa80a8)
- commit: 4aa80a8b4a4a378d721bd640d59fa9ac9403e27a
- subject: Sync Catalog
- composer_id: 3c6a1e97-504f-4cac-8eee-6a8e955a3373
- files_changed: electron, action-queue, schemas, catalog-service, catalog-sync, App, logger, viewmodel (16 files, +209/-30)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Logging (54caf59)
- commit: 54caf598e7fc478e5be57766115cab6ac1add393
- subject: Logging
- composer_id: 2a691d7c-ab12-429e-8d93-59faeec497e3
- files_changed: electron, controllers, data, main, services, state, AppContext, viewmodel (8 files, +164/-34)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Fix sync version (5d2b06f)
- commit: 5d2b06facce73b59438a34fc28f6ef40e718ee97
- subject: Fix sync version
- composer_id: 3c6a1e97-504f-4cac-8eee-6a8e955a3373
- files_changed: AppContext.tsx (1 file, +7/-4)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Bulk import (a6691c1)
- commit: a6691c16a5842e1eeed84f38b41bf961e4e1e6c3
- subject: Bulk import
- composer_id: 2c3f85ec-58ff-4c46-b255-5ad9cf7d18bc
- files_changed: schemas, theme-parser, BulkAddDialog, TokensCard, CatalogsPage, viewmodel (8 files, +414/-2)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Scrolling (c781376)
- commit: c7813769efa057b07889271d710e7ac2d39754b4
- subject: Scrolling
- composer_id: 3517d596-ab9e-430c-ada3-a6b2a7d24d03
- files_changed: styles.css (1 file, +12/-1)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Template Page (560df23)
- commit: 560df2394b5872a2bcda38fb0e8f6724b32b14e0
- subject: Template Page
- composer_id: 2241bbff-6811-46f7-bcac-f16333a9d25b
- files_changed: electron, actions, template-controller, template-repository, schemas, template-service, app-state, UI, TemplatesPage, viewmodel (24 files, +2103/-10)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Theme tab (23029d9)
- commit: 23029d9021e73ba63f1a1d8d0068664daefa853a
- subject: Theme tab
- composer_id: e29ad7bb-0f4b-45c7-abc4-215aa93a545c
- files_changed: electron, actions, theme-controller, theme-repository, schemas, theme-service, app-state, UI, ThemesPage, viewmodel (24 files, +2220/-14)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Previews (0c20274)
- commit: 0c202740876de69f7d52531702cec32cba8ecbe4
- subject: Previews
- composer_id: 7e2a4971-2fab-4597-8674-74ceb6e6122d
- files_changed: electron, preview-controller, package.json, previews/, scope-resolver, tokenizer, theme-controller, theme-repository, schemas, preview-service, app-state, EditorPreviewsCard, viewmodel (50 files, +27429/-42)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Delay color picker assignment (a8dd60d)
- commit: a8dd60d5f11f1e478812e4aa62e4e707f674bb3c
- subject: Delay color picker assignment
- composer_id: 94578c8e-74f4-4aea-a453-36bb2bdb9354
- files_changed: ThemeVariablesCard.tsx (1 file, +21/-4)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Contrast (dec11f0)
- commit: dec11f010393a45cb6f120a63e2e9289a7567651
- subject: Contrast
- composer_id: 94578c8e-74f4-4aea-a453-36bb2bdb9354
- files_changed: color.test.ts, color.ts, scope-resolver, EditorPreviewsCard, ThemesPage (7 files, +640/-11)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Tweak contrast (4656c8)
- commit: 4656c819a7bde0d3ee8de8aa0d77fe38b9da661b
- subject: Tweak contrast
- composer_id: 94578c8e-74f4-4aea-a453-36bb2bdb9354
- files_changed: color.test.ts, color.ts (2 files, +49/-33)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Filters (70265f)
- commit: 70265f1804c0d9643a8f288b77f3f2913999e2f3
- subject: Filters
- composer_id: 95261083-e285-41b8-b22d-0d8d4fcbe227
- files_changed: template json, CatalogDetailsCard, MappingsCard, ThemeVariablesCard, TokensCard, VariablesCard, styles (9 files, +5323/-39)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Sorting (8dd8b3)
- commit: 8dd8b33d4e86cf704d519ec86fe8b8688eaf603d
- subject: Sorting
- composer_id: 1d4ceb71-903e-46ad-9ae4-65d960d284bf
- files_changed: MappingsCard, ThemeVariablesCard, TokensCard, VariablesCard (4 files, +18/-11)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Template Groups (067f48)
- commit: 067f48a925d7e4d73f843a0bb50776a4b60c09d6
- subject: Template Groups
- composer_id: 2241bbff-6811-46f7-bcac-f16333a9d25b
- files_changed: template-controller, color, scope-resolver, template-repository, schemas, app-state, GroupsCard, MappingsCard, viewmodel (15 files, +583/-41)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Move storage to data dir (6bb8ba)
- commit: 6bb8ba796b0f8744d89aead2243c6d91863d2eac
- subject: Move storage to data dir
- composer_id: no session found
- files_changed: data/.gitkeep, data/catalogs, data/templates, data/themes, electron/main.ts (8 files, +4425/-10)
- touched_directive_file: false
- notes: Backfill entry. Storage paths under vayeate-theme-studio/data/.

## Backfill: Theme Export (27ef42)
- commit: 27ef42b7032aa6bc07409b8649f1f169d01237f9
- subject: Theme Export
- composer_id: bd432403-ecd0-465c-9946-5b9507b70ed0
- files_changed: themes/, data/templates, data/themes, electron, action-types, theme-exporter, theme-generator, theme-service, app-state, ThemeDetailsCard, AppContext, viewmodel (21 files, +1770/-357)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Remove Color Theme Studio (8344eb)
- commit: 8344ebeb0676c424414047e856485f1b87f44e08
- subject: Remove Color Theme Studio
- composer_id: no session found
- files_changed: .github/agent-docs, agents, skills, AGENTS.md; removal of color-theme-editor/ (106 files, +198/-55856)
- touched_directive_file: true
- notes: Backfill entry. Major directive update: repo single-app (vayeate-theme-studio only).

## Backfill: Optimistic state update for SAVE_THEME (ee3af6)
- commit: ee3af6bf999960f89c6138c22274c706998e7ba9
- subject: Optimistic state update for SAVE_THEME
- composer_id: bd432403-ecd0-465c-9946-5b9507b70ed0
- files_changed: AppContext.tsx (1 file, +6/-1)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Stop reloading theme after save (29602438)
- commit: 296024389b3791b868beadf928773d6b9ac52865
- subject: Stop reloading theme after save
- composer_id: bd432403-ecd0-465c-9946-5b9507b70ed0
- files_changed: vayeate-theme-studio/src/ui/context/AppContext.tsx (1 file, +5/-26)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Debounce persistence and precompute resolved token colors (6b470b4e)
- commit: 6b470b4e711a6f53d3741989f4c9f10a0c66581f
- subject: Debounce persistence and precompute resolved token colors
- composer_id: 5cabe570-298c-4c67-93a8-522cfd32f134
- files_changed: docs/theme_page_snappier_ui_16dac0f2.plan.md, EditorPreviewsCard.tsx, AppContext.tsx (3 files, +230/-35)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Start Maximized (6d541218)
- commit: 6d5412180d0e83ab06df7da79fe0dc09e8845d29
- subject: Start Maximized
- composer_id: 14a3d37b-c343-463b-8e1c-5c6691fe53b1
- files_changed: vayeate-theme-studio/electron/main.ts (1 file, +4)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Create Vayeate v2 template/theme (c087cacf)
- commit: c087cacf852d982397501c1ef0947acdb3611641
- subject: Create Vayeate v2 template/theme
- composer_id: b131744e-20e0-49df-809c-2ff21417fdfc
- files_changed: data/templates/vayeate-v2-1.0.0.template.json, data/themes/vayeate-v2-1.0.0.theme.json (2 files, +4581)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Add grouping to variables (b25cbcd4)
- commit: b25cbcd4ae05e8b0983d6a162dfb070990bb4ecf
- subject: Add grouping to variables
- composer_id: 64f3406a-3a33-40f4-84ca-c645932f89db
- files_changed: template/theme data, scope-resolver.test, theme-generator.test, template-repository.test, schemas, GroupsCard, ThemeVariablesCard, VariablesCard, TemplatesPage, ThemesPage, use-template-viewmodel(+test), use-theme-viewmodel(+test) (15 files, +5458/-28)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Implement theme save error handling and UI feedback (e9763995)
- commit: e9763995d9426427a2584d1d72b071eb23281acc
- subject: Implement theme save error handling and UI feedback
- composer_id: 11616ee5-39d8-4b33-810a-a840be4d5d74
- files_changed: template/theme data, electron/main.ts, action-types, theme-repository.test, schemas(+test), app-state(+test), AppContext, ThemesPage, styles.css, use-theme-viewmodel (13 files, +288/-137)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Enhance contrast assignment functionality invertComparison (c45c2f69)
- commit: c45c2f69ea345e454761a64ea3041d5e07caefc7
- subject: Enhance contrast assignment functionality invertComparison
- composer_id: 11616ee5-39d8-4b33-810a-a840be4d5d74
- files_changed: theme json, scope-resolver(+test), theme-generator(+test), schemas, ThemeVariablesCard, styles.css, use-theme-viewmodel(+test) (10 files, +236/-48)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Revert invertComparison (89ec9446)
- commit: 89ec9446ae54fbc27f42062aac5784ba15e3cf52
- subject: Revert invertComparison
- composer_id: 11616ee5-39d8-4b33-810a-a840be4d5d74
- files_changed: theme json, scope-resolver(+test), theme-generator(+test), schemas, ThemeVariablesCard, styles.css, use-theme-viewmodel(+test) (10 files, +48/-236)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Update theme JSON light contrast (196ecabf)
- commit: 196ecabf539d19938d4e6d0cfb6def8d0768a669
- subject: Update theme JSON light contrast
- composer_id: 11616ee5-39d8-4b33-810a-a840be4d5d74
- files_changed: vayeate-theme-studio/data/themes/vayeate-v2-1.0.1.theme.json (1 file, +49/-10)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Add Vayeate V2 themes and update package.json (f6b905b9)
- commit: f6b905b915337b79fefdc2a07426d99e8db2ffd1
- subject: Add Vayeate V2 themes and update package.json
- composer_id: 11616ee5-39d8-4b33-810a-a840be4d5d74
- files_changed: package.json, themes/vayeate-v2-*.json, data/templates vayeate-v2-1.0.2–1.0.4, data/themes 1.0.1–1.0.4, theme-controller, scope-resolver(+test), theme-generator(+test), theme-repository.test, schemas, app-state.test, EditorPreviewsCard(+test), ThemesPage, use-theme-viewmodel(+test) (23 files, +14585/-42)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Update theme files and improve color handling (f1a7d469)
- commit: f1a7d469b07b195763dc10cf0512fcca5a2fd5e9
- subject: Update theme files and improve color handling
- composer_id: 11616ee5-39d8-4b33-810a-a840be4d5d74
- files_changed: example.yml, themes, data/catalogs vayeate-tokens-1.0.1, data/templates 1.0.5–1.0.11, data/themes, color(+test), schemas(+test), EditorPreviewsCard, GroupsCard, MappingsCard, ThemeVariablesCard, VariablesCard (28 files, +35445/-134)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Highlight error variables (8cdd3b60)
- commit: 8cdd3b608a5d9d9bd6c85966ea829968c17d0f0c
- subject: Highlight error variables
- composer_id: 3038916b-0bbb-4b7c-9a4f-4b3aff263d18
- files_changed: vayeate-v2-light-color-theme.json, vayeate-v2-1.0.10.theme.json, ThemeVariablesCard.tsx, styles.css (4 files, +19/-4)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Virtualize previews (c7569395)
- commit: c7569395d767747703fddbe14f1c74cfbc43669c
- subject: Virtualize previews
- composer_id: 5cabe570-298c-4c67-93a8-522cfd32f134
- files_changed: package-lock.json, package.json, EditorPreviewsCard.tsx, styles.css (4 files, +207/-59)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Persist tab state (e14137e6)
- commit: e14137e63e595072fb758692f412517136a136bf
- subject: Persist tab state
- composer_id: f45513eb-c7e8-43a9-9a2c-95453ffc1ccd
- files_changed: ContentArea.test.tsx, ContentArea.tsx, styles.css (3 files, +155/-10)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Add new remote source (763cd38c)
- commit: 763cd38c31697ad86725cc4ee27f70d54194f1c7
- subject: Add new remote source
- composer_id: 7a757b08-f0b8-402e-be85-ade3777c189e
- files_changed: vayeate-theme-studio/data/catalogs/vscode-docs1-1.0.0.json, vscode-docs1-1.0.1.json (2 files, +847)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Faster tab switching (a478a0ee)
- commit: a478a0ee651c3c2079ed4b01da3c7d15fbddfe63
- subject: Faster tab switching
- composer_id: 3038916b-0bbb-4b7c-9a4f-4b3aff263d18
- files_changed: App.tsx, AppContext.tsx, slice-contexts.tsx, use-catalog-viewmodel, use-template-viewmodel, use-theme-viewmodel (6 files, +104/-16)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Support Color Registry Tokens (8fb43479)
- commit: 8fb43479aefb191f037b89e8485e9b03f57b8e63
- subject: Support Color Registry Tokens
- composer_id: bda4a774-70f6-4766-aed2-55f8358f8a55
- files_changed: data/catalogs/vs-code-color-registry-1.0.0.json, schemas(+test), catalog-sync(+test), CatalogDetailsCard(+test) (7 files, +1359/-13)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Parsing Semantic Tokens (094e8d7b)
- commit: 094e8d7bce6d6208b7f882f9e8c6e6ba2d31e00d
- subject: Parsing Semantic Tokens
- composer_id: 01f8e7aa-b728-4998-b08f-f2a864c9e45a
- files_changed: catalogs, migrate-catalogs-semantic.cjs, catalog-controller, semantic-token(+test), theme-generator.test, catalog-repository.test, schemas, catalog-sync(+test), app-state.test, CatalogDetailsCard(+test), MappingsCard, TokensCard(+test), AppContext, CatalogsPage(+test), TemplatesPage, use-catalog-viewmodel(+test), use-template-viewmodel (31 files, +6983/-57)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Rename textmate tokens (9b46feb9)
- commit: 9b46feb965143264c32776a1b1fd0a9c07186462
- subject: Rename textmate tokens
- composer_id: 94f48a31-3193-4f33-9647-aceef6438390
- files_changed: catalogs vayeate-tokens, templates, migrate-token-to-textmate.cjs, scope-resolver.test, theme-generator(+test), schemas(+test), catalog-sync(+test), theme-parser(+test), BulkAddDialog, CatalogDetailsCard(+test), EditorPreviewsCard.test, MappingsCard(+test), TokensCard(+test), use-catalog-viewmodel, use-template-viewmodel(+test) (38 files, +2295/-2272)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Add textmate grammar catalogs (3a207d31)
- commit: 3a207d31c67232b5b022c2992dc4e65263acac5d
- subject: Add textmate grammar catalogs
- composer_id: c0480436-5553-4603-9ef3-ad65d7a276d4
- files_changed: Test-1.0.0 removed, many data/catalogs/*.json added (dotnet-csharp, microsoft-typescript, powershell-editor-syntax, rust-syntax, shaders-hlsl, textmate-*, vs-code-semantic-token-registry), vscode-docs1 updated; schemas(+test), catalog-sync(+test), CatalogDetailsCard(+test) (41 files, +11276/-881)
- touched_directive_file: false
- notes: Backfill entry.

## Backfill: Add template groups on catalog import (cd071c11)
- commit: cd071c11b9c249c18e6647c3457d8db97ecced1d
- subject: Add template groups on catalog import
- composer_id: 5b98dc96-27af-4042-8489-320d6e1ac90b
- files_changed: .cursor/agents/directive-maintainer.md, .cursor/commands/refresh-directives.md, .cursor/hooks.json, .cursor/hooks/maybe_run_directive_review.py, .cursor/hooks/session_delta.py, .cursor/rules/00-agent-governance.mdc, .cursor/rules/10-directive-maintenance.mdc, .cursor/skills/maintain-directives/SKILL.md, .cursor/state/*, .cursor/tools/review_directives.py, .cursor-plugin/plugin.json, cursor-directive-maintainer/README.md, data/templates/test-1.0.1.template.json, use-template-viewmodel(+test) (17 files)
- touched_directive_file: true
- notes: Backfill entry. Introduced directive-maintainer workflow and template groups on import.

## Backfill: Update catalog button (6074bfbc)
- commit: 6074bfbc7e46a38984d8d5e7a8516f9e1ad8693d
- subject: Update catalog button
- composer_id: 2241bbff-6811-46f7-bcac-f16333a9d25b
- files_changed: .cursor-plugin/plugin.json removed, cursor-directive-maintainer/README.md removed; TemplateCatalogsCard(+test), TemplateCatalogsCard.tsx, TemplatesPage, styles.css, use-template-viewmodel(+test) (8 files, +361/-41)
- touched_directive_file: false
- notes: Backfill entry. Plugin surface removed; catalog-update UI in Theme Studio.
