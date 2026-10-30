# Chain — W-2026-10-14-s49-feed-brandbook (S49)

> Оркестратор зовёт следующую роль только после checkbox.  
> **Запрет:** parallel writers на `FeedPostCard` ↔ `VerticalPostCarousel`/`BoardsPanel` ↔ `ReleaseTeamFlowchart` ↔ `DesignLibraryCarousel`.  
> `ticket_limit: default≤3`. Тренер: `memory/trainer/2026-10-14-s49-feed-brandbook-grade.md`.  
> **НЕ prod.** Deployer — после QA sibling.

**One-liner:** Архитектор → Frontend → AI Bridge → Backend → Tester → Fixer → Deployer (localhost) → Client **S49 HARD**.

| # | Role | Paths | Done | Notes |
|---|------|-------|------|-------|
| 0 | Архитектор | этот `chain.md` + 3× ticket specs | [x] | memory only |
| 1 | Frontend | FeedPostCard; VerticalPostCarousel; BoardsPanel; ReleaseTeamFlowchart; BrandbookBoard + DesignLibrary | [x] | this pass |
| 2 | AI Bridge | agent-chat sanitize harden; deconstruct→brandbook preset | [x] | this pass |
| 3 | Backend | Apify followers map; loadUserBrief always empty | [x] | this pass |
| 4 | Тестировщик | guards S49.A–D | [x] | smoke + Playwright prep |
| 5 | Фиксер | red only | [x] | smoke assert drift → S49 DELETE |
| 6 | Деплоер | localhost only | [x] | :3000 confirmed; НЕ prod |
| 7 | Клиент | Playwright S49 HARD @1440 | [x] | **ПРИНЯТО** — client-verdict.md |

## Tickets (P0)

1. **C-feed-s49-chrome** — P0  
2. **C-boards-s49-upload** — P0  
3. **C-team-brief-gone-design-brandbook** — P0  

## Decision locks

| Lock | Decision |
|------|----------|
| **D-plaque-s49** | Competitors: **one** black plaque `@{name} \| {followersRu}` **inside** (followers after `\|`). Scale ≈ S48 1.5×. Century Gothic white. |
| **D-ours-no-plaque** | Ours / Published / Drafts cards: **no** username/followers plaque at all. |
| **D-toggle-s49** | Конкуренты\|Доски = **simple segment toggle** (same chrome as Опубликовано\|Черновики). **Not** floating MultiButton. Search **same row**, right. |
| **D-labels-white** | «Опубликовано» «Черновики» + draft count = **ALL white** text (active pill may stay gold bg). |
| **D-feed-clip** | Minimize gap under last feed row: reduce column `pb-*` / page bottom padding; keep «Разбор» CTA visible. |
| **D-boards-s49** | Boards: button label **«Загрузить»** same row as search; **delete** helper «Локально · несколько кадров…»; board cards **no** engagement metrics (+ no plaque). |
| **D-brief-gone** | Team User: **DELETE** basic brief textarea UI. `loadUserBrief` / `defaultCombatBrief` **never** injected into Create chat or agent user turns. Store may keep empty stubs for compat; `composeTopicWithBrief` stays raw-only; server sanitize hardened. |
| **D-brandbook-s49** | Settings Design primary slot preview = **Heritage-style brandbook board** (beige: colors+scales, Aa type, buttons, bars, icons) from `DesignPresetFile`. Upload image → `/api/settings/design-deconstruct` → brandbook. Active slot tokens still → Designer on draw. Sliced 3×4:5 may remain secondary. |

## Overlap ban

| Surface | Rule |
|---------|------|
| `FeedPostCard` + `VerticalPostCarousel` | chrome sequential |
| `BoardsPanel` upload chrome | after competitors toggle row locked |
| `ReleaseTeamFlowchart` + `agent-store` + `agent-chat` | brief delete FE then AI Bridge/Backend |
| `DesignLibraryCarousel` / BrandbookBoard | after Architect schema lock |
