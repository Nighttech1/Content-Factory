# Wave W-2026-10-05-carousel-razbor

| Field | Value |
|-------|-------|
| **Sprint** | Carousel workspace + Razbor rewrite |
| **Max tickets** | 3 |
| **Status** | client_accepted |
| **Depends on** | Trainer A — `memory/trainer/2026-10-05-carousel-razbor-wave-grade.md` |
| **Chain (типовой)** | Архитектор → Frontend → Motion → AI Bridge → Тестировщик → Фиксер → Деплоер → Клиент |
| **before_sha** | N/A |

## Tickets

| ID | P | Folder | Scope | Result |
|----|---|--------|-------|--------|
| C-49 | P0 | `tickets/C-49-carousel-workspace-chrome/` | subtitles, IdeaBar, search, play parity | **ПРИНЯТО** Клиент |
| C-50 | P1 | `tickets/C-50-settings-reels-page-size/` | Settings «Рилсы» count/page | **ПРИНЯТО** Клиент |
| C-51 | P0 | `tickets/C-51-razbor-script-only/` | welcome CTA, no designer, no carousel preview, competitor timeline | **ПРИНЯТО** Клиент |

## Architect lock (2026-10-05)

Порядок: **C-49 → C-50 → C-51**.  
Specs: `architect-spec.md` + `chain.md` в каждой папке тикета.  
Ключевые решения: search = local title + debounce topic refetch (no IdeaBar); play = per-card UI, no autoplay; C-50 = `cf.reels.pageSize` client slice only (no Backend); C-51 = Analyst→Scriptwriter only, CapCut-lite scrubber.

## Safety

- No DB wipe / Redis / generatedMedia delete.
- No social publish without HITL.
- C-48 (custom tile descriptions) deferred — not in this wave.
