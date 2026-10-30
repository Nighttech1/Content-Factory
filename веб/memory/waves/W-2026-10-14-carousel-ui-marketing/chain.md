# Chain — W-2026-10-14-carousel-ui-marketing

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить writers на `FeedPostCard` ↔ `RazborModal` ↔ `CreateCarouselModal`; Marketing shell — отдельный path после модалок.  
> `ticket_limit: default≤3` — **не** full-queue. Тикеты волны: **C-feed-card-chrome-s47** → **C-razbor-create-modal-s47** → **C-marketing-director-chat**.  
> Тренер: `memory/trainer/2026-10-14-carousel-ui-marketing-chat-grade.md`.

**One-liner:** Архитектор (memory) → Frontend (Feed → Razbor/Create sequential) → Motion → Backend → AI Bridge → Tester → Fixer → Deployer → Client **S47**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Архитектор | этот `chain.md`; 3× `architect-spec.md`; wave summary | [x] | Только memory; **no** prod code |
| 1 | Frontend | `FeedPostCard` (+ workspace badge strip) | [x] | **C-feed-card-chrome-s47** done — plaque + engagement; badge/tags/caption removed |
| 2 | Frontend | `RazborModal` → `CreateCarouselModal` (sequential) | [ ] | **C-razbor-create-modal-s47** — not this pass |
| 3 | Frontend | Marketing Director shell + AIInput | [ ] | **C-marketing-director-chat** — after modals |
| 4 | Motion | AIInput sink + optional modal enter 120–200ms | [ ] | After FE chrome stable |
| 5 | Backend | GraphQL/search tool endpoints; metrics `shares`/`saves` map if gap | [ ] | With Marketing tools |
| 6 | AI Bridge | `marketing-director-prompt.md` → live Haiku + tools | [ ] | After Backend tool names locked |
| 7 | Тестировщик | guards **S47** A–D | [x] | smoke OK + 3× guards.md + regression-guards |
| 8 | Фиксер | red paths only | [x] | smoke comment false-positive only (no prod P0) |
| 9 | Деплоер | localhost refresh local API | [x] | :3000 up; carousel/marketing/settings 200 |
| 10 | Клиент | Playwright **S47 HARD** @1440 | [x] | **ПРИНЯТО** — `client-s47.md` |

## Ticket pointer chains

- `memory/tickets/C-feed-card-chrome-s47/chain.md` → this file
- `memory/tickets/C-razbor-create-modal-s47/chain.md` → this file
- `memory/tickets/C-marketing-director-chat/chain.md` → this file

## Overlap ban

| Surface | Rule |
|---------|------|
| `FeedPostCard.tsx` / feed badge in `StudioModuleWorkspace.tsx` | Frontend **C-feed** only; freeze for other tickets |
| `RazborModal.tsx` / `CreateCarouselModal.tsx` | Frontend **C-razbor-create** sequential; **не** touch in C-feed pass |
| Marketing route / AIInput / projects rail | Frontend **C-marketing**; after modals |
| GraphQL/search tools + Haiku wire | Backend → AI Bridge; FE shows tool status only |

## Decision locks (Architect)

| Lock | Decision |
|------|----------|
| **D-IA-1 Marketing route** | New App Router page **`/marketing`** + Studio entry label **«Маркетинг-директор»** (module top / Launchpad tile OK). Sidebar IA C-136 **unchanged** (Studio / Schedule / Settings only) — Marketing enters from Studio surface, not new sidebar root. |
| **D-tools-1** | Tool names: **`app_graphql`** (read strategy data) + **`app_search`** (internal search). Write/mutate → HITL confirm. |
| **D-icons-1 Create top** | S47 **4 rounded people icons** = agent switcher visual; Create **Button-segment** (Сценарист \| Дизайнер \| Публикация) **retained** as step chrome. Icons sit **beside/above** segment as agent avatars for handoff target — **not** a second MultiButton step switcher. Architect forbid: replace segment with icons-only without Client re-lock. |
| **D-feed-1 Badge** | Remove workspace **`feed-source-badge`** («Онлайн · Instagram» / «Демо-данные»). Live proof = username plaque + on-photo metrics. Column titles «Наши»/«Конкуренты» **stay**. |

## Acceptance gate (Client S47)

1. Feed cards: no Онлайн badge; no Конкуренты/Наши on card; no bottom caption; black plaque username CG; bottom-center engagement CG.
2. Razbor+Create: modal scroll/capture; no «Карусель конкурента»; crop + `N/M` CG; short welcome; «Сообщение»; no Tools; handoff arrow+logo; 4 people icons + Create segment lock.
3. Marketing: projects rail; welcome→sink; AIInput; Haiku + real tools (not mock-only).
