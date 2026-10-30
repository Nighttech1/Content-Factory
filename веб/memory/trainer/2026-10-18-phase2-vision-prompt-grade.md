# Trainer grade — 2026-10-18 Phase 2 vision prompt + logoTextColor

## План хода

- Запрос: **Фаза 2** — polish IMAGE-LLM prompt + `logoTextColor` + stock fonts ban; logo quality (fringe / soft wordmark); `@promts` cycle until Client.
- Режим: AI Bridge prompts + Backend composite/schema (не UI-волна; не Phase 3 Pixar product).
- Роли по chain: Architect → AI Bridge → Backend → Tester → smoke → Client.
- Out of scope: Phase 3 character Pixar (кроме hygiene soften «3D animated» в image conductor); VPS/publish/DB wipe; AppShell redesign.
- `ticket_limit: full-queue` (user explicit — не резать на пачки по 3).

## Грейд: C → B

| До апгрейда | После апгрейда |
|-------------|----------------|
| **C** — нет контракта `logoTextColor`; Phase2 помечен OUT в v2; image prompt с конфликтующими hardcoded RE-plate линиями без «review-before-implement»; logo quality (176px fringe) не в skills | **B** — карточка + notes + Logo HARD + gap + AI Bridge skill; код ещё не scrubbed / schema без `textColor` — это волна |

Не **A**: прод ещё отдаёт старый `buildVisionRefBackgroundImagePrompt` и wordmark PNG без LLM color — задача специалистов после Architect.

## Аудит

| Слой | Статус |
|------|--------|
| Roles | Architect, AI Bridge, Backend, Tester, Client, Deployer — в реестре OK |
| Skill vision_ref | Есть BAN Manrope/scale + `assertVisionRefPromptBanClean` — KEEP |
| Image prompt | `buildVisionRefBackgroundImagePrompt` жив; hardcoded orange/white + «3D/product» — scrub target |
| logoTextColor | **не было** в `html_layout` schema / skills — пробел закрыт карточкой |
| Logo quality | v2: strip ≤28 + max 176; fringe/soft — Phase 2 investigate A\|B |
| MCP | Playwright / chrome-devtools — для Client HARD GATE |
| data-safety | No DB wipe / no publish — OK |
| Phase 3 | Explicit OUT; only conductor wording hygiene |

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Нет контракта `logoTextColor` / path A\|B logo quality | Trainer → Architect/AI Bridge/Backend | skill/plugin | **P0** (закрыт этим ходом в знаниях) |
| 2 | IMAGE prompt lines conflict with «copy etalon» | AI Bridge | code | P0 (волна; сначала dump на review) |
| 3 | Schema + composite не применяют textColor | Backend | code | P0 (волна) |
| 4 | Soft/fringe wordmark at 176px | Backend | asset/composite | P1 (волна; Architect выбирает A или B) |
| 5 | Phase 3 Pixar creep | Orchestrator | scope | P2 (lock OUT) |

## Что добавлено этим ходом

- `plugins/trainer/phase2-vision-prompt-logo.md` (+ draft clean IMAGE prompt)
- `plugins/trainer/PLUGINS.md` index row; `logo-placement-v2` Phase2 OUT → opened
- `vision-style-copy.md` → next-wave pointer
- gap-playbook rows (clash / fringe / prompt conflict / Manrope / Pixar creep)
- `create-carousel-prompts-notes` § PHASE 2 + LOGO TEXT COLOR
- `carousel-json-contract` Logo HARD Phase 2 line
- `ai-bridge/SKILL.md` Phase 2 bullet
- Wave brief: `memory/waves/2026-10-18-phase2-vision-prompt/brief.md`

## Proposed chain

```text
Architect (spec + chain.md: logoTextColor schema; path A vs B; image-prompt SoT; review-before-implement gate)
  → AI Bridge (dump CLEAN image prompt for user review → scrub buildVisionRef* + sanitize; Designer emit logo.textColor; KEEP ban assert)
  → Backend (Zod html_layout.logo.textColor; composite apply color; emblem split and/or alpha/fringe fix)
  → Tester (guards: ban clean; textColor present+applied; contrast/fringe; no stock fonts in Designer dump)
  → smoke (vision_ref short carousel)
  → Client (Playwright HARD GATE → cycle @promts until «согласовано»)
```

## Вердикт

**ticket_limit:** `full-queue`  
Команда готова к волне: **да** (после C→B; прод-код не писался)
