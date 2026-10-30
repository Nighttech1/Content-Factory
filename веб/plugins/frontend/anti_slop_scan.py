#!/usr/bin/env python3
"""Scan CSS/HTML/JS/TSX for common luxury-killing AI-slop patterns."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd()
SKIP = {".git", "node_modules", "dist", "build", ".next", ".cursor", "plugins", "knowledge"}
EXTS = {".css", ".scss", ".html", ".js", ".jsx", ".ts", ".tsx", ".vue", ".mdx"}

PATTERNS = [
    (r"linear-gradient\([^)]*(#6366f1|#8b5cf6|#7c3aed|#4f46e5|indigo)", "indigo/violet AI gradient"),
    (r"from-indigo-|to-purple-|from-violet-", "Tailwind indigo/purple slop"),
    (r"background:\s*#000(?:000)?\b", "pure #000 background"),
    (r"box-shadow:\s*0\s+2?0px\s+5?0px", "generic floating card shadow"),
    (r"scale\(0\)", "scale(0) entrance"),
    (r"ease-in\b(?!-out)", "ease-in entrance smell"),
    (r"font-family:\s*['\"]?Inter['\"]?", "Inter as default luxury voice"),
    (r"font-family:\s*['\"]?Roboto['\"]?", "Roboto as default luxury voice"),
    (r"animate__animated|wow\.js|aos\.js", "junk animation libraries"),
]


def iter_files(root: Path):
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in EXTS:
            continue
        if any(part in SKIP for part in p.parts):
            continue
        yield p


def main() -> int:
    hits = []
    for path in iter_files(ROOT):
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for rx, label in PATTERNS:
            for m in re.finditer(rx, text, flags=re.I):
                line = text[: m.start()].count("\n") + 1
                hits.append(f"{path.relative_to(ROOT)}:{line}: {label}")
    if not hits:
        print("anti_slop_scan: OK")
        return 0
    print("anti_slop_scan: FAIL")
    for h in hits[:80]:
        print(h)
    if len(hits) > 80:
        print(f"... +{len(hits) - 80} more")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
