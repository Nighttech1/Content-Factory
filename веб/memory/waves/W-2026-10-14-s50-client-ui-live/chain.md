# Chain — W-2026-10-14-s50-client-ui-live (S50)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** parallel writers на `FeedPostCard`/`VerticalPostCarousel` ↔ `DesignLibraryCarousel`/`BrandbookBoard` ↔ `CreateCarouselModal`.  
> `ticket_limit: default≤3`. Тренер: `memory/trainer/2026-10-14-s50-client-ui-live-grade.md`.  
> **НЕ prod.**

**One-liner:** Trainer ✅ → Архитектор → Frontend (UI) → AI Bridge (prompts) → Backend (live if mock) → Tester → Fixer → Deployer (localhost) → Client S50 HARD.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Архитектор | этот `chain.md` + 3× ticket specs | [x] | memory brief |
| 1 | Frontend | Settings Design + feed chrome + Create UI | [x] | UI done — see frontend.md |
| 2 | AI Bridge | s50-prompt-hardening → Scriptwriter/Designer/Razbor | [x] | parallel wave live-competitors-prompt-hardening |
| 3 | Backend | live competitors if mock; Boards CRUD if needed | [x] | empty≠mock; Boards local rename OK |
| 4 | Тестировщик | guards S50.A–D | [x] | tester-report.md |
| 5 | Фиксер | red only | [x] | no P0 UI |
| 6 | Деплоер | localhost only | [x] | HTTP 200; НЕ prod |
| 7 | Клиент | Playwright S50 HARD @1440 | [x] | ПРИНЯТО С ЗАМЕЧАНИЯМИ |

## Tickets (P0)

1. **C-s50-settings-design** — P0  
2. **C-s50-feed-chrome** — P0  
3. **C-s50-create-prompts** — P0 (FE UI now; prompts → AI Bridge)

## Decision locks

| Lock | Decision |
|------|----------|
| **D-bb-3-5** | Brandbook Embla cards = **aspect 3:5** (width:height), same element layout as Heritage board (colors/type/buttons). **Only** BrandbookBoard visual — no sliced strip / swatches / MD crumbs under card. |
| **D-design-toolbar** | ONE row: «дизайн.md» icon+short · «референс» · «новый дизайн»+icon · preview **icon-only**. No slots counter. No colors helper. No context/preview on card click. |
| **D-settings-pad** | Settings horizontal padding **~75% smaller** → wider content (`max-w-7xl`, less `px`/`pr`). |
| **D-feed-bottom** | Dual-feed height → near window bottom (`calc(100dvh−…)`); column/page `pb-*` **minimal**; no thick black dead band clipping cards. |
| **D-boards-dd** | Boards = **dropdown** all boards + create + rename. **No** count «1» on label «Доски». Default title without trailing number spam. |
| **D-sort-filter** | Sort + filter **left of search** on **both** Ours and Competitors. Ours also gets search row. |
| **D-chrome-clean** | No orange dots left of Наши/Конкуренты. Module title **without** «(4:5)». |
| **D-create-parity** | Create chrome = Razbor people-tabs look; **start Scriptwriter**; Competitors/Ours toggle **higher**; preview **≈1.5×** again (~29rem). |

## Overlap ban

| Surface | Rule |
|---------|------|
| Design library + BrandbookBoard | sequential before Settings padding |
| VerticalPostCarousel + StudioModuleWorkspace | bottom + boards + sort together |
| CreateCarouselModal + CreateCarouselPreview | after Razbor toggle pattern locked |
