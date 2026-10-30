# Architect Spec — 2026-10-17 useful-smoke 51 / 1 / 17

**Дата:** 2026-10-17  
**Роль:** Архитектор  
**Волна:** мини-волна **useful-smoke** после correct pipeline  
**ticket_limit:** `default≤3` (focused mini-wave; 3 locks + smoke)  
**shell_freeze:** `true` (AppShell / left nav / module top chrome — **0** redesign)  
**upgrade_only:** UI rename + half-width only on Settings Brand/Персонажи; draw path = correct pipeline as-is  
**no_pipeline_break:** Scriptwriter → Designer → Draft (+ critic/vision) **KEEP**  
**S55 + S56:** Client acceptance (S56 = useful-smoke HARD)  
**Trainer:** `memory/trainer/2026-10-17-useful-smoke-51-1-17-grade.md` · card `plugins/trainer/useful-smoke-51-1-17.md`  
**Canon skills:** `carousel-prompt-trace` § Useful-smoke · `content-factory-ui` Brand/Персонажи · `backend` useful-only gid · `carousel-json-contract` Phase 6 · `ai-bridge` · `content-pipeline-agents` · Client `client-scenarios` **S55 + S56**  
**Код продукта в этом ходе Архитектора:** **нет** — только `architect-spec.md` + `chain.md`.

**Chain:** `memory/waves/2026-10-17-useful-smoke-51-1-17/chain.md`

---

## 1. Зачем (простым языком)

Нужно три вещи подряд:

1. **Intake** смотрит **только** вкладку Google Sheet «Полезные карусели» (gid `902078005`). Вкладку встреч **не читать** — темы встреч пользователь позже сам вставит в useful со СТА=3.
2. В Настройках: подпись **«Пейзажи» → «Персонажи»**; поля Бренд и Персонажи — **не шире половины экрана**.
3. **Smoke прямо сейчас:** сгенерировать **3 карусели по 4 слайда** из строк useful **№51, №1, №17**, положить PNG + MD-таймлайн (модель, system/user, ответы) в `docs/карусель тест/smoke-useful-51-1-17/`.

Бюджет этой волны: **12 PNG** (пользователь явно разрешил). Сверх бюджета — stop-report.

---

## 2. Жёсткие замки (HARD)

| # | Lock | Значение |
|---|------|----------|
| 1 | `useful_only` | Intake / sync / cron / smoke **только** gid=`902078005` («Полезные карусели»). **Ignore** meetings tab (`gid=0`). Нет dual-poll `meetings\|useful` в product path этой волны. |
| 2 | `half_width_settings` | Settings **Brand** + **Персонажи** field groups: `max-w-[50%]` или `~max-w-[50vw]` (половина viewport). Не full-bleed формы. |
| 3 | `rename_landscapes_ui` | Product copy везде: **«Персонажи»**. Internal API/persist `/api/settings/landscapes` + id `landscapes` **могут остаться**. TOC, headings, aria, testids labels — без «Пейзажи». |
| 4 | `smoke_rows_51_1_17` | Generate **3×4** from useful rows **51 → 1 → 17** (order OK as listed). `slides=4` **forced** for smoke (override sheet default if any). |
| 5 | `md_timeline_traces` | Artifacts: PNG under `generatedMedia/` + **MD timeline** (LLM id, full system, full user, full reply) under `docs/карусель тест/smoke-useful-51-1-17/`. Secrets **never**. |
| 6 | `budget_12_png` | Max **12** new PNG this wave. Overspend → stop-report. Supersedes 6-PNG default **for this smoke only**. |

| Доп. | Значение |
|------|----------|
| `shell_freeze` | AppShell / Sidebar / left nav IA / module top chrome — freeze. Settings Brand/Персонажи rename+width **in scope**. |
| `preflight_useful` | Confirm useful tab visible (headers + rows 51/1/17 readable) **before** gen. |
| `cta_swipe_keep` | CTA catalog **1–4** + `swipe_trigger` meta **KEEP** (S55 spirit). |
| `html_overlay_primary` | FAIL if primary paint = HTML text overlay (S53 spirit). |
| `no_silent_social` | No social publish in smoke. Drafts only. |
| `row_51_flag_meetings` | Row 51 lives **on useful tab** with `flag=meetings` + СТА=3 — treat as **useful intake row** (mode=`useful`), not meetings-tab read. |

---

## 3. Sheet — smoke rows (SoT for this wave)

**Spreadsheet:** `https://docs.google.com/spreadsheets/d/1kOJ1CjMK5rNldM1IGNLdiVXqHTMeCuG35yP6_w6Y5Ls`  
**Tab:** Полезные карусели · **gid=`902078005` only**

