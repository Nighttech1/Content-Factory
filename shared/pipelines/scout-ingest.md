# Scout → Apify (MCP) → веб: реальные ленты (наши + конкуренты)

## Подключение Apify (без токена, через MCP)
Владелец добавляет коннектор в **claude.ai → Settings → Connectors → Add custom connector**:
- Name: `Apify`
- URL: `https://mcp.apify.com/?tools=actors,docs,apify/instagram-scraper`
- Connect → OAuth в браузере (токен руками НЕ нужен).

Коннекторы подхватываются на старте сессии → открываешь **новый** облачный чат со
Scout и включаешь Apify через `+ → Connectors`. (Токен, если всё же нужен —
`console.apify.com/settings/integrations`; с MCP не требуется.)

## Что делает Scout
1. Через Apify MCP (actor `apify/instagram-scraper`) парсит:
   - **НАШИ:** `@mosarmclub` (последние рилсы/карусели + метрики).
   - **КОНКУРЕНТЫ:** топ виральных **армянских** аккаунтов/постов ниши.
   - Экономно: `resultsLimit ≤ 50`, 1–2 прогона в день (см. `shared/skills/scout-apify`).
2. Пушит результат в веб по модулю:

```
POST {CONTENT_FACTORY_WEB_URL}/api/scout/ingest   (x-ingest-secret: INGEST_SECRET)
{
  "moduleId": "club-reels",            // или carousel-engine / youtube-cartoon / …
  "ours": [
    { "id":"o1","title":"...","username":"mosarmclub","thumbUrl":"https://...","likes":320,"views":5400 }
  ],
  "competitors": [
    { "id":"c1","title":"...","username":"rival","thumbUrl":"https://...","likes":12000,"views":210000,"followers":55000 }
  ]
}
```
Веб кладёт это в стор и показывает в ленте модуля (колонки «Наши»/«Конкуренты»),
`sourceMode: live`. Пусто — пока Scout не пушнул (без мокапа).

## Какие модули наполнять
- `club-reels` (Рилс) — рилсы @mosarmclub + виральные рилсы армян-конкурентов.
- `carousel-engine` — карусели (конкуренты). Образцы владельца — отдельно `/api/content/reference` (идут первыми).
- `youtube-cartoon` — YouTube (можно и через YouTube Data API, ключ уже есть).

## Аномалии и воронка
- Аномалии (что выстрелило/просело) Scout считает по снапшотам и раздаёт профильным
  агентам + уведомляет владельца (он смотрит в вебе: Аналитика → Аномалии).
- Полная воронка к встречам (подписки IG / TG / явки / удержание) — отдельные
  источники (IG Insights, TG Bot API, учёт явок @vernatunbot); подключим позже.
