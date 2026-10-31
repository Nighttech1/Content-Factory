---
name: scout-apify
description: IG/TikTok разведка через Apify (free-план, pay-per-result) с жёсткой экономией кредитов. Ключ APIFY_TOKEN из окружения (вступает в силу на старте сессии). Один закапанный прогон → снапшот; resultsLimit ≤50; soft-fail без retry-storm. Использует Разведчик для поиска виральных аккаунтов/контента и мониторинга конкурентов IG/TikTok.
---

# Скилл: разведка IG/TikTok через Apify (бюджет прежде всего)

Для REST-API Apify нужен **ровно один токен** — API token. Отдельный **`APIFY_ID`** (это id аккаунта) для вызовов **НЕ нужен** — токен сам аутентифицирует. Если в окружении лежат `APIFY_ID` + `APIFY_API_KEY` — используем только ключ. Имя переменной: поддерживаем и `APIFY_TOKEN`, и `APIFY_API_KEY`.
```bash
# резолвим токен из любого из принятых имён (значение не эхоим)
APIFY="${APIFY_TOKEN:-${APIFY_API_KEY:-}}"
test -n "$APIFY" && echo "ключ есть" || echo "НЕТ ключа — подхватится в НОВОЙ сессии (секреты вступают на старте); проверь имя: APIFY_TOKEN или APIFY_API_KEY"
```
Free-план ≈ $5 кредитов/мес. **Цель — укладываться в бесплатное.** (Секрет — только из окружения, не эхоить, не в git.)

## Железные правила экономии (из `apify-scraper-cost-discipline`)
- **Один прогон на задачу.** Никаких прогонов «на каждое открытие/рефетч». Результат → снапшот (временный файл), дальше читаем снапшот, не Apify.
- **`resultsLimit` ≤ 50** всегда. По умолчанию 10–40.
- **`run-sync-get-dataset-items`** с `timeout` — синхронно, один вызов, без цикла ретраев.
- **Soft-fail:** нет ключа / 4xx / пусто → вернуть прошлый снапшот или пусто; **никогда** не долбить Apify повторно.
- Дешёвые акторы, точечные хэштеги/аккаунты; без «скачать всё».
- Секрет только из `$APIFY_TOKEN`; не в логи/git.

## Приёмочный запрос (ГОТОВ, закапан) — топ-10 армянских аккаунтов с виральным контентом, БЕЗ артистов
Цель владельца: найти **виральный залетевший контент**, исключив популярных армянских **артистов/селеб** (певцы/актёры/публичные персоны). Один прогон, ≤48 постов.

```bash
APIFY="${APIFY_TOKEN:-${APIFY_API_KEY:-}}"   # один токен; APIFY_ID для вызовов не нужен
# 1) ОДИН синхронный прогон: топ-посты по армянским хэштегам (≤12 на хэштег × 4 = ≤48)
curl -s -X POST "https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/run-sync-get-dataset-items?token=$APIFY&timeout=180" \
  -H "Content-Type: application/json" \
  -d '{"hashtags":["hayastan","armenianfood","armenianmemes","armenianstyle"],"resultsLimit":12}' \
  > /tmp/apify-ig-snapshot.json
# размер/кол-во (контроль, что не ушли в тысячи)
python3 -c "import json;d=json.load(open('/tmp/apify-ig-snapshot.json'));print('постов:',len(d))"
```

Разбор снапшота → аккаунты (агрегируем по автору, ранжируем по вовлечению, исключаем артистов):
```bash
python3 - <<'PY'
import json,collections
posts=json.load(open('/tmp/apify-ig-snapshot.json'))
# исключаем явных артистов/селеб по категории/био (дополняется в EXCLUDE)
EXCLUDE={}  # сюда — хэндлы известных армянских артистов/певцов/актёров
agg=collections.defaultdict(lambda:{'posts':0,'eng':0})
for p in posts:
    u=(p.get('ownerUsername') or '').lower()
    if not u or u in EXCLUDE: continue
    likes=p.get('likesCount') or 0; views=p.get('videoViewCount') or 0; comm=p.get('commentsCount') or 0
    agg[u]['posts']+=1; agg[u]['eng']+=max(likes,views)+comm*3
top=sorted(agg.items(),key=lambda kv:kv[1]['eng'],reverse=True)[:10]
for i,(u,s) in enumerate(top,1):
    print(f"{i}. @{u}  посты:{s['posts']}  вовлечение:{s['eng']}")
PY
```