| № | topic | СТА (cta_type) | flag | slides (smoke) |
|---|-------|----------------|------|----------------|
| **51** | Последствия скромности | **3** | meetings | **4** |
| **1** | Как научить ребёнка армянскому без ссор: 5 способов | **1** | (sheet) | **4** |
| **17** | Армянская кухня за неделю: план на 5 блюд | **2** | (sheet) | **4** |

**Pick key:** useful `№` = `sheetRowKey`.  
**Force:** `slides=4` in generate payload for all three smokes (even if sheet has no `slides` col).  
**CTA:** map `СТА` → `cta_type` ∈ {1,2,3,4}; row 51 → CTA **3**.  
**hero:** use sheet `hero` if present; empty → no character.

---

## 4. Layers (контракты)

```text
┌────────────────────────────────────────────────────────────┐
│ FE Settings: Brand + Персонажи (rename + max-w-[50%])       │
│ shell_freeze AppShell                                      │
└──────────────────────────┬─────────────────────────────────┘
                           │ (no prompt ownership)
┌──────────────────────────▼─────────────────────────────────┐
│ Backend: useful-only intake (gid 902078005)                 │
│   + generate 51/1/17 × slides=4 → Drafts/PNG                │
│ AI Bridge: correct overlays + prompt-trace MD dump          │
└────────────────────────────────────────────────────────────┘
```

| Layer | Владеет | Не трогает |
|-------|---------|------------|
| **Frontend** | UI strings «Персонажи»; half-width wrappers on BrandPanel + LandscapesPanel (and SettingsQuickNav label). Optional `data-testid` alias keep `settings-landscapes-*` OK if aria/visible text = Персонажи | Sheet sync; generate jobs; prompt files; AppShell |
| **Backend** | Default intake modes → **useful only**; cron/sync/generate entrypoints that currently loop `["meetings","useful"]` → useful-only for product smoke path; force `slides=4` for smoke script/API; write PNG paths; status write-back if already wired | Prompt wording; Settings JSX chrome beyond consuming APIs |
| **AI Bridge** | Ensure Scriptwriter/Designer/vision path dumps **MD timeline** (model · system · user · reply · per-slide image prompts); wire `CAROUSEL_PROMPT_TRACE` or equivalent into `docs/карусель тест/smoke-useful-51-1-17/`; STRICT correct/ no invention | SettingsShell layout; invent dual meetings poll |

**Combined agent OK:** Backend + AI Bridge may be **one executor** if paths do not overlap Frontend Settings files (see `chain.md`). Frontend Settings **first**, then gen+trace.

---

## 5. Frontend scope (step 1)

### 5.1 Rename «Пейзажи» → «Персонажи»

Touch (expected paths — executor confirms via grep):

| File | Change |
|------|--------|
| `components/settings/SettingsQuickNav.tsx` | label `Пейзажи` → `Персонажи` |
| `components/settings/LandscapesPanel.tsx` | heading / visible copy / aria-labelledby text → **Персонажи**; comments may say «characters (API landscapes)» |
| Any TOC / helper copy in SettingsShell comments | product-facing «Пейзажи» → «Персонажи» |

**Keep:** route `/api/settings/landscapes`, store `landscapes-store`, section id `settings-landscapes` (stable anchors OK).

### 5.2 Half-width

On **Brand** and **Персонажи** field groups (form stacks / content columns — not necessarily the whole Settings page chrome):

- Apply `max-w-[50%]` **or** `max-w-[50vw]` on the field container (Architect preference: `max-w-[50%]` of settings content column, with `w-full` so it shrinks on narrow).
- Logo upload / photo cells stay usable inside the capped column.
- Do **not** shrink Design brandbook grid as part of this ticket unless it shares the same wrapper (prefer isolate Brand + Landscapes panels).

### 5.3 Out of FE scope

Mesh redesign · Motion · Create chrome redesign · Brand-kit route resurrection · meetings UI.

---

## 6. Backend + AI Bridge scope (step 2 · one agent OK)

### 6.1 Useful-only intake

Current code (Architect evidence from repo scan):

- `lib/intake/sheet-client.ts` — loops `["meetings","useful"]` when mode unset.
- `lib/intake/correct-pipeline-job.ts` — similar dual modes.
- `lib/intake/sheet-config.ts` — `DEFAULT_USEFUL_GID = "902078005"` already correct.

**Required behavior this wave:**

| Surface | Behavior |
|---------|----------|
| Product sync / cron / default generate intake | **useful only** (gid 902078005) |
| Meetings tab | **not polled** |
| Explicit `mode=meetings` API (if kept for docs/debug) | may remain for schema history, but **smoke + default path must not call it** |
| Env | `GOOGLE_SHEETS_GID_USEFUL` default `902078005`; do not require meetings gid for smoke |

### 6.2 Smoke generate 51 / 1 / 17

