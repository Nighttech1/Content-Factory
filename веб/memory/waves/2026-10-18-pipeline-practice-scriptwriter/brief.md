# Brief — pipeline practice (Scriptwriter = LLM-analyst)

**Status:** awaiting user answers to clarifying questions (max 10) before Architect full chain.

## Done already
- Etalons copied → `docs/карусель тест/эталон/pipeline-practice-2026-10-18/`
  - `01-higven-heavy-lifting-grid.png`
  - `02-sua-logo-moto-grid.png`
  - schema A/B jpgs
- Removed **forced** `logo.textColor` MUST from Designer prompts (color after bg / Backend auto)

## Target flow (user + GPT schema)
1. Input: style etalon (Settings) + topic (sheet) + Vernatun logo (Brand)
2. **Scriptwriter (Claude Haiku)** instead of “LLM-analyst” → text + (later) layout JSON / image prompt?
3. HITL: agree text with user
4. Image model → bg only
5. Renderer → slides
6. Playwright + **Client + Art Director** after step 5

## Practice order
ONE etalon at a time (01 then 02).
