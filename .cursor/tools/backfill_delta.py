#!/usr/bin/env python3
"""
Produce a session-delta backfill entry for one commit.
Usage: python backfill_delta.py "<subject>" <hash> [composer_id|no session found]
Reads git show --stat from stdin or runs git show when hash given.
"""
import sys
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # .cursor
REPO = ROOT.parent  # Vayeate repo root


def main():
    if len(sys.argv) < 3:
        print("Usage: backfill_delta.py <subject> <hash> [composer_id]", file=sys.stderr)
        sys.exit(1)
    subject = sys.argv[1]
    hash_val = sys.argv[2]
    composer_id = sys.argv[3] if len(sys.argv) > 3 else ""
    if composer_id.lower() == "no":
        composer_id = "no session found"

    result = subprocess.run(
        ["git", "show", hash_val, "--stat"],
        cwd=str(REPO),
        capture_output=True,
        text=True,
    )
    stat_out = result.stdout.strip() if result.returncode == 0 else "(git show failed)"
    lines = [l for l in stat_out.splitlines() if l.strip()]
    files_line = ""
    for line in lines:
        if line.startswith(" ") or "\t" in line or "|" in line:
            files_line = line.strip() if "|" in line else (files_line + " " + line.strip())
    if not files_line and len(lines) >= 2:
        files_line = " ".join(lines[-3:])

    touched = "true" if any(
        x in stat_out.lower()
        for x in ["rules/", "agents/", "skills/", "commands/", "agent.md", "agents.md"]
    ) else "false"

    short_hash = hash_val[:8] if len(hash_val) >= 8 else hash_val
    block = f"""
## Backfill: {subject} ({short_hash})
- commit: {hash_val}
- subject: {subject}
- composer_id: {composer_id or 'none'}
- files_changed: {files_line[:200] + ('...' if len(files_line) > 200 else '')}
- touched_directive_file: {touched}
- notes: Backfill entry.
"""
    print(block.strip())


if __name__ == "__main__":
    main()
