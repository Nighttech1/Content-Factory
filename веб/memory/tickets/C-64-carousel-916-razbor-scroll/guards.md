# Guards — C-64 Carousel 9:16 + Разбор + scroll

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

| # | Guard | Verdict | Evidence 2026-10-07 |
|---|-------|---------|---------------------|
| G1 | carousel-engine workspace: `stack` + aspect `9/16` | **PASS** | `StudioModuleWorkspace.tsx` `feedLayout="stack"`, `feedAspect` carousel → `9/16` |
| G2 | feed-fixtures carousel `slideUrls.length ≥ 3` | **PASS** | `carouselSlideUrls` returns 3; `getFeedForModule("carousel-engine")` |
| G3 | FeedPostCard L/R slide controls | **PASS** | `feed-slide-prev` / `feed-slide-next` |
| G4 | `razbor-btn` large terracotta CTA | **PASS** | `py-2.5 text-sm font-semibold` + terracotta tokens |
| G5 | VerticalPostCarousel visible Dark Luxury scrollbar | **PASS** | `[scrollbar-width:thin]` + `scrollbar-color` (not `cf-hide-scrollbar`) |

## Executable checks

```powershell
npx tsx scripts/smoke-c63-c67-ux-wave.ts
# expect: SMOKE_C64_OK
```

Note: older `scripts/smoke-c29-feed-grid.ts` may still assert grid+3/5 — **superseded by C-64** (stack 9:16). Do not revert C-64 to pass C-29; update C-29 smoke separately if still in CI.

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-64**.

## Fixer?

**Нет** (static GREEN). Chain Motion step still open — optional polish only; not blocking these guards.
