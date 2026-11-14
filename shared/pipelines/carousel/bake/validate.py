"""Validate inputs without starting a browser, a renderer or an API."""
import argparse
import json
from pathlib import Path
from contract import ContractError, validate_job


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--job', type=Path, required=True)
    parser.add_argument('--asset-root', type=Path, required=True)
    args = parser.parse_args()
    try:
        hashes = validate_job(json.loads(args.job.read_text()), args.asset_root)
    except (ContractError, KeyError, TypeError, OSError, ValueError) as exc:
        print(json.dumps({'status': 'FAILED', 'error': str(exc)}))
        return 1
    print(json.dumps({'status': 'INPUT_VALID', 'assets': len(hashes),
                      'content_approval': False}))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
