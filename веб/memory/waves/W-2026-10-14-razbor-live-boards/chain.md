# Chain — W-2026-10-14-razbor-live-boards (S48)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** parallel writers на `FeedPostCard` ↔ `RazborModal`/`CreateCarouselModal` ↔ `SidebarNavigation`.  
> `ticket_limit: full-queue`. Тренер: `memory/trainer/2026-10-14-razbor-live-boards-grade.md`.  
> **НЕ prod.**

**One-liner:** Архитектор → Frontend (nav + feed + Razbor/Create UI + Boards + parity) → Motion (L/R) → Backend → AI Bridge (LIVE Haiku) → Tester → Fixer → Deployer → Client **S48 HARD**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Архитектор | этот `chain.md`; 7× ticket stubs | [x] | memory only |
| 1 | Frontend | Sidebar + StudioPageClient; FeedPostCard; VerticalPostCarousel; preload lib; Razbor/Create chrome; Boards | [x] | UI tickets P0 — this pass |
| 2 | Motion | RazborSlidesCarousel + CreateCarouselPreview + FeedPostCard slides | [x] | S48 horizontal L/R + reduced-motion |
| 3 | Backend | followers map; Boards persist optional; metrics completeness | [ ] | sibling |
| 4 | AI Bridge | razbor-live Haiku; models; insights handoff | [ ] | **не** FE deep wire |
| 5 | Тестировщик | guards S48.A–E | [x] | smoke 27/27 + live analyze OK |
| 6 | Фиксер | red only | [x] | no P0 red |
| 7 | Деплоер | localhost only | [x] | /studio/carousel-engine + /marketing 200 |
| 8 | Клиент | Playwright S48 HARD @1440 | [x] | ПРИНЯТО С ЗАМЕЧАНИЯМИ — client-verdict.md |

## Tickets (P0 first)

1. **C-director-nav-marketing** — P0  
2. **C-feed-plaque-metrics-s48** — P0  
3. **C-razbor-cta-clip** — P0  
4. **C-carousel-preload-slides** — P0  
5. **C-slide-motion-horizontal** — P1 (Motion)  
6. **C-razbor-live-haiku-boards** — P0 (FE chrome + Boards; AI Bridge live path)  
7. **C-module-parity-carousel-ui** — P0  

## Decision locks

| Lock | Decision |
|------|----------|
| **D-nav-1** | Left sidebar **«Директор»** → `/marketing`. **Remove** Studio top-right Marketing button. Prefetch `/marketing`. |
| **D-followers-1** | `FeedPost.followers?: number` (or `account.followers` / subscribers). Display RU compact **`Nk`/`Nк`** right of plaque. Mock OK if live missing. |
| **D-metrics-1** | Always render 5 slots: views · likes · comments · shares · saves (0/`—` if missing). Scale ≈2× S47. |
| **D-plaque-1** | Plaque ≈1.5× S47 (font+padding). |
| **D-preload-1** | On Razbor/Create/feed-card open: `prefetchAll(slideUrls)` via `lib/image-cache.ts` (`Image`+decode Map). Motion never waits network. |
| **D-motion-1** | Slide change = expensive horizontal L/R translateX ±8–16% + light opacity, 280–420ms; reduced-motion → cut. |
| **D-razbor-chrome-1** | Preview ≈1.5×; **no** post title in modal header; CTA labels **white**; HandoffRoundButton **inside** PromptBox chrome; Competitors\|Boards MultiButton on competitors column (+ Boards local upload → Razbor). |
| **D-ai-1** | LIVE Haiku / models — **AI Bridge** owns; FE leaves hooks (`Начать разбор` CTA) unchanged for sibling. |
| **D-parity-1** | Shared `FeedPostCard` / workspace patterns apply to **all** `/studio/[moduleId]`. |

## Overlap ban

| Surface | Rule |
|---------|------|
| `SidebarNavigation` / `StudioPageClient` | C-director only early |
| `FeedPostCard` + `VerticalPostCarousel` | plaque/metrics/clip/preload/motion sequential FE+Motion |
| `RazborModal` / `CreateCarouselModal` / PromptBox | C-razbor chrome after feed stable |
| `razbor-pipeline` / AI prompts | AI Bridge only |
