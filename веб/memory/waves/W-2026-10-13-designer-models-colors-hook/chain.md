# Chain — W-2026-10-13-designer-models-colors-hook

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths` на model catalog ↔ Settings Design UI ↔ create-carousel-prompts; **не** трогать `RazborModal`; **не** VPS; **не** жечь много image gens.  
> Тикеты (≤3 P0 pack): **C-agent-model-defaults → C-design-colors-only → C-designer-panorama-slice** (hook внутри AI Bridge той же пачки).

**One-liner:** Architect (memory) → AI Bridge → Backend (thinking pass-through) → Frontend → Tester → Fixer → Deployer → Client **S45**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Архитектор | этот `chain.md`; `memory/tickets/C-agent-model-defaults\|C-design-colors-only\|C-designer-panorama-slice/architect-spec.md`; wave summary | [x] | Только memory; **no** prod code |
| 1 | AI Bridge | `lib/settings/llm-models.ts`; `types/mesh-agent.ts`; `lib/mesh/agent-defaults.ts`; `lib/studio/create-carousel-prompts.ts`; `lib/llm/aggregator-chat.ts` (+ thinking); `lib/llm/aggregator-images.ts` DEFAULT sync; hook bar in scriptwriter overlays | [x] | Locks: Haiku id `anthropic/claude-haiku-4.5`; Designer `openai/gpt-5.4-image-2`; panorama→slice + colors-only prompt inject |
| 2 | Backend | `app/api/studio/agent-chat/route.ts` — pass `thinking` / `reasoningEffort` into aggregator; assert draw returns N×4:5 (reject/slice if single panorama); no DDL | [x] | Soft persist only via existing mesh store (localStorage) — no new server prefs table |
| 3 | Frontend | Settings Design caption colors-only; hide layout/primitive editors if any; Team Model tab thinking toggle; Create preview stays sliced (`CreateCarouselPreview`); mesh model options surface new defaults | [x] | Skills: `content-factory-ui`, `21st-ui-catalog` |
| 4 | Тестировщик | guards S45 + model default smoke greps | [x] | `scripts/smoke-w-2026-10-13-designer-models-colors-hook.ts` 24/24; tester-report.md |
| 5 | Фиксер | red paths only | [x] | Skip — no P0/P1 from Tester |
| 6 | Деплоер | localhost refresh local API | [x] | /settings + /studio/carousel-engine 200; no restart |
| 7 | Клиент | Playwright **S45 HARD** @1440 | [x] | client-verdict.md — ПРИНЯТО С ЗАМЕЧАНИЯМИ |

## Ticket pointer chains

- `memory/tickets/C-agent-model-defaults/chain.md` → this file
- `memory/tickets/C-design-colors-only/chain.md` → this file
- `memory/tickets/C-designer-panorama-slice/chain.md` → this file

## Overlap ban

| Surface | Rule |
|---------|------|
| `llm-models.ts` / `mesh-agent.ts` / `agent-defaults.ts` | AI Bridge step 1 owns; FE only reads |
| `create-carousel-prompts.ts` | AI Bridge; colors-only + panorama + hook |
| `SettingsShell` / `DesignLibraryCarousel` / Tuner | Frontend step 3; caption + hide layout editors |
| `agent-chat/route.ts` + `aggregator-chat.ts` | Backend after AI Bridge types |
| `RazborModal.tsx` | **Out of scope / freeze** |

## Acceptance gate (Client S45)

1. Designer default model = `openai/gpt-5.4-image-2` on first seed / Team Model.
2. Scriptwriter carousel = `anthropic/claude-haiku-4.5` + thinking ON.
3. Settings Design = palette + Quick Theme Tuner **colors only**; caption «Только цвета…».
4. Create draw preview = N×4:5 sliced — never panorama-only.
5. Scriptwriter cover hook = curiosity gap, ≤6–8 words (flat hook = FAIL).
