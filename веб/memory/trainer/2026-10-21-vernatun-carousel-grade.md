# Тренер — грейд готовности · Vernatun carousel rebuild

**Дата:** 2026-10-21  
**Грейд:** B (можно строить; закрыть пробелы в skills по ходу)

## Пробелы

| Gap | Действие |
|-----|----------|
| GPT-6 не существует в каталоге Polza | role-models: default `openai/gpt-4o` / `openai/gpt-5.4` если slug доступен; конфиг без хардкода |
| Старый layered_html пересекается с ТЗ Mode A | Product path → vernatun-carousel; archaeology gates off |
| Нет Image Planner / ASSET_MANIFEST / repair×3 | Новые модули в `lib/studio/vernatun-carousel/` |
| Delete draft в UI отсутствует | store + DraftsPanel trash |
| Mode A/B switch отсутствует | CreateCarouselModal + mesh designer drawer |

## Skills усилить

- `content-pipeline-agents` — Vernatun flow A/B
- `art-director` — двупроходный AD + defects schema
- `carousel-json-contract` — script JSON Vernatun

**Вердикт Тренера:** волна full-queue разрешена (пользователь снял лимит).
