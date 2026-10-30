# Decisions — C-19 Module SDK registry

Date: 2026-09-19  
Role: Backend

## Stub method behavior

| Method | Behavior | Rationale |
|--------|----------|-----------|
| `generateDraft(topic, options?)` | Returns a **minimal mock** `DraftOutput`: `draftId` = `stub-{moduleId}-{timestamp}`, one element `{ index: 0, kind: "stub", payload: { topic } }`, `meta.mock: true` | Smoke / Frontend can call without C-20 adapters |
| `renderAsset(draft)` | `throw new Error('NotImplemented:C-20')` | Real render lives in C-20 |
| `regenerateElement(draftId, elementIndex)` | `throw new Error('NotImplemented:C-20')` | Granular reroll in C-20 |

## Secrets / APIs

- Stubs **do not** read `process.env` or `.env`.
- No HeyGen / Remotion / Satori / Puppeteer calls from registry or stub modules.
- `HEYGEN_API_KEY` remains documented only in `.env.example` (already present); unused until C-20.

## ID bridge

- Canonical registry keys: `carousel-engine`, `aesthetic-graphics`, `cartoon-reels`, `heygen-reels`.
- Alias map in `src/modules/id-map.ts`: `carousel-4-5` → `carousel-engine`, `infographics` → `aesthetic-graphics`, `heygen-avatar` → `heygen-reels`, `cartoon-reels` unchanged.
- `getModule(id)` normalizes via `toCanonicalModuleId` before lookup.

## Types field names

Locked to architect-spec contracts in `types/module.ts` (`DraftOutput`, `AssetRenderResult`, `ElementOutput`). No renames.

## Worker hints

Each manifest `defaultSettings.worker` points at future worker folder names (`workers/designer-carousel`, etc.) for C-20 — informational only in C-19.

## inputSchema

Minimal `z.object({})` per core module; detailed Zod forms deferred to C-20/C-21.
