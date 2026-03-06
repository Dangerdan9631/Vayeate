#!/usr/bin/env python3
import sys
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
STATE_DIR = ROOT / "state"
STATE_DIR.mkdir(parents=True, exist_ok=True)
DELTA_FILE = STATE_DIR / "session-directive-deltas.md"


def safe_get(d, *path, default=None):
    cur = d
    for part in path:
        if not isinstance(cur, dict) or part not in cur:
            return default
        cur = cur[part]
    return cur


def main() -> int:
    event_name = "unknown"
    if "--event" in sys.argv:
        idx = sys.argv.index("--event")
        if idx + 1 < len(sys.argv):
            event_name = sys.argv[idx + 1]

    raw = sys.stdin.read().strip()
    payload = {}
    if raw:
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"raw": raw}

    ts = datetime.now(timezone.utc).isoformat()
    file_path = (
        safe_get(payload, "filePath")
        or safe_get(payload, "file", "path")
        or safe_get(payload, "path")
        or "unknown"
    )
    old_content = (
        safe_get(payload, "oldContent")
        or safe_get(payload, "file", "oldContent")
        or ""
    )
    new_content = (
        safe_get(payload, "newContent")
        or safe_get(payload, "file", "newContent")
        or ""
    )

    changed = old_content != new_content
    line_delta = None
    if isinstance(old_content, str) and isinstance(new_content, str):
        line_delta = len(new_content.splitlines()) - len(old_content.splitlines())

    entry = f"""## Event
- time: {ts}
- event: {event_name}
- file: {file_path}
- changed: {str(changed).lower()}
- line_delta: {line_delta if line_delta is not None else 'unknown'}

### Potential directive impact
- touched_directive_file: {'true' if str(file_path).startswith(('rules/', 'agents/', 'skills/', 'commands/')) or str(file_path).upper().endswith('AGENT.md') else 'false'}
- likely_requires_rule_update: false
- likely_requires_skill_update: false
- likely_requires_subagent_update: false

### Notes
- Auto-captured from hook.
- Reviewer should infer impact from cumulative session history, not this event alone.

"""

    with DELTA_FILE.open("a", encoding="utf-8") as f:
        f.write(entry)

    print(json.dumps({
        "continue": True,
        "message": f"logged delta for {file_path}"
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
