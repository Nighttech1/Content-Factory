# Guards — C-52 Feed flicker + graphics cards

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

C-49 «Play на всех карточках» для IMAGE / aesthetic-graphics — **superseded**. Отсутствие Play на статике = **PASS**.

| # | Guard | Verdict | Evidence 2026-10-06 |
|---|-------|---------|---------------------|
| G1 | Skeletons iff `loading && empty`; no `if (loading) return` skeletons | **PASS** | `VerticalPostCarousel` `showSkeletons` + `posts.length === 0` |
| G2 | `feed-refetching` when loading with posts; grid stays mounted | **PASS** | Source + live: hint during fetch, then 0; cards never swapped to pulse |
| G3 | Parent competitors `loading={feedLoading \|\| competitorsLoading}` | **PASS** | `StudioModuleWorkspace` |
| G4 | `shouldShowFeedPlay`: hide IMAGE + `aesthetic-graphics`; VIDEO with url shows | **PASS** | `lib/studio/feed-play.ts` + `SMOKE_C52_PLAY_HELPER_OK` |
| G5 | Graphics fixtures: comments + shares; card RU `комм.` / `репосты` | **PASS** | 7/7 fixtures; live 7 cards, 0 play, 7 comments, 7 shares |
| G6 | anti-slop wave UI | **PASS** | `python plugins/frontend/anti_slop_scan.py` on workspace/mesh/schedule paths → OK |

## Executable checks

```powershell
$env:BASE_URL="http://127.0.0.1:3000"
npx tsx scripts/smoke-c52-feed-swr-play.ts
# expect SMOKE_C52_SWR_SOURCE_OK / PLAY_HELPER_OK / GRAPHICS_FIXTURES_OK / SMOKE_C52_OK

npx tsx scripts/smoke-c40-competitors-by-topic-ui.ts
# C-52 SWR asserts in assertLoadingWiring; IdeaBar copy asserts may still be C-49-stale

python plugins/frontend/anti_slop_scan.py components/studio/workspace
```

Live `/studio/aesthetic-graphics`: after settle `feed-play-btn=0`, `animate-pulse=0`, metrics comments+shares visible. During refetch header `Конкуренты…` + `feed-refetching`, cards remain.

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-52**.

## Fixer?

**Нет** — SWR / Play / metrics зелёные на диске и localhost.
