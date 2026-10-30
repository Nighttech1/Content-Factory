# Guards — C-feed-s49-chrome (S49.A)

## Executable

```bash
npx tsx scripts/smoke-w-2026-10-14-s49-feed-brandbook.ts
```

Expect: `SMOKE_W_2026_10_14_S49_FEED_BRANDBOOK_OK` (plaque `|` + followers, Ours no plaque default, competitors-boards-switch, no MultiButton, text-white).

## Playwright @1440 (Client)

1. `/studio/carousel-engine` → Competitors plaque `@name | Nк` (`feed-username-plaque` + `feed-followers-count` inside).
2. Наши cards: no `feed-username-plaque`.
3. Toggle Конкуренты|Доски + search same row; Опубликовано/Черновики color white.

Evidence: `memory/waves/W-2026-10-14-s49-feed-brandbook/s49-competitors-plaque.png`

## Regression line

`.cursor/skills/client-review/regression-guards.md` — W-2026-10-14 s49-feed-brandbook
