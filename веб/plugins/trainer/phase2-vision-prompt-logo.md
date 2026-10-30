# Phase 2 — Vision image-prompt polish + logoTextColor (2026-10-18)

**When:** after logo-placement-v2 Client cycle; user starts **Фаза 2**: scrub IMAGE-model prompt + logo contrast/quality. Cycle `@promts` until Client **«согласовано»**. `ticket_limit: full-queue`.

**SUPERSEDES (narrow):**
- `logo-placement-v2.md` lock **7** «Phase 2 OUT» → Phase 2 **IN** (this card)
- `phase1-logo-wordmark-html.md` «Phase 2 fonts/vision OUT» → vision image-prompt + logo color **IN**
- Hardcoded RE-orange plate lines in `buildVisionRefBackgroundImagePrompt` that **fight** «copy attached etalon» (AI Bridge rewrites; keep solid-plate grammar only when etalon shows it)

**KEEP:** S57 layered HTML; logo placement v2 slots + size baseline; vision_ref BAN Manrope / `typography.scale` / FULL TOKEN CARD; Brand dual-path raw `logoRef`; Phase 3 Pixar **OUT** (except hygiene soften of «3D animated» in conductor image wording).

## User locks (HARD)

| # | Lock |
|---|------|
| **1 logoTextColor** | Designer LLM (sees etalon + knows logo placement) **MUST** emit **`html_layout.logo.textColor`** (alias `logoTextColor`) — CSS hex for logo **word** so HTML chrome does not clash with plate/photo under the mark. Composite **applies** color (text fill and/or safe tint). Missing color on vision_ref = FAIL guard. |
| **2 Logo quality** | Investigate soft/fringe wordmark: baked PNG ~1024×682 shown at **max 176px**; black-matte strip **≤28** leaves fringe. **Prefer (Architect picks one product path in spec):** **(A)** emblem-only PNG + **HTML wordmark** colored by `logoTextColor`, **or (B)** keep wordmark `<img>` + `logoTextColor` for contrast + **crisper** larger mark (better alpha / sharper asset). Document choice in `architect-spec.md`. |
| **3 Image prompt scrub** | Line-by-line audit of **every** string that reaches the **IMAGE model**: `buildVisionRefBackgroundImagePrompt` + `sanitizeBackgroundImagePrompt` (+ appended HARD ban). Remove conflicting / stock / spreadsheet leftovers. **Strengthen:** «**copy layout from the attached etalon image**» as primary SoT. |
| **4 Stock fonts BAN** | Designer **vision_ref** path: still **0** Manrope / Cormorant / `typography.scale` / FULL DESIGN TOKEN CARD in system+user dumps (`assertVisionRefPromptBanClean`). |
| **5 Review-before-implement** | AI Bridge delivers **clean final IMAGE prompt** (full text) into wave report for **user review** → only then implement scrub in code. |
| **6 Cycle** | `@promts` / Client↔Orchestrator until **«согласовано»**. `ticket_limit: full-queue`. |
| **7 Out of scope** | **Phase 3** character Pixar product lock. VPS/publish/DB wipe. AppShell redesign. |

## Proposed clean IMAGE prompt (draft for user review — AI Bridge may refine)

```text
MATCH THE ATTACHED ETALON IMAGE — primary source of truth for composition.
Copy from the picture: plate vs photo share, object/hero zone, empty-space rhythm,
lighting polarity, balance. Do not invent a competing layout system.

BACKGROUND PLATE ONLY, vertical 4:5, 1080×1350.
Hero/subject from Scriptwriter visual_prompt (scene materials/mood/object ONLY): {visual_prompt}.
{optional conductor line when character_paint=in_image on cover|cta:
  Vernatun conductor to-camera WITH the subject — presenter, not a lifestyle story actor.
  Style: match etalon (photoreal or soft illustrated). Avoid forcing "Pixar / 3D animated" wording.}

HARD BAN: NO TEXT, NO LETTERS, NO WORDS, NO TYPOGRAPHY, NO LOGOS, NO WATERMARKS,
NO UI BADGES, NO CAPTIONS, NO BRAND MARKS in pixels.
Typography, brand logo, and CTA are HTML layers later.

Slide {n}/{total}.
```

**Must NOT appear** on vision_ref image path (scrub list):
- Manrope / Cormorant / `typography.scale` / FULL DESIGN TOKEN / Title = Npx tables
- «always full-bleed kitchen / room» as style when etalon is plate+object
- Hardcoded alternating orange/white **unless** etalon polarity is mirrored (prefer «match etalon plate polarity»)
- Bake logo / wordmark / club name into pixels
- Forced Pixar / toy-3D character language (Phase 3 OUT — hygiene soften only)

## logoTextColor contract (AI Bridge → Backend)

```text
html_layout.logo = {
  placement: top-left | bottom-left | … (v2 role defaults KEEP),
  textColor: "#RRGGBB"   // REQUIRED on vision_ref when brand chrome present
}
// aliases accepted: logoTextColor, logo.text_color
```

- LLM picks contrast vs **local bg under logo** (etalon-aware).
- Path **A:** emblem PNG `<img>` + HTML wordmark `.brand-wordmark { color: textColor }` (may reintroduce controlled text — **not** duplicate of baked letters in PNG).
- Path **B:** wordmark PNG only + apply `textColor` via CSS filter/mask/SVG fill where safe; still emit field for future A.
- Never bake colored wordmark into IMAGE model bg.

## Skills / code touchpoints

| Role | Touch |
|------|--------|
| Architect | Spec: path A vs B; schema field; image-prompt SoT; chain.md; review gate before scrub land |
| AI Bridge | Scrub `buildVisionRefBackgroundImagePrompt` + sanitize; Designer emit `logo.textColor`; ban assert; **prompt dump for user review first** |
| Backend | Zod/`html_layout`; composite apply color; logo asset quality (emblem split and/or alpha/fringe fix); smoke |
| Tester | Guards: ban clean; logoTextColor present+applied; fringe/contrast smoke; no stock fonts in Designer dump |
| Client | Playwright @1440 + composite evidence → cycle to «согласовано» |

## Client FAIL

- Logo text/mark unreadable / same-luminance clash with plate
- Fringe black matte / muddy 176px wordmark with no A or B fix
- Image prompt still conflicts with «copy etalon» or still has stock font/scale inject on Designer path
- Scrub landed **without** user-reviewed clean prompt artifact in wave folder
- Phase 3 Pixar product work sneaks in
- Acceptance without Playwright HARD GATE

## Chain

```text
Architect (spec + chain.md: logoTextColor · A|B logo quality · prompt scrub SoT · review-before-implement)
  → AI Bridge (clean IMAGE prompt for user review → then scrub + logoTextColor contract in prompts)
  → Backend (schema + composite color apply + logo asset quality)
  → Tester (guards)
  → smoke (short carousel / vision_ref path)
  → Client (Playwright → «согласовано»; full-queue)
```

No Frontend/Motion unless Brand upload UI blocks emblem. No paid MCP. `shell_freeze` AppShell.
