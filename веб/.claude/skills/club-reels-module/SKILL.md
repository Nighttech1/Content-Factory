---
name: club-reels-module
description: >-
  Модуль снятых рилсов клуба (club-reels): пользователь снимает сам, ИИ режет и добавляет моушн.
  Регистрация в registry + capcut-gate allowlist + loop «правки → правила» (style-memory).
  Не cartoon (Remotion) и не heygen (аватар) — это ЖИВОЙ отснятый материал.
---

# Club Reels — модуль снятых рилсов (Vernatun)

## When

Новый core-модуль **`club-reels`**: исходник = реальная съёмка клуба (не генерация). Пайплайн: Сценарист → съёмка → загрузка → автомонтаж + моушн → правки → рендер 9:16.
Отличие от соседей: `cartoon-reels` = Remotion 2D-генерация; `heygen-reels` = аватар; **`club-reels` = живое видео пользователя**.

## Регистрация (3 точки, иначе модуль «невидим»)

1. **Манифест** `src/modules/club-reels/manifest.ts` — `id:"club-reels"`, `outputFormat:"video_9_16"`, `title`, `description`, `icon`. Экспорт в `src/modules/manifests.ts`.
2. **Адаптер** `src/modules/club-reels/index.ts` → `IContentModule` (`content-module-sdk`); регистрация в `src/modules/registry.ts`.
3. **CapCut-гейт** `lib/studio/capcut-gate.ts` → добавить `"club-reels"` в `CAPCUT_MODULE_IDS`, иначе edit-shell вернёт `notFound()`.

UI-плитка подтянется из манифеста (`components/studio/modules.ts`), badge `9:16 · Съёмка`.

## Loop «правки → правила» (ядро ценности)

Пользователь даёт правки словами → они становятся **будущими правилами монтажа**. Канон уже есть, не переписывать:

| Шаг | Код |
|-----|-----|
| Из фидбэка предложить правило | `proposeRuleFromFeedback({feedback, sourceReelId})` → `status:"proposed"` |
| Пользователь подтверждает | `POST /api/reels/rules {action:"confirm"}` → `status:"active"` |
| Отклоняет | `{action:"reject"}` → `status:"disabled"` |
| Конфликты | `findConflicts()` — **не** авто-удалять, показать на ручное разрешение |
| Применять к монтажу | `activeRulesFor(styleProfileId)` в `creative-director` / `timeline-builder` |

Правило = `MontageRule {category, scope (all|style_profile), scopeRef, priority, condition}`. Активные правила **всегда** подмешиваются в автомонтаж следующего рилса → система «учится вкусу» клуба.

## Пайплайн модуля

```
Сценарист (reels-scriptwriter-workspace)
  → сценарий contentType:reels
  → съёмка → /sources → footage-analyzer (сцены/пригодность)
  → generateScriptAndStoryboard → MontageProject
  → ensureBasicMotionScenes (титры/моушн) + insert-finder (B-roll)
  → runQualityChecks (есть hook/beats/CTA? STRICT)
  → редактор (reels-timeline-editor) ручная доводка
  → ffmpeg-render → MP4 1080×1920 (BullMQ + SSE)
  → правки → proposeRuleFromFeedback → активные правила
```

## Жёсткие правила

- **Zero data loss** на исходники пользователя (`backend/zero-data-loss`): загруженную съёмку не перезаписывать/не удалять без явного действия; версии сценария/ревизии сохранять.
- **No mock success:** нет ffmpeg / нет hook / провал quality — честная ошибка, не зелёный мок.
- Палитра клуба + армянские шрифты в титрах (`brand`).
- Снятый материал — не Remotion и не HeyGen путь (не подменять рендер).

## Выход роли

`🎥 **CLUB-REELS:** [registry: y/n, gate: y/n, loop правила: active N, пайплайн: script→sources→montage→render]`

## Related

- `reels-scriptwriter-workspace` — вход (чат + исходники)
- `reels-timeline-editor` — ручной монтаж
- `reels-scriptwriter` — драматургия
- `content-module-sdk` — контракт модуля
- `backend/zero-data-loss`, `bullmq-job-queue`, `sse-job-stream`
