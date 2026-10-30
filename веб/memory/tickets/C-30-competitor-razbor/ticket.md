# C-30 — Competitor «Разбор» multi-agent modal + Drafts

| Field | Value |
|-------|-------|
| **ID** | `C-30` |
| **Priority** | P0 |
| **Area** | studio / carousel-engine / agents |
| **Wave** | W-2026-09-20-carousel-razbor |
| **Status** | done |

## Expected

1. Each **competitor** card on carousel-engine: button **«Разбор»**.
2. Opens contextual modal/window:
   - **Right:** enlarged competitor carousel (mock slides).
   - **Left:** chat panes with AI agents (Analyst, Scriptwriter, Designer/Renderer at minimum).
3. **Analyst** auto-analyzes carousel parts by algorithm; explains strong metrics; proposes modified scenario for our carousel.
4. User action in **Scriptwriter** chat starts script writing → tasks cascade to other agents → last agent delivers **our** branded carousel (logo/mock assets).
5. Result lands in **Черновики** (Ours Drafts); unpublished; updates when edited.

Mock/deterministic agent messages OK without live LLM keys (optional LLM if key present).

## Notes

Зона: Backend (mock agent pipeline + drafts store API or zustand) → Frontend → Motion.
