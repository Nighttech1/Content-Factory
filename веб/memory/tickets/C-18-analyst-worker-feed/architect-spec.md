# Architect spec — C-18

> Заполняет **Архитектор** до любого кода. Mid-flight → стоп → обновить этот файл + `chain.md`.

## Goal

Живой контур **The Analyst** (DEV_PLAN **5.6**): воркер читает агрегаты `PostAnalytics` → LLM (или mock) → инсайты; API отдаёт feed (+ опц. KPI/retention); Frontend `InsightsFeed` (и желательно KPI) грузит с API с **fallback на существующий mock**.

## Depends on

1. **C-16** Backend Done (repository).  
2. **C-17** Backend Done (at least one ingest run / seed snapshots available).

Serial: AI Bridge starts only after C-17 Backend Done.

## In scope

### AI Bridge

- `workers/analyst/` prompt pack:
  - `prompt.md` or `system.md` + `user-template.md` — versioned (`analyst@v1`).
  - Input: aggregated metrics (per module / platform / top posts saves-views).
  - Output: structured JSON matching `AnalystInsight[]` (+ optional `promptHint` proposals — **not auto-applied**).
- Runner: `workers/analyst/run.ts` (or `lib/analyst/run-insights.ts` invoked by API):
  - Load aggregates via analytics repository.
  - If `OPENAI_API_KEY` / project LLM env present → call LLM with prompt-engineering parse.
  - Else → **deterministic mock insights** derived from numbers (e.g. highest saves post → green insight).
- HITL: never overwrite prod prompts under `workers/**` silently; proposals only as data field `promptHints[]` for future Owner review.
- Skills: `content-pipeline-agents`, `prompt-engineering`, `ai-bridge`, `workers/analyst/SKILL.md`.

### Backend

- API routes (App Router):
  - `GET /api/analytics/insights` → `{ cycleLabel, insights: AnalystInsight[], source: "llm"|"mock"|"cache", generatedAt }`
  - Optional: `GET /api/analytics/snapshot` → subset of `AnalyticsSnapshot` (kpis + retention + insights) aggregated from PostAnalytics; if aggregation thin → fill gaps from mock constants **server-side** with `source` flag.
  - Optional: `POST /api/analytics/insights/refresh` (dev/secret) to re-run analyst.
- Persist optional cache: `data/local/analyst-insights.json` or in-memory TTL — so FE refresh is cheap.
- No direct Prisma in AI Bridge — call repository / Backend service module.

### Frontend

- Wire `InsightsFeed` to fetch `/api/analytics/insights` (React Query or simple `useEffect`); on failure/empty → keep `useAnalyticsStore` / `ANALYTICS_SNAPSHOT` mock (C-13…C-15).
- Optional: KPI cards / RetentionChart hydrate from `/api/analytics/snapshot` with same mock fallback — **non-blocking** if insights live works.
- Do **not** remove mock seed; fallback is acceptance requirement.
- Path touch: `components/analytics/InsightsFeed.tsx`, optional thin `lib/analytics-api.ts` client; store may gain `hydrateFromApi` — allowed only under C-18 path lock.

## Out of scope

- Silent prod prompt overwrite / auto brandbook change.
- Social publish; Mesh editor.
- Replacing entire analytics UI redesign.
- New Prisma models for insights table (JSON cache file OK; DB table = escalate).

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Prompt + run + parse | **AI Bridge** | first in chain after C-17 |
| API routes + aggregate service | **Backend** | after AI Bridge contracts stable |
| InsightsFeed (+ optional KPI hydrate) | **Frontend** | mock fallback mandatory |
| Motion | skip unless FE breaks entrance | no new motion ticket |
| QA | Tester → Fixer | API + FE fallback; no secret leak; HITL prompt rule |
| Localhost | Deployer | `/analytics` shows insights from API or mock |
| Приёмка | Client | scenarios: feed visible; live or mock labeled OK |

## Contracts

### Insight JSON (align with `lib/analytics-mock.ts`)

```ts
type AnalystInsight = {
  id: string;
  tone: "green" | "blue" | "gold" | "terracotta";
  badge: string;
  targetLabel: string;
  body: string;
  footer: string;
};
```

### LLM output schema (AI Bridge)

```json
{
  "insights": [ { "tone", "badge", "targetLabel", "body", "footer" } ],
  "promptHints": [ { "target": "hook-writer", "fromVersion": "vN", "toVersion": "vN+1", "rationale": "..." } ]
}
```

Parse failures → mock insights from aggregates (never empty hard-fail for `/analytics`).

### Sufficiency / honesty

- If aggregates empty → return mock store-equivalent insights with `source: "mock"` and footer noting insufficient metrics (no invented platform API claims).

### Path lock

| Role | May edit | Must not edit |
|------|----------|---------------|
| AI Bridge | `workers/analyst/**`, `lib/analyst/**` (prompt/run/parse) | FE components; prisma schema |
| Backend | `app/api/analytics/**`, `lib/analytics/aggregate*.ts`, cache under `data/local/` | prompt text (owned by AI Bridge) |
| Frontend | `InsightsFeed.tsx`, optional `InsightCard.tsx`, `lib/analytics-api.ts`, minimal `analytics-store.ts` hydrate | `prisma/**`, adapters C-17, prompt files |

## Acceptance criteria (язык Клиента)

1. На `/analytics` лента Self-Learning ≥3 инсайта (как в C-15).
2. С LLM ключом — инсайты могут отличаться от seed mock; без ключа — детерминированный mock из цифр **или** fallback к UI mock.
3. Analyst **не** перезаписывает prod prompts.
4. Падение API не ломает страницу — виден mock feed.
5. Секреты LLM не в git/UI.

## Safety

- No migrate reset / DROP.
- LLM must not write DB mutations except via Backend service that only writes insights cache (not ContentJob).
- promptHints are advisory only.

## Risks

- FE types drift from mock — import shared type from `lib/analytics-mock.ts` or `lib/analytics-types.ts` (Backend/FE may extract types file under C-18 if needed).
- Over-eager KPI live wiring — keep optional; Hard REJECT only if insights feed broken.

## Mid-flight escalation

Need `Insight` Prisma model → new Architect decision; do not block feed on DB persistence.
