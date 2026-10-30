# Trainer grade — 2026-10-18 Phase 1 logo HTML

## План хода

- Запрос: **Фаза 1 only** — Vernatun transparent wordmark PNG на слайд в S57 layered HTML; убрать отдельный текст Vernatun / ARMENIAN CLUB рядом с иконкой (слово уже в PNG).
- Режим: backend / composite (не UI-волна, не fonts/vision/Pixar).
- Роли по chain: Architect → Backend → Tester → (optional smoke re-composite).
- Out of scope: Фаза 2 fonts/scale/vision; Фаза 3 Pixar; VPS/publish/DB wipe.
- `ticket_limit: full-queue` (single-phase queue — не резать на пачки по 3).

## Грейд: C → B

| До апгрейда | После апгрейда |
|-------------|----------------|
| **C** — конфликт locks: skills требовали «name beside» + код всегда рисует `.brand-name` (renderer default `Vernatun`) | **B** — пробел знания закрыт карточкой + gap + Logo HARD; инфраструктура dual-path/`<img>` уже есть |

Не **A**: код ещё рисует name рядом — это задача Backend после Architect, не «уже готово в проде».

## Аудит

| Слой | Статус |
|------|--------|
| Backend / composite | Есть `carousel-layered-composite` + raw `logoRef` dual-path; FAIL path = всё ещё emit `.brand-name` when `brandName` set |
| Skill / cards | Было: `design-inject-logo-br` «name beside»; S57 logo HTML OK |
| Asset | PNG transparent **существует** по указанному пути Cursor assets |
| MCP | Playwright/chrome-devtools — не блокер этой фазы (smoke composite) |
| Roles | Architect, Backend, Tester в реестре — OK |
| data-safety | No DB wipe / no publish — OK |

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Lock «name beside» конфликтовал с wordmark PNG | Trainer → Backend | skill/plugin | **P0** (закрыт этим ходом) |
| 2 | Composite/renderer всё ещё выводит `.brand-name` + default «Vernatun» | Backend | code | P0 (волна) |
| 3 | Brand store должен получить указанный transparent PNG как raw `logoRef` | Backend (± FE upload only if store empty) | env/store | P1 |

## Что добавлено этим ходом

- `plugins/trainer/phase1-logo-wordmark-html.md`
- gap-playbook: supersede «name beside» + row wordmark duplicate text
- `design-inject-logo-br.md` lock 3 — Phase 1 supersede note
- `carousel-json-contract` Logo HARD — wordmark omit `.brand-name`
- PLUGINS.md index row
- Wave brief: `memory/waves/2026-10-18-phase1-logo-html/brief.md`

## Proposed chain

```text
Architect (spec + chain.md: logo-only wordmark, PNG path → Brand raw, omit .brand-name)
  → Backend (store PNG / logoRefRaw + composite + renderer: no brand-name when logoUrl)
  → Tester (guards: <img.brand> present; no .brand-name / no Vernatun text chrome when wordmark)
  → (optional) smoke re-composite ONE slide or short carousel
```

## Вердикт

**ticket_limit:** `full-queue`  
Команда готова к волне: **да** (после C→B апгрейда знаний; прод-код не писался)
