# Guards — C-10

| Guard type | What | Where |
|------------|------|-------|
| test | Route `app/studio/inspect/[id]/page.tsx` exists; mounts InspectorShell | `scripts/sprint4-guards.mjs` |
| test | MediaDeck + ReelsPlayer + CarouselDeck (+ @dnd-kit) present | `scripts/sprint4-guards.mjs` |
| test | KaraokeCaptions uses `--font-hy` / `font-hy` | `scripts/sprint4-guards.mjs` |
| test | Store has media + C-11/C-12 actions (`selectHook`, `rerollSelectedSlide`, `confirmApproveSchedule`, …) | `scripts/sprint4-guards.mjs` |
| test | Optional HTTP: GET `/studio/inspect/demo` → 200 when localhost up | `scripts/sprint4-guards.mjs` |

## Mirror in Client skill

| C-10 | inspect media deck / route missing / no hy font | sprint4-guards | `scripts/sprint4-guards.mjs` |
