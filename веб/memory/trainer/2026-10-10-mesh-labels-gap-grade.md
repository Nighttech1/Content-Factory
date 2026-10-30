# Trainer grade — 2026-10-10 mesh labels gap (C-129)

## План хода

- Запрос: пользователь «дочисти подписи угараешь чтоль!!» после Vernatun UI; Клиент — **ПРИНЯТО С ЗАМЕЧАНИЯМИ** (mesh handoff labels наезжают на ноды/линии).
- Режим: Mesh / усиление команды после «не то» (gap → skill → повтор волны).
- Тикет: **C-129** mesh labels polish (P0 visual) — единственный.
- `ticket_limit: default≤3` (фактически **1** тикет: C-129).
- Роли по chain: **Frontend → Motion → Tester → Клиент HARD** (без app-кода Тренера; Архитектор опционален — контракт уже в skill C-129).

## Gap-playbook (ожидали vs сделали)

| | |
|--|--|
| **Ожидали** | Читаемые handoff-подписи на `/admin/mesh` без наезда на карточки агентов и линии @1440; демо-готово. |
| **Сделали** | Fixer сдвинул labels (~64% along edge, −34…−42px) в `PulseEdge` / seed — визуально лучше на глаз, **недостаточно** для демо. |
| **Какого знания не было** | C-107 = *наличие* concrete handoff; C-124/C-125 = *node↔node* overlap = 0. **Label bounding box ↔ node bounding box** не был HARD с Playwright assert. Команда трактовала «чуть сдвинуть %/px» как закрытие. Нет канона: short RU **или** gutters **или** hide mid-edge clutter на **dashed Trainer** edges. |

## Грейд: C → B (после апгрейда skills)

До усиления: **C** (критичный пробел знания → повтор «сдвига» без приёмки).  
После записи HARD в skills: **B** — команда готова к коду волны C-129.

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Нет HARD «label NEVER ∩ node bbox @1440» + Playwright acceptance | Frontend / Motion / Tester / Client | skill | P0 |
| 2 | Нет prefer short RU / gutters / hide dashed mid-clutter | Frontend | skill | P0 |
| 3 | S33 не требовал bbox labels↔nodes (только node overlap) | Client | skill | P0 |

## Что добавлено этим ходом

- `gap-playbook.md` — строка «дочисти подписи / labels наезжают»
- `xyflow-agent-mesh/SKILL.md` — § **Edge labels polish C-129 HARD** + checklist
- `client-scenarios` **S33** step 3 + Hard REJECT (C-129 bbox)
- `web-motion-engine` — C-129: offset ≠ закрытие тикета
- `plugins/trainer/PLUGINS.md` — указатель C-129
- Этот файл: `memory/trainer/2026-10-10-mesh-labels-gap-grade.md`

**Не писали:** `app/` / `components/` прод-код.

## Chain recommendation

`Frontend → Motion → Tester → Клиент HARD (S33 + Playwright bbox labels↔nodes)`

Guard: bbox intersection count = 0 @1440; dashed Trainer mid-labels без каши.

## Вердикт

Команда готова к волне: **да** (после усиления skills; код — специалистам по chain).
