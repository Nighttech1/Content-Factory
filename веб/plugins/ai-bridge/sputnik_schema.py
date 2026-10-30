"""Sputnik Life OS data schema for Cortana (C-31).

CLI: python plugins/ai-bridge/sputnik_schema.py
Also imported from cortana_service.services.sputnik_schema
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# Allow running from repo root without PYTHONPATH
_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from cortana_service.services.sputnik_schema import SCHEMA_FOR_LLM, SCHEMA_SHORT  # noqa: E402


def main() -> None:
    # Windows consoles may be cp1251 — avoid UnicodeEncodeError on arrows etc.
    def _out(s: str) -> None:
        try:
            print(s)
        except UnicodeEncodeError:
            sys.stdout.buffer.write((s + "\n").encode("utf-8", errors="replace"))

    _out(SCHEMA_FOR_LLM)
    if len(sys.argv) > 1 and sys.argv[1] == "--short":
        _out("---")
        _out(SCHEMA_SHORT)
    else:
        _out(
            json.dumps(
                {"ok": True, "levels": ["sphere", "yearly", "monthly", "week", "day"]},
                ensure_ascii=False,
            )
        )


if __name__ == "__main__":
    main()
