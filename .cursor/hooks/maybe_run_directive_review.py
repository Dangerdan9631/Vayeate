#!/usr/bin/env python3
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
STATE_DIR = ROOT / "state"
DELTA_FILE = STATE_DIR / "session-directive-deltas.md"
REPORT_FILE = STATE_DIR / "directive-update-report.md"
THRESHOLD_EVENTS = 8


def count_events(text: str) -> int:
    return text.count("## Event")


def should_run(text: str) -> bool:
    if "touched_directive_file: true" in text:
        return True
    if "user correction" in text.lower():
        return True
    if count_events(text) >= THRESHOLD_EVENTS:
        return True
    return False


def main() -> int:
    if not DELTA_FILE.exists():
        print(json.dumps({"continue": True, "message": "no delta file yet"}))
        return 0

    text = DELTA_FILE.read_text(encoding="utf-8")
    if not should_run(text):
        print(json.dumps({
            "continue": True,
            "message": "directive review skipped; threshold not met"
        }))
        return 0

    proc = subprocess.run(
        [sys.executable, str(ROOT / "tools" / "review_directives.py")],
        cwd=str(ROOT),
        capture_output=True,
        text=True
    )

    ts = datetime.now(timezone.utc).isoformat()
    summary = proc.stdout.strip() or proc.stderr.strip() or "no output"

    REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with REPORT_FILE.open("a", encoding="utf-8") as f:
        f.write(f"\n\n---\nreview_run: {ts}\nexit_code: {proc.returncode}\n\n{summary}\n")

    print(json.dumps({
        "continue": True,
        "message": "directive review executed"
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
