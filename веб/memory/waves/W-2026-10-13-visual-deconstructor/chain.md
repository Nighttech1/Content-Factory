# Chain — W-2026-10-13-visual-deconstructor (единый для пачки)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths` на deconstruct API ↔ design-library persist ↔ `carousel-html-renderer` / builder; **не** ломать `RazborModal`.  
> Тикеты: **C-visual-style-deconstructor (P0) → C-design-slot-sliced-preview (P0) → C-carousel-css-vars-builder (P0/P1) → C-reels-scriptwriter-upgrade (P1)**.

**One-liner:** Architect (done) → AI Bridge → Backend → Frontend → Tester → Fixer → Deployer → Client **S44**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Архитектор | `memory/waves/W-2026-10-13-visual-deconstructor.md`; `memory/tickets/C-visual-style-deconstructor\|C-design-slot-sliced-preview\|C-carousel-css-vars-builder\|C-reels-scriptwriter-upgrade/architect-spec.md`; этот `chain.md` | [x] | Только memory; **no** `app/` / `components/` prod-code |
| 1 | AI Bridge | `deconstructStyle` vision→`DesignPresetFile`+DESIGN.md; seed golden **`dark_notes`** + **`bento_glass`** (user refs); create-carousel prompts = preset CSS vars + role kits + sliced-only; `lib/mesh/agent-defaults.ts` **custom-reels** ← `reels-scriptwriter` canon; optional `lib/studio/design-from-image-prompts.ts` evolve | [x] | Contracts: `memory/tickets/C-*/ai-bridge.md`. Types `types/design.ts`; agents `lib/agents/deconstructStyle.ts`; seeds `lib/settings/design-presets/`; reels `lib/studio/reels-script-contract.ts`. No Embla UI / RazborModal. |
| 2 | Backend | `POST` deconstruct (image → preset+MD); active sync preset fields on library/active resolve; evolve `lib/studio/carousel-html-renderer.ts` → **`carouselHtmlBuilder`** CSS vars + cover/body/cta kits; soft-fail no wipe library | [ ] | Skills: `backend`, `design-system`. Prefer thin `app/api/settings/design-deconstruct` (or reuse studio route). **No DDL** unless Architect mid-flight. Data-safety: no truncate media. |
| 3 | Frontend | **Sequential same writer queue:** | [ ] | Skills: `content-factory-ui`, `21st-ui-catalog`, `design-system` |
| 3a | Frontend — **C-design-slot-sliced-preview** | `components/settings/DesignLibraryCarousel.tsx`; `SettingsShell.tsx`; `lib/settings/design-library.ts` (**extend** `DesignLibrarySlot`); Quick Theme Tuner swatches → live `--cf-design-*` on **3×4:5** mocks; CTA «Создать из референса» upload → deconstruct API | [x] | SlicedSlotPreview + QuickThemeTuner; seeds; Create presetFile wire. See `memory/tickets/C-design-slot-sliced-preview/decisions.md`. |
| 3b | Frontend — Create sliced + wire | `CreateCarouselModal` / Designer preview strip — **N×4:5** tiles; bind active `DesignPresetFile` + overrides; **do not** show panorama product preview | [ ] | After builder contract exists; read `activeId` only |
| 3c | Frontend — Reels surface (light) | Studio `/studio/custom-reels` or Team chat label **Сценарист**; no carousel JSON UI as primary | [ ] | Prompt text from AI Bridge defaults; FE smoke only if label/wire missing |
| 4 | Тестировщик | `memory/tickets/C-*/guards.md`; S44 asserts A/B/C; budget counter ≤40; greps: no panorama-only Settings preview; reels ≠ `slides[]` 4:5; `RazborModal` untouched | [ ] | Skill `tester`. Smoke script optional under `scripts/smoke-w-2026-10-13-visual-deconstructor.ts` |
| 5 | Фиксер | Только red paths from Tester | [x] | CTA pill captionLine; unify normalizeCarouselSlideRole; kit chrome; regen wave PNGs. Notes: `memory/tickets/C-carousel-css-vars-builder/fixer.md` |
| 6 | Деплоер | localhost `/settings`, `/studio/carousel-engine`, `/studio/custom-reels` (or mesh); copy Create-draw PNGs → `generatedMedia/wave-visual-deconstructor/{preset}/`; restart local API if needed | [x] | 200 on settings/carousel/reels; artifacts 9 PNG @36/40; `deployer.md`. No new PNG. |
| 7 | Клиент | Playwright MCP @1440 — **S44 HARD** full (Settings sliced+Tuner+deconstruct; Create vs golden; Reels hook/CTA) | [x] | **ПРИНЯТО С ЗАМЕЧАНИЯМИ** — `client-verdict.md` + `W-2026-10-13-visual-deconstructor-client.md`; artifacts linked; Reels C deferred |

## Ticket pointer chains

Каждый тикет ссылается на **этот** файл как канон:

- `memory/tickets/C-visual-style-deconstructor/chain.md` → pointer
- `memory/tickets/C-design-slot-sliced-preview/chain.md` → pointer
- `memory/tickets/C-carousel-css-vars-builder/chain.md` → pointer
- `memory/tickets/C-reels-scriptwriter-upgrade/chain.md` → pointer

## Overlap ban

| Surface | Rule |
|---------|------|
| `lib/settings/design-library.ts` + Settings Embla | Frontend **3a** only for UI; AI Bridge may add types/helpers **before** FE; one writer at a time |
| `carousel-html-renderer.ts` / builder | Backend step **2** owns evolve; FE binds only |
| Create modal preview | Frontend **3b** after builder; no parallel rewrite with Settings Embla |
| `agent-defaults.ts` custom-reels | AI Bridge step **1** only |
| `RazborModal.tsx` | **Out of scope / freeze** |
| PNG generation | Budget gate shared; Deployer copies to artifact folder — **не** >40 |

## Acceptance gate (Client)

Закрытие волны только после **S44** + guards на все четыре тикета + артефакты в `generatedMedia/wave-visual-deconstructor/` (или stop-report at budget).
