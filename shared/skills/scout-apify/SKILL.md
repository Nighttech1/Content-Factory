---
name: scout-apify
description: IG/TikTok разведка через Apify (free-план, pay-per-result) с жёсткой экономией кредитов. Ключ APIFY_TOKEN из окружения (вступает в силу на старте сессии). Один закапанный прогон → снапшот; resultsLimit ≤50; soft-fail без retry-storm. Использует Разведчик для поиска виральных аккаунтов/контента и мониторинга конкурентов IG/TikTok.
---

# Скилл: разведка IG/TikTok через Apify (бюджет прежде всего)

Ключ — `APIFY_TOKEN` в окружении (НЕ в git, не эхоить значение). **Секрет виден только в сессии, стартовавшей после его добавления.** Проверка:
```bash
test -n "$APIFY_TOKEN" && echo "ключ есть" || echo "НЕТ ключа — ключ подхватится в НОВОЙ сессии (секреты вступают на старте)"
```
Free-план ≈ $5 кредитов/мес. **Цель — укладываться в бесплатное.**

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
# 1) ОДИН синхронный прогон: топ-посты по армянским хэштегам (≤12 на хэштег × 4 = ≤48)
curl -s -X POST "https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/run-sync-get-dataset-items?token=$APIFY_TOKEN&timeout=180" \
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

## После прогона
- Снапшот — во временную папку (`/tmp`), НЕ в git. В `brand/competitors.md` — только итог (топ-аккаунты + почему интересны).
- В отчёте указать: сколько постов стянули, сколько прогонов (должно быть **1**), прикидку расхода (runs × CU × $/CU) — без значения ключа.
- TikTok — аналогично дешёвым актором (`clockworks~tiktok-scraper` и т.п.) с тем же `resultsLimit ≤50`, когда понадобится.
