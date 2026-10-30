# Chain — W-2026-10-16-s52-scout-apify-only

```
Trainer ✅ (grade A)
→ Architect ✅ (this wave)
→ Backend (C-scout-apify-bind) — FIRST, path lock: ig-live-feed + scout API
→ Frontend (C-scout-razvedat-ui + C-competitors-snapshot) — AFTER Backend contract
→ AI Bridge (describe-only / no scrape tools on feed)
→ Tester (S52.D: feed-open apify_run_count=0; Разведать fires once)
→ Fixer (if red)
→ Deployer (localhost only)
→ Client (Playwright S52.D)
```

## Path lock

- Backend owns: `lib/studio/ig-live-feed.ts`, `lib/studio/scout-*`, `app/api/studio/.../scout/**`, `app/api/studio/.../feed/route.ts`
- Frontend owns: `ScoutInspectorSettings.tsx`, `AgentInspectorDrawer.tsx`, `scout-search-config.ts`, Studio feed consumer notes only (no Apify)
- Do NOT parallel Backend + Frontend on same files

## Acceptance (Client language)

1. Открыл Студию / Конкуренты → карточки из последнего снимка Скаута (или пусто). **Нет** нового списания Apify.
2. Команда выпуска → Скаут → «Разведка» → фильтры + частота + кнопка **«Разведать»** внизу → после клика данные обновляются.
3. Авторазведка: если включена — следующий run по `frequencyHours`, не на каждом remount.
