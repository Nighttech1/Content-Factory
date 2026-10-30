# Guards — C-58 Mesh view-only + header count

Тикет закрыт **только** если симптом на localhost исчез **и** предохранители ниже зелёные.

C-08/C-09 «Add Module на холсте» — **superseded**. Отсутствие `mesh-add-module` = **PASS**.

| # | Guard | Verdict | Evidence 2026-10-06 |
|---|-------|---------|---------------------|
| G1 | Нет `mesh-add-module` / `onAddModule` в mesh source | **PASS** | `CanvasTopBar.tsx`, `AgentMeshCanvas.tsx` |
| G2 | `nodesDraggable={false}`; `nodesConnectable={false}`; нет пользовательского `onConnect` | **PASS** | `AgentMeshCanvas.tsx` |
| G3 | `MeshPipelineSwitcher` сверху (`CanvasTopBar` extra) | **PASS** | `AgentMeshCanvas.tsx` |
| G4 | `VerticalPostCarousel` шапка: `{visibleHeaderCount}`, не `loading ? "…" : count` | **PASS** | last-known ref; count span без `"…"` |

## Executable checks

```powershell
Select-String -Path "components\mesh\*.tsx" -Pattern "mesh-add-module"
# expect: no matches
Select-String -Path "components\mesh\AgentMeshCanvas.tsx" -Pattern "nodesDraggable=\{false\}"
Select-String -Path "components\studio\workspace\VerticalPostCarousel.tsx" -Pattern 'loading \? "…"|"…"'
# header must not use ellipsis for count
node scripts/sprint3-guards.mjs
# expect GREEN; C-09 add-module asserts inverted (C-58)
```

## Mirror in Client skill

`.cursor/skills/client-review/regression-guards.md` → **C-58**.

## Fixer?

**Нет.**
