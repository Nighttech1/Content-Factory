# Chain — W-2026-10-13-drafts-design-team (единый для пачки)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** параллелить overlapping `paths` на Create drafts ↔ Settings design library; **не** ломать `RazborModal`.  
> Тикеты: **C-drafts-always (P0) → C-settings-design-md-carousel → C-team-brief-n-indicator** (FE Settings/Team во втором Frontend pass).

**One-liner:** Architect (done) → Frontend drafts P0 → AI Bridge → Backend → Frontend Settings/Team + next.config → Tester → Fixer → Deployer → Client **S43**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Архитектор | `memory/waves/W-2026-10-13-drafts-design-team.md`; `memory/tickets/C-drafts-always|C-settings-design-md-carousel|C-team-brief-n-indicator/architect-spec.md`; этот `chain.md` | [x] | Только memory; **no** `app/` / `components/` prod-code |
| 1 | Frontend — **C-drafts-always** P0 | `components/studio/workspace/CreateCarouselModal.tsx`; `lib/studio/carousel-drafts-store.ts`; `lib/studio/create-carousel-publish.ts`; `components/studio/StudioModuleWorkspace.tsx` (`openDraftsNonce`); `components/studio/workspace/VerticalPostCarousel.tsx`; `components/studio/workspace/DraftsPanel.tsx` (empty copy Create+Razbor) | [ ] | Skills: `carousel-studio-handoff`, `content-factory-ui`. Lock: `upsertDraft` after **successful draw** + on **publish**; bump `openDraftsNonce` + switch **Черновики**. **Do not** edit `RazborModal.tsx` |
| 2 | AI Bridge | Designer resolve **active DESIGN.md** (`cf.settings.design.activeId` → library slot); Разборщик image→MD+HTML prompts/contract; **C-155 audit**: agent-chat `user` = raw only — **no** Team «Задание» glue | [x] | See `memory/tickets/C-settings-design-md-carousel/ai-bridge.md`. Paths: `lib/settings/design-library.ts`, `lib/studio/design-from-image-prompts.ts`, `lib/studio/agent-chat-sanitize.ts`, prompts + agent-chat wire |
| 3 | Backend | Optional API: design image upload + parse → `{ markdown, html }` (Razbor agent / LLM); serve/store if not pure client; wire Designer draw to read active MD server-side if generate-slides needs it | [ ] | Skills: `backend`. Prefer thin `app/api/settings/design-*` or reuse studio routes. Soft-fail without wiping library. **No DDL** unless Architect mid-flight. Skip heavy API if FE-only parse OK — note in ticket decisions |
| 4 | Frontend — Settings/Team pack | **Sequential same writer queue:** | [ ] | Skills: `content-factory-ui`, `21st-ui-catalog` (Embla `carousel.tsx` **without** `@appica`), `xyflow-agent-mesh` |
| 4a | Frontend — **C-settings-design-md-carousel** | `components/settings/SettingsShell.tsx`; `components/settings/DesignPreviewPanel.tsx`; new Embla library UI + persist `lib/settings/design-library.ts` (keys below); CTA «Добавить новый дизайн» file input → AI Bridge/Backend | [ ] | Library ≤10; chip **DESIGN.md**; Close **X outside** drag `setPointerCapture` target; `open=false` unmounts panel |
| 4b | Frontend — **C-team-brief-n-indicator** | `components/mesh/v2/ReleaseTeamFlowchart.tsx`; `lib/mesh/agent-store.ts` / `lib/mesh/agent-defaults.ts` (empty default brief); `next.config.ts` → `devIndicators: false` | [ ] | Label **«Задание»**; body default `""`; no baseline lorem; do not re-glue brief in chat client |
| 5 | Тестировщик | `memory/tickets/C-*/guards.md`; S43 asserts; static greps: no `defaultCombatBrief` seed in UI default; Close close; drafts after draw+publish; no bottom-left **N** | [x] | Skill `tester`. Smoke `scripts/smoke-w-2026-10-13-drafts-design-team.ts` → OK. Reports: `memory/tickets/C-drafts-always|C-settings-design-md-carousel|C-team-brief-n-indicator/tester-report.md`. Fixer P2: `agent-defaults` still seeds `userRequest` combat (UI brief empty OK). Live S43 → Client |
| 6 | Фиксер | Только red paths from Tester | [x] | P0 agent-chat imports already OK (`design-active-server`); P2 `seedAgentsForPipeline` → `userRequest: ""`. Smoke OK. Notes: `C-settings-design-md-carousel/fixer.md`, `C-team-brief-n-indicator/fixer.md` |
| 7 | Деплоер | localhost `/studio/carousel-engine`, `/settings`, `/admin/mesh`; verify `devIndicators` off | [x] | Localhost READY — `deployer.md`; all 200; restart not needed; `devIndicators: false` |
| 8 | Клиент | Playwright MCP @1440 — **S43** full (drafts + Embla + Close + Razbor CTA smoke + Team empty + C-155 network + no **N**) | [ ] | HARD GATE |

## Ticket pointer chains

Каждый тикет ссылается на **этот** файл как канон:

- `memory/tickets/C-drafts-always/chain.md` → pointer
- `memory/tickets/C-settings-design-md-carousel/chain.md` → pointer
- `memory/tickets/C-team-brief-n-indicator/chain.md` → pointer

## Overlap ban

| Surface | Rule |
|---------|------|
| `CreateCarouselModal.tsx` + drafts store | Frontend step **1 only** for drafts wire; Settings pass must not rewrite Create publish helpers except reading `activeDesignId` |
| `SettingsShell` / design library | Frontend **4a** only; one writer |
| `ReleaseTeamFlowchart` / `agent-store` brief | Frontend **4b**; after or sequential after 4a (same FE agent OK sequential) |
| `RazborModal.tsx` / Razbor publisher | **Out of scope / freeze** — не трогать |
| `next.config.ts` | Only in **4b** / Deployer verify — not parallel rewrite |

## Acceptance gate (Client)

Закрытие волны только после **S43** + guards на все три тикета.
