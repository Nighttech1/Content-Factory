# Guards — Cortana Retrieval (ТЗ §7)

Использовать при закрытии тикетов Шагов 5–9. Без зелёных пунктов — **не done**.

## Обязательные кейсы

| # | Кейс | Assert |
|---|------|--------|
| R1 | Точечный вопрос («цели по Работе на месяц») | В промпт/filter только нужная сфера (+ опц. счётчик); чужие сферы не развёрнуты |
| R2 | Multi-entity («не успеваю + Path») | Union: `biometrics` **и** `path` (**и** temporal сегодня, если есть) |
| R3 | Бедный filter | LLM → `need_vector_search=true`, финал в TG **не** уходит до vector |
| R4 | Vector hits | Второй промпт содержит `VECTOR_HITS`; ответ опирается на hits |
| R5 | Vector пусто | Текст «в данных Спутника… нет» / уточнение; **нет** выдуманных целей/id |
| R6 | Anti-hallucination block | §2.1 присутствует в **каждом** LLM-вызове хода |
| R7 | Один vector-раунд | Второй `need_vector_search` не крутит бесконечный цикл |
| R8 | HITL | Propose без approve не мутирует sync/GCal |

## Артефакты закрытия C-*

1. pytest (router / filter / sufficiency parse / vector merge)
2. `memory/tickets/C-…/guards.md` со ссылкой на R1–R8
3. Строка в `client-review/regression-guards.md` при приёмке Клиентом

Моки LLM в unit; live TG — только с явным маркером волны.
