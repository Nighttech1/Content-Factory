# Architect spec — C-16

> Заполняет **Архитектор** до любого кода. Mid-flight → стоп → обновить этот файл + `chain.md`.

## Goal

Greenfield bootstrap Prisma + модель **`PostAnalytics`** (DEV_PLAN **5.5** / ARCHITECTURE §6) с минимальными `User` / `ContentJob` / enums, чтобы C-17 мог писать снимки метрик, а C-18 — читать агрегаты. Localhost должен работать **без Docker** через fallback-репозиторий.

## In scope

- Bootstrap `prisma/` (сейчас **нет** папки):
  - `prisma/schema.prisma` — provider **`postgresql`** (канон ARCHITECTURE).
  - Модели/enums **строго по форме** ARCHITECTURE §6 (см. Contracts ниже) — реализация тела схемы = Backend, не Архитектор.
  - Первая **additive** миграция через `safe-db-migrations` (только CREATE TABLE / indexes; **запрет** `migrate reset`, DROP, wipe volumes).
- Минимальный data-access слой:
  - `lib/db/prisma.ts` — PrismaClient singleton (lazy).
  - `lib/db/analytics-repository.ts` — интерфейс чтения/записи `PostAnalytics` (+ опц. seed User/ContentJob).
  - **Fallback:** если `DATABASE_URL` отсутствует / Prisma connect fails → **JSON-file** store `data/local/post-analytics.json` (gitignored) **или** in-memory Map с тем же интерфейсом. Клиентская приёмка не требует Docker Postgres.
- Seed: `prisma/seed.ts` **или** `scripts/seed-analytics-fixtures.ts` — 1 User (ADMIN), 2–3 `ContentJob` status `PUBLISHED`, 4–8 снимков `PostAnalytics` с разными `platform` / `moduleId`-связью через `contentJobId`. Empty-safe (повторный seed идемпотентен по стабильным ids).
- `.env.example` (без секретов): `DATABASE_URL`, комментарии к `REDIS_URL`, IG/YT/LLM keys (заполняет C-17/C-18).
- `package.json`: deps `prisma`, `@prisma/client`; scripts `db:generate`, `db:migrate`, `db:seed` (имена на усмотрение Backend, но задокументировать в `decisions.md` тикета при отклонении).

## Out of scope

- Cron / BullMQ / Instagram / YouTube adapters → **C-17**.
- Analyst LLM / insights API / FE wire → **C-18**.
- UI `/analytics`, mock store rewrite (кроме опционального read-only re-export типов — не трогать `lib/analytics-mock.ts` / store).
- Docker-compose обязательный; wipe/recreate volumes; prod deploy.
- Полный product schema beyond User/ContentJob/PostAnalytics (нет Brand Kit, Mesh telemetry tables и т.д.).

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Prisma bootstrap + repo + seed + `.env.example` | **Backend** | skills: `prisma-content-schema`, `safe-db-migrations`, `backend` |
| QA | Tester → Fixer | schema shape + fallback path + no secrets in git |
| Localhost | Deployer | app starts; optional `db:generate` |
| Приёмка | Client | schema/repo готов под ingest; без Docker OK |

## Contracts

### Schema shape (document — Backend implements)

```prisma
// provider = postgresql; url = env("DATABASE_URL")

model User { ... }           // id cuid, email unique, name, role Role, contentJobs, createdAt
enum Role { OWNER ADMIN }
model ContentJob { ... }     // per ARCHITECTURE §6 incl. analytics PostAnalytics[]
enum JobStatus { QUEUED RESEARCHING GENERATING_COPY RENDERING_MEDIA
                 AWAITING_APPROVAL READY_TO_PUBLISH PUBLISHED FAILED }
model PostAnalytics {
  id, postId, platform, views, saves, shares,
  retentionCurve Json?, capturedAt, contentJobId?, contentJob?
  @@index([postId, platform, capturedAt])
}
```

### Repository interface (conceptual)

```ts
// lib/db/analytics-repository.ts
upsertSnapshot(input: PostAnalyticsWrite): Promise<PostAnalyticsRow>
listByPost(postId: string, platform?: string): Promise<PostAnalyticsRow[]>
listLatest(limit: number): Promise<PostAnalyticsRow[]>
aggregateForKpi(since: Date): Promise<{ views: number; saves: number; shares: number; /* ... */ }>
// Backend chooses exact field names; must support C-17 write + C-18 read aggregates
```

### Env

| Var | Required for | Notes |
|-----|----------------|-------|
| `DATABASE_URL` | Prisma path | e.g. `postgresql://user:pass@localhost:5432/content_factory` |
| _(absent)_ | Fallback path | JSON/in-memory; log once at boot: `analytics-store=fallback` |

### Path lock

| May edit | Must not edit |
|----------|---------------|
| `prisma/**` | `components/**`, `app/(ui)/**` analytics UI |
| `lib/db/**` | `lib/analytics-mock.ts`, `lib/analytics-store.ts` |
| `.env.example` | `.env` (local only; never commit secrets) |
| `package.json` / lockfile (prisma deps + scripts) | workers/analyst prompts (C-18) |
| `data/local/.gitignore` (ignore json db) | Docker volume wipe scripts |

## Acceptance criteria (язык Клиента)

1. В репо есть `prisma/schema.prisma` с `PostAnalytics` + User/ContentJob как в ARCHITECTURE.
2. Миграция **additive**; нет `migrate reset` / DROP в инструкциях и скриптах тикета.
3. Без `DATABASE_URL` приложение **не падает**: fallback пишет/читает снимки (проверка Tester unit или smoke script).
4. Seed даёт ≥1 published job и несколько снимков метрик (или fallback seed).
5. В git нет реальных ключей; только `.env.example`.

## Safety

- **Запрет:** `prisma migrate reset`, `DROP`, truncate shared DB, delete Postgres/Redis volumes.
- Secrets только `.env` (gitignored).
- Fallback file вне git (`data/local/`).

## Risks

- Greenfield: Backend может захотеть SQLite provider — **отклонено** (см. `decisions.md`); только postgresql + fallback repo.
- Dual store drift — один интерфейс `analytics-repository`; Prisma и fallback за ним.

## Mid-flight escalation

Нужен docker-compose snippet → обновить `decisions.md`, не делать wipe. Нужны лишние модели → новый тикет, не раздувать C-16.
