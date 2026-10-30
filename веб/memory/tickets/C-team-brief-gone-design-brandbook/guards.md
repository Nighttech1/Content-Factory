# Guards — C-team-brief-gone-design-brandbook (S49.C–D)

## Executable

```bash
npx tsx scripts/smoke-w-2026-10-14-s49-feed-brandbook.ts
npx tsx scripts/smoke-w-2026-10-13-drafts-design-team.ts
```

Expect:
- no `user-brief-textarea`; `loadUserBrief` always `""`
- `BrandbookBoard` + DesignLibrary «Создать из референса»
- drafts/team smoke OK (S49 brief assertions)

## Playwright @1440

1. `/studio/carousel-engine/mesh` → User node: **no** textarea / «Задание».
2. `/settings` → Дизайн → `brandbook-board` (colors/type/buttons/bars/icons) beige; upload label visible.

Evidence:
- `memory/waves/W-2026-10-14-s49-feed-brandbook/s49-team-no-brief.png`
- `memory/waves/W-2026-10-14-s49-feed-brandbook/s49-settings-brandbook.png`
