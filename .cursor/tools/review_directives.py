#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
RULES_DIR = ROOT / "rules"
AGENTS_DIR = ROOT / "agents"
SKILLS_DIR = ROOT / "skills"
STATE_DIR = ROOT / "state"
DELTA_FILE = STATE_DIR / "session-directive-deltas.md"
REPORT_FILE = STATE_DIR / "directive-update-report.md"


def collect_files(base: Path, patterns):
    found = []
    if not base.exists():
        return found
    for pattern in patterns:
        found.extend(sorted(base.rglob(pattern)))
    return found


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except Exception as e:
        return f"<<error reading {path}: {e}>>"


def main():
    rules = collect_files(RULES_DIR, ["*.md", "*.mdc"])
    agents = collect_files(AGENTS_DIR, ["*.md"])
    skills = collect_files(SKILLS_DIR, ["SKILL.md"])
    deltas = read_text(DELTA_FILE) if DELTA_FILE.exists() else ""

    findings = []
    proposed = []
    directive_files = rules + agents + skills

    for path in directive_files:
        text = read_text(path)
        rel = path.relative_to(ROOT)
        if len(text.splitlines()) > 180:
            findings.append(f"{rel} is long; consider splitting.")
        if re.search(r"always\s+update|rewrite all rules", text, re.I):
            proposed.append(f"Tighten {rel} to avoid churn-heavy instructions.")

    if "touched_directive_file: true" in deltas:
        proposed.append("Review directive files touched in this session for redundancy or stale guidance.")
    if "deleted" in deltas.lower():
        proposed.append("Check for rule and skill references to deleted files, folders, or workflows.")
    if "renamed" in deltas.lower():
        proposed.append("Check globs, paths, and examples for renamed locations.")
    if "correction" in deltas.lower():
        proposed.append("Promote repeated user corrections into durable rules or skill steps when reusable.")

    lines = [
        "# Directive Update Report",
        "",
        "## Findings",
        *([f"- {x}" for x in findings] or ["- No obvious structural issues found."]),
        "",
        "## Proposed Updates",
        *([f"- {x}" for x in proposed] or ["- No durable directive changes proposed."]),
        "",
        "## Reviewed Files",
        *[f"- {path.relative_to(ROOT)}" for path in directive_files],
    ]

    report = "\n".join(lines)
    REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)
    REPORT_FILE.write_text(report, encoding="utf-8")
    print(report)


if __name__ == "__main__":
    main()
