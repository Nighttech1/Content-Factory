---
name: scout-youtube
description: Тянет данные YouTube через YouTube Data API v3 (ключ YOUTUBE_API_KEY из окружения) — свой канал и конкурентов: подписчики, просмотры, частота загрузок, что заходит. Стоимость 0 ₽ (в рамках бесплатной квоты). Использует Разведчик (и Аналитик) для мониторинга и идей.
---

# Скилл: разведка YouTube (YouTube Data API v3)

Ключ — в окружении как `YOUTUBE_API_KEY` (НЕ в git). Квота бесплатная (10 000 ед./день по умолчанию): `search.list` = 100 ед., `channels/videos.list` = 1 ед. — предпочитай дешёвые `*.list` по id, `search` трать экономно.

## Проверка ключа
```bash
test -n "$YOUTUBE_API_KEY" && echo "ключ есть" || echo "НЕТ ключа — проверь секреты окружения"
```

## Свой канал / канал конкурента по хэндлу
```bash
curl -s "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&forHandle=mosarmclub&key=$YOUTUBE_API_KEY"
```
Отдаёт `statistics` (subscriberCount, viewCount, videoCount) и `contentDetails.relatedPlaylists.uploads` (плейлист всех загрузок).

## Последние ролики канала (что и как часто) — дёшево (1 ед.)
```bash
# UPLOADS = id плейлиста uploads из предыдущего запроса
curl -s "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=25&playlistId=$UPLOADS&key=$YOUTUBE_API_KEY"
```
Затем по собранным videoId — статистика (1 ед. на пачку до 50):
```bash
curl -s "https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=VIDEO_ID_1,VIDEO_ID_2&key=$YOUTUBE_API_KEY"
```
`viewCount/likeCount/commentCount` + даты → частота загрузок и «что заходит» (топ по просмотрам/вовлечению).

## Поиск ВСЕХ популярных каналов по теме (задание Директора) — 100 ед./запрос
Да, по заданию Директора можно находить все популярные каналы на тему (армянский язык/культура/юмор и т.д.). Два метода:

**А) Прямой поиск каналов** (быстро, но «популярность» косвенная):
```bash
curl -s "https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=армянский%20язык&maxResults=10&relevanceLanguage=ru&key=$YOUTUBE_API_KEY"
```

**Б) Через топ-видео → их каналы (точнее по «залетело»):** ищем видео `order=viewCount`, собираем `channelId`, дедуп, тянем статистику каналов и ранжируем по подписчикам/просмотрам:
```bash
curl -s "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=viewCount&q=армянский%20юмор&maxResults=25&relevanceLanguage=ru&key=$YOUTUBE_API_KEY" \
 | python3 -c "import sys,json;print(','.join({i['snippet']['channelId'] for i in json.load(sys.stdin).get('items',[])}))" > /tmp/chids.txt
curl -s "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=$(cat /tmp/chids.txt)&key=$YOUTUBE_API_KEY" \
 | python3 -c "import sys,json;ch=json.load(sys.stdin)['items'];ch.sort(key=lambda c:int(c['statistics'].get('subscriberCount',0)),reverse=True);[print(c['snippet']['title'],'—',c['statistics'].get('subscriberCount'),'подп.') for c in ch]"
```
> Проверено вживую 2026-10-30: метод А вернул школы армянского; метод Б — «Настя, это где?», MAGASHOW и др.

**Экономия квоты:** `search` = 100 ед. (из 10 000/день). 1–2 поисковых запроса на тему + дешёвые `channels.list` (1 ед.). Не гонять `search` пачками «на всякий случай».

## Правила
- Ключ только из `$YOUTUBE_API_KEY`; не вписывать в команды/логи/git, не эхоить значение.
- Беречь квоту: id-запросы (`channels/videos/playlistItems.list`) вместо `search`, где можно.
- Результаты (цифры своих/конкурентов, топ-ролики) складывать в отчёт для Директора/Аналитика; сырые дампы — во временную папку, не в git.
- 403/quotaExceeded → подождать сброс суток или сузить запросы (не плодить `search`).
