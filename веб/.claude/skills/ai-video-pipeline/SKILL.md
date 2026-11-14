---
name: ai-video-pipeline
description: AI-комикс 9:16 из сценария, character references, keyframes и motion-плана.
---

# AI-video pipeline

## Обязательный порядок

1. Сценарий: hook 0–2 секунды, драматургия, CTA.
2. Character/style bible: персонажи, одежда, палитра, локации и continuity.
3. Shot list: 8–16 сцен, длительность, крупность, действие, motion и текст.
4. Keyframes: изображения генерируются без текста, логотипов и social UI.
5. Motion: Remotion для композиции и лёгких движений; FFmpeg для нормализации и финального H.264/AAC.
6. QA: continuity, safe zones, читаемость, звук, фактическое воспроизведение.
7. Editor gate и явный апрув владельца до публикации.

## Вход владельца

Тема, язык, длительность, character references, CTA, музыка/голос и права на материалы.

## Текущий статус

Studio-модуль и scene-plan контракт готовы. Реальный image-generation worker и BullMQ/Remotion render — следующий инженерный тикет.