**Фильтр «без артистов» (правило):** исключать аккаунты с категорией IG *Musician/Artist/Public figure* и явных певцов/актёров; оставлять комьюнити/мемы/еду/культуру/юмор/медиа. Найденных артистов дописывать в `EXCLUDE` (растущий денай-лист) и в `brand/competitors.md` с пометкой «артист — исключён».

## Свои метрики через scraping (вместо IG Graph API) — решение владельца
Официальный IG Graph API-токен настраивать НЕ обязательно. Свой аккаунт **@mosarmclub** берём тем же Apify-скрапером, что и конкурентов (он ходит в любой публичный профиль). Один `APIFY_TOKEN` — и свои, и чужие.
- **Доступно скрапингом (публичное):** подписчики, кол-во постов, лайки/комменты на пост, просмотры рилсов (plays), частота/время постинга, ER-грубо (лайки+комменты / подписчики).
- **НЕ доступно (только IG Graph API):** охват/показы (reach/impressions), **сохранения (saves)**, шеры, заходы в профиль, клики, метрики Stories, демография. Их Аналитик помечает «нет данных» (НЕ выдумывает).
- IG Graph API подключаем позже, когда нужны saves/reach/демография (разовая настройка под свой Business-аккаунт).
- Умеренность: свой аккаунт тоже ≤1–2 прогона/день, `resultsLimit ≤50`; публичный профиль — риск низкий, но не частить.

## Свой аккаунт всегда в выборке + разделение ours/competitors (ОБЯЗАТЕЛЬНО)
`SELF_HANDLE="mosarmclub"` — наш IG. К **любой** IG-разведке добавляй свой профиль и помечай его показатели «НАШИ», отдельно от конкурентов.

```bash
APIFY="${APIFY_TOKEN:-${APIFY_API_KEY:-}}"
SELF_HANDLE="mosarmclub"
# Свой профиль (всегда): профиль + последние посты (followers через addParentData)
curl -s -X POST "https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=$APIFY&timeout=180" \
  -H "Content-Type: application/json" \
  -d "{\"directUrls\":[\"https://www.instagram.com/$SELF_HANDLE/\"],\"resultsType\":\"posts\",\"resultsLimit\":12,\"addParentData\":true}" \
  > /tmp/apify-ours.json
```

Разбор: всё, где `ownerUsername == SELF_HANDLE` → блок **«НАШИ»**; остальное (хэштеги/конкуренты из других прогонов) → **«Конкуренты»**.
```bash
python3 - <<PY
import json,os
SELF=os.environ.get("SELF_HANDLE","mosarmclub").lower()
ours=json.load(open('/tmp/apify-ours.json'))
posts=[p for p in ours if (p.get('ownerUsername') or '').lower()==SELF]
likes=sum((p.get('likesCount') or 0) for p in posts)
views=sum((p.get('videoViewCount') or 0) for p in posts)
comm=sum((p.get('commentsCount') or 0) for p in posts)
foll=next((p.get('ownerFullName') and (p.get('ownerFollowersCount') or p.get('followersCount')) for p in ours), None)
print(f"НАШИ @{SELF}: постов={len(posts)} лайки={likes} просмотры={views} комменты={comm} подписчиков={foll}")
print("Нет данных (только IG Graph API): saves, reach, шеры, демография — НЕ выдумывать.")
PY
```
> В отчёте Аналитику/Директору: два раздела — «НАШИ (@mosarmclub)» и «Конкуренты». Свой профиль в выборку добавляется **автоматически**, даже если директор просил «найди конкурентов».
> Экономия: свой профиль — один дешёвый прогон, `resultsLimit ≤12`; не частить.

## После прогона
- Снапшот — во временную папку (`/tmp`), НЕ в git. В `brand/competitors.md` — только итог (топ-аккаунты + почему интересны).
- В отчёте указать: сколько постов стянули, сколько прогонов (должно быть **1**), прикидку расхода (runs × CU × $/CU) — без значения ключа.
- TikTok — аналогично дешёвым актором (`clockworks~tiktok-scraper` и т.п.) с тем же `resultsLimit ≤50`, когда понадобится.
