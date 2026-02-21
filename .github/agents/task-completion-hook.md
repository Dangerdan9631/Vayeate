# Task Completion Hook (GitHub Copilot)

Use this hook at the end of every completed implementation task.

## Hook trigger

Run this checklist after code changes are complete and before final handoff.

## Hook checklist

1. Determine if agent guidance changed because of the task:
   - new workflow,
   - changed boundaries,
   - changed validation commands,
   - changed architecture/module ownership,
   - new repeated edge case.
2. If changed, update the relevant agent file(s):
   - `AGENTS.md` (routing, read order, decision table)
   - `.github/copilot-instructions.md` (global Copilot rules/workflow)
   - `.github/agents/*.md` (agent profiles/hook docs)
   - `.github/skills/*.md` (task playbooks)
   - `.github/agent-docs/*.md` (architecture/functionality/edge-cases/conventions)
3. Keep updates minimal and directly tied to the completed work.
4. Re-run normal validation if these docs change in a way that could affect workflows.
5. In final handoff, explicitly note whether agent files were updated and which ones.

## Guardrails

- Do not rewrite agent docs broadly unless needed for accuracy.
- Do not add contradictory rules across files.
- Prefer editing existing guidance over creating duplicate guidance.
