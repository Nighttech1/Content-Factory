# Guards — C-51 Razbor script-only

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

C-30 Designer / auto-start / «Готовая карусель» — **superseded**. Отсутствие Designer в Razbor = **PASS**, не FAIL.

| # | Guard | Verdict | Evidence 2026-10-05 |
|---|-------|---------|---------------------|
| G1 | Open → welcome only: `razbor-welcome` + `razbor-start-btn`; analysis `useEffect` = `getRazborWelcome` (no auto analysis) | **PASS** | `RazborModal` comment + welcome effect; analysis only in `handleStartRazbor` |
| G2 | `RAZBOR_AGENTS` = analyst + scriptwriter (non-carousel). Designer+publisher только в `RAZBOR_CAROUSEL_AGENTS` (C-59) | **PASS** | `carousel-draft-types.ts` |
| G3 | Cascade: no `designerMessages` / no `draft`; script has roles/plot/text/location | **PASS** | `runRazborCascade` + `SMOKE_C30_PIPELINE_OK` |
| G4 | Non-carousel Razbor: no Designer tab (`razborAgentsForModule`). Carousel Designer — C-59 | **PASS** | `RazborModal` + types |
| G5 | `RazborReelPlayer`: play + scrubber timeline; `autoPlay={false}` | **PASS** | `razbor-reel-play` / `razbor-reel-timeline` / `razbor-reel-playhead` |
| G6 | Live HTTP razbor analyze + script; `draft == null` | **PASS** | `BASE_URL=http://127.0.0.1:3000` → `SMOKE_C30_HTTP_OK` |
| G7 | anti-slop wave | **PASS** | `python plugins/frontend/anti_slop_scan.py .` → OK |

## Executable checks

```powershell
# G2 agents
Select-String -Path "lib\studio\carousel-draft-types.ts" -Pattern "RAZBOR_AGENTS" -Context 0,4
# must show analyst + scriptwriter only

# G1 / G4 / G5 UI source
Select-String -Path "components\studio\workspace\RazborModal.tsx" -Pattern 'razbor-welcome|razbor-start-btn|upsertDraft|Готовая карусель'
Select-String -Path "components\studio\workspace\RazborReelPlayer.tsx" -Pattern 'razbor-reel-play|razbor-reel-timeline|autoPlay=\{false\}'

# G3 + G6 pipeline + live
$env:BASE_URL="http://127.0.0.1:3000"
npx tsx scripts/smoke-c30-razbor.ts
# expect SMOKE_C30_PIPELINE_OK / UI_SOURCE_OK / HTTP_OK / SMOKE_C30_OK

# G7
python plugins/frontend/anti_slop_scan.py .
```

## Process note

В `chain.md` шаг Motion ещё `[ ]`, но scrubber/play уже в `RazborReelPlayer` (FE/Motion deliverable на диске). Продуктовый контракт C-51 — **PASS**; оркестратор может закрыть Motion checkbox отдельно.

## Mirror in Client skill

Строка в `.cursor/skills/client-review/regression-guards.md` → **C-51**.

## Fixer?

**Нет** — welcome / script-only cascade / reel player зелёные на диске и live API.
