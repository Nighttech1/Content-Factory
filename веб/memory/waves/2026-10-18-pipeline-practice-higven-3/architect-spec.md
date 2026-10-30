# Architect Spec — 2026-10-18 pipeline-practice-higven-3

**Дата:** 2026-10-18  
**Роль:** Архитектор  
**Волна:** `2026-10-18-pipeline-practice-higven-3`  
**Цель:** Тренировка пайплайна: активный эталон **01 HIGVEN**, Designer **parallel pack** (`image_prompt`+`html_layout` ONE reply), Scriptwriter **Haiku**, N=**3** (cover·body·cta), Brand **full** `vernatun-logo.png`, `characterPaint=none`, AD no remake, ≤**3** smoke attempts  
**Client gate:** later (Orchestrator)  
**ticket_limit:** `full-queue`  
**shell_freeze:** `true` (AppShell / nav / Studio chrome — **0** redesign)  
**upgrade_only:** `true`  
**Frontend:** **omit** (HITL button already exists / smoke bypasses UI handoff)  
**Trainer:** `memory/trainer/2026-10-18-pipeline-practice-higven-3-grade.md` (grade **A**)  
**Canon:** `memory/waves/2026-10-18-pipeline-practice-higven-3/plan.md`  
**Card:** `plugins/trainer/pipeline-practice-higven-3.md`  
**Skills:** `create-carousel-prompts-notes` § HIGVEN-3 · `html-layout-variant-a` § HIGVEN-3 · `ai-bridge` · `content-pipeline-agents` · `carousel-json-contract` Phase 7 · `art-director` (no remake) · `backend` · `tester`  
**Код продукта в этом ходе Архитектора:** **нет** — только этот файл + `chain.md`.

**Chain:** `memory/waves/2026-10-18-pipeline-practice-higven-3/chain.md`

**Etalon SoT (на диске):**  
`docs/карусель тест/эталон/pipeline-practice-2026-10-18/`  
(mirror under `generatedMedia/эталон карусели/pipeline-practice-2026-10-18/` for slot cache)

| File | Role in wave |
|------|----------------|
| `01-higven-heavy-lifting-grid.png` | **ACTIVE** style pack — industrial dark/orange (4×2 panel grid → slots cover·midA·midB·cta) |
| `02-sua-logo-moto-grid.png` | **Inactive library only** (optional) |
| `03`/`04` schemas | Docs only — **not** Design presets |

---

## 1. Зачем (простым языком)

Нужна короткая тренировка: взять эталон HIGVEN (тёмный industrial + оранжевые акценты), вычистить старые пресеты (RE-orange / layout-copy), зафиксировать полный логотип Vernatun PNG, сделать ровно **3** слайда без персонажа, и прогнать пайплайн Сценарист→Дизайнер (одним ответом: картинка+раскладка)→рендер. Не больше трёх попыток.

---

## 2. User locks (HARD)

| # | Lock id | Acceptance |
|---|---------|------------|
| 1 | `etalon_higven_01_active` | Settings Design active = **01 HIGVEN**. Other layout-copy / RE-orange / prior etalon presets **removed or deactivated**. **02 SUA** may remain **inactive** library. |
| 2 | `brand_full_png` | `DEFAULT_LOGO_REF` / smoke Brand = `/brand/vernatun-logo.png` (full Armenian Club PNG). HTML `<img>` only — no emblem+wordmark Path A invent for this smoke. |
| 3 | `n_three` | Job + smoke: **slides=3** → cover · body · cta finals `slide_01..03.png`. |
| 4 | `character_none` | `characterPaint=none` (no girl / conductor / cutout). |
| 5 | `style_vision_ref` | `styleCopyMode=vision_ref`; pack = HIGVEN grid; N=3 slot map **cover → midA → cta**. |
| 6 | `parallel_designer_pack` | Designer GPT **ONE** reply: `image_prompt`×3 + `html_layout`×3. Then GPT Image ‖ renderer prep. **No** second Designer call «only for logo.textColor». `logo.textColor` optional from etalon zone plan in same pack. |
| 7 | `scriptwriter_haiku` | Scriptwriter = **Haiku** (+ thinking if API). Product HITL «Передать дизайнеру» — smoke may force handoff. |
| 8 | `ad_no_remake` | Art Director after PNG: `approve` \| `remarks` only — no auto-remake. Smoke may set `CAROUSEL_SKIP_ART_DIRECTOR=1`. |
| 9 | `smoke_out` | `scripts/smoke-pipeline-practice-higven-3.ts` → `docs/карусель тест/pipeline-practice-higven-3/` (3 PNG + timeline + meta). Topic = any useful sheet row. ≤**3** attempts. |
| 10 | `no_publish_no_vps_no_wipe` | No social publish, no VPS, no DB wipe. `shell_freeze` AppShell. |

