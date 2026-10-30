"""Summarize likely root cause from pytest or uvicorn logs."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

TRACEBACK_START = "Traceback (most recent call last):"
ERROR_HINTS: tuple[tuple[str, str, str], ...] = (
    (r"jinja2\.exceptions\.(\w+)", "jinja", "Template rendering failure"),
    (r"pydantic(?:_core)?\..*ValidationError|ValidationError", "pydantic", "Schema or payload validation failure"),
    (r"AssertionError", "assertion", "A product guard or unit assertion failed"),
    (r"ModuleNotFoundError|ImportError", "import", "Import or environment failure"),
    (r"Address already in use", "port", "Port conflict during localhost startup"),
    (r"ConnectionRefusedError|ConnectError", "network", "Connection failure during startup or test"),
)


@dataclass(frozen=True)
class RootCause:
    category: str
    summary: str
    evidence: str


@dataclass
class TracebackReport:
    path: str
    root_causes: list[RootCause] = field(default_factory=list)
    rerun_recommended: bool = True
    notes: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Summarize likely root cause from a log file.")
    parser.add_argument("logfile", type=Path, help="Path to pytest/uvicorn log")
    parser.add_argument("--json", action="store_true", help="Print JSON report")
    return parser.parse_args(argv)


def _tail_lines(text: str, limit: int = 40) -> list[str]:
    lines = [line.rstrip() for line in text.splitlines() if line.strip()]
    return lines[-limit:]


def _extract_traceback(lines: list[str]) -> list[str]:
    joined = "\n".join(lines)
    idx = joined.rfind(TRACEBACK_START)
    if idx == -1:
        return _tail_lines(joined, limit=20)
    block = joined[idx:]
    return block.splitlines()[-20:]


def analyze_log(path: Path) -> TracebackReport:
    if not path.is_file():
        raise FileNotFoundError(f"Log file not found: {path}")
    text = path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    report = TracebackReport(path=str(path.resolve()))
    sample_lines = _extract_traceback(lines)
    sample = "\n".join(sample_lines)

    for pattern, category, summary in ERROR_HINTS:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            evidence = match.group(0)
            report.root_causes.append(RootCause(category=category, summary=summary, evidence=evidence))

    if not report.root_causes and sample.strip():
        last_line = sample_lines[-1] if sample_lines else "No traceback captured"
        report.root_causes.append(
            RootCause(
                category="unknown",
                summary="Review the final traceback frame manually",
                evidence=last_line[:240],
            )
        )

    if "FAILED" not in text and "ERROR" not in text and TRACEBACK_START not in text:
        report.notes.append("No obvious red failure markers found in the log.")

    report.notes.append("After fixing the root cause, re-run the same failing command until green.")
    if any(cause.category in {"port", "jinja", "pydantic", "network"} for cause in report.root_causes):
        report.notes.append("If this affected startup or report generation, run localhost smoke after the fix.")
    if "chain.md" not in text:
        report.notes.append("Keep the patch inside chain.md scope; escalate contract changes to Architect.")
    return report


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    report = analyze_log(args.logfile)
    if args.json:
        print(json.dumps(report.to_dict(), ensure_ascii=False, indent=2))
    else:
        print(f"LOG  {report.path}")
        for cause in report.root_causes:
            print(f"  {cause.category}: {cause.summary} ({cause.evidence})")
        for note in report.notes:
            print(f"  note: {note}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
