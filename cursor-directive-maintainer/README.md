# Directive Maintainer Cursor Plugin

This plugin logs session deltas and periodically reviews whether your durable Cursor instructions should be updated.

## Install

For a single-plugin repo:
- keep `.cursor-plugin/plugin.json` at the repo root
- open the repo in Cursor or install it as a local plugin

## What it does

- logs edit events into `state/session-directive-deltas.md`
- runs a lightweight review on `stop`
- writes findings to `state/directive-update-report.md`
- provides:
  - rules for low-churn directive maintenance
  - a `directive-maintainer` subagent
  - a `maintain-directives` skill
  - a `/refresh-directives` command

## Suggested next steps

1. Tune `THRESHOLD_EVENTS` in `hooks/maybe_run_directive_review.py`
2. Expand delta logging with rename/delete/manual correction markers
3. Add a second command that applies approved edits
4. Package a marketplace manifest later if you want multi-plugin distribution
