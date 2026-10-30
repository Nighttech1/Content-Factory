# Tester report — C-settings-design-md-carousel

**Role:** Тестировщик  
**Wave:** `W-2026-10-13-drafts-design-team`  
**Date:** 2026-10-13  
**Verdict:** **PASS** (static + unit/contract). Live **S43.2–4** → Client.

## What ran

```bash
npx tsx scripts/smoke-w-2026-10-13-drafts-design-team.ts
# → SMOKE_W_2026_10_13_DRAFTS_DESIGN_TEAM_OK
```

## Covered

| Guard | Result |
|-------|--------|
| G1 library ≤10 + keys | PASS (unit cap block + keys) |
| G2 Embla + DESIGN.md chip | PASS (static DesignLibraryCarousel) |
| G3 upload block at 10 | PASS (`appendDesignLibrarySlot` → null) |
| G4 CTA «Добавить новый дизайн» | PASS (static) |
| G5 Close outside capture | PASS (static sibling + open gate) |
| G6 resolve active MD | PASS (unit `resolveActiveDesignMarkdown`) |
| G7 no @appica | PASS |

## Artifacts

- `memory/tickets/C-settings-design-md-carousel/guards.md`
- Shared smoke script (above)

## Fixer backlog

None blocking. Live Close / Embla select left to Client Playwright.
