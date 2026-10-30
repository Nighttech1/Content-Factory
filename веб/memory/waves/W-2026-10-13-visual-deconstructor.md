# Wave W-2026-10-13 — Visual Style Deconstructor + DESIGN.md + Reels Scriptwriter

| Field | Value |
|-------|-------|
| **ID** | `W-2026-10-13-visual-deconstructor` |
| **Date** | 2026-10-13 |
| **Status** | architect — specs ready; await AI Bridge |
| **before_sha** | `unknown` (no git) |
| **after_sha** | _(после прохода)_ |
| **Max tickets** | **≤3 soft** — три P0 карусели в фокусе; **C-reels-scriptwriter-upgrade** P1 в той же волне (план Тренера держит reels в chain) |
| **Trainer grade** | B — `memory/trainer/2026-10-13-visual-deconstructor-grade.md` |
| **Skills** | `design-system`, `create-design-md`, `workers/designer-carousel`, `carousel-json-contract`, `content-factory-ui`, `ai-bridge`, `reels-scriptwriter`, `content-pipeline-agents`, `backend`, `client-scenarios` **S44** |
| **Artifact folder** | `generatedMedia/wave-visual-deconstructor/` |
| **PNG budget** | **`png_budget_max: 40`** — Settings mock = CSS 0-LLM; at 40 STOP + report |

## Intent

1. **Visual Style Deconstructor (P0):** vision upload → typed `DesignPresetFile` + `DESIGN.md` → Embla library slot ≤10 + `activeId`; seed golden **`dark_notes`** + **`bento_glass`** from user refs.
2. **Settings Design sliced preview (P0):** каждый слот = **3×4:5** (cover / body / cta) CSS mock — **не** панорама; **Quick Theme Tuner** → live `--cf-design-*`.
3. **Carousel CSS-vars builder (P0/P1):** эволюция `lib/studio/carousel-html-renderer.ts` → role kits `cover` / `body_slide` / `cta_slide` + CSS vars; alias **`carouselHtmlBuilder`**.
4. **Reels Scriptwriter (P1):** отдельный от carousel Dramaturgy JSON; hook 0–2s + beats + CTA + `promptForMontage`; wire `agent-defaults` custom-reels.

**RazborModal** — **freeze** (не rewrite). Create-from-ref / «Добавить новый дизайн» живут в **Settings Design** (+ существующий CTA path без правки Razbor chat).

## Tickets in this wave

| ID | P | Folder | Result |
|----|---|--------|--------|
| **C-visual-style-deconstructor** | **P0** | `memory/tickets/C-visual-style-deconstructor/` | — |
| **C-design-slot-sliced-preview** | **P0** | `memory/tickets/C-design-slot-sliced-preview/` | — |
| **C-carousel-css-vars-builder** | P0/P1 | `memory/tickets/C-carousel-css-vars-builder/` | — |
| **C-reels-scriptwriter-upgrade** | P1 | `memory/tickets/C-reels-scriptwriter-upgrade/` | — |

## Path lock (NO overlapping parallel writers)

| Order | Surface | Rule |
|-------|---------|------|
| 1 | Types + deconstruct + seeds | **AI Bridge** first — `DesignPresetFile`, `deconstructStyle`, golden seeds, create-carousel prompts, reels agent-defaults |
| 2 | Persist / API | **Backend** — POST deconstruct; active sync preset fields on library; builder server path if any |
| 3 | Settings UI + Create preview | **Frontend** — DesignSlotManager 3×4:5 + Tuner; Create stays sliced; extend `DesignLibrarySlot` consumers |
| 4 | Builder evolve | **Backend and/or Frontend** on `carousel-html-renderer` → `carouselHtmlBuilder` — **after** types exist; **не** parallel с Settings Embla writers на тех же persist helpers без sequential handoff |
| — | Overlap ban | Не parallel: deconstruct API ↔ Settings library persist ↔ builder templates; **не** edit `RazborModal.tsx` |
| — | Reels | `agent-defaults` custom-reels + Studio reels chat — **после** (или sequential same AI Bridge pass as deconstruct prompts); **не** путать с carousel JSON |

