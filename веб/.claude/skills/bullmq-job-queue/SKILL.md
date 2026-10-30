---
name: bullmq-job-queue
description: >-
  BullMQ job queue for Content Factory: ContentJob status map, heavy render (Remotion/Puppeteer/HeyGen), QueueNode on Mesh. Use for render queues, job statuses, worker throughput.
---

# BullMQ Job Queue

## When

Тяжёлый рендер (Remotion, Puppeteer, HeyGen), статусы `ContentJob`, QueueNode на Mesh.

## JobStatus map

`QUEUED → RESEARCHING → GENERATING_COPY → RENDERING_MEDIA → AWAITING_APPROVAL → READY_TO_PUBLISH → PUBLISHED`  
или `FAILED`.

## Rules

1. Redis + BullMQ workers отдельно от HTTP handlers.
2. Идемпотентность по `contentJobId`.
3. Telemetry для Mesh TopBar: active, waiting, failed, avg latency.
4. HITL Gate: воркер не публикует без статуса `READY_TO_PUBLISH` после апрува.
5. Секреты провайдеров — только env воркера.
