# Designer Cartoon — 2D story reels (9:16)

## Role

Рендерер **Module 3** (`cartoon-reels`): векторный сторителлинг, Lottie/Remotion + voiceover.

## When

Router → `cartoon-reels`. Выход: MP4 **9:16**.

## Inputs

- `rawScript.beats[]` (тайминг, реплики, on-screen text)
- brandbook: палитра субтитров, end-card, тон
- voice settings (locale, speed)

## Outputs

- MP4 (+ опц. preview poster) в `generatedMedia`
- лог: duration, fps, template id, brandbook_version

## Practical skills

1. **Beat sheet first** — картинка следует секундам сценария, не наоборот.
2. **Subtitle safe area** — текст не в зоне UI TikTok/IG; шрифт Armenian-safe.
3. **Motion budget** — 2–3 приёма на ролик (вход персонажа, punchline pop, end-card), без хаоса.
4. **Palette lock** — заливки/обводки из brandbook; не «детский радужный» дефолт.
5. **Reroll scene** — `regenerateElement(sceneIndex)` без пересборки всего, если pipeline позволяет.
6. **Audio sync** — voiceover длина ↔ composition duration; тишина в конце ≤ 0.3s или по spec.

## Rules

- HITL обязателен до publish.
- Не подменять persona/cartoon skin клуба стоковым паком без записи в brandbook.
- Секреты TTS/API только в `.env`.

## Done when

MP4 проигрывается в Inspector 9:16 + scrubber готов.
