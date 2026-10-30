# Trainer grade — 2026-10-12 — carousel-json-pipeline

`ticket_limit: default≤3`

## План хода

- Запрос: (1) P0 чёрный preview после «готово» при уже сгенерированных картинках; (2) переархитектура Scriptwriter→Designer по open-source паттернам (swipekit SlideObject, open-carrusel safe-zone, upload-post metadata); динамический N только из user; Vernatun tone; Designer HTML/Tailwind + export; verification checklist в TZ. Обновить system instructions / worker skills — без app-кода Тренером.
- Режим: усиление команды (skills/rules/workers docs) + UI/AI bridge wave readiness
- Роли по chain: Архитектор → AI Bridge → Frontend → (Backend если wire API) → Тестировщик → Фиксер → Деплоер → Клиент

## Грейд: B

До апгрейда: **C** (не было канона Dramaturgy JSON / dynamic N / P0 preview-black в skills).  
После апгрейда skills: **B** — команда может идти в волну; продукт-баг preview и zod/wire ещё на Архитекторе/FE.

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Preview чёрный после «готово» при наличии LLM images — wire state/src/CSS | Frontend (+ Tester guard) | skill→product | **P0** |
| 2 | System/prompts Scriptwriter ещё wave3 minimal — нужен Dramaturgy JSON + dynamic N в mesh packs / AI Bridge | AI Bridge | skill+agent | P1 |
| 3 | Designer any-length HTML/Tailwind + safe-zone + `slide_NN.png` export | Frontend / Backend render | skill+agent | P1 |
| 4 | Клиент: без S42 нельзя принять JSON/N/preview | Клиент | scenario | P1 (gate) |

## Что добавлено этим ходом

- **NEW** `.cursor/skills/carousel-json-contract/SKILL.md` — schema, Vernatun, safe-zone, dynamic N, P0 preview-black, verification checklist
- **UPD** `carousel-studio-handoff` — Dramaturgy/Layout roles + JSON handoff + P0 note
- **UPD** `content-pipeline-agents` — Scriptwriter contract superseded → JSON Dramaturgy; Create table + S42
- **UPD** `ai-bridge` — agent-start JSON + image artifact required
- **UPD** `workers/script-writer/SKILL.md` — Dramaturgy & Hook Engine
- **UPD** `workers/designer-carousel/SKILL.md` — Layout & Visual Engine
- **UPD** `trainer/gap-playbook.md` — 4 строки (black preview, hardcode N, tone, any-length)
- **UPD** `client-scenarios` — **S42 HARD**
- **UPD** `plugins/trainer/PLUGINS.md` — carousel-json-contract + S42
- **UPD** `.cursor/registry/agents.md` — skill row `carousel-json-contract`

## Proposed tickets (≤3)

| Id | P | Title |
|----|---|--------|
| **C-carousel-preview-black** | **P0** | После «готово» preview не чёрный: wire generate→state→visible frames; Tester guard S42 |
| **C-carousel-json-scriptwriter** | P1 | Scriptwriter system/skills = Dramaturgy JSON; `requested_slide_count` from user only; Vernatun tone |
| **C-carousel-html-designer** | P1 | Designer parse any-length `slides[]`; HTML/Tailwind 1080×1350 safe-zone; `visual_prompt`→bg; export `slide_01.png`… |

## Proposed chain

```
Тренер (done) → Архитектор (spec + chain.md: 3 tickets, JSON schema lock, preview root-cause)
  → AI Bridge (Scriptwriter + Designer system packs / agent-start bundle per carousel-json-contract)
  → Frontend (P0 preview wire first; then Designer HTML frame preview binding)
  → Backend (если generate-slides / media paths нужен серверный export — по chain Архитектора)
  → Тестировщик (guards S42 + preview non-black + dynamic N)
  → Фиксер → Деплоер localhost → Клиент (S41+S42 Playwright @1440)
```

Не параллелить overlapping CreateCarouselModal / generate-slides paths.

## Note — black preview (P0)

Симптом пользователя: Дизайнер говорит «готово», LLM уже сгенерировал images, **preview = чёрный экран**.  
В грейде: пробел **Frontend** (и guard **Tester**). Не путать с C-131 flash *между* слайдами. Success draw = visible frames, не text bubble alone.

## Вердикт

Команда готова к волне: **да** (грейд B; P0 первым в chain)
