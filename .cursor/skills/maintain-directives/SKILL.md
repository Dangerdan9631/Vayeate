---
name: maintain-directives
description: Review session deltas and durable instruction files, then propose minimal, high-value updates to rules, skills, subagents, and AGENT.md.
---

# Maintain Directives

Use this skill when:
- a session involved multiple edits
- the user corrected the agent more than once
- files were added, removed, or renamed
- a refactor changed folder structure or workflow
- `rules/**`, `agents/**`, `skills/**`, or `commands/**` changed
- the user asks to update project instructions, rules, or skills

## Goal

Convert session learnings into a clean, durable instruction system without creating churn.

## Inputs to inspect

- `state/session-directive-deltas.md`
- `rules/**`
- `agents/**`
- `skills/**`
- `AGENT.md` if present
- changed implementation files only when needed for validation

## Review process

1. Read the session delta log first.
2. Build a candidate list of possible durable updates:
   - stale instruction
   - missing reusable constraint
   - outdated path or example
   - duplicate directive
   - obsolete directive
3. Validate each candidate:
   - Is it stable?
   - Is it reusable?
   - Is it better as a rule, skill step, or subagent prompt?
   - Does an existing directive already cover it?
4. Prefer the smallest effective change.
5. Produce a report before making durable edits unless the user explicitly asked for direct edits.

## Classification guidance

### Put it in a rule when:
- it is a durable constraint or project-wide expectation
- it should shape normal agent behavior automatically

### Put it in a skill when:
- it is a repeatable procedure
- it is task-specific and should load only when relevant

### Put it in a subagent when:
- the task needs an isolated role with a focused objective
- the workflow benefits from a fresh context and specialized review pass

### Do not persist when:
- it is a one-off preference from this session
- it only applies to a single temporary task
- it duplicates an existing instruction

## Output format

# Directive Review

## Candidate durable updates
- ...

## Recommended location for each update
- rule | skill | subagent | do not persist

## Exact edits
- file: ...
- change: ...

## Rationale
- ...
