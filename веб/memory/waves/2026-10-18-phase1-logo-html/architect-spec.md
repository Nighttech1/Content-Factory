# Architect Spec — 2026-10-18 Phase 1 · Vernatun wordmark HTML logo

**Дата:** 2026-10-18  
**Роль:** Архитектор  
**Волна:** `2026-10-18-phase1-logo-html`  
**Цель:** на S57 layered-слайдах показывать **прозрачный wordmark PNG** Vernatun как единственный brand-chrome; **не** дублировать название клуба текстом рядом с картинкой.  
**Client gate:** не требуется для закрытия фазы (smoke/guards достаточно); Playwright Client — только если Оркестратор отдельно попросит.  
**ticket_limit:** `full-queue` (одна фаза — не резать на пачки по 3)  
**shell_freeze:** `true` (AppShell / Sidebar / left nav IA / module top chrome — **0** правок)  
**upgrade_only:** `true` (patch Brand default + composite branch + тонкий prompt hint; **не** rewrite Create / Design / fonts / character)  
**Frontend / Motion / AI Bridge:** **omit** (prompt hint «omit name-right» — в зоне Backend по chain пользователя)  
**Trainer:** `memory/trainer/2026-10-18-phase1-logo-grade.md` (grade **C→B**)  
**Canon card:** `plugins/trainer/phase1-logo-wordmark-html.md`  
**Brief:** `memory/waves/2026-10-18-phase1-logo-html/brief.md`  
**Skills:** `carousel-json-contract` § Logo HARD · `backend` · `tester` · dual-path Brand (`lib/intake/placeholders.ts` KEEP)  
**Код продукта в этом ходе Архитектора:** **нет** — только этот файл + `chain.md`.

**Chain:** `memory/waves/2026-10-18-phase1-logo-html/chain.md`

---

## 1. Зачем (простым языком)

На карусели логотип Vernatun — это **картинка**, в которой слово Vernatun уже нарисовано. Сейчас композит часто кладёт PNG **и** рядом HTML-текст «Vernatun» / имя клуба → получается **двойная надпись**. Фаза 1 чинит только это: поставить правильный прозрачный PNG в Brand, и на HTML-слое при наличии лого рисовать **только картинку**.

Это **не** фаза шрифтов (2) и **не** фаза персонажей (3). Лого **не** вшивается в фон нейросети — только S57 HTML overlay.

---

## 2. User locks (HARD)

| # | Lock id | Acceptance |
|---|---------|------------|
| 1 | `install_png` | Source PNG скопирован в `public/brand/vernatun-logo.png`. Source (существует): `C:\Users\alexk\.cursor\projects\d-Applications-Content-factory\assets\c__Users_alexk_AppData_Roaming_Cursor_User_workspaceStorage_af706c00c2234488d2e1b065a04a1e63_images_logo-transparent-555fbf86-ea1d-4710-acc5-65722a5a1aa9.png` |
| 2 | `default_logo_png` | `DEFAULT_LOGO_REF` / `defaultBrandSettings().logoRef` = **`/brand/vernatun-logo.png`**. Legacy `public/brand/vernatun-logo.svg` **оставить на диске** как fallback-файл (не удалять); новые дефолты и fresh Brand → PNG. |
| 3 | `logo_only_when_url` | В layered composite HTML: если `logoUrl` truthy → внутри `.brand` **только** `<img …>`; **никогда** `.brand-name` / текст Vernatun / ARMENIAN CLUB. |
| 4 | `name_fallback_no_logo` | Если `logoUrl` пустой → текст `brandName` (`.brand-name`) **OK** как fallback (как сейчас для name-only). |
| 5 | `s57_html_only` | Лого только HTML overlay; **запрет** bake logo в image-model / `visual_prompt` / bg plate этой фазой. |
| 6 | `shell_freeze_scope` | `shell_freeze: true`. **Нет** Phase 2 fonts/scale/vision. **Нет** Phase 3 character/Pixar. |

### Keep from prior waves (do not reopen)

| Keep | Rule |
|------|------|
| `s57_layered` | image bg + HTML/CSS Puppeteer @ 1080×1350; OCR remake vision **OFF** |
| `logo_dual_path` | sanitized `logoRef` → LLM only; `logoRefRaw` / Brand raw → composite `<img>` via `resolvePlaywrightImageSrc` |
| `placement_br` | Default **bottom-RIGHT** + enlarged mark (`DEFAULT_BRAND_CHROME` / `BRAND_LOGO_SIZE_PX`) — **не** изобретать новую систему placement |
| `transparent_bg` | `.brand img` без solid plate / opaque chip за иконкой |
| `cta_1_4` / `swipe_meta` | без изменений |
| `no_silent_social` | no Meta/IG publish |
| `secrets` | never in memory / skills / reports |

### Supersede (logo chrome only)

