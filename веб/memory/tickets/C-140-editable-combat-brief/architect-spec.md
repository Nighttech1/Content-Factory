# Architect spec — C-140 (editable combat brief)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> Same mesh Frontend pass as **C-141**.

## Goal

Сделать User brief редактируемым combat prompt на каждый pipeline/module, сохранить в zustand/localStorage, отправлять в AI/composer вместе с topic.

## Decision locks

| Lock | Decision |
|------|----------|
| **D1 Key** | Persist map `MeshPipelineId` (or `moduleId`) → `brief: string`. Suggested key: `cf.mesh.user-brief.v1` (or extend existing mesh agent store with per-pipeline `userBrief`). |
| **D2 Templates** | Seed defaults per content module family: carousel / reels / heygen / articles (and other registered studio modules). Tone = **combat system** (миссия, аудитория, запреты, CTA) — **запрет** оставлять jazz-club mock as only template. |
| **D3 UI** | User card: expandable + **textarea** editable. Click User ≠ open `AgentInspectorDrawer`. |
| **D4 Wire** | On send from Razbor / `AgentChatComposer`: composed user message (or structured fields) = **topic + brief**. Brief from store for active `moduleId`/pipeline. |
| **D5 Scope surface** | Mesh User card + studio Razbor/composer paths that already import `AgentChatComposer`. |
| **D6 Path** | Implement in **same FE pass as C-141** — no second parallel writer on `components/mesh/**`. |

## Contracts

```ts
// illustrative — Frontend may adapt names
type UserBriefByPipeline = Record<string /* MeshPipelineId | moduleId */, string>;

// Composer / Razbor send
type ChatSendPayload = {
  topic: string;
  brief: string; // from store for active pipeline
  // existing fields unchanged
};
```

- Empty brief after user clear → send topic only (or empty brief string) — do not resurrect mock jazz silently.
- Reset control optional: restore module combat template (not jazz mock).

## In scope

- `types/mesh-agent.ts` / agent-store / new brief slice
- `ReleaseTeamFlowchart` (or static shell) User card textarea
- `lib/mesh/agent-defaults.ts` — replace mock-only defaults with combat templates
- `RazborModal` / `AgentChatComposer` send path
- Persist + hydrate without hydration flicker (stable testids)

## Out of scope

- Live Polza wire of generation (see **C-145** audit)
- Settings LLM UI
- Prod/VPS
- Changing drawer tabs (C-139)

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Store + User textarea + composer wire | **Frontend** | `xyflow-agent-mesh`, `content-pipeline-agents` |
| Pan/ports/TZ | **Frontend** via **C-141** same pass | |
| Motion | optional | accordion only if needed |
| QA | Tester → Client S39 | brief edit + send includes brief |

## Acceptance (язык Клиента)

1. На mesh: User → textarea; текст меняется и переживает reload.
2. Смена модуля/pipeline подставляет свой brief (или свой ключ store).
3. В Razbor/composer отправка: в payload/видимом контексте есть и topic, и brief (не только topic).
4. Нет открытия agent drawer по клику User.
5. Default brief не выглядит как единственный jazz-mock для всех модулей.

## Risks

- Dual store (agent `userRequest` vs new map) — pick one source of truth; migrate `userRequest` → brief map or sync both.
- Overlap with C-141 file edits — one PR/pass.
- Do not log brief contents into memory tickets with secrets.

## Mid-flight escalation

Стоп → Архитектор → правка spec+chain → продолжение.
