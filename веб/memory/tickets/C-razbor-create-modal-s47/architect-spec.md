# Architect spec — C-razbor-create-modal-s47

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-14-carousel-ui-marketing`.  
> Canon: `content-factory-ui` § Razbor/Create S47; `frontend.mdc` §20; `carousel-studio-handoff`.  
> Shared chain: `memory/waves/W-2026-10-14-carousel-ui-marketing/chain.md`.

## Goal

Паритет chrome Razbor + Create: modal scroll/capture, короткий welcome, «Сообщение», без Tools, handoff arrow+logo, 4 people icons, preview crop + index `N/M` Century Gothic.

## Covers

| Item | Lock |
|------|------|
| Scroll/capture | Wheel/touch **внутри** modal; background studio feed **не** скроллится; body scroll-lock + `overscroll-contain`; Client screenshot = modal frame |
| Razbor chrome | Удалить «Карусель конкурента»; short welcome; placeholder **«Сообщение»**; **нет** Tools rail |
| Preview | Fix crop/aspect; index **`N/M`** Century Gothic (напр. `5/8`); L/R сбоку |
| Handoff | Mic-like weight: **arrow + next-agent logo** (не text-only «передать») |
| Top agents | **4 rounded people icons** (release-team avatars) |
| Create parity | Same 2.x rules; **retain** Button-segment Сценарист\|Дизайнер\|Публикация (**D-icons-1** wave lock) |
| Font | Modal chrome Century Gothic Vernatun |

## Decision locks

| Lock | Decision |
|------|----------|
| **D-modal-1** | Razbor then Create **sequential** same Frontend pass — one writer at a time |
| **D-icons-1** | People icons ≠ replace Create segment (see wave `chain.md`) |
| **D-modal-2** | PromptBox / C-157 path preserved; strip Tools only |
| **D-modal-3** | Close = circular red X (C-135) retained |

## In scope

| Path | Owner |
|------|--------|
| `components/studio/workspace/RazborModal.tsx` | Frontend |
| `components/studio/workspace/CreateCarouselModal.tsx` | Frontend |
| Related composer / MultiButton / PromptBox only as needed | Frontend |
| Avatar assets from release-team / mesh | Frontend |

## Out of scope

- FeedPostCard chrome (→ **C-feed-card-chrome-s47**)
- Marketing Director (→ **C-marketing-director-chat**)
- Changing Scriptwriter JSON / Designer draw contracts
- Prod/VPS

## Acceptance criteria (S47.B / S47.C)

1. Scroll/screenshot хватает modal, не background feed.
2. Нет «Карусель конкурента»; welcome короткий; placeholder «Сообщение»; нет Tools.
3. Preview не обрезан бессмысленно; виден `N/M` CG.
4. Handoff = arrow+logo; top = 4 people icons; Create segment intact.

## Risks

- Shared PromptBox used by both modals — strip Tools without breaking mic/send.
- Avatar source missing → use mesh agent initials in rounded discs (Architect OK fallback).

## Mid-flight escalation

Conflict icons vs segment → стоп → wave **D-icons-1** only (Architect).