| Prior | New |
|-------|-----|
| `design-inject-logo-br` «club name **beside** icon» для Vernatun wordmark | **logo-only** when `logoUrl` set (`phase1-logo-wordmark-html.md`) |
| Composite emit `.brand-name` whenever `brandName` set | Emit `.brand-name` **only if** `!logoUrl` |
| `DEFAULT_LOGO_REF = /brand/vernatun-logo.svg` | **`/brand/vernatun-logo.png`** (svg file may remain as legacy asset) |
| FULL DESIGN role table line «name **right of** logo icon» | Hint: when Brand logo is wordmark / `logoRef` present → **omit** separate name-right chrome (Backend thin prompt patch) |

Icon-only marks (не Vernatun wordmark) теоретически могли бы оставлять name beside — **продуктовый дефолт Vernatun = wordmark** → правило `logoUrl → img only` достаточно для этой фазы (без нового флага `isWordmark`).

---

## 3. Target flow (patched)

```text
Install
  Cursor assets PNG
  → copy → public/brand/vernatun-logo.png

Brand store
  DEFAULT_LOGO_REF = /brand/vernatun-logo.png
  defaultBrandSettings / fresh users → PNG
  existing brand-settings.json: if logoRef still points at missing/svg default — Backend MAY migrate
    only the factory default path to PNG (do not wipe user uploads / data: URLs)

Placeholders (KEEP)
  logoRef = sanitize(raw)     → LLM
  logoRefRaw = raw            → composite

carousel-html-renderer
  resolveBrandLogoForPlaywright(placeholders) → logoUrl
  pass brandName + logoUrl into composite input
  (no bake into image model)

carousel-layered-composite buildSlideHtml
  showBrand = placement ≠ none && (logoUrl || brandName)
  if logoUrl:
    .brand → <img src=logoUrl> ONLY
  else if brandName:
    .brand → <div class="brand-name">…</div>
  placement = bottom-RIGHT (unchanged)

Prompt hint (Backend, thin)
  create-carousel-prompts FULL DESIGN / brand row:
    when logo present / wordmark → omit instructing “name right of icon”
    (не трогать fonts/scale/vision Phase 2)

Puppeteer → PNG slides
```

---

## 4. File / path map (Backend)

| Path | Change |
|------|--------|
| `public/brand/vernatun-logo.png` | **CREATE** — copy from user source PNG (lock 1) |
| `public/brand/vernatun-logo.svg` | **KEEP** on disk (legacy); not default |
| `lib/settings/brand-store.ts` | `DEFAULT_LOGO_REF` → `/brand/vernatun-logo.png`; comment that svg is legacy fallback asset |
| `data/local/brand-settings.json` | Optional: if entries use old default `/brand/vernatun-logo.svg` and no custom upload — update to PNG. **Do not** overwrite user `data:` / custom uploads |
| `lib/studio/carousel-layered-composite.ts` | Brand HTML branch: `logoUrl` → img only; else `brandName` → `.brand-name`. CSS for `.brand-name` may stay (fallback). Placement/size constants **unchanged** |
| `lib/studio/carousel-html-renderer.ts` | Ensure `logoUrl` resolution still prefers `logoRefRaw` / Brand raw; do **not** force visible name chrome when logo resolves. Default `brandName = "Vernatun"` may remain for **fallback-only** / logging — must not appear in HTML when `logoUrl` set |
| `lib/intake/placeholders.ts` | **KEEP** dual-path `logoRef` / `logoRefRaw` |
| `lib/studio/create-carousel-prompts.ts` | **Thin hint only:** role-table / brand chrome wording — omit «name right of logo» when logo/wordmark; do **not** reopen FULL DESIGN / fonts / secondary_copy |

### Out of scope paths (HARD)

- AppShell / `SidebarNavigation` / Create modal chrome  
- Phase 2: typography.scale / fontFit / vision prompts  
- Phase 3: character cut-out / Pixar  
- AI Bridge mesh defaults redesign  
- VPS / social publish / DB wipe / `prisma migrate reset`

---

## 5. Contracts

### 5.1 Composite brand chrome

```ts
// Pseudocode — Backend implements
const showBrand = logoPlacement !== "none" && Boolean(logoUrl || brandName);

// inside .brand:
if (logoUrl) {
  // ONLY img — NEVER .brand-name
} else if (brandName) {
  // .brand-name fallback OK
}
```

### 5.2 Brand default

| Field | Value |
|-------|--------|
| `DEFAULT_LOGO_REF` | `/brand/vernatun-logo.png` |
| `DEFAULT_BRAND_NAME` | `"Vernatun"` (store field OK; **not** painted when logoUrl set) |
| Legacy SVG path | `/brand/vernatun-logo.svg` file may exist; not default |

### 5.3 Dual-path (unchanged semantics)

| Channel | Value |
|---------|--------|
| LLM | sanitized stub / short `logoRef` OK |
| Puppeteer | raw `logoRefRaw` or Brand `logoRef` → `resolvePlaywrightImageSrc` → `<img class="brand">` src |
| FAIL | sanitized stub as composite src; name-only when logo file resolves; solid plate behind logo |

### 5.4 Prompt hint (Backend)

