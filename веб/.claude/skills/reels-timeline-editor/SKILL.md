---
name: reels-timeline-editor
description: >-
  CapCut-аналог: NLE timeline-редактор рилсов 9:16 в Studio. Дорожки/клипы, trim/split/ripple,
  playhead, waveform, snap, overlay/motion-слой. Wired to MontageProject schema + ffmpeg render.
  Не mock. Для club-reels / cartoon-reels / heygen-reels edit-shell.
---

# Reels Timeline Editor — CapCut-аналог (9:16)

## When

Edit-shell `app/studio/[moduleId]/edit/[draftId]/page.tsx` → `components/studio/editor/CapCutEditorShell.tsx`.
Любой монтаж снятого/сгенерированного материала в таймлайн. **Снять mock** (`MOCK_LAYERS`/`MOCK_CLIPS`) и подключить к реальным данным.
Не путать: контент/драматургия сценария — `reels-scriptwriter`; оболочка чата — `reels-scriptwriter-workspace`.

## Источник правды (НЕ выдумывать модель)

Таймлайн — это рендер `MontageProject` (`lib/studio/reels-framework/montage-schema.ts`). Редактор читает/пишет **только** эти сцены:

| Scene `type` | Дорожка в UI | Поля, которые редактор двигает |
|--------------|--------------|-------------------------------|
| `video` | V1 (основное видео) | `source_start` / `source_end` (trim), `asset_id`, `transition`, `caption`, `effects[]` |
| `insert` | V2 (B-roll/вставки) | `duration`, `asset_id`, `audio_enabled`, `reason` |
| `title` | T (титры) | `parameters.text/fontSize/color/position`, `duration` |
| `motion_graphic` | MG (моушн) | `template_id`, `parameters{}`, `duration` |
| `endcard` | T (финал-CTA) | `parameters.text/cta`, `duration` |
| `audio_bed` | A (музыка) | `asset_id`, `volume (0–1)` |

`transition ∈ cut|fade|xfade`. `effects[] = {type, params}`. LLM **никогда** не присылает исполняемый код — только JSON через Zod-гейт. Версия схемы `MONTAGE_SCHEMA_VERSION`.

## Обязательные жесты редактора (CapCut-паритет)

| Жест | Что делает | Правка в схеме |
|------|-----------|----------------|
| **Trim** края клипа | тянем левый/правый хэндл | `source_start`/`source_end` или `duration` |
| **Split** на playhead | `S` / ножницы | один `video` → два со сдвигом `source_*` |
| **Ripple delete** | удалить + сдвинуть хвост | убрать сцену, пересчитать таймкоды |
| **Drag-reorder** | перетащить клип | порядок сцен в массиве (`@dnd-kit` уже в deps) |
| **Snap** к playhead/краям | магнит ≤8px | только UI, не меняет схему без дропа |
| **Overlay add** | + Title / + Motion / + Insert | вставить соотв. scene |
| **Playhead scrub** | клик/драг по линейке | `currentTime` стора |
| **Zoom таймлайна** | `+`/`-` / pinch | px-per-second |

Хоткеи (desktop): `Space` play/pause, `S` split, `Del` ripple, `←/→` кадр, `Shift+←/→` 1s, `[`/`]` in/out. На мобиле — тач-хэндлы, long-press контекст; см. `mobile-touch-scroll` для инерции линейки.

## Превью и рендер

1. Превью — `<video>` + абсолютные overlay-слои (title/motion) поверх, синхрон по `currentTime`. Не рендерить ffmpeg на каждый кадр.
2. Финальный рендер — **только** `pipeline/render/ffmpeg-render.ts` (→ MP4 1080×1920), тяжёлый путь через BullMQ worker + SSE `RENDERING_MEDIA` (`bullmq-job-queue`, `sse-job-stream`). Не блокировать Next.js request.
3. `ffmpegAvailable()` перед рендером; нет бинаря → явная ошибка, не «успех»-mock. `FFMPEG_PATH`/`FFPROBE_PATH` из env.
4. Waveform — из `ffprobe`/декода аудио дорожки, кэшировать per `asset_id`.

## Гейт доступа

`lib/studio/capcut-gate.ts` → `CAPCUT_MODULE_IDS`. Edit-shell открывается только для модулей в allowlist. Новый снятый модуль (`club-reels`) добавляется туда явно (см. `club-reels-module`). Чужой `moduleId` → `notFound()`.

## Моушн-слой

Титры/моушн-графика — сцены `title` / `motion_graphic`, не захардкоженные div. Пресеты моушна и тайминги — `pipeline/motion/basic-titles.ts` (`ensureBasicMotionScenes`) + словарь `animation-vocabulary`; качество движения — `emil-animate` / `web-perf-motion`. Палитра клуба и армянские шрифты в текстовых слоях обязательны (`brand`).

## Выход роли

`🎞️ **EDITOR:** [дорожки live|mock, trim/split/ripple: ok, рендер: ffmpeg-queue|—, моушн-слой: scenes|div]`

## Related

- `club-reels-module` — модуль снятых рилсов (владелец данных)
- `reels-scriptwriter-workspace` — где рождается сценарий до монтажа
- `remotion-pipeline` — только для cartoon-reels (React-композиции), не для снятого материала
- `bullmq-job-queue`, `sse-job-stream` — очередь и прогресс рендера
