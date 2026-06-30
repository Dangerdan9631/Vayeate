---
name: code-maintainer
model: inherit
description: Audits Vayeate Theme Studio code against the embedded rule sections in AGENTS.md and reports violations with suggested fixes. Use for architecture audits, convention checks, or maintainer reviews.
disable-model-invocation: true
---

# Code maintainer

## Scope

Compare code under **`vayeate-theme-studio/`** to every rule section embedded in [`AGENTS.md`](../../../AGENTS.md).

## Rules to apply

- app-architecture.mdc
- Layers: layer-electron.mdc, layer-app.mdc, layer-domain.mdc, layer-gateway.mdc
- Concepts: controller.mdc, operation.mdc, validation.mdc, viewmodel.mdc, component.mdc, state.mdc, gateway.mdc, service.mdc, model.mdc

## Constraint

Do **not** create, edit, or delete code files. **Generate review artifacts only** (`code-review/checklist.md` and `code-review/report.md`); do not edit application code.

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

1. Identify all rule sections in scope for review. Unless the user specifies a narrower scope, review every rule section embedded in `AGENTS.md` against the implementation files relevant to that rule.
2. Before performing any audit, generate the checklist by running **`node .agents/skills/code-maintainer/scripts/generate-code-review-checklist.mjs`** from the `vayeate-theme-studio` directory. This writes `vayeate-theme-studio/code-review/checklist.md` with one unchecked parent item per rule and unchecked child items for the implementation files relevant to that rule. It also writes an `Unreferenced implementation files` section for files not listed under any rule. Do not hand-author the checklist.
3. Audit each listed child file against the corresponding parent rule only. The checklist intentionally repeats implementation files under multiple rules when those files are relevant to more than one rule; validate each rule-file pair independently.
4. Audit each file in `Unreferenced implementation files` against all directive files for violations. Use this catch-all section to find files that escaped the targeted rule mapping.
5. Do not review test files unless the checklist explicitly includes them.
6. Partition the checklist into smaller rule sections that can be reviewed by multiple subagents in parallel.
7. As each listed implementation file is reviewed for a rule, add any findings to the report (`/vayeate-theme-studio/code-review/report.md`) and check off that child item. When all child items under a rule are reviewed, check off the rule parent item. Each finding should stand alone. Do not reference other findings with phrases like "Same as above".
8. Ensure that every rule section and the unreferenced-files section are complete by verifying that every parent and child checklist item is checked off.

**Do not make any changes to the codebase.** Only generate the checklist and report review artifacts.
**Every rule section** in scope, every relevant implementation file listed beneath it, and every file in `Unreferenced implementation files` must be reviewed and checked off the checklist before completing the audit.
**Always** perform a targeted audit of each listed file against its corresponding parent rule, and audit unreferenced files against all directive files. Do not skip any rule sections or listed implementation files.

## Example Report

```markdown
# Vayeate Theme Studio — code maintainer audit

Scope: `AGENTS.md` rule sections. Each rule was compared against the implementation files listed beneath it in `vayeate-theme-studio/code-review/checklist.md`.

## operation.mdc

### Operation calls other Operation.execute [operation.mdc, lines 14-15, 29]
- **File:** `vayeate-theme-studio/src/domain/operations/example-operations/load-and-select-example-operation.ts`
- **Violation:** Constructor injects peer operation classes such as `LoadExampleOperation` and `SelectExampleOperation`; `execute` chains their `.execute(...)` methods instead of owning one atomic domain change.
- **Suggested fix:** Move orchestration into a **controller** (validations -> sequence of operations) or split into **separate UI actions** so each handler runs one operation; alternatively collapse into a **single operation** that inlines the gateway/state work without delegating to other `Operation` classes.

---

## app-architecture.mdc

### Multiple actions dispatched for a single user interaction [app-architecture.mdc, lines 36–39]

- **File:** `vayeate-theme-studio/src/app/example/viewmodel/use-example-viewmodel.ts`
- **Violation:** A single user gesture dispatches two distinct action types in sequence where the architecture expects one action per interaction.
- **Suggested fix:** Consolidate into one action; route it through a single handler and controller (or one operation) so the queue processes one logical interaction per enqueue.
```
