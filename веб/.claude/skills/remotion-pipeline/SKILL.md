---
name: remotion-pipeline
description: >-
  Remotion cartoon/video reels pipeline: 9:16 compositions, voiceover sync, subtitles (Module 3). Use for video composition work.
---

# Remotion Pipeline — Cartoon / Video Reels

## When

Module 3 `cartoon-reels`, видеокомпозиции 9:16, voiceover sync, субтитры.

## Rules

1. Композиции в React-коде Remotion; превью в Studio Inspector.
2. Выход: `video_9_16` (1080×1920 или согласованный preset).
3. Тяжёлый рендер — только через BullMQ worker, не блокировать Next.js request.
4. Прогресс рендера → SSE события `RENDERING_MEDIA`.
5. Согласовать палитру клуба и армянские шрифты в текстовых слоях.

## Related

- Motion UI оболочки плеера: `web-motion-engine`
- Очередь: `bullmq-job-queue`
- HITL preview: Inspector Left Deck
