# Chain — C-carousel-json-scriptwriter

> **Канон пачки:** `memory/waves/W-2026-10-12-carousel-json-pipeline/chain.md`  
> Этот файл — pointer. Не параллелить overlapping Create / agent-chat writers.

**One-liner:** Wave AI Bridge prompts + Backend zod → Frontend step **3b** (after P0).

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | AI Bridge | `create-carousel-prompts.ts`; `agent-defaults.ts` Scriptwriter Dramaturgy JSON + ask-N | [ ] | Wave step 1 |
| 2 | Backend | **NEW** `lib/studio/carousel-json-schema.ts` zod; agent-chat handoff validate | [ ] | Wave step 2 |
| 3 | Frontend | CreateCarouselModal JSON display / ask-N / handoff artifact | [ ] | Wave step **3b** after P0 |
| 4 | Tester | guards C-carousel-json-scriptwriter + S42 JSON/N | [x] | Wave step 4 — static PASS |
| 5 | Fixer / Deployer / Client | see wave chain | [ ] | S41+S42 |

