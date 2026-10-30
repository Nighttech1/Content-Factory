# 🧑‍💼 КЛИЕНТ — ПРИЁМКА S50 HARD

**Дата:** 2026-10-14  
**Доказательство:** Playwright MCP navigate + snapshot + screenshot @1440 + клики (Доски dropdown, Design card, Создать карусель)

## Вердикт: ПРИНЯТО С ЗАМЕЧАНИЯМИ

### Сценарии S50.A–D

| Gate | Вердикт |
|------|---------|
| A Feed chrome | PASS — minimal bottom; нет «(4:5)»; нет orange dots; sort/filter; Boards dropdown |
| B Settings Design | PASS — 3:5 brandbook; нет MD crumbs / slots / helper; toolbar one row |
| C Create | PASS — старт Сценарист; handoff; preview ≈29rem; нет Tools |
| D Live competitors | PASS policy — **empty**, не mock; **замечание:** Apify 403 → live plaque нечем проверить |

### Hard REJECT #16 (pickiness)

- Thick bottom clipping → **нет**
- DESIGN.md crumbs under cards → **нет**
- Mock competitors when live expected → **нет** (пусто OK)

### Замечания (не блокеры UI)

1. **IG scraper key 403** — ключ задан, Apify отвергает → колонка Конкуренты пустая. Это правильно по политике S50; для живых карточек нужно обновить/починить ключ.
2. **Наши** по-прежнему локальные fixture (picsum) — ожидаемо для демо; не путать с mock-конкурентами.
3. Live generation smoke (полный Scriptwriter→Designer draw) в этой приёмке не гонялся end-to-end — prompts усилены отдельной волной AI Bridge; при слабых хуках/CTA открывать P1 на промпты.

### Prod

**Запрещён.** Открытых UI P0/P1 по S50 chrome нет; live IG зависит от ключа.

### Скрины

- `s50-carousel-1440.png`
- `s50-boards-1440.png`
- `s50-settings-design-1440.png`
- `s50-create-1440.png`
