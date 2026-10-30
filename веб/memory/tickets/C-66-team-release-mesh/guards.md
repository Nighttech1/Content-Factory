# Guards — C-66 Команда выпуска + agent panel

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

| # | Guard | Verdict | Evidence 2026-10-07 |
|---|-------|---------|---------------------|
| G1 | Nav label «Команда выпуска» | **PASS** | `SidebarNavigation.tsx` href `/admin/mesh` |
| G2 | No `// Только владелец · Сетка агентов` chrome | **PASS** | absent in CanvasTopBar / AgentMeshCanvas / mesh page |
| G3 | Screen title «Команда выпуска» | **PASS** | CanvasTopBar + mesh `sr-only` h1 |
| G4 | `AgentPropertiesPanel` exists + wired | **PASS** | `AgentPropertiesPanel.tsx` + `AgentMeshCanvas` |
| G5 | mesh-seed agents: description / skills / completedJobs | **PASS** | `AgentNodeData` + `createMeshSeed` runtime |

## Executable checks

```powershell
npx tsx scripts/smoke-c63-c67-ux-wave.ts
# expect: SMOKE_C66_OK
```

RBAC S3 (ADMIN blocked from mesh) — still Client/Playwright; static seed/panel GREEN.

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-66**.

## Fixer?

**Нет** (static GREEN). Chain Motion panel enter still optional.
