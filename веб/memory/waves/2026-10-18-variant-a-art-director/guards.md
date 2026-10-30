# Guards — Wave 2026-10-18 Variant A `html_layout` + Art Director

**Role:** Тестировщик · chain step 5  
**Date:** 2026-10-18  
**Executable:** `npx tsx scripts/verify-variant-a-ad-guards.ts` → **16/16 PASS**  
**Deploy:** skipped (Orchestrator / user: no deploy this turn)

## Verdict: GREEN

| Check | Result | Evidence |
|-------|--------|----------|
| `html_layout` in contract | PASS | `htmlLayoutSchema` + `designerImagePromptsSchema` require layout; closed enum 6 templates |
| Composite uses templates | PASS | `carousel-layered-composite.ts` maps all 6 → `data-template` + accent wrap |
| AD API no remake | PASS | route + `art-director-run` always `remakeEnqueued: false`; no enqueue/draw calls |
| Smoke 4 PNG + review | PASS | `docs/карусель тест/variant-a-ad-smoke/` + mirror `generatedMedia/…` |
| Mesh art-director node | PASS | `nodeId`/`testId="node-art-director"` after Designer, before Publisher |

---

## Permanent asserts (class of defect)

### G1 — Variant A `html_layout` contract (`C-variant-a-html-layout`)

1. `htmlLayoutTemplateSchema` enum = exactly  
   `cover_center | body_left | body_split | cta_bottom | tip_card | quote_band` (size **6**).
2. Unknown template string → zod **reject**.
3. Designer pack (`designerImagePromptsSchema`) **requires** `html_layout` per slide.
4. Orphan highlight (`phrase` ∉ `primary_copy` / `secondary_copy`) → `critiqueHtmlLayout` code `orphan_highlight`.
5. Valid highlight substring → critic clean.

**Paths:** `lib/studio/carousel-json-contract.ts`

### G2 — Composite executes templates (`C-variant-a-html-layout`)

1. `resolveHtmlLayoutForSlide` / `synthesizeFallbackHtmlLayout` yield closed templates.
2. Source contains all 6 template ids + `data-template=` + accent `<span class="accent">`.
3. Product path: Puppeteer raster **1080×1350** (smoke PNG header assert).

**Paths:** `lib/studio/carousel-layered-composite.ts`

### G3 — Art Director API / job **no remake** (`C-art-director-agent`)

1. `POST /api/studio/art-director/review` returns `remakeEnqueued: false` on success **and** error paths.
2. `runArtDirectorReview` never calls `enqueue` / `addJob` / `queue.add` / Designer draw / composite.
3. `artDirectorVerdictSchema` accepts `approve | remarks`.
4. `correct-pipeline-job` runs AD once after finals; meta stamps `remakeEnqueued: false`.

**Paths:**  
`app/api/studio/art-director/review/route.ts` · `lib/studio/art-director-run.ts` · `lib/intake/correct-pipeline-job.ts`

### G4 — Smoke ONE + AD text (`C-art-director-ui-smoke`)

Canon folder (Backend report):

`docs/карусель тест/variant-a-ad-smoke/`  
(+ mirror `generatedMedia/variant-a-ad-smoke/`)

| Artifact | Required |
|----------|----------|
| `slide_01.png` … `slide_04.png` | exactly 4 finals @ **1080×1350** |
| `art-director-review.md` | present (verdict + **NO remake** section) |
| optional | `art-director-review.json`, `timeline.md`, `README.md` |

**Hard:** no remake loop after AD; budget ≤8 finals without stop-report.

### G5 — Mesh / Team node (`C-art-director-ui-smoke`)

1. `ReleaseTeamFlowchart`: `nodeId="node-art-director"` + `testId="node-art-director"`.
2. JSX order: `node-designer` → `node-art-director` → `node-publisher`.
3. Seed: `agent-defaults` carousel-engine `packId: "art-director"`; display name «Арт-директор» via `ART_DIRECTOR_DISPLAY_NAME`.

**Paths:** `components/mesh/v2/ReleaseTeamFlowchart.tsx` · `lib/mesh/agent-defaults.ts` · `lib/studio/art-director-review.ts`

---

## Evidence run (2026-10-18)

```text
npx tsx scripts/verify-variant-a-ad-guards.ts
TOTAL 16 FAIL 0
```

Smoke review sample: `verdict: approve`, source `vision`, section **NO remake**.

## Tickets

| Ticket | Guard file |
|--------|------------|
| C-variant-a-html-layout | `memory/tickets/C-variant-a-html-layout/guards.md` |
| C-art-director-agent | `memory/tickets/C-art-director-agent/guards.md` |
| C-art-director-ui-smoke | `memory/tickets/C-art-director-ui-smoke/guards.md` |

## Regression registry

`.cursor/skills/client-review/regression-guards.md` · **W-2026-10-18-variant-a-art-director**

## Out of this step

- Deployer localhost refresh — **not run** (user: no deploy)
- Client Playwright @1440 — optional, not armed
- Fixer — **skip** (GREEN)

`🧪 **ТЕСТИРОВЩИК:** verify-variant-a-ad-guards 16/16 PASS; html_layout+composite+AD no-remake+smoke 4PNG+mesh node; guards.md written; no deploy.`
