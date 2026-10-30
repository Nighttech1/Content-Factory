# C-139 — Static HTML/CSS/SVG flowchart (supersedes C-137 xyflow)

| Field | Value |
|-------|-------|
| **ID** | `C-139` |
| **Priority** | P0 |
| **Area** | mesh / release-team diagram + inspector |
| **Wave** | `W-2026-10-10-static-release-team` |
| **Status file** | pending |
| **[MKT]** | Команда выпуска = статичная схема как в эталоне, без «уезжающего» холста |

## Repro

1. OWNER: `/studio/<moduleId>/mesh` после C-137.
2. Primary path = ReactFlow `ReleaseTeamFlowchart` + `FlowAgentNode` / `FlowEdge` — сдвиги / infinite feel.
3. User accordion отсутствует (User открывает drawer как агент); Designer без `design.md` chip; drawer ≠ 3 tabs эталона (есть rules / timeout risk).

**URL:** `http://127.0.0.1:8787/studio/<moduleId>/mesh` (OWNER)  
**Эталон:** `c:\Users\alexk\Downloads\code_artifact.html`

## Expected

- **STATIC** flowchart (HTML/CSS/SVG), pattern after artifact: spacious `gap-28` / `gap-32`.
- **Lane A:** User → Razbor → Copywriter → Designer → Publisher; solid labels `запрос` / `разбор` / `сценарий` / `медиа`.
- **Lane B:** Scout → Analyst → Trainer; solid labels `фильтр` / `выводы`.
- **Dashed** Trainer → release agents (**Razbor, Copywriter, Designer, Publisher**) — **NO** mid-text labels.
- User = accordion brief **in-place**; **NO drawer** for User.
- Designer card: **`design.md` chip** + short helper text.
- Agent drawer **3 tabs:** Инструкция (prompt-only) | Скиллы & Инструменты (Skills → Plugins → MCP) | Модель & Параметры (LLM + temperature + maxTokens; **no timeout**; **no separate rules block**).
- Persist edits in existing zustand store; extend Agent with `plugins: string[]`, `mcp: string[]` (rules deprecated/removed from UI).
- Copy TZ → clipboard + toast.
- Route stays `/studio/[moduleId]/mesh`.
- **DELETE/stop using** xyflow `FlowEdge` / `FlowAgentNode` / ReactFlow `ReleaseTeamFlowchart` for this page.
- C-138 chrome (no Multibutton) included in same FE pass.

## Actual

C-137 clean-slate still on xyflow v2 — superseded by this ticket.

## Notes for Orchestrator

After/with C-138. Frontend → Motion → Tester → Fixer → Deployer → Client **S37 HARD**. Full-queue wave. No ReactFlow «на всякий случай».
