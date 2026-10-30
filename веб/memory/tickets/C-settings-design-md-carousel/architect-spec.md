# Architect spec — C-settings-design-md-carousel (P0/P1)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-13-drafts-design-team`.  
> Shared chain: `memory/waves/W-2026-10-13-drafts-design-team/chain.md`.  
> Canon: `content-factory-ui` (Design Embla block), `21st-ui-catalog` (Embla), `carousel-json-contract` (active DESIGN.md), `ai-bridge` (Razbor add-design).  
> Extends / supersedes single-file Design UX of **C-143 / C-145** preview with library carousel.  
> Bundle: Embla ≤10 + chip + activeId→Designer + preview Close HARD + «Добавить новый дизайн» (не 4-й тикет).

## Goal

Settings → **Дизайн** = Embla library до **10** слотов DESIGN.md; выбор слота задаёт `activeDesignId` для Designer; превью MD закрывается надёжно; Разборщик CTA загружает liked image → MD+HTML → current slot.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-sd-1 Library persist** | `localStorage` key **`cf.settings.design.library.v1`**: array of slots ≤ **10**. Shape: `{ id, name, markdown, html?: string, previewUrl?: string, createdAt: string }`. |
| **D-sd-2 Active id** | Key **`cf.settings.design.activeId`**. Click/select Embla slide → set active. Designer Create/draw reads **only** active slot markdown (AI Bridge + FE handoff). |
| **D-sd-3 Embla UI** | 21st **`carousel.tsx` / Embla** pattern. **Forbidden:** `@appica` dependency. Horizontal slides; each = preview frame + chip/button **DESIGN.md** top-right. |
| **D-sd-4 Upload MD** | Existing «Загрузить DESIGN.md» appends or replaces a slot (cap 10 — replace oldest or block with RU message; prefer block + toast when full unless product picks replace-oldest — **default: block at 10**). |
| **D-sd-5 Razbor CTA** | Button **«Добавить новый дизайн»** → file input image → AI Bridge/Backend parse → `{ markdown, html }` → append library + **set active** + Embla slide. Lives in **Settings Design**, not RazborModal rewrite. |
| **D-sd-6 Preview Close HARD** | `DesignPreviewPanel`: Close / Esc / toggle → `open=false`, panel unmounted or not visible; persist `cf.settings.design-preview.open=false`. |
| **D-sd-7 Close outside pointer capture** | **X** (and Esc) must **not** live under the drag handle that calls `setPointerCapture`. Move Close **outside** capture target (separate chrome row or stopPropagation + no capture on Close hit-area). Root cause today: Close sits inside drag bar with `setPointerCapture`. |
| **D-sd-8 Designer chip** | Team/Create Designer chip reflects **active** library filename / slot name (parity with design.md chip canon). |
| **D-sd-9 Migration** | On first load: if legacy single `designMd` override exists and library empty → seed **one** slot + set activeId. Do not wipe user MD. |
| **D-sd-10 Razbor freeze** | **Do not** break / rewrite `RazborModal.tsx` for this CTA. |

## In scope

| Path | Owner |
|------|--------|
| `components/settings/SettingsShell.tsx` | Frontend |
| `components/settings/DesignPreviewPanel.tsx` | Frontend (Close + capture fix) |
| New: Embla library component under `components/settings/` | Frontend + 21st |
| New: `lib/settings/design-library.ts` (read/write/cap/activeId) | Frontend |
| `lib/settings/design-preview-persist.ts` | Frontend (keep keys; Close write) |
| Designer / generate-slides / prompts reading active MD | AI Bridge (+ Backend if server path) |
| Image→MD+HTML API or client LLM path | AI Bridge → Backend |
| Optional wire CreateDesigner chip | Frontend (after library exists) |

## Out of scope

- Re-adding Settings LLM / Agents / Scout blocks (C-145)
- Prisma DESIGN library
- Editing RazborModal internals
- Prod/VPS

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Embla UI + persist + Close fix + CTA chrome | **Frontend** | Wave step **4a** (after drafts P0 + AI Bridge/Backend contracts) |
| Parse image → MD+HTML; Designer active MD resolve | **AI Bridge** | Wave step 2 |
| Upload/parse route if needed | **Backend** | Wave step 3; may be thin or deferred if client-only with Architect note |
| QA | Tester → Client **S43.2–4** | Embla ≤10, Close, CTA smoke |

## Contracts

```ts
type DesignLibrarySlot = {
  id: string;
  name: string; // e.g. DESIGN.md / user filename
  markdown: string;
  html?: string;
  previewUrl?: string;
  createdAt: string;
};

// localStorage
// cf.settings.design.library.v1 → DesignLibrarySlot[] (max 10)
// cf.settings.design.activeId → string | null

type DesignFromImageResponse = {
  markdown: string;
  html?: string;
  source: "live" | "mock";
};
```

### Close algorithm (HARD)

1. User clicks X / Esc / «Закрыть превью».
2. `setOpen(false)` + `writeDesignPreviewOpen(false)`.
3. Panel not in accessibility tree / not visible on snapshot.
4. Pointer capture released; no stuck overlay.

## Acceptance criteria (язык Клиента / S43)

1. `/settings` → Дизайн → Embla ≤10 слайдов; chip **DESIGN.md**; select → active.
2. Открыть превью → **Close** → panel **gone** (snapshot).
3. Видна **«Добавить новый дизайн»** + file input smoke; after Backend/AI Bridge — image creates/sets current slot.
4. Next Create Designer draw uses **active** MD (guard / network or fixture assert).

## Risks

- Pointer capture on drag parent swallows Close clicks.
- Library >10 without policy → corrupt UX.
- Parallel writers on SettingsShell + Create modal reading different MD sources.

## Mid-flight escalation

Если parse requires new Prisma / bucket storage — стоп → Архитектор → Backend DDL path + `safe-db-migrations`.
