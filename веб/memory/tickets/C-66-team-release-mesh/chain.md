# Chain — C-66

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Wave 2.** Не трогать Studio feed / CreateCarousel / schedule.  
> Vs C-63: не откатывать dynamic import mesh page.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Trainer | `memory/trainer/2026-10-07-ux-wave-grade.md` | [x] | Grade A; xyflow checklist |
| 1 | Architect | `architect-spec.md`, этот `chain.md` | [x] | Spec only |
| 2 | Frontend | `components/shell/SidebarNavigation.tsx` (label), `components/mesh/CanvasTopBar.tsx`, `components/mesh/AgentMeshCanvas.tsx`, `components/mesh/AgentPropertiesPanel.tsx` (new), `lib/mesh-seed.ts` (AgentNodeData + horizontal layout), `app/admin/mesh/page.tsx` (title/chrome) | [x] | Remove `// Только владелец…`; panel fields; RBAC OWNER; **не** StudioModuleWorkspace / schedule |
| 3 | Motion | panel enter/exit; reduced-motion | [ ] | no full-page opacity |
| 4 | Tester | `memory/tickets/C-66-team-release-mesh/guards.md`; S16 + S3 | [x] | Static smoke GREEN; label/panel/seed; S3 ADMIN → Client Playwright |
| 5 | Fixer | _(если красное)_ | [ ] | Surgical |
| 6 | Deployer | localhost `/admin/mesh` (OWNER) | [x] | 2026-10-07 — `/admin/mesh` HTTP 200 (no redirect on curl); no VPS |
| 7 | Client | acceptance | [x] | |

Skills: `xyflow-agent-mesh`, `content-factory-ui`, `web-motion-engine`, `client-scenarios`.  
**Не звать:** Backend, AI Bridge, Coder monolith, WebGL.
