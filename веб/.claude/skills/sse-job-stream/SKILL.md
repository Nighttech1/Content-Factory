---
name: sse-job-stream
description: >-
  SSE job stream: useJobStream(jobId), GenerationDrawer live log, render progress (Sprint 7). Use for live job-streaming UI and backend.
---

# SSE Job Stream

## When

GenerationDrawer live log, прогресс рендера, `useJobStream(jobId)` (Спринт 7).

## Contract

- Endpoint вида `GET /api/jobs/:id/stream` (text/event-stream).
- События: `{ status, agent, message, progress }`.
- Клиент: TanStack Query + EventSource; reconnect с last-event-id.
- Не дергать polling чаще SSE, если SSE доступен.

## UI mapping

Researcher / Hook Writer / Script Writer / Designer сообщения как в DEV_PLAN §2.3.
