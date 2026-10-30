#!/usr/bin/env python3
"""Static DESIGN.md / anti-slop guard for Aedifica.Core Dart UI files."""
from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT_MARKERS = ("app", ".cursor")

RULES: list[tuple[str, re.Pattern[str], str]] = [
    (
        "raw-hex-color",
        re.compile(r"\bColor\s*\(\s*0x", re.I),
        "raw Color(0x…) in widget — use Theme/preset tokens",
    ),
    (
        "fromRGBO",
        re.compile(r"\bColor\.(fromRGBO|fromARGB)\s*\("),
        "Color.fromRGBO/fromARGB in widget — use Theme/preset tokens",
    ),
    (
        "slop-material-color",
        re.compile(
            r"\bColors\.(blue|purple|indigo|grey|gray|black|deepPurple|lightBlue)\b"
        ),
        "Material Colors.* slop / #000 — use DESIGN.md tokens",
    ),
    (
        "default-card",
        re.compile(r"\bCard\s*\("),
        "default Card( — use surfaces + hairline, not Material card",
    ),
    (
        "elevated-button",
        re.compile(r"\bElevatedButton\s*(\.|\()"),
        "ElevatedButton — use custom / theme button kit",
    ),
    (
        "ease-in",
        re.compile(r"\bCurves\.easeIn(?!Out)\b"),
        "Curves.easeIn* — use easeOutCubic / spring / decelerate",
    ),
    (
        "data-table",
        re.compile(r"\bDataTable\s*\("),
        "DataTable on registry — use PlutoGrid (flutter-dense-datagrid)",
    ),
]

ALLOW_PREFIXES = (
    "app/lib/core/theme/",
    "app/lib/core/constants/",
)


def repo_root() -> Path:
    here = Path(__file__).resolve()
    for p in here.parents:
        if (p / "app").is_dir() and (p / ".cursor").is_dir():
            return p
    return Path.cwd()


def norm(path: Path, root: Path) -> str:
    try:
        rel = path.resolve().relative_to(root).as_posix()
    except ValueError:
        rel = path.as_posix()
    return rel.replace("\\", "/")


def is_allowed(rel: str) -> bool:
    return any(rel.startswith(p) for p in ALLOW_PREFIXES)


def git_changed_dart(root: Path) -> list[Path]:
    cmds = [
        ["git", "diff", "--name-only", "--", "app/lib"],
        ["git", "diff", "--name-only", "--cached", "--", "app/lib"],
        ["git", "diff", "--name-only", "HEAD", "--", "app/lib"],
    ]
    names: set[str] = set()
    for cmd in cmds:
        try:
            out = subprocess.check_output(cmd, cwd=root, text=True, stderr=subprocess.DEVNULL)
        except (subprocess.CalledProcessError, FileNotFoundError):
            continue
        for line in out.splitlines():
            line = line.strip().replace("\\", "/")
            if line.endswith(".dart"):
                names.add(line)
    return [root / n for n in sorted(names) if (root / n).is_file()]


def iter_all_ui(root: Path) -> list[Path]:
    hits: list[Path] = []
    for folder in (root / "app/lib/ui", root / "app/lib/widgets"):
        if folder.is_dir():
            hits.extend(folder.rglob("*.dart"))
    return hits


def scan_file(path: Path, rel: str) -> list[tuple[int, str, str, str]]:
    findings: list[tuple[int, str, str, str]] = []
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        return [(0, rel, "io", str(exc))]
    for i, line in enumerate(text.splitlines(), 1):
        stripped = line.strip()
        if stripped.startswith("//"):
            continue
        for code, pat, msg in RULES:
            if pat.search(line):
                findings.append((i, rel, code, msg))
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description="Aedifica design-token guardian")
    parser.add_argument("paths", nargs="*", help="Dart files to scan")
    parser.add_argument("--all", action="store_true", help="Scan all UI dart (noisy on legacy)")
    args = parser.parse_args()
    root = repo_root()
    os.chdir(root)

    if args.paths:
        files = [Path(p) for p in args.paths]
    elif args.all:
        files = iter_all_ui(root)
    else:
        files = git_changed_dart(root)
        if not files:
            print("design-token-guardian: no changed app/lib dart (git). OK.")
            return 0

    findings: list[tuple[int, str, str, str]] = []
    scanned = 0
    for path in files:
        if path.suffix != ".dart" or not path.is_file():
            continue
        rel = norm(path, root)
        if is_allowed(rel):
            continue
        if not (rel.startswith("app/lib/ui/") or rel.startswith("app/lib/widgets/") or rel.startswith("app/lib/")):
            continue
        scanned += 1
        findings.extend(scan_file(path, rel))

    if not findings:
        print(f"design-token-guardian: OK ({scanned} file(s))")
        return 0

    print(f"design-token-guardian: {len(findings)} violation(s) in {scanned} file(s)")
    for line_no, rel, code, msg in findings:
        loc = f"{rel}:{line_no}" if line_no else rel
        print(f"  [{code}] {loc} — {msg}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
