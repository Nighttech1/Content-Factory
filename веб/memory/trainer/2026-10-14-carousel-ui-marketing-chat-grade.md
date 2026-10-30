# Trainer grade — 2026-10-14-carousel-ui-marketing-chat

## План хода

- Запрос: (1) carousel feed cards — plaque + on-photo engagement, убрать Онлайн/tags/caption; (2) Razbor modal scroll/capture + chrome; (3) Create same 2.x; (4) NEW Marketing Director ChatGPT-like + AIInput + Haiku + GraphQL/search.
- Режим: UI + AI Bridge prompt/tools stub (+ Backend tools wire)
- Роли по chain: Архитектор → Frontend → Motion → Backend → AI Bridge → Тестировщик → Фиксер → Деплоер → Клиент
- `ticket_limit: default≤3` (пользователь **не** снимал лимит «до конца» / full-queue)

## Грейд: B

Мелкие пробелы закрыты этим ходом в skills/rules. Готово к Архитектору. Остаётся product lock: IA route Marketing Director; exact 4 agent avatars source; Create top icons vs Button-segment conflict.

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 | Статус |
|---|--------|------|------|----------|--------|
| 1 | Feed card chrome устарел (C-37 badge / caption / tags) | Frontend | skill | P0 | закрыт → `content-factory-ui` S47 |
| 2 | Razbor/Create scroll capture background; Tools; index ban vs 5/8 | Frontend | skill | P0 | закрыт → UI + S47.B/C |
| 3 | Нет Marketing Director + AIInput + Haiku tools | FE/BE/AI Bridge | skill stub | P1 | stub → `marketing-director-prompt.md` |
| 4 | Client proof всё ещё «Онлайн» badge | Клиент | rule/skill | P0 | закрыт → `client.mdc` #7+#13, S47 |
| 5 | Century Gothic Vernatun не в frontend.mdc как HARD для волны | Frontend | rule | P1 | закрыт → frontend.mdc §18–21 |
| 6 | Mobile modal lock / Marketing rail | Frontend | skill | P1 | закрыт → `responsive-mobile-web` S47 |
| 7 | Architect: route + GraphQL tool names + icons vs segment | Архитектор | spec | P0 | **открыт** — в spec/chain |

## Что добавлено этим ходом

- `content-factory-ui`: FeedPostCard S47; Razbor/Create S47; Marketing Director section; Do-not bans
- `client-scenarios`: **S47 HARD** A–D; live proof без badge-must; Hard REJECT
- `frontend.mdc`: §18–21 Century Gothic + S47 feed/modal/Marketing
- `client.mdc`: Hard REJECT #7 update + #13 S47
- `ai-bridge/SKILL.md` + **`marketing-director-prompt.md`** stub
- `responsive-mobile-web`: S47 notes
- `gap-playbook` rows; `plugins/trainer`; `21st-ui-catalog` AIInput query; `llm-model-catalog-notes` Marketing Director

## Proposed tickets (≤3)

| ID (suggested) | Priority | Scope |
|----------------|----------|-------|
| **C-feed-card-chrome-s47** | P0 | Feed: remove Онлайн/tags/caption; black plaque username; bottom-center engagement CG |
| **C-razbor-create-modal-s47** | P0 | Razbor+Create parity: scroll/capture modal; no «Карусель конкурента»; crop; `N/M` CG; short welcome; «Сообщение»; no Tools; handoff arrow+logo; 4 people icons |
| **C-marketing-director-chat** | P1 | New section: projects left; welcome→sink; AIInput; Haiku + GraphQL/search tools |

Если FE paths overlap сильно — Архитектор: pass A = C-feed + C-razbor-create (sequential files), pass B = Marketing; лимит 3 **не** снят.

## Recommended chain

```text
Тренер (done) → Архитектор (spec + chain.md, lock IA/tools/icons)
  → Frontend (FeedPostCard → RazborModal → CreateCarouselModal → Marketing shell + AIInput)
  → Motion (input sink + optional modal enter; 120–200ms)
  → Backend (GraphQL/search tool endpoints for Director; metrics map shares/saves if missing)
  → AI Bridge (marketing-director prompt + Haiku + tools)
  → Тестировщик (guards S47)
  → Фиксер
  → Деплоер (localhost only)
  → Клиент (S47 Playwright @1440)
```

Не параллелить overlapping: `FeedPostCard` / `RazborModal` / `CreateCarouselModal` в одном Frontend pass — **последовательно**.

## Вердикт

Команда готова к волне: **да** (грейд **B**)  
Prod-код: **не писать** (Тренер)  
VPS/prod: **нет**