### Product enums (wave overrides)

| Flag | Wave value | Notes |
|------|------------|-------|
| `styleCopyMode` | `vision_ref` | BAN FULL TOKEN CARD inject |
| `characterPaint` | **`none`** | Overrides product default `in_image` |
| `styleCopyPackId` | `higven_01` | Grid 01 HIGVEN |
| `slides` | **3** | cover / body / cta |
| Brand logo | `/brand/vernatun-logo.png` | Full PNG |

### Slot map (N=3 · HARD)

```text
Pack SoT:
  …/pipeline-practice-2026-10-18/01-higven-heavy-lifting-grid.png
  → slice 4×2 cells → slots: cover · midA · midB · cta
     (cover=cell[0,0], midA=cell[1,0], midB=cell[0,1], cta=cell[3,1] or last CTA-like)

N=3 slide → ref:
  1→cover  2→midA  3→cta
```

`mapSlideToRefSlot(i, 3)` already yields cover / midA / cta — keep.

### Visual bar

Resemble **HIGVEN**: dark industrial · safety-orange accents · bold hierarchy · desaturated machinery mood. Vernatun Sheet text. Full Vernatun PNG. 3 frames. No character.

### Keep (do not reopen)

| Keep | Rule |
|------|------|
| `s57_layered` | bg + HTML Puppeteer @ 1080×1350; OCR remake OFF |
| `cta_1_4` / `swipe_meta` | CTA catalog HTML; swipe meta only |
| `shell_freeze` | no AppShell redesign |
| `ad_no_remake` | approve \| remarks only |
| `secrets` | never in memory / reports |

### Out of scope

Phase3 girl · overlay_cutout · VPS · social publish · Frontend AppShell · >3 slides · paid MCP · second Designer logo-color call.

---

## 3. Tickets (logical)

| ID | Owner | DoD |
|----|-------|-----|
| **C-higven-seed** | Backend | Seed 01 active + 02 inactive; clear layout-copy/RE-orange/other etalons from active library |
| **C-higven-brand** | Backend | Brand logoRef full PNG for smoke user |
| **C-higven-ai-bridge** | AI Bridge | Haiku SW N=3; Designer parallel pack prompts; HIGVEN grammar; characterPaint=none; no logo-color second call |
| **C-higven-slots** | Backend | Pack `higven_01` + 4×2 slice → slots; wire vision_ref refs |
| **C-higven-smoke** | Backend | Smoke script → 3 PNG + timeline + meta; attempt 1 |

---

## 4. Path locks

1. Architect done → AI Bridge → Backend (seed+smoke) sequential.  
2. One writer on `create-carousel-prompts.ts` / designer overlays (AI Bridge).  
3. One writer on seeds / style-copy-slots / smoke / brand force (Backend).  
4. No Frontend unless HITL button missing (omit).  
5. Fixer only if attempt 1 visual FAIL — max attempt 3 then STOP.

---

## 5. Smoke matrix

| Attempt | styleCopyMode | characterPaint | Pack | N | Out |
|---------|---------------|----------------|------|---|-----|
| 1 (mandatory) | `vision_ref` | `none` | `higven_01` | 3 | `docs/карусель тест/pipeline-practice-higven-3/` |
| 2–3 | same + Fixer prompt strengthen | same | same | 3 | overwrite same dir |

---

## 6. Reports required

- `architect-spec.md` (this) + `chain.md`  
- `ai-bridge-report.md`  
- `backend-report.md`  
- Smoke artifacts under out dir  

**Next executor:** AI Bridge (step 2).
