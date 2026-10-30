# Status — C-139

| Field | Value |
|-------|-------|
| **Status** | Motion done |
| **Wave** | `W-2026-10-10-static-release-team` |
| **Updated** | 2026-10-10 |

## Frontend [x]

- `ReleaseTeamFlowchart.tsx` rewritten: static HTML/CSS/SVG, **no** `@xyflow/react`
- Deleted `FlowEdge.tsx`, `FlowAgentNode.tsx`
- Dual-lane gaps `gap-28` / `gap-36`, min-w 1680; solid labels; dashed Trainer→release without text
- User accordion in-place (no drawer); Designer `design.md` chip
- `AgentInspectorDrawer`: 3 tabs (Инструкция / Скиллы & Инструменты / Модель & Параметры); plugins+mcp chips; no rules UI; no timeout; Save+toast
- Types/store/defaults: `plugins`, `mcp`, `maxTokens`
- Route `/studio/[moduleId]/mesh` mounts new flowchart
- C-138 chrome in same pass

## Motion [x]

- Drawer: `translateX` 100%→0, 160ms ease-out; `prefers-reduced-motion` → duration 0
- User accordion: max-height + opacity 280ms ease-out; reduceMotion → transition-none
- Dashed Trainer→release: `.flow-dashed` 1.8s linear (globals); reduceMotion / `.flow-dashed-static` = no anim
- No xyflow / PulseEdge / MultiButton

## Next

Tester → Fixer → Deployer → Client S37 HARD
