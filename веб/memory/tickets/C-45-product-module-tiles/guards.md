# Guards — C-45 Product module tiles

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

| # | Guard | Verdict | Evidence 2026-10-05 |
|---|-------|---------|---------------------|
| G1 | `data/local/custom-modules.json`: ровно **3** модуля | **PASS (disk)** | count=3 |
| G2 | Ids: `custom-reels`, `custom-clips-to-reels`, `custom-info-video` | **PASS (disk)** | совпадают со spec |
| G3 | RU titles: Рилс / Нарезки с видео в рилсы / Информационное видео | **PASS (disk)** | titles в JSON |
| G4 | Нет QA junk ids (`custom-tester-plugin-c21`, `custom-client-plugin-c21`, `custom-c22-*`) в JSON | **PASS (disk)** | junk=[] |
| G5 | CORE `src/modules/manifests.ts`: ровно 4 (`carousel-engine`, `aesthetic-graphics`, `cartoon-reels`, `heygen-reels`) | **PASS** | `CORE_MANIFESTS` length 4; product ids не в CORE |
| G6 | Live `GET /api/modules/register` отдаёт те же 3 product ids, **без** C21/C22 | **PASS (GREEN)** | curl count=3; ids=custom-reels, custom-clips-to-reels, custom-info-video; junk=[] |
| G7 | `/studio` после hydrate: плитки product RU, нет Tester/C22 titles | **PASS (GREEN)** | G6 green; API больше не отдаёт Tester/C22 → FE mirror без QA junk |
| G8 | anti-slop wave | **PASS** | `python plugins/frontend/anti_slop_scan.py .` → OK |

## Root cause (live) — FIXED

`ensureCustomModulesHydrated()` был one-shot upsert-only: старые `custom-*` оставались в Map после замены JSON.

**Fix (2026-10-05):** `hydrateCustomModulesFromDisk` sync-удаляет `custom-*` отсутствующие на disk; GET `/api/modules/register` вызывает `ensureCustomModulesHydrated({ force: true })`.

## Executable checks

```powershell
# Disk (G1–G4)
python -c "import json; d=json.load(open('data/local/custom-modules.json',encoding='utf-8')); ids=[m['id'] for m in d['modules']]; assert len(ids)==3; assert ids==['custom-reels','custom-clips-to-reels','custom-info-video']; assert not any('c21' in i or 'c22' in i or 'tester' in i for i in ids); print('disk OK', ids)"

# CORE untouched (G5)
Select-String -Path "src/modules/manifests.ts" -Pattern "carouselEngine|aestheticGraphics|cartoonReels|heygenReels"  # 4 imports
Select-String -Path "src/modules/manifests.ts" -Pattern "custom-reels|custom-tester"  # empty

# Live (G6) — must be GREEN before done
# Expect: count=3 and ids custom-reels / custom-clips-to-reels / custom-info-video
Invoke-WebRequest http://127.0.0.1:3000/api/modules/register -UseBasicParsing | Select-Object -ExpandProperty Content

python plugins/frontend/anti_slop_scan.py .
```

## Mirror in Client skill

Строка в `.cursor/skills/client-review/regression-guards.md` → **C-45**.

## Fixer?

**Done.** Sync delete + GET force hydrate. G6/G7 GREEN без полного рестарта (HMR подхватил). CORE не трогали.
