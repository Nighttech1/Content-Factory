# Architect spec — C-137 (mesh clean-slate)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> **AFTER C-136** (nested `/studio/[moduleId]/mesh` must exist).  
> Supersedes **C-124 / C-125 / C-129** (intent dual-lane + dashed retained).

## Goal

Полная перепись «Команда выпуска»: flowchart + inspector с типизированным **Agent**, без legacy canvas как primary path.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Entry** | Primary page: **`/studio/[moduleId]/mesh`** (from C-136). OWNER RBAC. |
| **D2 Delete legacy** | **DELETE** old `AgentMeshCanvas` implementation as product path + dead imports (MiniMap/Controls/Dots playground, old PulseEdge mid-clutter wiring tied to free canvas). Не «патчить» static-picture рядом. Settings may still need shared role enums — extract types if needed; **do not** keep dead canvas mounts. |
| **D3 Engine** | Fresh flowchart: **@xyflow/react OK** from clean slate (new component tree), OR equivalent flowchart — but **new** page composition, not incremental patch of old board. |
| **D4 Dual-lane** | **Upper (release):** User → Разборщик → Copywriter → Designer → Publisher. **Lower:** Scout / Analyst / Trainer with **dashed** edges to release lane. No node/label overlap @1440. |
| **D5 Agent type** | Selected node → Inspector binds typed Agent: `systemPrompt: string`, `skills: string[]`, `rules: string[]`, `modelConfig: { model: string; temperature: number; … }`. |
| **D6 Inspector UI** | Drawer/panel: skills **chips**, prompt **textarea**, rules list/editor, **model select**, **temperature**, **Save** / **Reset**. Save → **state-driven mutate** (Zustand/local store OK; Backend persist optional same wave — mock OK first). |
| **D7 Close** | Esc + outside click closes inspector. |
| **D8 Naming** | Разборщик ≠ Аналитик ≠ Тренер (пайплайн); Scout ≠ patches-only toy. |
| **D9 Chrome** | No MiniMap / Controls / Dot playground. Title/context «Команда выпуска». MultiButton / pipeline switcher — keep if still product-needed; restyle to new page, don't revive free-edit canvas. |

## In scope — Frontend (+ Motion)

Suggested new/replace paths (names flexible if clearer — update chain if renamed):

- `app/studio/[moduleId]/mesh/page.tsx` — mount new shell (replace C-136 placeholder)
- New: e.g. `components/mesh/ReleaseTeamFlowchart.tsx` (or rename) — clean flowchart
- New: `components/mesh/AgentInspectorDrawer.tsx` — typed fields + Save/Reset
- Types: `types/mesh-agent.ts` or extend store — Agent shape D5
- **Remove/stop exporting** primary use of `components/mesh/AgentMeshCanvas.tsx`; delete file if unused; purge dead imports from page
- Legacy helpers (`PulseEdge`, old `AgentNode`, bloated `mesh-seed` coords) — delete or gut if unused; **preserve** Settings-shared enums via thin `lib/mesh-roles.ts` extract if Settings breaks
- Motion: dashed edges, density, no overlap polish after FE structure

## Out of scope

- Prod/VPS
- Publishing HITL bypass
- Changing sidebar IA (done C-136)
- Full Backend Prisma Agent CRUD — optional; mock state OK for S37

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Clean-slate UI + delete legacy | **Frontend** | `xyflow-agent-mesh` clean-slate checklist |
| Dashed / density / no-overlap | **Motion** | after FE |
| Agent `modelConfig` persist | **Backend** | optional same path; mock first OK |
| QA | Tester → Client **S37 HARD** | |

## Contracts — Agent (minimum)

```ts
type MeshAgentModelConfig = {
  model: string;
  temperature: number;
};

type MeshAgent = {
  id: string;
  role: string; // e.g. razbor / copywriter / scout / trainer …
  systemPrompt: string;
  skills: string[];
  rules: string[];
  modelConfig: MeshAgentModelConfig;
};
```

Save: write into client store (and optional API later). Reset: revert to last saved / seed defaults.

## Acceptance (язык Клиента) — S37 HARD

1. Navigate module → «Команда выпуска» → nested mesh URL.
2. Flowchart dual-lane visible; Scout/Trainer dashed; **no overlap** @1440.
3. Click agent → Inspector: systemPrompt / skills chips / rules / model / temperature.
4. Edit + Save → UI state updates (re-open shows mutation).
5. Esc / outside closes drawer.
6. Legacy playground canvas **gone** (no MiniMap/Controls/Dots primary).
7. Screenshot-only / legacy patch without typed fields → **НЕ ПРИНЯТО**.

## Risks

- Settings imports from `lib/mesh-seed` — extract shared types before delete.
- Smoke scripts pointing `AgentMeshCanvas` / `/admin/mesh` — update or note in guards.
- Do not parallel another FE on mesh files during this ticket.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
