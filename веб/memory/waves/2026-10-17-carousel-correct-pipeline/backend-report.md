# Backend report — chain step 3 (carousel correct pipeline)

**Date:** 2026-10-17  
**Role:** Backend  
**SoT:** JSON under `data/local/` (no Prisma migrate / no wipe)

---

## Sheet visibility (preflight)

- Sheet ID: `1kOJ1CjMK5rNldM1IGNLdiVXqHTMeCuG35yP6_w6Y5Ls`
- Read path: public CSV `export?format=csv&gid=…`
- Meetings gid `0`: headers `Дата,Время,Место,Тема,Примечание,Статус` — sample «Кумовство» pickable when `Статус=1`, default `cta_type=3`
- Useful gid `902078005`: headers `№,topic,category,value,СТА,flag,hero` — no live `status` col → pick by non-empty topic until col added
- Smoke: `npx tsx scripts/smoke-sheet-preflight.ts` → `ok: true`, sampleTopic «Кумовство»
- Write-back: without `GOOGLE_SHEETS_WRITE=1` + creds → **local mirror** + agent log **RED** «sheet write skipped»
- Prisma: skipped (JSON SoT under `data/local/` per spec preference; no migrate reset)

---

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/intake/sheet/preflight` | Visibility: tabs, headers, sample, pickable counts |
| GET | `/api/intake/sheet/rows?mode=meetings\|useful&pickable=1` | Normalized rows |
| POST | `/api/intake/sheet/sync` | CSV → `data/local/sheet-row-mirror.json` |
| POST | `/api/intake/sheet/generate` | `{ mode, sheetRowKey, scheduleAt?, publishMode? }` → correct pipeline → Draft |
| POST | `/api/intake/sheet/cron-tick` | Auto-pick ≤limit rows → gen drafts |
| PATCH | `/api/intake/sheet/rows/:key/status` | Local mirror (+ skip Sheet write + RED) |
| GET/PUT | `/api/settings/brand` | Brand name + logoRef (+ tagline/extras) |
| GET/PUT/POST | `/api/settings/landscapes` | Character catalog list / replace / upsert |
| GET/DELETE | `/api/settings/landscapes/:number` | One character |
| GET/PUT | `/api/settings/publicist` | auto\|manual hour/minute/daysAhead |
| GET/POST | `/api/agents/logs` | List (+ `errorFlags`) / append |
| GET | `/api/agents/:id/logs` | Per-agent logs + `hasError` |
| POST | `/api/publicist/schedule` | `{ draftId, publishAt?, mode? }` → ScheduleSlot DRAFT (HITL) |

---

## Draft payload flags

```ts
{
  pipeline: "correct",
  needs_review?: boolean,
  needs_input?: boolean,
  sheetRowKey?: string,
  mode?: "meetings" | "useful",
  visionFailures?: [...],
  criticRetries?: number,
  publishMode?: "auto" | "manual",
  publishAt?: string
}
```

Pipeline: Scriptwriter → `critiqueCarouselHandoff` retry ≤2 → `runCreateCarouselDraw({ pipeline: "correct", placeholders })` → vision `needsReview` → Draft `UNPUBLISHED`.

---

## Frontend bind map

| UI | API |
|----|-----|
| Settings **Бренд** after Design | `GET/PUT /api/settings/brand` |
| Settings **Пейзажи** | `GET/PUT/POST /api/settings/landscapes` |
| Team **Логи** tab | `GET /api/agents/:id/logs` or `GET /api/agents/logs?agentId=` |
| Mesh **RED** perimeter | `errorFlags` / `hasError` from logs GET |
| Publicist time chrome | `GET/PUT /api/settings/publicist` + `POST /api/publicist/schedule` |
| Sheet intake / schedule→drafts | preflight + rows + generate / cron-tick |
| Approve to calendar queue | existing `POST /api/schedule/slots/approve` (no social) |

---

## Env keys (.env.example — no secrets)

`GOOGLE_SHEETS_ID`, `GOOGLE_SHEET_ID` (alias), `GOOGLE_SHEETS_GID_MEETINGS`, `GOOGLE_SHEETS_GID_USEFUL`, `GOOGLE_SHEETS_WRITE`, `GOOGLE_SHEETS_API_KEY`, `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON`, `CAROUSEL_PIPELINE`, `CAROUSEL_VISION_MODEL`

---

## Local JSON files

- `data/local/sheet-row-mirror.json`
- `data/local/brand-settings.json`
- `data/local/landscapes-catalog.json`
- `data/local/publicist-settings.json`
- `data/local/agent-run-logs.json`

---

`🔌 **BACKEND:** Sheet preflight+sync+generate; Brand/Landscapes/Logs/Publicist APIs; correct job → Draft flags; write-skip RED; no migrate reset.`
