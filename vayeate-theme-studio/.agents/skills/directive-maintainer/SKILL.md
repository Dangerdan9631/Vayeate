---
name: directive-maintainer
model: inherit
description: Audits Vayeate Theme Studio directives against the actual codebase and reports directive drift with suggested text fixes. Use for rule audits, maintainer reviews, or rule alignment checks.
disable-model-invocation: true
---

# Directive maintainer

## Scope

Compare directives embedded in [`AGENTS.md`](../../../AGENTS.md), `.agents/skills/*/SKILL.md`, and `.claude/skills/*/SKILL.md` to the implementation under **`vayeate-theme-studio/`**.

Code under **`vayeate-theme-studio/`** is the authority for conventions, architecture, naming, and flow.

## Rules to apply

- app-architecture.mdc
- Layers: layer-electron.mdc, layer-app.mdc, layer-domain.mdc, layer-gateway.mdc
- Concepts: controller.mdc, operation.mdc, validation.mdc, viewmodel.mdc, component.mdc, state.mdc, gateway.mdc, service.mdc, model.mdc

## Constraint

Do **not** create, edit, or delete rule, skill, agent, or code files. **Generate review artifacts only.**

## Authority

- Treat the current codebase as the source of truth when directives and code disagree.
- Report directives that are outdated, incomplete, over-prescriptive, or inconsistent with actual code patterns.
- If multiple directive files disagree, use the codebase to determine which directive text has drifted.
- Do **not** recommend changing the code merely to satisfy stale directives unless the user explicitly asks for a directive-led refactor.

## What to find

- **Drift** — directive text no longer matches implemented naming, layering, dependency flow, or exceptions
- **Gap** — code establishes a repeated convention or exception that directives do not document
- **Conflict** — two directive files describe different behavior than each other or than the codebase
- **Overreach** — directive text forbids patterns the codebase intentionally and repeatedly uses
- **Stale flow** — agents or skills still describe older audit or implementation flows that no longer match current maintainer conventions

## Report format

Group by **directive file**. Per issue:

```markdown
### Short title [directive file and line number]
- **Directive:** `AGENTS.md`, `.agents/...`, or `.claude/...`
- **Code evidence:** `vayeate-theme-studio/...`
- **Drift:** short description of how the directive disagrees with the code.
- **Suggested update:** concrete replacement text or bullet edits for the directive.
```

- Tie each finding to the **specific directive** that drifted.
- Cite at least one **code file** as evidence for each finding.
- Prefer **actionable** text fixes (replace / add / remove / narrow).
- Do not report files with no findings.

## Review Process

1. Identify all directive sources in scope for review. Unless the user specifies a narrower scope, review rule sections embedded in `AGENTS.md`, `.agents/skills/*/SKILL.md`, and `.claude/skills/*/SKILL.md`.
2. Before performing any audit, generate the checklist by running **`node .agents/skills/directive-maintainer/scripts/generate-directive-review-checklist.mjs`** from the `vayeate-theme-studio` directory. This writes `vayeate-theme-studio/directive-review/checklist.md` with one unchecked parent item per in-scope directive and unchecked child items for the implementation files relevant to that directive. It also writes an `Unreferenced implementation files` section for files not listed under any directive. Do not hand-author the checklist.
3. Review every implementation file listed under a directive before marking that directive complete. The checklist intentionally repeats code files under multiple directives when those files are relevant to more than one rule or skill; validate the directive independently against each listed file.
4. Audit each file in `Unreferenced implementation files` against all directive files for violations. Use this catch-all section to find files that escaped the targeted directive mapping.
5. Do not review test files except when the checklist includes architecture tests because they encode conventions referenced by directives.
6. Partition the checklist into smaller directive sections that can be reviewed by multiple subagents in parallel.
7. As each listed implementation file is reviewed for a directive, check off that child item. When all child items under a directive are reviewed, add any findings to `vayeate-theme-studio/directive-review/report.md` and check off the directive parent item. Each finding should stand alone. Do not reference other findings with phrases like "Same as above".
8. Ensure that every directive section and the unreferenced-files section are complete by verifying that every parent and child checklist item is checked off.

**Do not make any changes to rules, skills, agents, or application code.** Only generate the checklist and report review artifacts.
**Every directive source** in scope, every relevant implementation file listed beneath it, and every file in `Unreferenced implementation files` must be reviewed and checked off the checklist before completing the audit.
**Always** perform a full audit of all directive sections and all listed implementation files, and audit unreferenced files against all directive files. Do not skip any directive sections, skills, agents, or relevant code files.

## Example Report

```markdown
# Vayeate Theme Studio — directive maintainer audit

Scope: `AGENTS.md`, `.agents/skills/*/SKILL.md`, and `.claude/skills/*/SKILL.md`. Compared against each implementation file listed by `vayeate-theme-studio/directive-review/checklist.md`.

## operation.mdc

### Missing window callback exception [operation.mdc, lines 12-18]
- **Directive:** `AGENTS.md`
- **Code evidence:** `vayeate-theme-studio/src/domain/operations/app-operations/initialize-window-callbacks-operation.ts`
- **Drift:** The code intentionally injects controller classes into `InitializeWindowCallbacksOperation` to register `WindowService.init(...)` callbacks, but the directive still states operations must not inject or bridge controllers without documenting this exception.
- **Suggested update:** Add an exception bullet that explicitly allows controller injection only for `InitializeWindowCallbacksOperation` callback registration, and state that the exception does not permit broader controller orchestration inside operations.

## app-architecture.mdc

### Audit flow added here but not reflected in directive maintainer [code-maintainer.md, lines 36-48]
- **Directive:** `.agents/skills/directive-maintainer/SKILL.md`
- **Code evidence:** `vayeate-theme-studio/src/**`
- **Drift:** The maintainer flow now expects a full-file checklist-driven audit, but the directive maintainer prompt still uses a lightweight directive-quality review and does not mirror the code-maintainer review process.
- **Suggested update:** Replace the prompt with an inverse audit flow: audit every directive section in `AGENTS.md` against the codebase, create `directive-review/checklist.md`, write findings to `directive-review/report.md`, and treat code as the authority when directives drift.
```
