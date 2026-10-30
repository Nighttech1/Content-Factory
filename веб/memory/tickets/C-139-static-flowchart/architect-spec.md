# Architect spec — C-139 (static flowchart)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> **Supersedes C-137 engine** (xyflow `ReleaseTeamFlowchart` / `FlowEdge` / `FlowAgentNode`).  
> Product intent retained: dual-lane, OWNER RBAC, nested route, typed agent edits.  
> Эталон: `c:\Users\alexk\Downloads\code_artifact.html`.  
> Chrome lock **C-138** may land in same Frontend pass.

## Goal

Заменить ReactFlow-схему «Команда выпуска» на статичную HTML/CSS/SVG блок-схему по эталону: просторные gaps, dual lane, короткие solid labels, dashed Trainer→release без текста, User accordion, Designer `design.md`, drawer 3 tabs, persist zustand.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Route** | Primary remains **`/studio/[moduleId]/mesh`**. OWNER only; ADMIN deny/redirect (unchanged C-136). |
| **D2 Engine** | **STATIC** DOM cards + SVG overlay connections. Prefer **не** `@xyflow/react` / ReactFlow infinite canvas on this page. |
| **D3 Delete xyflow v2** | **DELETE or stop using** `components/mesh/v2/FlowEdge.tsx`, `FlowAgentNode.tsx`, ReactFlow-based `ReleaseTeamFlowchart.tsx`. Replace with static shell (name flexible, e.g. `StaticReleaseTeamFlowchart.tsx`). Gut `lib/mesh/flowchart-graph.ts` xyflow seeds or replace with layout constants. |
| **D4 Gaps** | Spacious card gaps **`gap-28` / `gap-32`** (artifact); long readable arrows. |
| **D5 Lane A (release)** | **User → Разборщик → Copywriter → Designer → Publisher**. Edge labels (solid): `запрос` → `разбор` → `сценарий` → `медиа`. |
| **D6 Lane B (support)** | **Scout → Analyst → Trainer**. Edge labels (solid): `фильтр` → `выводы`. |
| **D7 Feedback dashed** | Trainer → Razbor / Copywriter / Designer / Publisher: **dashed** curves (CSS `flow-dashed` / Motion dashflow). **`label: null`** — **no** mid-text («дообучение», «корректировка», etc.). |
| **D8 User accordion** | User is **not** an agent. Click toggles in-place brief accordion (short ↔ full). **Never** opens agent drawer. |
| **D9 Designer chip** | On Designer card: attached **`📄 design.md`** chip + helper («Опирается на файл: палитра, шрифты, гайдлайн…»). |
| **D10 Drawer tabs** | Agents only. Exactly **3 tabs:** (1) **Инструкция** — editable system prompt only; rules live inside prompt; **remove separate rules UI**. (2) **Скиллы & Инструменты** — order fixed: Skills → Plugins → MCP (chips add/remove). (3) **Модель & Параметры** — LLM select, temperature, **maxTokens**; **no timeout** field. |
| **D11 Persist** | Extend existing `useMeshAgentStore` / `types/mesh-agent.ts`: add `plugins: string[]`, `mcp: string[]`; `modelConfig.maxTokens` required in UI; deprecate/hide `rules` in inspector (may keep field unused or fold into prompt migration — UI must not show rules block). Save/Reset + toast. |
| **D12 Copy TZ** | Top-bar «Скопировать ТЗ для Cursor» copies prompt/spec text to **clipboard** + **toast**. Modal preview optional; clipboard+toast mandatory. |
| **D13 Overlap** | **0** node/label overlap @1440. No free pan/zoom playground. |
| **D14 Naming** | Разборщик ≠ Аналитик ≠ Тренер (пайплайн). Scout ≠ Trainer. |
| **D15 C-138** | No MultiButton / MeshPipelineSwitcher on page (see C-138). |

## Agent contract (extend C-137)

```ts
type MeshAgentModelConfig = {
  model: string;
  temperature: number;
  maxTokens: number; // UI required; no timeout
};

type MeshAgent = {
  id: string;
  name: string;
  role: string;
  packId: string;
  systemPrompt: string;       // tab «Инструкция»
  skills: string[];           // tab 2 group 1
  plugins: string[];          // NEW — tab 2 group 2
  mcp: string[];              // NEW — tab 2 group 3
  // rules: string[] — NOT shown in UI (remove or ignore)
  modelConfig: MeshAgentModelConfig;
  isActive: boolean;
  roleKind: "user" | "scout" | "analyst" | "trainer" | "release";
  userRequest?: string;       // User accordion brief source
};
```

Save → zustand (+ existing localStorage key pattern OK). Reset → last saved / defaults.

## In scope — Frontend (+ Motion)

Suggested paths (names flexible — update chain if renamed):

- `app/studio/[moduleId]/mesh/page.tsx` — mount static shell
- **New/replace:** static flowchart component (HTML/CSS cards + SVG layer)
- **Rewrite:** `components/mesh/v2/AgentInspectorDrawer.tsx` → 3 tabs per D10
- **Adapt:** `types/mesh-agent.ts`, `lib/mesh/agent-store.ts`, `lib/mesh/agent-defaults.ts`
- **Delete/stop:** `FlowEdge.tsx`, `FlowAgentNode.tsx`, ReactFlow `ReleaseTeamFlowchart`
- **C-138:** unmount/delete `MeshPipelineSwitcher`; top bar chrome
- User card accordion component (in flowchart)
- Designer `design.md` chip
- Copy TZ clipboard + toast
- Motion: SVG `dashflow` on feedback edges; accordion max-height transition; drawer entrance (keep calm 160ms); **not** PulseEdge

## Out of scope

- Prod/VPS
- Publishing HITL bypass
- Sidebar IA / Analytics
- Full Prisma Agent CRUD (mock/localStorage OK)
- Returning ReactFlow for «future» mesh

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Static diagram + drawer + store extend + C-138 chrome | **Frontend** | `xyflow-agent-mesh` C-139 STATIC checklist |
| Dashflow + accordion | **Motion** | `web-motion-engine`; reduceMotion → static dashes |
| QA | Tester → Client **S37 HARD** | Playwright clicks + tabs |

## Acceptance (язык Клиента) — S37 HARD

1. Navigate → «Команда выпуска» → nested mesh URL (OWNER).
2. Top bar = title + subtitle + Copy TZ; **no** MultiButton/Switcher (**C-138**).
3. Static dual-lane visible; gaps spacious; solid short labels; dashed Trainer→release **without** text; **0 overlap** @1440.
4. User click → accordion in-place; drawer stays closed.
5. Designer shows `design.md` chip.
6. Agent click → drawer with **exactly 3 tabs**; edit Skills/Plugins/MCP + model/temp/maxTokens; **no timeout**, **no rules block**; Save → persist reopen; Esc/outside/X close.
7. Copy TZ → clipboard + toast.
8. No ReactFlow / `FlowAgentNode` primary path.
9. Screenshot-only / xyflow infinite / Multibutton chrome → **НЕ ПРИНЯТО**.

## Risks

- Settings still sync skills via pack — keep `lib/mesh-roles.ts` / pack overrides; extend defaults for plugins/mcp.
- Old smoke pointing ReactFlow / Flow* — update guards; do not keep dead mounts.
- Migration: existing localStorage agents without plugins/mcp → default `[]`.
- Do not parallel another FE on mesh files.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
