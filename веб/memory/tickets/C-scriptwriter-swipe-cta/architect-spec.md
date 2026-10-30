# Architect spec — C-scriptwriter-swipe-cta (P1)

> **Архитектор** — memory only. Wave: `W-2026-10-13-scriptwriter-swipe-cta`.  
> Canon: `workers/script-writer`, `carousel-json-contract`, `create-carousel-prompts-notes.md`.

## Goal

Усилить Сценариста каруселей: (1) `swipe_trigger` = **meta** engagement QA; (2) CTA catalog **1–4 HARD** + `cta_type`.

## Contracts

### swipe_trigger (HARD)

| Rule | Detail |
|------|--------|
| Meaning | Per-slide descriptive «зачем листать дальше» — engagement QA meta |
| On-slide | **NEVER** put into `primary_copy` / `secondary_copy`; Designer **must NOT** paint as slide text |
| Required | Still required `string` on every slide (incl. cover; last = soft end OK) |

### CTA catalog (HARD)

| # | Intent | Action copy sense |
|---|--------|-------------------|
| 1 | Вопрос зрителю | → напишите в комментариях |
| 2 | Хочешь ещё подобного? | → подписывайся |
| 3 | Живые встречи армянского разговорного клуба | → приглашение через TG канал в шапке профиля |
| 4 | Понравился контент? | → лайк+сохранить |

- User wrote number N → set root **or** last/`cta` slide `cta_type: N` + matching CTA copy.
- Missing N → **ask** which CTA 1–4 (do not invent silently).

### Zod

- Optional `cta_type`: `z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])` on **root** and/or **slide**.
- Keep `swipe_trigger` required string; document as meta in `CAROUSEL_JSON_SCHEMA_HINT`.

## Paths / owners

| Path | Owner |
|------|-------|
| `lib/studio/create-carousel-prompts.ts` | AI Bridge |
| `lib/studio/carousel-json-contract.ts` | AI Bridge (zod in same file — no separate Backend step) |
| `lib/mesh/agent-defaults.ts` | AI Bridge (carousel `copywriterPrompt` + Designer one-liner) |

## Out of scope

- Razbor; Settings Design; VPS; Frontend «?» (→ C-scriptwriter-cta-hint-ui).

## Acceptance (Client S46 A)

1. Overlay states swipe = meta; CTA 1–4 exact senses.
2. Schema hint documents meta + optional `cta_type`.
3. Designer overlay: do not render `swipe_trigger` as on-slide text.
