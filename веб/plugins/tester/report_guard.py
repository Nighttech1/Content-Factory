"""Fast contract scan for FinGrad HTML reports and ReportData JSON."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

PLACEHOLDER_RE = re.compile(r"\{\{.*?\}\}|\{%.*?%\}", re.DOTALL)
NONE_RE = re.compile(r"(^|[>\s])(None|null)([<\s]|$)", re.IGNORECASE)
PERCENT_RE = re.compile(r"(?P<value>\d{3,}(?:[.,]\d+)?)\s*%")
FORBIDDEN_TRIAD = ("мкд", "light industrial", "ритейл")
BREAK_ALL_RE = re.compile(r"a\.doc-link-dark\s*\{[^}]*word-break:\s*break-all", re.IGNORECASE | re.DOTALL)
VRI_COL4_RE = re.compile(r"table\.data\.vri-table\s+th:nth-child\(4\).*?width:\s*\d+%", re.IGNORECASE | re.DOTALL)
MANUAL_OKS_RE = re.compile(r"Автоматическое отсутствие ОКС не подтверждено", re.IGNORECASE)
SCRIPT_STYLE_RE = re.compile(r"<(script|style)\b.*?</\1>", re.IGNORECASE | re.DOTALL)


@dataclass(frozen=True)
class GuardIssue:
    kind: str
    detail: str


@dataclass
class GuardReport:
    path: str
    ok: bool
    issues: list[GuardIssue] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class _TBodyParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_tbody = False
        self.depth = 0
        self.current_chunks: list[str] = []
        self.empty_indexes: list[int] = []
        self.index = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() == "tbody":
            self.in_tbody = True
            self.depth = 1
            self.current_chunks = []
            self.index += 1
            return
        if self.in_tbody:
            self.depth += 1

    def handle_endtag(self, tag: str) -> None:
        if not self.in_tbody:
            return
        self.depth -= 1
        if tag.lower() == "tbody" and self.depth == 0:
            body_text = "".join(self.current_chunks).strip()
            if not body_text:
                self.empty_indexes.append(self.index)
            self.in_tbody = False
            self.current_chunks = []

    def handle_data(self, data: str) -> None:
        if self.in_tbody:
            self.current_chunks.append(data)


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scan FinGrad HTML/JSON report artifacts.")
    parser.add_argument("path", type=Path, help="Path to HTML report or ReportData JSON")
    parser.add_argument(
        "--expect-scenarios",
        default="",
        help="Comma-separated expected scenario tokens that must be present",
    )
    parser.add_argument("--json", action="store_true", help="Print JSON report")
    return parser.parse_args(argv)


def _append_issue(report: GuardReport, kind: str, detail: str) -> None:
    report.issues.append(GuardIssue(kind=kind, detail=detail))
    report.ok = False


def _scan_common_text(text: str, report: GuardReport) -> None:
    if PLACEHOLDER_RE.search(text):
        _append_issue(report, "template_placeholder", "Found raw Jinja placeholder")
    if NONE_RE.search(text):
        _append_issue(report, "none_literal", "Found literal None/null in client-facing artifact")


def _scan_html(path: Path, report: GuardReport, expected_scenarios: list[str]) -> None:
    html = path.read_text(encoding="utf-8")
    lowered = html.lower()
    visible_html = SCRIPT_STYLE_RE.sub("", html)
    _scan_common_text(visible_html, report)

    parser = _TBodyParser()
    parser.feed(html)
    for idx in parser.empty_indexes:
        _append_issue(report, "empty_tbody", f"Found empty <tbody> #{idx}")

    if all(token in lowered for token in FORBIDDEN_TRIAD):
        report.notes.append("HTML contains the default MKD/LI/Retail triad; verify this is VRI-derived.")

    for token in expected_scenarios:
        if token.lower() not in lowered:
            _append_issue(report, "missing_scenario", f"Missing expected scenario token: {token}")

    for match in PERCENT_RE.finditer(html):
        raw = match.group("value").replace(",", ".")
        try:
            value = float(raw)
        except ValueError:
            continue
        if value > 400:
            report.notes.append(f"High percentage token detected: {match.group(0)}")

    if BREAK_ALL_RE.search(html):
        _append_issue(report, "layout_break_all", "Document source links still use word-break: break-all")
    if 'class="data cols-auto vri-table"' in html and not VRI_COL4_RE.search(html):
        _append_issue(report, "vri_table_width", "VRI table is missing explicit width for the 4th column")
    if "ОКС в ЕГРН и на снимке не выявлены" in html and MANUAL_OKS_RE.search(html):
        _append_issue(report, "oks_contradiction", "Manual OKS review is required, but HTML still claims no OKS found")


def _flatten_json_strings(payload: Any) -> list[str]:
    flattened: list[str] = []
    if isinstance(payload, dict):
        for key, value in payload.items():
            flattened.append(str(key))
            flattened.extend(_flatten_json_strings(value))
    elif isinstance(payload, list):
        for item in payload:
            flattened.extend(_flatten_json_strings(item))
    elif payload is None:
        flattened.append("None")
    else:
        flattened.append(str(payload))
    return flattened


def _scan_json(path: Path, report: GuardReport, expected_scenarios: list[str]) -> None:
    payload = json.loads(path.read_text(encoding="utf-8"))
    blob = "\n".join(_flatten_json_strings(payload))
    lowered = blob.lower()
    _scan_common_text(blob, report)

    if '"winner' in lowered and '"npv' in lowered:
        report.notes.append("JSON includes winner/NPV fields; verify cross-block winner=max(NPV) in pytest.")
    if all(token in lowered for token in FORBIDDEN_TRIAD):
        report.notes.append("JSON contains the default MKD/LI/Retail triad; verify VRI-only scenarios.")

    for token in expected_scenarios:
        if token.lower() not in lowered:
            _append_issue(report, "missing_scenario", f"Missing expected scenario token: {token}")


def scan_artifact(path: Path, *, expected_scenarios: list[str]) -> GuardReport:
    if not path.is_file():
        raise FileNotFoundError(f"Artifact not found: {path}")
    suffix = path.suffix.lower()
    report = GuardReport(path=str(path.resolve()), ok=True)
    if suffix in {".html", ".htm"}:
        _scan_html(path, report, expected_scenarios)
    elif suffix == ".json":
        _scan_json(path, report, expected_scenarios)
    else:
        raise ValueError("Supported files: .html, .htm, .json")
    return report


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    expected = [part.strip() for part in args.expect_scenarios.split(",") if part.strip()]
    report = scan_artifact(args.path, expected_scenarios=expected)
    if args.json:
        print(json.dumps(report.to_dict(), ensure_ascii=False, indent=2))
    else:
        status = "OK" if report.ok else "FAIL"
        print(f"{status}  {report.path}")
        for issue in report.issues:
            print(f"  {issue.kind}: {issue.detail}")
        for note in report.notes:
            print(f"  note: {note}")
    return 0 if report.ok else 1


if __name__ == "__main__":
    sys.exit(main())
