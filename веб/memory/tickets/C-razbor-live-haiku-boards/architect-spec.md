# Architect spec — C-razbor-live-haiku-boards

Wave: `W-2026-10-14-razbor-live-boards`. Priority: **P0**.

## Goal (split)

**Frontend (this pass):** Razbor/Create chrome + Competitors\|Boards upload.  
**AI Bridge (sibling):** LIVE Haiku after «Начать разбор»; models; insights handoff — **do not deep-touch** pipeline here.

## FE locks

| Item | Lock |
|------|------|
| 7.1 | Preview carousel ≈1.5× (max-w / frame width) |
| 7.2 | Remove post title from Razbor (+ Create if present) chrome header |
| 7.3 | Button labels gray → **white** |
| 7.4 | `HandoffRoundButton` **inside** PromptBox input chrome (mic-area row) |
| 7.6 | Competitors column: MultiButton **Конкуренты \| Доски**; Boards = local image upload → open Razbor |

## AI Bridge hooks (leave for sibling)

- `startRazbor` / «Начать разбор» CTA stays; wire live prompt later.
- Models Haiku / image-2 — mesh defaults; FE no mock rewrite in this pass.

## Acceptance (FE)

Preview larger; no post title; white CTAs; handoff inside composer; Boards upload → Razbor open.
