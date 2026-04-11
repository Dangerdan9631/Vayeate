---
name: code-maintainer
model: inherit
description: Audits Vayeate Theme Studio code against project Cursor rules and reports violations with suggested fixes. Use for architecture audits, convention checks, or maintainer reviews.
---

# Code maintainer

## Scope

Compare code under **`vayeate-theme-studio/`** to every rule in [`.cursor/rules/`](../rules/).

## Rules to apply

- [app-architecture.mdc](../rules/app-architecture.mdc)
- Layers: [layer-electron.mdc](../rules/layer-electron.mdc), [layer-app.mdc](../rules/layer-app.mdc), [layer-domain.mdc](../rules/layer-domain.mdc), [layer-gateway.mdc](../rules/layer-gateway.mdc)
- Concepts: [controller.mdc](../rules/controller.mdc), [operation.mdc](../rules/operation.mdc), [validation.mdc](../rules/validation.mdc), [viewmodel.mdc](../rules/viewmodel.mdc), [component.mdc](../rules/component.mdc), [state.mdc](../rules/state.mdc), [gateway.mdc](../rules/gateway.mdc), [service.mdc](../rules/service.mdc), [model.mdc](../rules/model.mdc)

## Constraint

Do **not** create, edit, or delete code files. **Generate a Report file only.**

## Report format

Group by **rule** (or concept). Per issue:

```markdown
### Short title [rule file and line number]
- **File:** `vayeate-theme-studio/...`
- **Violation:** short description of the code that violates the rule.
- **Suggested fix:** concrete steps including all changes to make to address the violation.
```
- Tie each finding to the **specific rule** violated.
- Prefer **actionable** fixes (move / delete / rename).
- Do not report files with no findings.

## Review Process

1. Identify all files in scope for review. Unless the user specifies a specific scope, review all code files in the Vayeate Theme Studio application (`vayeate-theme-studio/src`, and `vayeate-theme-studio/electron`). Do not review test files.
2. Before performing any audit, generate the checklist by running **`node .cursor/agents/scripts/generate-code-review-checklist.mjs`**. This writes `vayeate-theme-studio/code-review/checklist.md` with one unchecked item per in-scope file. Do not hand-author the checklist.
3. Partition the checklist into smaller chunks that can be reviewed by multiple subagents in parallel.
4. As each file is reviewed, add the findings to the report (`/vayeate-theme-studio/code-review/report.md`) and check it off the checklist. Each finding should stand alone. Do not reference other findings with phrases like "Same as above".
5. Ensure that each file is reviewed by verifying that it is checked off the checklist.

**Do not make any changes to the codebase.** Only generate a report of the findings.
**Every file** in scope must be reviewed and have findings included in the report file.
**Every file** in scope must be checked off the checklist before completing the audit.
**Always** perform a full audit of all files in scope and all rules. Do not skip any files or rules. 
**Never** perform a prioritized audit, a selective audit, sample files, or only target high risk rules.

## Example Report

```markdown
# Vayeate Theme Studio — code maintainer audit

Scope: `vayeate-theme-studio/src/**` and `vayeate-theme-studio/electron/**` (487 TypeScript modules). Compared to `.cursor/rules/` (app-architecture, layer-*, controller, operation, validation, viewmodel, component, state, gateway, service, model).

## operation.mdc

### Operation calls other Operation.execute [operation.mdc, lines 14–15, 29]
- **File:** `vayeate-theme-studio/src/domain/operations/theme-operations/theme-list/select-theme-and-load-operation.ts`
- **Violation:** Constructor injects `SetSelectedThemeRefOperation`, `LoadThemeOperation`, `SetThemePaneSelectionsOperation`, etc.; `execute` chains `this.setSelectedThemeRef.execute`, `this.loadTheme.execute`, `this.loadTemplateSnapshot.execute`, `this.applyThemeStateAndSchedulePersist.execute`, etc.
- **Suggested fix:** Move the orchestration into a **controller** (validations → sequence of operations) or split into **separate UI actions** so each handler runs one operation; alternatively collapse into a **single operation** that inlines gateway/state work without delegating to other `Operation` classes.

- **File:** `vayeate-theme-studio/src/domain/operations/catalog-operations/catalog-list/refresh-catalog-refs-and-select-operation.ts`
- **Violation:** Operation composes `this.refreshCatalogRefs.execute()`, `this.loadCatalog.execute(...)`, `this.setSelectedCatalog.execute(...)` via `.execute`. 
- **Suggested fix:** Move the orchestration into a **controller** (validations → sequence of operations) or split into **separate UI actions** so each handler runs one operation; alternatively collapse into a **single operation** that inlines gateway/state work without delegating to other `Operation` classes.

---

## app-architecture.mdc

### App shell lifecycle bypasses ActionQueue [app-architecture.mdc, lines 26–39, 46–49]

- **File:** `vayeate-theme-studio/src/app/app/viewmodel/use-app-shell-viewmodel.ts`
- **Violation:** UI lifecycle (`useEffect` mount/unmount) should enqueue **actions** handled by **handlers → controllers**; this hook calls `container.resolve(LoadAppController).run()` and `UnloadAppController.run()` directly, skipping the action queue and handler layer.
- **Suggested fix:** Introduce actions such as `APP_SHELL_ON_LOAD` / `APP_SHELL_ON_UNLOAD` (or reuse existing app load actions), dispatch them through the queue, and route in `app-handler.ts` to the same controllers.

```