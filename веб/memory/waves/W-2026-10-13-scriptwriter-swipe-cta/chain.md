# Chain — W-2026-10-13-scriptwriter-swipe-cta

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить `create-carousel-prompts.ts` ↔ Create Scriptwriter chrome; **не** Razbor; **не** VPS.  
> Тикеты (≤3): **C-scriptwriter-swipe-cta** → **C-scriptwriter-cta-hint-ui**.

**One-liner:** Architect (memory) → AI Bridge → Frontend → Tester → Fixer → Deployer → Client **S46**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Архитектор | этот `chain.md`; tickets `architect-spec.md`; wave summary | [x] | Только memory; **no** prod code |
| 1 | AI Bridge | `lib/studio/create-carousel-prompts.ts`; `lib/studio/carousel-json-contract.ts`; `lib/mesh/agent-defaults.ts` | [x] | swipe meta HARD; CTA catalog 1–4; optional `cta_type`; Designer one-liner no paint swipe_trigger |
| 2 | Frontend | `CreateCarouselModal.tsx` + `ScriptwriterCtaHint.tsx` | [x] | «?» top-right Scriptwriter chat only; testids |
| 3 | Тестировщик | guards S46 + smoke greps | [x] | smoke OK; guards + regression |
| 4 | Фиксер | red paths only | [x] | skipped — no P0 |
| 5 | Деплоер | localhost refresh local API | [x] | carousel-engine HTTP 200 |
| 6 | Клиент | Playwright **S46 HARD** @1440 | [x] | S46.A ПРИНЯТО — `client-verdict.md` |

## Ticket pointer chains

- `memory/tickets/C-scriptwriter-swipe-cta/chain.md` → this file
- `memory/tickets/C-scriptwriter-cta-hint-ui/chain.md` → this file

## Overlap ban

| Surface | Rule |
|---------|------|
| `create-carousel-prompts.ts` / `carousel-json-contract.ts` / `agent-defaults.ts` | AI Bridge owns |
| Create Scriptwriter «?» chrome | Frontend after AI Bridge prompts locked |
| `RazborModal.tsx` | **Out of scope / freeze** |

## Acceptance gate (Client S46)

1. `swipe_trigger` = meta engagement QA only — never on-slide paint; never in primary/secondary_copy.
2. CTA catalog 1–4 HARD; user number N → `cta_type: N` + matching copy; missing N → ask.
3. Scriptwriter step: «?» → cheat sheet CTA 1–4 (RU); testids present; not on Designer/Publication as primary.
