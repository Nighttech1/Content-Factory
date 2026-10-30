# Backend + AI Bridge report — useful-smoke 51 / 1 / 17

**Дата:** 2026-10-17  
**Роль:** Backend + AI Bridge (один исполнитель)  
**Волна:** `memory/waves/2026-10-17-useful-smoke-51-1-17/`  
**Вердикт исполнителя:** DONE — useful-only intake · 3×4 live gen · ≤12 PNG · MD timelines

---

## A) Code changes

### Useful-only default

| File | Change |
|------|--------|
| `lib/intake/sheet-config.ts` | `DEFAULT_SHEET_INTAKE_MODE = "useful"` · `resolveIntakeModes()` · `parseSheetModeOrDefault()` |
| `lib/intake/sheet-client.ts` | `runSheetPreflight` / `syncSheetRows` default **useful only** (meetings only if explicit) |
| `lib/intake/correct-pipeline-job.ts` | `runSheetCronTick` uses `resolveIntakeModes` — **meetings not polled by default cron** |
| `app/api/intake/sheet/preflight/route.ts` | default useful; `?mode=meetings` opt-in |
| `app/api/intake/sheet/rows/route.ts` | default useful when mode omitted |
| `app/api/intake/sheet/generate/route.ts` | default mode useful; accepts `slides`, `force` |

### Slides override

- `runCorrectPipelineGenerate({ slides?: number, force?: boolean })` merges `slides` onto row before Scriptwriter user message.
- POST `/api/intake/sheet/generate` body: `{ slides?: number, force?: boolean }`.

### Prompt-trace dump

| File | Role |
|------|------|
| `lib/intake/smoke-prompt-trace.ts` | MD timeline writer + PNG copy + README index |
| `lib/intake/correct-pipeline-job.ts` | Captures Scriptwriter system/user/replies; after draw dumps image prompts / vision / PNG paths when `CAROUSEL_PROMPT_TRACE=1` |

Folder: `docs/карусель тест/smoke-useful-51-1-17/`

### Supporting fixes (needed for live smoke)

| Fix | Why |
|-----|-----|
| `sanitizeLogoRefForLlm` in `placeholders.ts` + fillCorrect placeholders | Brand logo was **data:image base64 ~360KB** → aggregator HTTP 400 |
| `formatCharacterCatalogJson` strips photo data-URLs | Same class of failure |
| `normalizeRawCarouselObject` strips JSON `null` on optional fields + coerces `cta_type` | LLM emitted `cta_type: null` → zod fail after retries |
| Soft-recover corrupt `sprint8-sot.json` in `sprint8-fallback.ts` + one-shot repair | Trailing junk after JSON broke draft upsert mid-draw |
| Smoke resets `_png_budget.json` count→0 | Prior wave left 39/40 — blocked new gens |

**Not touched:** SettingsShell / BrandPanel / LandscapesPanel (Frontend lock).

---

## B) Live smoke results

**Command:** `npx tsx scripts/smoke-useful-51-1-17.ts`  
**Env:** `CAROUSEL_PROMPT_TRACE=1` · `CAROUSEL_PIPELINE=correct` · aggregator key from `.env` (not printed)  
**Preflight:** useful gid `902078005` only · 55 rows · meetings **not** polled  
**Runtime:** ~11 min · exit 0

| Order | № | Topic | CTA | Slides | draftId | PNG |
|-------|---|-------|-----|--------|---------|-----|
| 1 | 51 | Последствия скромности | 3 | 4 | `draft_correct_sheet_496b194d561a406d` | 4 |
| 2 | 1 | Как научить ребёнка армянскому без ссор… | 1 | 4 | `draft_correct_sheet_0af56f7a68fa48d1` | 4 |
| 3 | 17 | Армянская кухня за неделю… | 2 | 4 | `draft_correct_sheet_87bac88721ec4409` | 4 |

**Budget:** 12 / 12 PNG · `needs_review: false` on all three  
**Note:** Postgres `localhost:5432` unreachable → sprint8 **fallback** store used (OK for local smoke). Image model: `openai/gpt-5.4-image-2`.

---

## C) Artifact paths

### Index

- `docs/карусель тест/smoke-useful-51-1-17/README.md`

### MD timelines (Scriptwriter system+user+reply · Designer image prompts · vision · PNG)

- `docs/карусель тест/smoke-useful-51-1-17/51-row-51-timeline.md`
- `docs/карусель тест/smoke-useful-51-1-17/01-row-1-timeline.md`
- `docs/карусель тест/smoke-useful-51-1-17/17-row-17-timeline.md`

### PNG copies (docs)

```
docs/карусель тест/smoke-useful-51-1-17/51/slide_01.png … slide_04.png
docs/карусель тест/smoke-useful-51-1-17/1/slide_01.png  … slide_04.png
docs/карусель тест/smoke-useful-51-1-17/17/slide_01.png … slide_04.png
```

### PNG originals (public)

```
public/generated/carousel/sheet_496b194d561a406d/slide_0N.png  (row 51)
public/generated/carousel/sheet_0af56f7a68fa48d1/slide_0N.png  (row 1)
public/generated/carousel/sheet_87bac88721ec4409/slide_0N.png  (row 17)
```

### Smoke log

- `memory/waves/2026-10-17-useful-smoke-51-1-17/smoke-run.log`

### Script

- `scripts/smoke-useful-51-1-17.ts`

---

## How to re-run

```bash
npx tsx scripts/smoke-useful-51-1-17.ts
```

Requires `AGGREGATOR_API_KEY` in `.env`. Resets wave PNG counter; force-generates rows 51→1→17 with `slides=4`.

---

`⚙️🤖 **BACKEND + AI BRIDGE:** useful-only intake + slides override + prompt-trace dump; live 3×4 OK ≤12 PNG; MD+PNG under docs/карусель тест/smoke-useful-51-1-17/`
