# C-20 — Isolated module adapters (M1–M4)

| Field | Value |
|-------|-------|
| **ID** | `C-20` |
| **Priority** | P0 |
| **Area** | module_sdk_workers |
| **Wave** | `W-2026-09-19-sprint6-sdk` |

## Expected (DEV_PLAN 6.2)

- Adapter Module 1 (`carousel-engine`): map draft → HTML/CSS template 1080×1350.
- Adapter Module 2 (`aesthetic-graphics`): vector / SVG card generator.
- Adapter Module 3 (`cartoon-reels`): Lottie/Remotion scene assembler (mock-safe without GPU).
- Adapter Module 4 (`heygen-reels`): HeyGen API gateway (text + avatar → stream URL); mock when no `HEYGEN_API_KEY`.

Each adapter implements `IContentModule` from C-19: `generateDraft`, `renderAsset`, `regenerateElement`.

## Notes

Depends on C-19 registry/types. AI Bridge owns HeyGen + pipeline prompts. Secrets only `.env`.
