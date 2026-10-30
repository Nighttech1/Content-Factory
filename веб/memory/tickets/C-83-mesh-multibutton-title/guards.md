# Guards — C-83 Mesh MultiButton + title

Тикет закрыт **только** если `/admin/mesh` (OWNER) показывает expanded MultiButton по центру и заголовок «Команда выпуска» в стиле Studio h1.

| # | Guard | Verdict | Evidence |
|---|-------|---------|----------|
| G1 | `MeshPipelineSwitcher` использует `MultiButton`, не `CompactMultiButton` | **PASS** | `components/mesh/MeshPipelineSwitcher.tsx` |
| G2 | Switcher центрирован (`justify-center` в TopBar) | **PASS** | `components/mesh/CanvasTopBar.tsx` |
| G3 | Заголовок «Команда выпуска» | **PASS** | CanvasTopBar text |
| G4 | Studio h1 style (`text-3xl font-semibold`) | **PASS** | CanvasTopBar className |

## Executable checks

```powershell
npx tsx scripts/smoke-c82-c87-ux-wave5.ts
# expect: SMOKE_C82_C87_OK (C-83 asserts)
```

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-83**.

## Fixer?

**Нет.**
