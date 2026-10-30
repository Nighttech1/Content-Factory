"""Minimal localhost smoke for the FinGrad generator UI."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Smoke-check FinGrad localhost UI.")
    parser.add_argument("--url", default="http://127.0.0.1:8000/", help="Target URL")
    parser.add_argument(
        "--contains",
        default="Генератор отчётов",
        help="Text token that must be present in the response body",
    )
    parser.add_argument(
        "--save",
        type=Path,
        default=None,
        help="Optional path to save the fetched HTML body",
    )
    return parser.parse_args(argv)


def smoke(url: str, expected_token: str, save_path: Path | None = None) -> tuple[bool, str]:
    try:
        with urlopen(url, timeout=10) as response:
            status = getattr(response, "status", None) or response.getcode()
            body = response.read().decode("utf-8", errors="replace")
    except URLError as exc:
        return False, f"Connection failed: {exc}"

    if save_path is not None:
        save_path.parent.mkdir(parents=True, exist_ok=True)
        save_path.write_text(body, encoding="utf-8")

    if status != 200:
        return False, f"Unexpected HTTP status: {status}"
    if expected_token not in body:
        return False, f"Missing token in body: {expected_token}"
    return True, f"OK {url} contains '{expected_token}'"


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    ok, message = smoke(args.url, args.contains, args.save)
    print(message)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