- Replace / soften lines that tell Designer «name **right of** logo icon» for Vernatun wordmark path.  
- Wording intent: «If Brand `logoRef` / wordmark PNG present → HTML shows **logo image only**; do not paint club name beside it.»  
- No Phase 2 font tables; no character instructions.

---

## 6. Tickets (single-phase queue)

| ID | Owner | Covers |
|----|-------|--------|
| **C-phase1-logo-png-install** | Backend | Copy PNG → `public/brand/vernatun-logo.png`; default `logoRef` PNG; optional store migrate default-only |
| **C-phase1-logo-composite-omit-name** | Backend | Composite (+ renderer wire): `logoUrl` → img only; no `.brand-name` |
| **C-phase1-logo-prompt-hint** | Backend | Thin omit name-right hint in `create-carousel-prompts.ts` |
| **C-phase1-logo-guards** | Tester | Guards G1–G6 below |
| **C-phase1-logo-resmoke** | Backend/Tester optional | Re-composite 1 slide or short set on existing vision/smoke bg PNGs if easy |

---

## 7. Definition of Done — Backend (return this to Orchestrator)

Backend **DONE** when **all** of the following are true:

1. **Asset:** `public/brand/vernatun-logo.png` exists and is a byte-copy (or lossless equivalent) of the locked Cursor assets source PNG.  
2. **Default:** `lib/settings/brand-store.ts` exports / uses `DEFAULT_LOGO_REF === "/brand/vernatun-logo.png"`; `defaultBrandSettings()` returns that `logoRef`. SVG file may remain; must not be the code default.  
3. **Composite rule:** In generated layered HTML for a slide with resolved `logoUrl`:  
   - present: `<img` inside `.brand` (or equivalent brand img)  
   - absent: `.brand-name`  
   - absent as visible text chrome: standalone «Vernatun» / «ARMENIAN CLUB» next to the mark  
4. **Fallback rule:** With empty `logoUrl` and non-empty `brandName`, `.brand-name` still renders (regression OK).  
5. **Dual-path KEEP:** `logoRefRaw` still preferred for Playwright src; no sanitize stub as img src.  
6. **Prompt hint:** Designer/brand chrome instructions no longer require «name right of icon» when logo/wordmark is present (thin edit only).  
7. **Scope:** no AppShell/nav edits; no Phase 2 fonts; no Phase 3 character; no logo bake into image-model prompts; no social publish; no DB wipe.  
8. **Report:** `memory/waves/2026-10-18-phase1-logo-html/backend-report.md` with paths touched + how to verify (grep / unit / one composite call).  
9. **Handoff:** Tester may run guards; optional re-smoke listed in chain.

**Not Backend DoD:** Client Playwright @1440; VPS; Phase 2/3.

---

## 8. Tester guards (proposed)

| ID | Assert |
|----|--------|
| **G1** | File exists: `public/brand/vernatun-logo.png` |
| **G2** | Source `DEFAULT_LOGO_REF` / brand-store default string = `/brand/vernatun-logo.png` |
| **G3** | Fixture: `logoUrl` set → composite HTML has brand `<img`; **no** `.brand-name` |
| **G4** | Fixture: no `logoUrl`, `brandName` set → `.brand-name` present |
| **G5** | Grep/static: no regression that always concatenates name when logo present (the old `brandName ? .brand-name` unconditional branch removed/gated) |
| **G6** | Prompt hint: no HARD «name right of logo icon» as required chrome when wordmark/logo present (or superseded wording present) |

Optional smoke: re-run composite on **existing** bg PNGs from a prior vision/smoke folder (no new paid image gen) → spot-check one slide: logo bottom-right, no duplicate text.

---

## 9. Escalation

| If… | Then… |
|-----|-------|
| Brand Settings UI cannot persist `/brand/…` path | Arm **Frontend-minimal** on BrandPanel only — escalate to Orchestrator; not default chain |
| `resolvePlaywrightImageSrc` fails on `/brand/*.png` | Backend fix resolver / public static serve — still Backend |
| User store already has custom data-URL logo | **Do not** overwrite; only change code default + optional svg→png default migration |

---

## 10. Out of wave

- Phase 2 fonts / type scale / vision prompt hardening  
- Phase 3 Pixar / character paint  
- Mesh redesign / Motion / AI Bridge full overlay rewrite  
- paid MCP / VPS / publish / DB wipe  

---

## 11. Architect verdict

| Item | Value |
|------|-------|
| Spec ready for Backend | **yes** |
| Product code this turn | **none** |
| Chain | Backend → Tester → optional re-smoke |
| Primary risk | unconditional `.brand-name` emit in `carousel-layered-composite.ts` ~1297–1299 |
| Primary fix | gate name on `!logoUrl`; install PNG + default path |

`🏗️ **АРХИТЕКТОР:**` Phase 1 wordmark HTML — PNG install + default `/brand/vernatun-logo.png` + composite logo-only when `logoUrl` + thin prompt omit name-right. Spec+chain ready. Backend DoD = §7.
