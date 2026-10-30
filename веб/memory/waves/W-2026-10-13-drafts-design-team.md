# Wave W-2026-10-13 — Drafts always + Design MD Embla + Team «Задание» + no «N»

| Field | Value |
|-------|-------|
| **ID** | `W-2026-10-13-drafts-design-team` |
| **Date** | 2026-10-13 |
| **Status** | client — ПРИНЯТО С ЗАМЕЧАНИЯМИ (S43 Playwright 2026-10-13) |
| **before_sha** | `unknown` (no git) |
| **after_sha** | _(после прохода)_ |
| **Max tickets** | **≤3** (bundled UX pack) |
| **Trainer grade** | B — `memory/trainer/2026-10-13-settings-design-drafts-grade.md` |
| **Skills** | `content-factory-ui`, `carousel-studio-handoff`, `carousel-json-contract`, `21st-ui-catalog` (Embla), `ai-bridge`, `content-pipeline-agents`, `xyflow-agent-mesh`, `backend`, `client-scenarios` **S43** |
| **User plan** | Drafts always + Design MD library Embla ≤10 + Razbor upload + Design preview Close + Team «Задание» empty + disable Next DevTools **N** |

## Intent

1. **Create → Черновики всегда (P0):** после успешного Designer **draw** и после **«Опубликовать»** — `upsertDraft` + `openDraftsNonce` + переключение на **Черновики**; empty copy = Create + Разбор.
2. **Settings → Дизайн:** Embla carousel library ≤10 DESIGN.md; chip; `activeDesignId` → Designer; «Добавить новый дизайн» image→MD+HTML; preview **Close** вне pointer capture.
3. **Team:** label **«Задание»**, тело **пустое** (нет baseline); C-155 verify — **no brief glue** в `user`.
4. **Mystery «N»:** Next.js Dev Indicator → `devIndicators: false` в `next.config`.

**RazborModal** — **не ломать** (freeze except zero-touch; Design CTA живёт в Settings, не rewrite Razbor chat).

## Tickets in this wave

| ID | P | Folder | Result |
|----|---|--------|--------|
| **C-drafts-always** | **P0** | `memory/tickets/C-drafts-always/` | ПРИНЯТО С ЗАМЕЧАНИЯМИ (UI path; full draw deferred) |
| **C-settings-design-md-carousel** | P0/P1 | `memory/tickets/C-settings-design-md-carousel/` | ПРИНЯТО |
| **C-team-brief-n-indicator** | P1 | `memory/tickets/C-team-brief-n-indicator/` | ПРИНЯТО |

## Path lock (NO overlapping parallel writers)

| Order | Surface | Rule |
|-------|---------|------|
| 1 | Create drafts / Ours rail | **Frontend P0 alone** — `CreateCarouselModal` + `carousel-drafts-store` + `VerticalPostCarousel` / `DraftsPanel` / `StudioModuleWorkspace` |
| 2 | Designer active MD + Razbor parse | **AI Bridge** then **Backend** (upload/parse API if needed) — **before** Settings Embla FE wire to live parse |
| 3 | Settings Design + Team + next.config | **Frontend second pass** — `SettingsShell` / Embla / `DesignPreviewPanel`; Team User «Задание»; `next.config.ts` |
| — | Overlap ban | Не parallel: Create drafts store ↔ Settings `cf.settings.design.*` keys без Architect lock; **не** edit `RazborModal.tsx` |

## Wave chain (roles)

```text
Тренер (done, B) → Архитектор (done)
  → Frontend (P0 drafts)
  → AI Bridge → Backend
  → Frontend (Settings Embla + preview Close + Team «Задание» + next.config N)
  → Тестировщик → Фиксер → Деплоер → Клиент Playwright (**S43**)
```

**Единый chain:** `memory/waves/W-2026-10-13-drafts-design-team/chain.md`

## Spec index

| Ticket | Spec |
|--------|------|
| C-drafts-always | `memory/tickets/C-drafts-always/architect-spec.md` |
| C-settings-design-md-carousel | `memory/tickets/C-settings-design-md-carousel/architect-spec.md` |
| C-team-brief-n-indicator | `memory/tickets/C-team-brief-n-indicator/architect-spec.md` |

## Persist key locks (Architect names)

| Key / API | Owner | Notes |
|-----------|-------|-------|
| `cf.carousel.drafts.v1` | FE (existing C-156) | **Do not** rename; drafts-always writes here |
| `openDraftsNonce` | `StudioModuleWorkspace` → `VerticalPostCarousel` | Bump after successful draw **and** publish |
| `cf.settings.design.library.v1` | FE Settings | Array ≤10 `{ id, name, markdown, html?, previewUrl?, createdAt }` |
| `cf.settings.design.activeId` | FE + AI Bridge read | Designer draw resolves active MD |
| `cf.settings.design-preview.*` | existing C-145 | Keep; Close must clear `open` |
| `cf.mesh.userBrief.v1:{pipelineId}` | Team | Default **`""`** (empty); no `defaultCombatBrief` seed body |

## Supersedes / extends

| Prior | By |
|-------|-----|
| C-carousel-publish drafts only on publish (optional draw gap) | **C-drafts-always** — also draft-on-successful-draw + rail switch |
| C-143 / C-145 single design.md + preview | **C-settings-design-md-carousel** — Embla library ≤10 + Razbor add-design + Close HARD |
| C-140 baseline combat brief seed | **C-team-brief-n-indicator** — empty «Задание»; C-155 no glue |
| Next default `devIndicators` | **C-team-brief-n-indicator** — `devIndicators: false` |

## Stop report (заполняет Оркестратор)

**Закрыто (Client+guard):** —

**Осталось:** Frontend P0 drafts → AI Bridge → Backend → Frontend Settings/Team → Tester → Fixer → Deployer → Client S43

**Готов дальше отрабатывать очередь волны (≤3 в пачке) — закрыть с guards.**
