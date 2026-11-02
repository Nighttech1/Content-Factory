#!/usr/bin/env python3
"""Embed the reviewed Markdown plan into the standalone board; no dependencies."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PLAN = ROOT / 'projects/vernatun/content-plan/2026-11.md'
PAGE = ROOT / 'веб/public/content-board/index.html'
items = []
for line in PLAN.read_text().splitlines():
    if not line.startswith('| V-202611-'):
        continue
    cells = [c.strip() for c in line.strip('|').split('|')]
    if len(cells) != 7:
        raise ValueError(f'Unexpected plan row: {line}')
    identity, pillar, fmt, channel, title, cta, date = cells
    day, month = date.split('.')
    items.append(dict(id=identity, pillar=pillar.replace(' ⚠️', ''), format=fmt,
                      channel=channel, title=title, cta=cta,
                      date=f'2026-{month}-{day}', hold='⚠️' in pillar))
if len(items) != 70 or len({item['id'] for item in items}) != 70:
    raise ValueError('Expected 70 uniquely identified plan entries; review parser and plan.')
payload = json.dumps(items, ensure_ascii=False).replace('<', '\\u003c')
page = PAGE.read_text()
page, count = re.subn(r'(<script id="initial-content" type="application/json">).*?(</script>)',
                      lambda m: m[1] + payload + m[2], page, flags=re.S)
if count != 1:
    raise ValueError('Expected exactly one embedded calendar block')
PAGE.write_text(page)
print(f'Embedded {len(items)} draft entries from {PLAN.relative_to(ROOT)}')
