# Trainer grade — 2026-10-14 — s51-design-boards-apify (S51)

## План хода

- Запрос: шаг 0 волны **S51** —
  1. Settings Design: все кнопки **top-right**; **убрать** preview DESIGN.md; eye = **«код дизайн мд»**; сжать empty bottom карточек; active = **blue neon** perimeter; **нет** context/edit popup на клик.
  2. Carousels Boards: dropdown **только** из segment **«Доски»** (рядом с Конкуренты); dblclick rename; выбранное имя **заменяет** «Доски»; Upload = **icon only**, всегда справа от filter (gray disabled на Конкуренты) — **UI не прыгает**.
  2.6 Apify ~$5 / 2 дня при «одном» scrape → аудит call volume; оценка $/мес на 10 top carousels + reels daily; усилить Backend/AI Bridge (cache, no bootstrap spam).
- Режим: UI + Backend cost/cache + AI Bridge no-scraper. **НЕ prod.**
- `ticket_limit: default≤3` — явного «до конца / full queue» нет.
- Роли: Архитектор → Frontend → Backend → AI Bridge → Тестировщик → Фиксер → Деплоер → Клиент (Playwright S51 HARD).

## Грейд: C → **A** (после апгрейда skills этим ходом)

До шага 0: **C** — S50 закрыл dropdown/no-context в общем виде, но **не** зафиксировал: top-right cluster; удаление preview MD; label «код дизайн мд»; neon active; Boards **из segment** без extra buttons; **no UI jump** / Upload always; Apify **cost discipline**. Риск снова принять прыгающий toolbar и сжечь CU.  
После дописки: **A** — команда готова к Архитектору / ≤3 tickets.

## Пробелы (закрыты в skills; код — волна)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Design buttons not top-right; preview MD; eye label; empty bottom; neon; edit popup | Frontend + Client | skill/rule | P0 |
| 2 | Boards not from «Доски» segment; extra buttons; UI jump; Upload mount/unmount | Frontend + Client | skill/rule | P0 |
| 3 | Apify call spam / weak cache / bootstrap refetch; no monthly estimate discipline | Backend + AI Bridge | skill | P0 |

MCP: Playwright + chrome-devtools — OK. Платный MCP не предлагать. Prod — запрещён.

## Who strengthened

### Engineering team

| Роль | Что усилено |
|------|-------------|
| **Client** | `client.mdc` Hard REJECT **#17 S51**; `client-scenarios` **S51.A–B**; `client-review` S51 |
| **Frontend** | `content-factory-ui` S51 Design + Boards; `frontend.mdc` §26–27 |
| **Architect** | `architect` § S51 ticket pack ≤3 + chain |
| **Backend** | `backend` S51 + **`apify-scraper-cost-discipline.md`** |
| **AI Bridge** | no Apify from agent-start / bootstrap / tools |
| **Tester** | S51 guards checklist + regression-guards |
| **Trainer** | gap-playbook S51 rows; `plugins/trainer/s51-design-boards-apify.md` + PLUGINS |

### Release-team

| Агент | Что |
|-------|-----|
| Разборщик / Сценарист / Дизайнер | без нового scrape side-effect; live feed остаётся Backend |
| Scout / Публицист | без изменений UI S51 |

## Что добавлено этим ходом

- `client.mdc` #17; `client-scenarios` S51; `client-review` + regression-guards.
- `content-factory-ui` Design/Boards S51 + anti-patterns; `frontend.mdc` §26–27.
- `backend/SKILL.md` S51 + `apify-scraper-cost-discipline.md`.
- `ai-bridge` S51 no-scraper; `tester`; `architect` S51 pack.
- `gap-playbook` + `plugins/trainer/s51-design-boards-apify.md` + PLUGINS.
- Этот файл.

## Apify cost note (для Архитектора / Backend — порядок величин)

- Сегодня: in-memory TTL ~10 min; `resultsLimit` 50; dual paths carousel + reels; client bootstrap + refetch легко дают **десятки** run-sync при «одном» UX scrape → объясняет ~$5 / 2 дня.
- **Цель после фикса:** 1 raw scrape / niche refresh → reuse cache для carousel+reels; **≤1–2** paid runs/day при спокойной работе.
- **Оценка $/мес** на «10 top carousels + reels daily» (дисциплина): порядка **единиц–десятков USD/мес**; без дисциплины легко **×10–50**. Точную цифру Backend пишет в ticket после счётчика runs × Apify CU (секреты не в memory).

## Recommended tickets (`ticket_limit: default≤3`)

| ID (proposed) | Title | Priority |
|---------------|-------|----------|
| **C-s51-settings-design** | Design: all actions top-right; remove preview DESIGN.md; eye «код дизайн мд»; shrink empty bottom; blue neon active perimeter; no context/edit popup | P0 |
| **C-s51-boards-chrome** | Boards dropdown FROM «Доски» segment; dblclick rename; selected name replaces «Доски»; Upload icon-only always right of filter (disabled Competitors); no UI jump | P0 |
| **C-s51-apify-cost** | Audit Apify call volume; TTL + in-flight dedup + raw reuse; no bootstrap spam; AI Bridge never calls scraper; monthly $ estimate for 10 carousels+reels/day | P0 |

## Proposed chain (≤3, no full-queue)

```
Тренер ✅ (этот файл)
→ Архитектор (spec + chain.md: Design toolbar layout; Boards segment API; Apify cache TTL/dedup locks)
→ Frontend (C-s51-settings-design + C-s51-boards-chrome)
→ Backend (C-s51-apify-cost: counters, cache, dedup)
→ AI Bridge (assert no scraper side-effects)
→ Тестировщик (guards S51.A–B + Apify HIT/MISS smoke)
→ Фиксер
→ Деплоер (localhost only — НЕ prod)
→ Клиент (Playwright @1440 S51 HARD — #17)
```

Не параллелить overlapping: Design Settings vs Boards feed chrome if same workspace file — Architect orders in `chain.md`.

## Вердикт

Команда готова к волне: **да**  
Лимит тикетов: **default≤3**  
Prod: **нет**  
Грейд: **A**