## Wave chain (roles)

```text
Тренер (done, B) → Архитектор (this wave)
  → AI Bridge (deconstructStyle + seeds + create-carousel prompts + reels agent-defaults)
  → Backend (POST deconstruct; active sync; carouselHtmlBuilder CSS vars)
  → Frontend (3×4:5 + Tuner + Create-from-ref wire; Create sliced preview)
  → Тестировщик (guards S44 + budget counter)
  → Фиксер
  → Деплоер (localhost; copy PNGs → generatedMedia/wave-visual-deconstructor/)
  → Клиент Playwright (**S44 HARD** @1440)
```

**Единый chain:** `memory/waves/W-2026-10-13-visual-deconstructor/chain.md`

## Spec index

| Ticket | Spec |
|--------|------|
| C-visual-style-deconstructor | `memory/tickets/C-visual-style-deconstructor/architect-spec.md` |
| C-design-slot-sliced-preview | `memory/tickets/C-design-slot-sliced-preview/architect-spec.md` |
| C-carousel-css-vars-builder | `memory/tickets/C-carousel-css-vars-builder/architect-spec.md` |
| C-reels-scriptwriter-upgrade | `memory/tickets/C-reels-scriptwriter-upgrade/architect-spec.md` |

## Type / persist locks (Architect names)

| Key / type | Owner | Notes |
|------------|-------|-------|
| `DesignPresetFile` | Architect → AI Bridge / Backend / FE | Canon sketch in `design-system` + `workers/designer-carousel`; **lock Zod/TS names** in ticket specs |
| `DesignLibrarySlot` **extend** | FE + shared `lib/settings/design-library.ts` | Keep `id/name/markdown/html?/previewUrl?/createdAt`; **add** `presetFile?: DesignPresetFile` (or `presetId` + embedded colors/overrides) |
| `cf.settings.design.library.v1` | FE (existing) | **Do not** rename; slots may grow fields; migrate old MD-only slots |
| `cf.settings.design.activeId` | FE + AI Bridge + Backend | Designer / builder resolve active **preset + MD** |
| CSS vars `--cf-design-*` | Builder + Tuner | `bg`, `accent`, `text`, `surface`, `muted` (+ overrides) |
| `carouselHtmlBuilder` | evolve `carousel-html-renderer.ts` | Alias export OK; role kits cover/body/cta |
| Artifact path | Deployer / Client | `generatedMedia/wave-visual-deconstructor/{preset}/slide_NN.png` |
| `png_budget_max` | All | **40**; Settings = CSS mocks |

## Supersedes / extends

| Prior | By |
|-------|-----|
| C-settings-design-md-carousel Embla MD-only slots | **C-visual-style-deconstructor** + **C-design-slot-sliced-preview** — preset+MD + 3×4:5 |
| C-carousel-html-designer / `carousel-html-renderer` | **C-carousel-css-vars-builder** — CSS vars + role kits |
| custom-reels weak copywriter prompts | **C-reels-scriptwriter-upgrade** — `reels-scriptwriter` skill canon |
| S43 Design Embla Close / library | Keep Close HARD; S44 adds sliced + Tuner + deconstruct quality |

## Freeze

- **`RazborModal.tsx`** — out of scope / freeze
- No Prisma DESIGN library DDL unless mid-flight escalation
- No prod/VPS
- Panorama JPG = Deconstructor **input only**, never product deliverable preview

## Stop report (заполняет Оркестратор)

**Закрыто (Client+guard):** —

**Осталось:** AI Bridge → Backend → Frontend → Tester → Fixer → Deployer → Client S44

**Готов продолжить** после Architect handoff (≤3 P0 в фокусе; reels P1 в том же chain).
