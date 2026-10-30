# Sprint 9 — Carousel + Reels quality (Claude Code bar)

**When:** `DEV_PLAN` 9.1–9.11; quality like strong Claude Code run; IG/YT drafts only.

## HARD user locks

| Lock | Meaning |
|------|---------|
| **upgrade_only** | Patch prompts / skills / contracts / fixtures **in place** |
| **no_pipeline_break** | Keep **Razbor → Scriptwriter → Designer → Draft**; reels Scriptwriter → existing render |
| **shell_freeze** | No UI shell / nav / Create chrome redesign |
| **no social publish** | Draft/HITL only until 9.9–9.10 green |
| **modules** | `carousel-engine` + `custom-reels` only → else Sprint 23 |

## Skills

- `prompt-engineering` § Sprint 9
- `carousel-json-contract` § Sprint 9
- `reels-scriptwriter` § Sprint 9
- `content-pipeline-agents` § Sprint 9
- `ai-bridge` § Sprint 9
- `architect` § Sprint 9
- `tester` § 9.9–9.10
- `backend` § Sprint 9 fixtures/STRICT only

## Chain hint

Trainer → Architect → **AI Bridge** (primary) → Backend (routing / HTML renderer / zod) → Tester → Fixer → Deployer → Client

**Carousel audit reconstruction (2026-10-16):** same chain; Architect must lock Sonnet slug + describe≠image routing + Phase3 HTML/CSS-first + budget **6 PNG**. Frontend only if preview wire broken — else **shell_freeze**.

**Prompt-trace diagnostic (2026-10-16):** same locks; primary skill **`carousel-prompt-trace`** → MD under `docs/карусель тест/`; AI Bridge injects VIRAL CRAFT + fills session logs; optional `CAROUSEL_PROMPT_TRACE=1`.

## Do NOT touch

AppShell/nav; HeyGen/cartoon/aesthetic/articles; mesh rewrite; social publish workers; Sprint 10 Apify ops (unless blocker).