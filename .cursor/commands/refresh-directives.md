---
description: Review current durable directives against session deltas and produce a directive update report.
---

Run the `directive-maintainer` subagent.

Required inputs:
- `state/session-directive-deltas.md`
- `rules/**`
- `agents/**`
- `skills/**`
- `AGENT.md` if present

Tasks:
1. Review all durable directive sources.
2. Identify stale instructions, missing reusable guidance, outdated paths/examples, and duplicates.
3. Update or overwrite `state/directive-update-report.md` with a concise recommendation set.
4. Do not directly rewrite durable directives unless the user explicitly asks for edits.
