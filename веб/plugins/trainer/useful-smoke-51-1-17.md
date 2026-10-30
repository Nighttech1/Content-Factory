# Useful-only smoke — rows 51 / 1 / 17

> **SUPERSEDED smoke set 2026-10-17 (S57):** user explicit — **DELETE** `docs/карусель тест/smoke-useful-51-1-17/` and replace with **ONE** new **4-slide** layered-html carousel for Client score. Product paint → `plugins/trainer/carousel-layered-html-pipeline.md`. Keep useful-only **gid** lock for sheet intake if still in scope.

**When (legacy mini-wave):** после correct pipeline. Smoke из Google Sheet вкладки **«Полезные карусели»**.

## User locks (HARD)

| # | Lock |
|---|------|
| 1 | **Intake = useful ONLY.** Tab **«Полезные карусели»** · gid=`902078005`. **Ignore** meetings tab entirely. User will insert meeting topics **into useful** with **СТА=3** later — do **not** dual-read meetings. |
| 2 | Settings **Brand** + **Персонажи** field groups: max width **~50vw / `max-w-[50%]`** (половина экрана). |
| 3 | UI rename everywhere: **«Пейзажи» → «Персонажи»** (labels, TOC, aria). Internal API key / persist id `landscapes` **may stay** or alias → `characters`; product copy = **Персонажи**. |
| 4 | Smoke **NOW:** **3 carousels × 4 slides** from useful rows **№ 51, 1, 17**. Artifacts + **MD timeline** (which LLM, prompts in/out) → `docs/карусель тест/` (or subfolder e.g. `useful-smoke-51-1-17/`). |

## Sheet

- Spreadsheet: `https://docs.google.com/spreadsheets/d/1kOJ1CjMK5rNldM1IGNLdiVXqHTMeCuG35yP6_w6Y5Ls`
- **Only** gid `902078005` (Полезные карусели)
- Rows: **51**, **1**, **17** (order of smoke OK as listed)
- `slides` target this smoke: **4** per carousel
- Preflight: confirm useful tab visible before gen

## Prompt-trace MD (mandatory)

Per carousel (or one timeline MD covering all three):

| Block | Required |
|-------|----------|
| Row id + topic excerpt from useful sheet | yes |
| Scriptwriter: model id · full system · full user · full reply | yes |
| Designer: model id · handoff · **per-slide image prompts** (typography on PNG) | yes |
| Image / vision: model id · pass/fail · `needs_review` if any | yes |
| PNG paths under `generatedMedia/` | yes |
| Secrets | **never** |

Budget this wave: **12 PNG** (3×4). Overspend → stop-report. Supersedes older 6-PNG default **for this smoke only**.

## Skills

- `carousel-prompt-trace` § Useful-smoke 51/1/17
- `content-factory-ui` § Brand + **Персонажи** half-width
- `backend` § useful-only gid
- `carousel-json-contract` Phase 6 + useful-only lock
- `ai-bridge` · `content-pipeline-agents`
- Client: **S55** + **S56** useful-smoke rename/width checks

## Chain

```text
Trainer ✅ → Architect (spec: useful-only + rename + half-width + smoke 51/1/17 + MD traces)
  → Frontend (Пейзажи→Персонажи; Brand/Персонажи max-w-[50%])
  → AI Bridge / Backend (gen from useful rows; prompt-trace MD dump)
  → Tester → Deployer (localhost) → Client (Playwright S55/S56 + read MD traces)
```

Motion / Mesh redesign: **out**. `shell_freeze` AppShell; Settings Brand/Персонажи width+rename **in scope**.
