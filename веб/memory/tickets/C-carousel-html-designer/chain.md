# Chain — C-carousel-html-designer

> **Канон пачки:** `memory/waves/W-2026-10-12-carousel-json-pipeline/chain.md`  
> Этот файл — pointer. Не параллелить с P0/json на том же modal path.

**One-liner:** Wave Backend HTML→PNG + `slideCount = slides.length` → Frontend step **3c**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 1 | AI Bridge | Designer Layout prompts + safe-zone in `create-carousel-prompts` / agent-defaults | [ ] | Wave step 1 |
| 2 | Backend | `carousel-html-renderer`; `generate-carousel-slides-core`; agent-chat draw **no** hardcode 4; Windows `cmd.exe /c` PNG | [ ] | Wave step 2 |
| 3 | Frontend | CreateCarouselModal bind draw → N frames from JSON | [ ] | Wave step **3c** after P0 |
| 4 | Tester | guards C-carousel-html-designer + dynamic N + Razbor untouched smoke | [x] | Wave step 4 — static PASS |
| 5 | Fixer / Deployer / Client | see wave chain | [ ] | S41+S42 |

