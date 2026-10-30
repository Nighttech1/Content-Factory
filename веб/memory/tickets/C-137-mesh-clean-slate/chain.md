# Chain — C-137 (mesh clean-slate)

> Оркестратор зовёт следующую роль только после checkbox.  
> **AFTER C-136.** **Запрет** parallel FE на mesh files / «патч» legacy xyflow рядом с delete.

**One-liner:** Frontend → Motion → Backend(opt) → Tester → Fixer → Deployer → Client **S37 HARD**

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | Frontend | `app/studio/[moduleId]/mesh/page.tsx`, **new** flowchart + inspector under `components/mesh/**`, `types/mesh-agent.ts` (or store), **delete/unmount** `components/mesh/AgentMeshCanvas.tsx` + dead imports (`PulseEdge`/`AgentNode`/old seed coords if unused); extract Settings-safe roles from `lib/mesh-seed.ts` if needed | [x] | Clean-slate v2 + zustand Agent; `lib/mesh-roles.ts`; legacy canvas deleted |
| 2 | Motion | new flowchart / edges / inspector entrance | [x] | Drawer translateX 160ms ease-out; reduceMotion instant; calm select glow; no MiniMap |
| 3 | Backend | optional Agent persist API / types | [ ] | mock OK first; no Prisma DROP; skill `backend` if touched |
| 4 | Tester | `memory/tickets/C-137-mesh-clean-slate/guards.md` | [x] | static PASS 2026-10-10; Playwright S37 HARD pending Client |
| 5 | Fixer | _(если красное)_ | [ ] | surgical; no architecture rewrite |
| 6 | Deployer | localhost | [ ] | nested mesh 200 OWNER; sync local API if any |
| 7 | Client | **S37 HARD** | [ ] | Playwright @1440 full clicks — not screenshot-only |

**Порядок волны:** shell → feed → razbor → **C-137** → Tester → Fixer → Deployer → Client S36–S38.
