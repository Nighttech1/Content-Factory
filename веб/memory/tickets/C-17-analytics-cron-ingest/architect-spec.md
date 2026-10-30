# Architect spec — C-17

> Заполняет **Архитектор** до любого кода. Mid-flight → стоп → обновить этот файл + `chain.md`.

## Goal

Ежедневный (или repeatable) **ingest** метрик Instagram + YouTube в `PostAnalytics` (DEV_PLAN **5.4**). Localhost работает без Redis и без API keys через **mock adapters** + тот же job handler.

## Depends on

**C-16 Backend Done** (repository + schema/fallback). Не начинать до зелёного C-16 chain Backend.

## In scope

- Job handler `lib/analytics/ingest-post-metrics.ts` (имя на усмотрение Backend):
  1. Resolve list of published posts (from `ContentJob` where `status=PUBLISHED` **or** seed list / env allowlist).
  2. For each post × platform → adapter.fetchMetrics → `analyticsRepository.upsertSnapshot`.
  3. Idempotent key: `(postId, platform, capturedAt day bucket)` или overwrite same calendar day — Backend выбирает одно; задокументировать в ticket `decisions.md` update if needed.
- Adapters (interface + two impls + mocks):
  - `lib/analytics/adapters/types.ts` — `PlatformMetricsAdapter`.
  - `instagram-graph.ts` — Instagram Graph API (real when env present).
  - `youtube-analytics.ts` — YouTube Analytics API (real when env present).
  - `mock-platform.ts` — deterministic fixtures (views/saves/shares + sample `retentionCurve`).
- Scheduler dual-path:
  - If `REDIS_URL` present → BullMQ **repeatable** job (skill `bullmq-job-queue`), queue name e.g. `analytics-ingest`, cron `0 6 * * *` (06:00 UTC) or daily equivalent.
  - Else → `node-cron` (or Next.js instrumentation / `scripts/run-analytics-ingest.ts`) calling **the same handler**.
- Manual trigger for QA: `POST /api/analytics/ingest` (or `scripts/…`) — guarded (dev-only or simple `INGEST_SECRET` header from env); no secrets in response body.
- `.env.example` append: `REDIS_URL`, `IG_ACCESS_TOKEN` / `INSTAGRAM_GRAPH_TOKEN`, `YOUTUBE_API_KEY` / OAuth placeholders, `INGEST_SECRET` (optional).
- package.json: `bullmq`, `ioredis` (or project Redis client), `node-cron` as needed.

## Out of scope

- Prisma schema changes beyond tiny additive columns (prefer none; escalate to Architect).
- Analyst LLM / InsightsFeed → **C-18**.
- Publishing to social networks; HITL approve flow.
- Real OAuth UI for IG/YT (tokens via `.env` only).
- Mesh QueueNode live telemetry wiring (nice-to-have log only).

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Ingest job + adapters + scheduler + trigger route/script | **Backend** | `bullmq-job-queue`, `backend`; uses C-16 repository |
| QA | Tester → Fixer | mock path without keys; writes PostAnalytics; no secret leak |
| Localhost | Deployer | one manual ingest smoke |
| Приёмка | Client | после ingest снимки есть (fallback OK) |

## Contracts

### Adapter

```ts
type PlatformId = "instagram" | "youtube";

type MetricsSnapshot = {
  postId: string;
  platform: PlatformId;
  views: number;
  saves: number;
  shares: number;
  retentionCurve?: { tSec: number; retentionPct: number }[];
  capturedAt: Date;
  externalPostId?: string;
};

interface PlatformMetricsAdapter {
  platform: PlatformId;
  isConfigured(): boolean; // env keys present
  fetchMetrics(posts: { postId: string; externalId?: string }[]): Promise<MetricsSnapshot[]>;
}
```

### Selection rule

```
for each platform adapter:
  if adapter.isConfigured() → real
  else → mock adapter for that platform
```

Both platforms must produce at least one snapshot in mock mode on a full ingest run (seed posts exist from C-16).

### Scheduler

| Condition | Mechanism |
|-----------|-----------|
| `REDIS_URL` set | BullMQ repeatable → same `runAnalyticsIngest()` |
| else | `node-cron` in-process **or** documented CLI cron; same handler |

### Path lock

| May edit | Must not edit |
|----------|---------------|
| `lib/analytics/**` | `prisma/schema.prisma` (unless Architect amends) |
| `app/api/analytics/ingest/route.ts` (or script) | `components/**`, InsightsFeed |
| `lib/db/analytics-repository.ts` (only if need new query helpers) | `workers/analyst/**` (C-18) |
| `.env.example`, `package.json` | `.env` secrets commit |

## Acceptance criteria (язык Клиента)

1. Без IG/YT ключей ingest отрабатывает и пишет реалистичные снимки в PostAnalytics (Prisma **или** fallback).
2. Без Redis планировщик всё равно может запустить тот же handler (cron или manual POST/script).
3. С Redis — BullMQ job зарегистрирован (smoke: enqueue once).
4. Секреты не в логах/git; ответы API без токенов.
5. Повторный ingest за день не раздувает хаос (идемпотентность / day-bucket).

## Safety

- No migrate reset / DROP / volume wipe.
- Adapters never log access tokens.
- Manual ingest endpoint not a public unauthenticated write in prod posture (secret or NODE_ENV=development).

## Risks

- Next.js serverless may not keep `node-cron` alive — prefer also shipping `scripts/run-analytics-ingest.ts` for localhost/Deployer; document in decisions.
- Missing published jobs → mock adapter seeds synthetic postIds tied to C-16 seed.

## Mid-flight escalation

Need schema column (e.g. `followers`) → Architect amends C-16/C-17; Backend does not freestyle DROP/rename.
