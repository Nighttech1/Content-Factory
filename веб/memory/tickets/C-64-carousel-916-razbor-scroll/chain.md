# Chain — C-64

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths`.  
> **Порядок волны 1:** **C-64 (этот) → C-65 → C-63**.  
> **Старт Frontend волны первым.**

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Trainer | `memory/trainer/2026-10-07-ux-wave-grade.md` | [x] | Grade A |
| 1 | Architect | `architect-spec.md`, этот `chain.md` | [x] | Spec only |
| 2 | Frontend | `lib/studio/feed-fixtures.ts`, `components/studio/workspace/FeedPostCard.tsx`, `components/studio/workspace/VerticalPostCarousel.tsx`, `components/studio/StudioModuleWorkspace.tsx` (aspect/layout `carousel-engine` → stack `9/16` only), optional `DraftsPanel.tsx` aspect match | [x] | stack 9/16; slideUrls≥3; L/R centered; Разбор large terracotta; styled scrollbar; keep `razbor-btn`; **не** CreateCarouselModal / AppShell / loading.tsx |
| 3 | Motion | L/R press / reduced-motion; scrollbar chrome без jank | [ ] | no full-page opacity |
| 4 | Tester | `memory/tickets/C-64-carousel-916-razbor-scroll/guards.md`; S15 carousel asserts | [x] | Static smoke GREEN; slideUrls≥3; stack 9/16; L/R + razbor + scrollbar |
| 5 | Fixer | _(если красное)_ | [ ] | Surgical; не стартовать C-65 пока красное |
| 6 | Deployer | localhost `/studio/carousel-engine` | [x] | 2026-10-07 — `/studio/carousel-engine` HTTP 200; no VPS |
| 7 | Client | acceptance | [x] | stack 9:16 + Разбор + scroll |

Skills: `content-factory-ui`, `content-pipeline-agents`, `21st-ui-catalog`, `web-motion-engine`, `client-scenarios`.  
**Не звать:** Backend, AI Bridge, Coder monolith, WebGL.
