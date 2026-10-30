# Trainer grade — 2026-10-18 logo placement v2

## План хода

- Запрос: короткая волна **logo placement v2** после Phase1 — новый Vernatun PNG (прозрачный, без чёрной подложки), роль-зависимый placement (body = bottom-LEFT; cover+last = TOP / top-left), размер **2×** текущего `BRAND_LOGO_SIZE_PX`, logo-only HTML KEEP; цикл до Client Playwright **«согласовано»**.
- Режим: backend / composite (+ Deployer localhost + Client HARD GATE). Не UI-редизайн, не fonts, не character.
- Роли по chain: Architect → Backend → Tester → Deployer (localhost if needed) → Client.
- Out of scope: Phase 2 fonts/scale/vision; Phase 3 character; VPS/publish/DB wipe; AI Bridge/Motion/Mesh.
- `ticket_limit: full-queue` (явный full-queue + cycle until «согласовано» — не резать на пачки по 3).

## Грейд: C → B

| До апгрейда | После апгрейда |
|-------------|----------------|
| **C** — знания команды всё ещё канонизировали Phase1 **bottom-RIGHT** + size 88 + старый PNG; конфликт с новыми HARD locks | **B** — пробел знания закрыт карточкой v2 + gap + Logo HARD + brief; код ещё на старых defaults — задача Backend после Architect |

Не **A**: прод ещё `DEFAULT_BRAND_CHROME = "bottom-right"`, `BRAND_LOGO_SIZE_PX = 88`, asset Phase1 bytes — это волна, не «уже готово».

## Аудит

| Слой | Статус |
|------|--------|
| Agent / roles | Architect, Backend, Tester, Deployer, Client в реестре — OK |
| Skill / cards | Phase1 card + Logo HARD = bottom-RIGHT / keep placement — **stale vs v2** → закрыто этим ходом |
| Code (факт) | `carousel-layered-composite`: placement enum уже умеет top/bottom-left/right; defaults + size wrong for v2 |
| Asset | New source PNG **exists** at Cursor assets path; `public/brand/vernatun-logo.png` still Phase1 size (~238KB) — Backend must reinstall + strip black matte |
| MCP | Playwright / chrome-devtools в `.cursor/mcp.json` — обязательны для Client HARD GATE |
| data-safety | No DB wipe / no publish — OK |
| Env | No live IG required |

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Skills/cards канон «default bottom-RIGHT» vs user body=bottom-LEFT + cover/cta=TOP | Trainer → Backend | skill/plugin | **P0** (закрыт этим ходом) |
| 2 | Нет lock на 2× `BRAND_LOGO_SIZE_PX` (88→176) | Trainer → Backend | skill | **P0** (закрыт) |
| 3 | Новый source PNG + strip black matte → transparent `public/brand/vernatun-logo.png` | Backend | asset/code | P0 (волна) |
| 4 | Role-aware default when layoutMap absent (cover/cta top-left; body bottom-left) | Backend | code | P0 (волна) |
| 5 | Client cycle Playwright → «согласовано» | Client (+ Deployer localhost) | mcp | P0 (волна) |
| 6 | Thin prompt strings still say bottom-RIGHT default | Backend | code | P1 (волна) |

## Что добавлено этим ходом

- `plugins/trainer/logo-placement-v2.md`
- `memory/waves/2026-10-18-logo-placement-v2/brief.md`
- gap-playbook: row logo placement v2 + update stale BR row
- `carousel-json-contract` Logo HARD → role placement + 2× + transparent install
- `phase1-logo-wordmark-html.md` — supersede note (placement/size/source)
- PLUGINS.md index row

## Proposed chain

```text
Architect (spec + chain.md: new PNG+alpha, role slots, 2× size, logo-only KEEP; Phase2/3 OUT)
  → Backend (install+strip matte; BRAND_LOGO_SIZE_PX=176; role defaults; thin prompt align)
  → Tester (guards: alpha; cover/cta top-left; body bottom-left; size 176; no .brand-name)
  → Deployer (localhost if needed)
  → Client (Playwright HARD GATE @1440; cycle C-* until «согласовано»)
```

## Вердикт

**ticket_limit:** `full-queue`  
Команда готова к волне: **да** (после C→B апгрейда знаний; прод-код не писался)
