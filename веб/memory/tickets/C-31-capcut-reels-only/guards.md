# Guards — C-31 CapCut reels only

| Field | Value |
|-------|-------|
| **Ticket** | C-31 |
| **Updated** | 2026-09-20 |
| **Result** | **GREEN** — `SMOKE_C31_OK` (unit + source + live) |

## Commands

```bash
npx tsx scripts/smoke-c31-capcut-gate.ts
$env:BASE_URL="http://127.0.0.1:3000"; npx tsx scripts/smoke-c31-capcut-gate.ts
```

## Live evidence (2026-09-20)

| Check | Result |
|-------|--------|
| Unit allowlist | PASS |
| UI source gate + Razbor/reels CTAs | PASS |
| `/studio/cartoon-reels/edit/draft-smoke-c31` | **200** |
| `/studio/carousel-engine/edit/draft-should-404` | **404** |
| `/studio/inspect/demo` | **200** |
| `/studio/heygen-reels` | **200** |

Playwright MCP: gap (honest) — HTTP + smoke sufficient like prior tickets.
