# Guards — C-137 mesh clean-slate (flowchart + Agent inspector)

Тикет закрыт **только** если симптом на localhost исчез **и** есть предохранитель ниже.

| Guard type | What | Where |
|------------|------|-------|
| static | **No** `AgentMeshCanvas` in `app/` or `components/` (legacy deleted) | grep |
| static | Page mounts `ReleaseTeamFlowchart` (not legacy canvas) | `app/studio/[moduleId]/mesh/page.tsx` |
| static | `data-testid="release-team-flowchart"`, `data-testid="studio-module-mesh"` | mesh page + v2 flowchart |
| static | Inspector: `agent-inspector-drawer` + typed fields testids | `AgentInspectorDrawer.tsx` |
| static | Flow nodes: `mesh-agent-node`; `nodesDraggable={false}`; no MiniMap | `ReleaseTeamFlowchart.tsx` |
| static | Route: `/studio/[moduleId]/mesh` OWNER; ADMIN redirect | mesh `page.tsx` |
| localhost | **S37 HARD**: flowchart + click agent → drawer with systemPrompt/skills/rules/modelConfig; Esc close; 0 overlap | Playwright Client |
| regression | Sidebar still no Mesh link (C-136) | SidebarNavigation |

## Static asserts (grep)

1. `grep AgentMeshCanvas app/` → **0** imports.
2. `Test-Path components/mesh/AgentMeshCanvas.tsx` → **False** (deleted).
3. `grep ReleaseTeamFlowchart app/studio/[moduleId]/mesh/page.tsx` → dynamic import.
4. Inspector testids: `agent-inspector-prompt`, `agent-inspector-skills`, `agent-inspector-rules`, `agent-inspector-model`.
5. `grep nodesDraggable={false} components/mesh/v2/ReleaseTeamFlowchart.tsx`.

## Localhost asserts (Playwright / Client — pending S37 HARD)

1. OWNER → `/studio/carousel-engine` → `module-top-mesh`
2. `expect(page.getByTestId('release-team-flowchart')).toBeVisible()`
3. Click `[data-testid="mesh-agent-node"]` (first) → `agent-inspector-drawer` visible
4. Fields visible: prompt, skills, rules, model
5. Esc closes drawer; ADMIN denied mesh

## Tester static (2026-10-10)

| ID | Check | Result |
|----|-------|--------|
| G1 | No AgentMeshCanvas in app/ | **PASS** |
| G2 | Legacy file deleted | **PASS** |
| G3 | ReleaseTeamFlowchart + inspector testids | **PASS** |
| G4 | nodesDraggable false; no MiniMap | **PASS** |
| G5 | Playwright S37 HARD (overlap, dual-lane, Save) | **pending Client** |

## Advisory (not wave blocker)

Legacy smoke scripts still reference deleted `AgentMeshCanvas` (`scripts/smoke-c63-c67-ux-wave.ts`, `sprint3-guards.mjs`) — update in Fixer pass if CI runs them.

## Mirror in Client skill

`| C-137 | mesh clean-slate | ReleaseTeamFlowchart + AgentInspectorDrawer; no legacy canvas S37 | memory/tickets/C-137-mesh-clean-slate/guards.md |`
