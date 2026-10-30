# Architect spec — C-carousel-publish (1.6–1.7)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-12-carousel-studio-handoff`.  
> Canon: `.cursor/skills/carousel-studio-handoff/SKILL.md`.  
> Shared chain: `memory/waves/W-2026-10-12-carousel-studio-handoff/chain.md`.  
> Depends on: chrome segment «Публикация» + agents handoff to publication step.

## Goal

В Create заменить агента **Публицист** на шаг UI **Публикация**: дата/площадка + **«Опубликовать»** → карточка в **Черновиках (Ours)** и слот в **`/schedule`**. Образец UX — `RazborPublisherPane`; Razbor **не ломать**.

## Covers

| Item | Lock |
|------|------|
| **1.6** | Удалить Publisher LLM agent / chat pane из Create |
| **1.7** | Step Публикация + «Опубликовать» → drafts store + schedule storage |

## Decision locks

| Lock | Decision |
|------|----------|
| **D-pub-1 No Publisher agent** | Create step id = `publication` (not `publisher`). No agent-chat calls with `agentRole: "publisher"` from Create. Soft-ack publisher strings unused in Create. |
| **D-pub-2 Pane pattern** | New Create publication pane **modeled after** `RazborPublisherPane` (datetime + platform picker + confirm). Prefer extract shared presentational pieces **only if** zero behavior change to Razbor; default = parallel Create pane that **imports patterns**, not drive-by rewrite of Razbor. |
| **D-pub-3 Razbor freeze** | **Do not** edit `RazborModal.tsx` in this wave. **Do not** break `RazborPublisherPane` public props/tests. If shared extract needed — additive refactor with Razbor still compiling/green. |
| **D-pub-4 Publish action** | On **«Опубликовать»**: (1) `upsertDraft` into `carousel-drafts-store` (`cf.carousel.drafts.v1`) under Ours/Черновики; (2) `upsertSlot` via `lib/schedule/storage.ts` (`cf.schedule.v1`) with `moduleId: "carousel-engine"`, `startsAt`, optional `platformId`. |
| **D-pub-5 HITL** | Calendar slot ≠ silent social publish. No Meta/IG post from this button. |
| **D-pub-6 Entry** | Reachable via Designer **«Передать на публикацию»** (from agents ticket `ready` state) and/or segment click if prior steps complete (product: allow view; publish disabled until draft-ready slides exist). |
| **D-pub-7 Labels** | Step: **Публикация**. CTA: **«Опубликовать»**. Forbidden: «Публицист», chat welcome for publisher in Create. |

## In scope

| Path | Owner |
|------|--------|
| `components/studio/workspace/CreateCarouselModal.tsx` | Frontend |
| Create publication pane (new OK, e.g. `CreateCarouselPublicationPane.tsx`) | Frontend |
| `components/studio/workspace/RazborPublisherPane.tsx` | **Read-as-sample**; edit only if additive share with zero Razbor break |
| `lib/studio/carousel-drafts-store.ts` | Frontend |
| `lib/schedule/storage.ts` | Frontend (client schedule; existing helpers) |
| `lib/mesh/agent-defaults.ts` | Only if Create seed list must drop publisher from Create UX map — **do not** delete mesh publisher agent globally |

## Out of scope

- Live Publisher chat in Razbor (stays until separate TZ)
- Social network API publish
- Prisma persistence of drafts/slots (localStorage OK as today)
- Chrome/agents work (prior tickets)

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Publication UI + draft/schedule write | **Frontend** | After agents handoff exists |
| Optional thin API if Architect mid-flight requires server draft | Backend | **Default: client stores only** (parity Razbor) |
| LLM | — | none on publication step |

## Contracts

```ts
// Conceptual publish payload (client)
type CreateCarouselPublishInput = {
  draft: CarouselDraft; // slides + meta from designer ready
  startsAt: string; // ISO
  platformId?: string;
  moduleId: "carousel-engine";
};

// Effects
upsertDraft(draft); // status unpublished
upsertSlot({ postId: draft.id, moduleId, startsAt, platformId });
```

Fail (missing date / no slides): block CTA + RU validation message; **no** fake success toast.

## Acceptance criteria (язык Клиента / S41)

1. В Create **нет** агента/чата «Публицист»; третий шаг называется **Публикация**.
2. На шаге Публикация выбираю дату/площадку и жму **«Опубликовать»**.
3. После этого вижу карточку карусели в **Черновиках** и слот на **`/schedule`** (Playwright snapshot).
4. Razbor Create-adjacent flows: Razbor modal по-прежнему открывается; publisher pane Razbor не сломан (smoke/regression).

## Risks

- Shared extract from RazborPublisherPane accidentally changes Razbor datetime UX.
- Draft id vs schedule `postId` mismatch — lock same id.
- User publishes without slides — must hard-block.

## Mid-flight escalation

Если нужен server API вместо localStorage для schedule — стоп → Архитектор добавляет Backend step в wave chain → продолжение.
