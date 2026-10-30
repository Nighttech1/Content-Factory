# Chain — C-47

> Оркестратор зовёт следующую роль только после checkbox.  
> **Motion / Backend / AI Bridge — нет.**  
> Старт после Done Frontend **C-46**. Далее → **C-45**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `components/studio/ModuleSelectorGrid.tsx` | [x] | `min-h-[252px]` cards + Add-slot; description полный текст (`text-pretty`, без line-clamp-2) |
| 2 | Tester | `memory/tickets/C-47-module-card-height/guards.md` | [x] | PASS: min-h-[252px] card+add; text-pretty без line-clamp-2; anti-slop OK |
| 3 | Fixer | `ModuleSelectorGrid.tsx` (если красное) | [ ] | Только fit height/copy |
| 4 | Deployer | localhost `:3000` | [ ] | `/studio` HTTP 200; не VPS |
| 5 | Client | приёмка C-47 | [ ] | высота ×1.5 + полный текст |

Порядок: **Frontend → Tester → Fixer → Deployer → Client**.

**После Done Frontend C-47** → Оркестратор стартует C-45 Frontend.
