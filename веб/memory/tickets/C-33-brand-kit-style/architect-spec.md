# Architect spec — C-33

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Brand Kit page показывает логотип Vernatun + читаемый DESIGN; агенты Razbor (Designer/Renderer path) загружают brand tokens/logo из общего `lib/brand/` + `GET /api/brand-kit`.

## Depends

- **C-32** preferably done or non-blocking (no overlapping paths with C-32 FE workspace if sequenced). Wave order: C-32 → **C-33** → C-34.
- Stitch source: `stitch_armenian_club_brandbook/atelier_synth/DESIGN.md`.

## In scope

### 1. Logo asset

1. Place SVG (preferred) or PNG at `public/brand/vernatun-logo.svg` (and optional PNG fallback).
2. No secrets in asset filenames/content.

### 2. DESIGN.md in repo

1. Add `docs/DESIGN.md` — **copy or symlink content** from stitch brandbook (`stitch_armenian_club_brandbook/atelier_synth/DESIGN.md`). Prefer real file copy on Windows if symlink unreliable.
2. Do **not** invent a new purple/cream palette; preserve stitch / Vernatun tokens already in product globals where they align.
3. Brand Kit page renders readable DESIGN content (markdown → HTML or preformatted sections).

### 3. Brand pack module + API

1. `lib/brand/loadBrandKit.ts` — loads logo path, palette/tokens summary, and DESIGN body (or structured subset: colors, typography, logoUrl, voice one-liners).
2. `GET /api/brand-kit` — JSON response for UI + agents; **no** env secrets in payload.
3. Shape (minimum):

```ts
type BrandKit = {
  logoUrl: string; // e.g. "/brand/vernatun-logo.svg"
  name: string; // "Vernatun"
  palette: Record<string, string>; // key token → hex/css var
  typography?: { display?: string; body?: string };
  designMarkdown: string; // full or truncated DESIGN.md
  voice?: string[];
};
```

### 4. Brand Kit page

1. Upgrade `app/brand-kit/page.tsx`: show logo prominently + DESIGN content (not placeholder only).
2. Fetch via `GET /api/brand-kit` or server-side `loadBrandKit()`.

### 5. Razbor designer uses brand

1. Wire Designer step in `razbor-pipeline` (and/or draft slide factory) to call `loadBrandKit` / consume brand pack so **our** carousel slides reference logo URL + palette from Brand Kit.
2. Mock slide captions/URLs may stay picsum-like, but include brand mark path from kit (cover/finale logo).

## Out of scope

- Settings LLM models / aggregator → **C-34**.
- Remotion full render / HeyGen.
- Changing global `app/globals.css` token architecture wholesale (may **read** tokens into BrandKit; do not redesign shell).
- DB persistence of brand kit.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| `loadBrandKit` + `GET /api/brand-kit` + DESIGN.md copy | Backend | Read fs / public; no Prisma |
| Brand Kit page + logo in UI | Frontend | `/brand-kit` |
| Razbor designer brand wire | Backend (+ FE if preview shows logo) | Pipeline uses brand pack |
| Motion | Optional | Logo/page enter only if needed |
| AI Bridge | Optional mid-flight | Only if designer prompts need brand injection text — default Backend embeds strings |

## Contracts

### GET /api/brand-kit

| Status | Body |
|--------|------|
| 200 | `BrandKit` JSON |
| Fail | Never expose secrets; empty palette + fallback logo path OK |

### Agent consumption

| Consumer | Source |
|----------|--------|
| Designer / draft slides | `loadBrandKit()` or API |
| Brand Kit page | Same source of truth |

### Invariants

- Single logo path: `/brand/vernatun-logo.svg`.
- DESIGN content from stitch → `docs/DESIGN.md` (not invented slop).
- No real API keys in memory/git.

## Acceptance criteria (язык Клиента)

1. На `/brand-kit` виден логотип Vernatun и читаемый текст из DESIGN.
2. После Разбора «наш» черновик карусели опирается на логотип/палитру Brand Kit (видно в слайдах/метаданных черновика).
3. Guard: API 200 + logo file exists + DESIGN present. Safety: no secrets, no DB wipe.

## Risks

- Windows symlink for DESIGN.md may fail → prefer file copy.
- Stitch DESIGN may diverge from live CSS tokens — BrandKit should document both; do not break shell tokens.
- Overlap with C-32 if FE edits RazborModal same time — sequence after C-32.

## Mid-flight escalation

If full DESIGN is too large for API — paginate or return structured summary + separate `/api/brand-kit/design` text route; update spec.