| Rule | Value |
|------|-------|
| Entry | Existing `/api/intake/sheet/generate` (or smoke script under `scripts/`) — **useful** rows by `№` |
| Rows | `51`, `1`, `17` in that order |
| slides | **force 4** |
| Pipeline | correct: Scriptwriter → critic+zod → Designer image_prompt → image → vision≤2 → Draft |
| PNG out | `generatedMedia/` (existing convention; document exact paths in MD) |
| MD out | `docs/карусель тест/smoke-useful-51-1-17/` |

Suggested MD layout (executor may merge into one timeline):

```text
docs/карусель тест/smoke-useful-51-1-17/
  README.md                    # index: 3 rows, PNG links, budget
  51-timeline.md               # row 51 full LLM timeline
  01-timeline.md               # row 1
  17-timeline.md               # row 17
```

Each timeline MD **must** include:

1. Row id + topic excerpt  
2. Scriptwriter: model · system · user · reply  
3. Designer: model · handoff · **per-slide image prompts** (typography on PNG)  
4. Image/vision: model · pass/fail · `needs_review` if any  
5. PNG paths  
6. **No secrets** (keys, tokens)

### 6.3 Preflight

Before gen: hit useful CSV/preflight; assert headers include `№,topic,…` and rows 51/1/17 exist with expected topics (fuzzy match OK on topic prefix). If useful tab not visible → **stop**, no PNG spend.

### 6.4 Budget guard

After each carousel: count new PNGs. At 12 stop. If a row fails mid-way → stop-report with MD partials; do not start row N+1 if budget would exceed.

---

## 7. Acceptance (Client language)

### S55 (still required where applicable)

- Brand after Design; Персонажи below Brand; Logs/RED if already shipped from correct wave — **do not regress**.  
- CTA 1–4 + swipe meta keep; no HTML-overlay-primary success.

### S56 (HARD · this wave)

| Check | Pass |
|-------|------|
| Intake | Evidence that smoke/sync used **only** gid `902078005` (no meetings poll in logs/MD) |
| Rows | Artifacts for **51, 1, 17** only (topics match table §3) |
| Slides | **4** PNG per carousel |
| Traces | MD timeline(s) under `docs/карусель тест/smoke-useful-51-1-17/` with LLM + prompts in/out |
| Budget | ≤12 PNG; stop-report if over |
| UI rename | Settings shows **Персонажи**, zero chrome «Пейзажи» |
| UI width | Brand + Персонажи ≤ ~half viewport (`max-w-[50%]` / 50vw) |
| Playwright | @1440 navigate Settings + read MD traces; not API-only |

**Hard REJECT:** meetings tab read · wrong gid · wrong rows · ≠4 slides · no MD timeline · «Пейзажи» alive · full-width Brand/Персонажи · >12 PNG without stop · accept without Playwright S56.

---

## 8. Path locks (no overlapping writers)

1. **Frontend** finishes rename+width on Settings files **before** Backend/AI Bridge gen (UI accept can run after Deployer, but FE file ownership is step 1 only).  
2. **One writer** on `SettingsShell` / `BrandPanel` / `LandscapesPanel` / `SettingsQuickNav` (Frontend).  
3. **One writer** on `lib/intake/**` + generate routes + prompt-trace dump paths (Backend+AI Bridge combined agent).  
4. AI Bridge does **not** edit Settings JSX; Frontend does **not** edit intake/prompt libs.  
5. **shell_freeze:** no AppShell / SidebarNavigation / left nav IA.  
6. Motions / Mesh / Scout / Razbor redesign: **out of chain**.

---

## 9. Out of scope

- Dual meetings|useful product poll  
- Renaming API `landscapes` → `characters` (optional later; not required)  
- Filling empty `correct/01–06` from scratch (already drafted in prior wave — reuse)  
- S54 bake-off compare folders  
- Prod/VPS deploy  
- Social publish  
- Product code in Architect turn

---

## 10. Done definition (wave)

| Role | Done when |
|------|-----------|
| Architect | This spec + `chain.md` committed to memory (no product code) |
| Frontend | Visible «Персонажи»; Brand+Персонажи half-width; report |
| Backend+AI Bridge | useful-only intake; 3×4 gen; ≤12 PNG; MD timelines in `smoke-useful-51-1-17/` |
| Tester | Guards: useful-only · rename strings · half-width class · row/slide counts · MD present |
| Deployer | Localhost live for Client |
| Client | Playwright S55+S56 verdict |

---

## 11. Next executor

**Frontend** — step 1 in `chain.md` (rename + half-width). Then Backend+AI Bridge gen+traces.

`🏗️ **АРХИТЕКТОР:** useful-smoke locks зафиксированы; chain Frontend → Backend+AI Bridge → Tester → Deployer → Client; код продукта не писался.`
