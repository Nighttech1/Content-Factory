# Wave W-2026-10-12 Create Carousel Studio Handoff

| Field | Value |
|-------|-------|
| **ID** | `W-2026-10-12-carousel-studio-handoff` |
| **Date** | 2026-10-12 |
| **Status** | open — Architect done |
| **before_sha** | `unknown` (no git) |
| **after_sha** | _(после прохода)_ |
| **Max tickets** | **≤3** (вся фича 1.1–1.8 в одной пачке) |
| **Trainer grade** | B — `memory/trainer/W-2026-10-12-carousel-studio-handoff-grade.md` |
| **Skills** | `carousel-studio-handoff` (primary), `content-factory-ui`, `content-pipeline-agents`, `ai-bridge`, `21st-ui-catalog`, `backend`, `client-scenarios` **S41** |
| **User plan** | утверждён |

## Intent

Переписать окно **«Создать карусель»** (`CreateCarouselModal`) по канону `carousel-studio-handoff`:

1. **Chrome (1.1–1.3):** убрать bottom handoff/tools; top Button-variant segment; `button.tsx` + slot/cva; Vernatun tokens.
2. **Agents (1.4, 1.5, 1.8):** top-right handoff; agent-start bundle; Designer describe→draw; markdown; no auto-handoff сценариста; **no-mock** (`source: "error"` при fail).
3. **Publish (1.6–1.7):** шаг **Публикация** (не агент Публицист); **«Опубликовать»** → Черновики + `/schedule`.

**RazborModal / RazborPublisherPane** — образец для Publication pane; **не ломать** Razbor в этой волне.

## Tickets in this wave

| ID | P | Covers | Folder | Result |
|----|---|--------|--------|--------|
| **C-carousel-chrome** | P0 | 1.1–1.3 | `memory/tickets/C-carousel-chrome/` | pending |
| **C-carousel-agents** | P0 | 1.4, 1.5, 1.8 | `memory/tickets/C-carousel-agents/` | pending |
| **C-carousel-publish** | P0 | 1.6–1.7 | `memory/tickets/C-carousel-publish/` | pending |

## Path lock (NO overlapping parallel FE writers)

Один path на `CreateCarouselModal` — **sequential**:

1. AI Bridge + Backend (agent-start / modes / draw / no-mock) **до** FE live wire  
2. Frontend: **chrome → agents → publish** (одна очередь, не два writer’а на modal)  
3. Tester → Fixer → Deployer → Client **S41**

## Wave chain (roles)

```text
Тренер (done, B) → Архитектор (done)
  → AI Bridge → Backend → Frontend
  → Тестировщик → Фиксер → Деплоер → Клиент Playwright (S41)
```

**Единый chain:** `memory/waves/W-2026-10-12-carousel-studio-handoff/chain.md`

## Spec index

| Ticket | Spec |
|--------|------|
| C-carousel-chrome | `memory/tickets/C-carousel-chrome/architect-spec.md` |
| C-carousel-agents | `memory/tickets/C-carousel-agents/architect-spec.md` |
| C-carousel-publish | `memory/tickets/C-carousel-publish/architect-spec.md` |

## Supersedes (Create only)

| Prior | By |
|-------|-----|
| Create MultiButton / CompactMultiButton agent switcher + bottom handoff/tools | **C-carousel-chrome** |
| Create Publisher agent + chat pane | **C-carousel-publish** |
| Auto-handoff сценариста; mock soft-ack «успех» в Create при fail | **C-carousel-agents** |
| Wave2 «Publisher с чатом» / C-59 footer handoff **в Create** | эта волна (Razbor отдельно) |

## Stop report (заполняет Оркестратор)

**Закрыто (Client+guard):** —

**Осталось:** AI Bridge → Backend → Frontend (chrome→agents→publish) → Tester → Fixer → Deployer → Client S41

**Готов дальше отрабатывать очередь волны — после пачки ≤3 (вся фича в пачке) закрыть с guards.**
