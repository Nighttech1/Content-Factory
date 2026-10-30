# ENV — первый ключ API каруселей

Подготовка к live-генерации каруселей. **Секреты не коммитить.**

## Что добавить в локальный `.env` (имена)

```env
CAROUSEL_API_KEY=
CAROUSEL_API_BASE_URL=
```

| Имя | Зачем |
|-----|--------|
| `CAROUSEL_API_KEY` | Bearer / token провайдера генерации каруселей (первый ключ волны) |
| `CAROUSEL_API_BASE_URL` | Опционально: base URL API, если не зашит в коде |

## Правила

1. Значения кладёт человек / ops в `.env` или env ОС — **не** в skills, memory, tickets, git.
2. Без ключа Backend **soft-fail** → mock generate (как у scraper/aggregator).
3. Не путать с:
   - `AGGREGATOR_API_KEY` (Polza LLM) — `docs/ENV_AGGREGATOR.md`
   - `IG_SCRAPER_API_KEY` (конкуренты Apify)
4. Тикет волны: **C-153** — prep + wire path; smoke без печати секрета (только `KEY_OK len/prefix`).

Vendor/URL конечного провайдера фиксирует Архитектор в spec тикета (сюда только имена env).
