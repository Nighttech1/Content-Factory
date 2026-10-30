# Addendum — Sprint 9: карусели + рилсы IG/YT (2026-10-15)

**Роль:** Архитектор  
**Тип:** docs-only  
**Файлы:** `DEV_PLAN.md`, `knowledge/area_content_factory/_index.md` (one-liner), этот addendum.

## Запрос пользователя

1. В **Sprint 9** фокус **только** на:
   - Instagram carousels (`carousel-engine`);
   - Reels для Instagram **и** YouTube (`custom-reels` / reels path — vertical 9:16 viral script + существующий render; **не** HeyGen/cartoon/aesthetic/articles).
2. Остальные модули → новый **Sprint 23** «Остальные модули».
3. Планка качества: **как Claude Code** — один сильный промпт → острые красивые карусели; то же для вирусных каруселей и рилсов (hooks 0–2с, value beats, CTA, swipe/meta, brandbook, no purple slop). Опора: **S44–S46 HARD** + golden fixtures.

## Что изменилось в DEV_PLAN

### Sprint 9 — новое название и чеклист

**«Карусели + рилсы IG/YT — качество как Claude Code»**

| # | Заголовок пункта |
|---|------------------|
| 9.1 | Инвентарь live vs chrome (только carousel + reels) |
| 9.2 | Золотые эталоны каруселей (golden fixtures) |
| 9.3 | Золотые эталоны рилсов (hook / beats / CTA) |
| 9.4 | Scriptwriter карусели: hook, CTA 1–4, swipe_trigger meta |
| 9.5 | Designer: brandbook + панорама→slice + anti-slop |
| 9.6 | Reels scriptwriter (IG + YouTube Shorts) |
| 9.7 | Viral contracts: STRICT JSON карусель + reels schema |
| 9.8 | Claude-Code-level: prompt packs + few-shots + critic loop |
| 9.9 | Smoke: Razbor → Create → Draft (карусель) + reels path |
| 9.10 | Scorecard качества (eval) |
| 9.11 | Цикл фикса при провале планки |

**Убрано из Sprint 9:** глубокая прокачка Analyst / Marketing Director / Trainer (старый 9.9); матрица «всех модулей» как размытие фокуса (статус прочих moduleId = «→ Sprint 23»).  
**Влито из старого Sprint 17:** custom-reels сценарий → **9.6**.

### Sprint 23 — что перенесено

| Было (14–19) | Куда в 23 |
|--------------|-----------|
| 14 HeyGen E2E | 23.1–23.5 |
| 15 Cartoon Remotion | 23.6–23.10 |
| 16 Aesthetic-graphics | 23.11–23.15 |
| 17 custom-reels | **не отложено** — в Sprint 9.6 |
| 18 site-articles / tg-articles | 23.16–23.20 |
| 19 clips-to-reels, info-video, mesh parity, SDK depth | 23.21–23.25 |

### Слоты 14–19

В таймлайне сжаты до placeholder **«отложено → Спринт 23»**. Нумерация 20–22 сохранена.  
Sprint 22 = публикация **карусель/рилс** после HITL. Sprint 23 = остальные модули **после** publish gate карусель/рилс.  
Sprint 8 done и UI shell freeze — без изменений духа.

## Инварианты

- Docs-only: продуктный код не трогали.  
- Не стартовать Sprint 22, пока Sprint 9 не green по **обоим** путям (carousel + reels).  
- Не тащить HeyGen/Cartoon/Aesthetic/статьи обратно в Sprint 9.
