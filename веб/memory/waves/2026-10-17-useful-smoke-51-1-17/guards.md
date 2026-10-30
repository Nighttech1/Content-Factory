# Guards — 2026-10-17 useful-smoke 51 / 1 / 17 (Tester step 4)

**Date:** 2026-10-17  
**Role:** Тестировщик  
**Wave:** `memory/waves/2026-10-17-useful-smoke-51-1-17/`  
**Verdict:** **GREEN** — all S56 static/artifact locks pass.  
**Fixer:** none  
**Deploy:** not this step (chain step 6).  
**Do not weaken.** Client Playwright **S55 + S56** still required later.

---

## Commands / checks run

| # | Check | Result |
|---|--------|--------|
| 1 | Artifact folder inventory | **PASS** — README + 3 timeline MD + **12 PNG** (4×3) |
| 2 | Useful-only default (`sheet-config` / preflight / sync / cron) | **PASS** |
| 3 | UI «Персонажи» (QuickNav + LandscapesPanel); zero «Пейзажи» in `components/settings` | **PASS** |
| 4 | Brand + Landscapes `max-w-[50%]` | **PASS** |
| 5 | Smoke log preflight modes = useful-only gid `902078005` | **PASS** |
| 6 | Static assert suite (PowerShell) | **PASS** `ALL_ASSERTS_PASS` |

Reusable re-check (static):

```powershell
# from repo root — same asserts as Tester wave
# useful default + UI strings + max-w + 12 PNG + 4 MD files
```

Live re-gen (optional, burns LLM/budget): `npx tsx scripts/smoke-useful-51-1-17.ts`

---

## Assert matrix (S56 / architect §7)

### G1 — Smoke artifact pack

Folder: `docs/карусель тест/smoke-useful-51-1-17/`

| Artifact | Assert |
|----------|--------|
| `README.md` | Present; index lists rows **51, 1, 17**; budget **12/12**; gid useful-only |
| `51-row-51-timeline.md` | Present; mode=`useful`; Scriptwriter model+system+user+reply; Designer image prompts; PNG paths |
| `01-row-1-timeline.md` | Same shape for row 1 |
| `17-row-17-timeline.md` | Same shape for row 17 |
| PNG | `51/slide_01…04.png`, `1/slide_01…04.png`, `17/slide_01…04.png` → **12** total |

**Evidence:** filesystem count PNG=12; timeline MD sizes ~18–19 KB; row 51 timeline starts with `mode: useful`, CTA 3, `slides: 4`.

### G2 — Useful-only default (intake)

| Surface | Assert |
|---------|--------|
| `lib/intake/sheet-config.ts` | `DEFAULT_SHEET_INTAKE_MODE = "useful"`; `DEFAULT_USEFUL_GID = "902078005"`; `resolveIntakeModes(undefined) → ["useful"]` — **not** dual `meetings\|useful` |
| `lib/intake/sheet-client.ts` | `runSheetPreflight` / `syncSheetRows` call `resolveIntakeModes` |
| `app/api/intake/sheet/preflight/route.ts` | Unset mode → useful default; `?mode=meetings` opt-in only |
| `lib/intake/correct-pipeline-job.ts` | `runSheetCronTick` uses `resolveIntakeModes` |

**Smoke log:** preflight `modes: [{ mode: 'useful', gid: '902078005', ok: true, rowCount: 55 }]` — meetings **not** polled.

### G3 — Rename «Пейзажи» → «Персонажи»

| File | Assert |
|------|--------|
| `components/settings/SettingsQuickNav.tsx` | TOC label `"Персонажи"` (id `settings-landscapes` kept) |
| `components/settings/LandscapesPanel.tsx` | Visible heading **Персонажи**; helper copy about персонажей |
| `components/settings/**` | Grep **0** matches for `Пейзажи` |

API/persist id `landscapes` / testids `settings-landscapes-*` may remain (spec OK).

### G4 — Half-width Brand + Персонажи

| File | Assert |
|------|--------|
| `components/settings/BrandPanel.tsx` | Field wrapper includes `max-w-[50%]` |
| `components/settings/LandscapesPanel.tsx` | Field wrapper includes `max-w-[50%]` |

### G5 — Smoke rows / budget / CTA (from live run evidence)

| Order | № | Topic excerpt | CTA | Slides | draftId (smoke) |
|-------|---|---------------|-----|--------|-----------------|
| 1 | 51 | Последствия скромности | 3 | 4 | `draft_correct_sheet_496b194d561a406d` |
| 2 | 1 | Как научить ребёнка армянскому… | 1 | 4 | `draft_correct_sheet_0af56f7a68fa48d1` |
| 3 | 17 | Армянская кухня за неделю… | 2 | 4 | `draft_correct_sheet_87bac88721ec4409` |

Budget: **12/12** PNG · `needs_review: false` all three · log: `memory/waves/2026-10-17-useful-smoke-51-1-17/smoke-run.log`.

Row 51 `flag=meetings` still generated as **useful-tab** row (not meetings gid).

### G6 — shell_freeze (static)

Frontend report + path locks: AppShell / Sidebar / left nav IA **not** in wave FE touch list. Tester confirms Settings-only rename/width files under guard.

### G7 — Secrets

No API keys/tokens in README or timeline MD headers (spot-check). Secrets stay in `.env` only.

---

## Fixer tasks

**None.** All requested verifies green.

---

## Deployer note (next chain step — not Fixer)

Bring localhost live for Client **S55 + S56** Playwright @1440:

1. Settings → TOC **Персонажи**; Brand + Персонажи visually ≤ ~half content column.
2. Read MD timelines under `docs/карусель тест/smoke-useful-51-1-17/`.
3. Optional: `GET /api/intake/sheet/preflight` without `mode` → single useful tab.

---

## Files under guard

| Path | Role |
|------|------|
| `lib/intake/sheet-config.ts` | useful-only default + gid |
| `lib/intake/sheet-client.ts` | preflight/sync modes |
| `app/api/intake/sheet/preflight/route.ts` | API default useful |
| `lib/intake/correct-pipeline-job.ts` | cron useful-only |
| `components/settings/SettingsQuickNav.tsx` | label Персонажи |
| `components/settings/LandscapesPanel.tsx` | heading + max-w-[50%] |
| `components/settings/BrandPanel.tsx` | max-w-[50%] |
| `docs/карусель тест/smoke-useful-51-1-17/**` | README + 3 MD + 12 PNG |
| `scripts/smoke-useful-51-1-17.ts` | re-run smoke |
| `memory/waves/2026-10-17-useful-smoke-51-1-17/smoke-run.log` | live evidence |

---

`🧪 **ТЕСТИРОВЩИК:** GREEN — artifacts 12 PNG + 4 MD; useful-only default; Персонажи + max-w-[50%]; Fixer list empty; guards: this file.`
