# Logo placement v2 — per-role slots + 2× size (2026-10-18)

**When:** short wave **after Phase 1** (logo-only wordmark HTML kept). User locks new PNG, transparent install, **role-based** placement, **2×** size. Cycle until Client Playwright **«согласовано»**.

**SUPERSEDES (placement / size / asset only):**
- `phase1-logo-wordmark-html.md` lock **4** («keep bottom-RIGHT») and Phase1 source PNG path
- `design-inject-logo-br.md` / gap «logo BR bottom-RIGHT» as **default product chrome**
- `carousel-json-contract` Logo HARD line that said default **bottom-RIGHT** + old enlarged px

**KEEP from Phase 1:** logo-only HTML — **omit** `.brand-name` / Vernatun / ARMENIAN CLUB text when wordmark PNG present; S57 layered `<img>`; dual-path raw `logoRef`; no bake into image-model bg.

## User locks (HARD · logo placement v2)

| # | Lock |
|---|------|
| **1 Source** | New file: `C:\Users\alexk\.cursor\projects\d-Applications-Content-factory\assets\c__Users_alexk_AppData_Roaming_Cursor_User_workspaceStorage_af706c00c2234488d2e1b065a04a1e63_images_________VERNATUN__________________-9f51e9dd-8f09-4890-b9a2-00ea9c84e867.png` |
| **2 Install** | Copy → `public/brand/vernatun-logo.png`. Background **MUST be transparent**. If source has black matte / solid plate — **strip** to alpha (Backend/tooling). Do not leave opaque black behind the mark. |
| **3 Placement by role** | **COVER** (`title` / cover) + **LAST** (`cta` / cta_slide) → **TOP** (prefer **`top-left`**). **ALL body** slides → **`bottom-left`**. Not a single global bottom-right. |
| **4 Size** | `BRAND_LOGO_SIZE_PX` = **2× current** (today `88` → **`176`**). Apply in composite CSS / constant; keep safe-zone. |
| **5 Chrome** | Still **logo-only** HTML (`<img class="brand">`). No `.brand-name` text. |
| **6 Cycle** | Full queue until Client Playwright acceptance ends with **«согласовано»** (`ticket_limit: full-queue`). |
| **7 Out of scope (at v2 ship)** | ~~**Phase 2** fonts / type scale / vision~~ → **OPENED** by `phase2-vision-prompt-logo.md`. **Phase 3** character Pixar still OUT. VPS/publish/DB wipe. |

## Code touchpoints (Architect → Backend)

- `public/brand/vernatun-logo.png` — replace from lock #1; verify alpha (no black matte).
- `lib/settings/brand-store.ts` — keep `DEFAULT_LOGO_REF = "/brand/vernatun-logo.png"` (path unchanged; bytes change).
- `lib/studio/carousel-layered-composite.ts`:
  - `BRAND_LOGO_SIZE_PX`: `88` → `176`
  - Default chrome: **role-aware** — cover/cta → `top-left`; body → `bottom-left` (replace `DEFAULT_BRAND_CHROME = "bottom-right"` as product default when no layoutMap override)
  - `resolveLogoPlacement` / defaults when layoutMap absent must honor role rule
  - Slide-num opposite rule already handles left/right — keep collision-safe
- Prompts that hardcode «default bottom-RIGHT» (`create-carousel-prompts.ts` / notes) → align to role defaults (thin text only; no Phase2 font work).
- Smoke: re-composite short carousel (cover + ≥1 body + last) proving positions + 2× size + transparent PNG.

## Client FAIL (Playwright @1440 + composite evidence)

- Black / opaque plate behind logo
- Body logo still bottom-**right** or top
- Cover/last logo still bottom
- Size still ~88px (not ~2×)
- `.brand-name` / duplicate Vernatun text returns
- Acceptance without Playwright HARD GATE → annul

## Chain

```text
Architect (spec + chain.md: asset+alpha, role placement, 2× size, logo-only KEEP)
  → Backend (install PNG strip matte; composite constants + role defaults; thin prompt align)
  → Tester (guards: alpha PNG; cover/cta top-left; body bottom-left; size 176; no .brand-name)
  → Deployer (localhost if needed for live UI)
  → Client (Playwright HARD GATE → cycle to «согласовано»)
```

No AI Bridge / Frontend / Motion / Phase2 / Phase3 unless Brand upload UI broken. No paid MCP.
`ticket_limit: full-queue`
