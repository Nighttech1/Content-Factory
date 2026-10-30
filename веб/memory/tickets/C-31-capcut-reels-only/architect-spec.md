# Architect spec — C-31

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

**CapCut-like editor** (`/studio/[moduleId]/edit/[draftId]`) доступен **только** для reels-модулей (`cartoon-reels`, `heygen-reels`). На reels competitor open → CapCut (reference prefills). **carousel-engine** никогда не открывает CapCut — только Разбор (C-30). По желанию: mock thumbs / grid polish на reels (9:16).

## Depends

- **C-29** grid patterns (shared card/carousel props).
- **C-30** Razbor on carousel (so carousel competitor path exists).

## In scope

### Hard gate CapCut by module

1. Canonical allowlist for CapCut route:

```ts
const CAPCUT_MODULE_IDS = ["cartoon-reels", "heygen-reels"] as const;
// helper: isCapCutModule(moduleId) 
// optional also: outputFormat === "video_9_16" for custom plugins that opt-in later — default OFF for custom unless id matches
```

2. `app/studio/[moduleId]/edit/[draftId]/page.tsx`:
   - If `!isCapCutModule(moduleId)` → `notFound()` **or** redirect to `/studio/[moduleId]` (prefer **notFound** + FE never links).
3. `StudioModuleWorkspace.openDraftEditor`:
   - Reels → navigate CapCut (current behaviour).
   - `carousel-engine` → **do not** navigate CapCut; open Drafts panel or no-op with hint («Черновики / Разбор»).
   - `aesthetic-graphics` / others: **no CapCut** in this wave (same gate); empty draft may stay visual-only or open lightweight stub — **not** CapCut shell.

### Competitor open behaviour

| Module | Competitor primary action |
|--------|---------------------------|
| `carousel-engine` | **«Разбор»** → C-30 modal (already) |
| `cartoon-reels`, `heygen-reels` | Open CapCut with query/state: `?ref=competitorId` or draftId `ref-{competitorId}`; shell shows competitor thumb as reference clip/layer |
| Other | No CapCut; no Razbor unless product extends later |

4. `CapCutEditorShell`: read optional `referenceCompetitorId` / feed lookup mock; show reference badge in preview — no real video decode required.

### Reels feed polish

1. Ensure reels fixtures have **https mock thumbs** (picsum seed) — Backend light expand if missing (can be Frontend-only if Backend already did partial in C-29; prefer Backend small patch in this chain if counts/thumbs weak).
2. Card aspect on reels: **9:16** (prop), layout: vertical list **or** compact grid — product says «same grid polish as C-29 if shared **or** reels-appropriate 9:16». **Decision:** vertical scroll with 9:16 cards is enough; optional 2-col grid if space — not mandatory 3×7.

### Inspect HITL

- Keep `/studio/inspect/[id]` intact (approve / hook swap). CapCut gate must not break inspect.

## Out of scope

- Building real CapCut NLE / Remotion timeline engine.
- Razbor for reels.
- CapCut for `aesthetic-graphics` / `carousel-engine`.
- Prod deploy / DB changes.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Gate + competitor→editor + workspace | Frontend | Primary owner |
| Reels thumbs fixtures (if needed) | Backend | Small; skip if already good |
| Motion | Motion | optional light on editor enter with ref |
| AI Bridge | — | no |

## Contracts

### `isCapCutModule(moduleId: string): boolean`

- true iff `cartoon-reels` | `heygen-reels`.

### Editor route

| moduleId | Result |
|----------|--------|
| reels allowlist | Render `CapCutEditorShell` |
| else | `notFound()` |

### Navigation matrix

| Surface | carousel-engine | reels |
|---------|-----------------|-------|
| Draft empty / Generate draft entry | Drafts / workspace only | → CapCut |
| Competitor CTA | Разбор | → CapCut + ref |
| Ours card click | no CapCut (optional preview later) | optional CapCut for ours mock — **default:** competitor-only auto-open; ours may open CapCut as empty/new draft if product wants parity — **Architect default:** competitor open → CapCut; ours card no forced navigation |

### Invariants

- Carousel never CapCut.
- CapCut only reels modules.
- Inspect HITL unchanged.
- No DB wipe.

## Acceptance criteria (язык Клиента)

1. С carousel-engine **нельзя** попасть в CapCut-редактор (ни draft, ни конкурент).
2. На cartoon-reels / heygen-reels редактор CapCut открывается как раньше для draft.
3. Клик по **конкуренту** на reels открывает CapCut с mock reference, **не** модал Разбор.
4. В лентах reels есть понятные mock-превью (9:16).
5. Inspect HITL на месте. Guard: route gate + navigation matrix. Safety: no DB wipe.

## Risks

- **C-28 regression:** all modules currently push `/edit/` — must fix workspace before Client.
- **Deep links:** old bookmarks to `/studio/carousel-engine/edit/...` → 404 by design.
- **custom-* video plugins:** CapCut off until explicit allowlist — document.
- **Overlap paths:** Frontend owns gate; Backend only fixtures — sequential if both touch fixtures.

## Mid-flight escalation

Если Client wants CapCut for aesthetic-graphics: new ticket. Если competitor on reels should open Razbor instead: product conflict → Architect (current product rule 3 wins: CapCut).
