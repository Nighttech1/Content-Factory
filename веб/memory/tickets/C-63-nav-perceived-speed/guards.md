# Guards — C-63 Nav perceived speed

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

| # | Guard | Verdict | Evidence 2026-10-07 |
|---|-------|---------|---------------------|
| G1 | `loading.tsx` for studio, schedule, analytics, brand-kit, settings, admin/mesh | **PASS** | `app/*/loading.tsx` ×6 |
| G2 | Dynamic import mesh canvas | **PASS** | `app/admin/mesh/page.tsx` `dynamic(AgentMeshCanvas)` |
| G3 | Dynamic Razbor + CreateCarouselModal | **PASS** | `StudioModuleWorkspace.tsx` |
| G4 | Dynamic RetentionChart | **PASS** | `AnalyticsMainGrid.tsx` |
| G5 | InsightsFeed parallel fetch | **PASS** | `Promise.all([insights, snapshot])` |
| G6 | Shells: no full-page opacity:0 enter | **PASS** | AppShell / AnalyticsShell / StudioModuleWorkspace `initial={false}` |

## Executable checks

```powershell
npx tsx scripts/smoke-c63-c67-ux-wave.ts
# expect: SMOKE_C63_OK
```

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-63**.

## Fixer?

**Нет** (static GREEN). HTTP `/studio` → 200 confirmed in smoke re-run.
