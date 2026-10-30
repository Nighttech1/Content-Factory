# Trainer grade — 2026-10-18-layout-copy-dual-char

## План хода

- Запрос: (1) Scriptwriter text MUCH wider — expand `secondary_copy`; (2) Settings Design 4-ref upload → deconstruct colors+fonts+sizes **+ block layout map** (anchors, numbering present|absent, logo/CTA chrome) → gen copies grammar; (3) 3 DESIGN.md from grids (RE orange, luma coffee, omkopa teal); primary orange RE + Vernatun girl conductor OVER bg (cover+last, speaks text); (4) TWO 6-slide carousels — A in_image / B overlay cutout — other useful-sheet topics; (5) refs `generatedMedia/эталон карусели/layout-copy-refs-2026-10-18/`.
- Режим: AI Bridge / Backend / carousel pipeline + skill upgrade (UI only if 4-up upload missing)
- Роли по chain: **Architect → AI Bridge → Backend → Tester → dual smoke**
- `ticket_limit: full-queue` (user lock list 1–5)
- `shell_freeze: true` (AppShell)

## Грейд: B

Было **C** (критичные пробелы знания): layoutMap 4-up, numbering mirror, dual character_paint, MUCH wider SW bar, 3-grid DESIGN.md. После апгрейда skills/карточки — команда готова (**B**: мелкие runtime-дыры закроет Architect/Backend в коде).

## Пробелы

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Deconstruct только tokens — нет `layoutMap` из 4-slide grid | AI Bridge / Backend | skill→code | P0 |
| 2 | Always pretty `N/M` vs «нет номеров на рефе → нет в gen» | Backend / Designer | skill→code | P0 |
| 3 | Один character path (cutout) — нет dual `in_image` \| `overlay_cutout` | AI Bridge / Backend | skill→code | P0 |
| 4 | secondary_copy soft ≥120 / 2–3× — мало для «MUCH wider» | AI Bridge / Scriptwriter | skill→prompts | P0 |
| 5 | Нет канона 3 DESIGN.md grids + etalon folder | Architect / Backend | skill→ops | P1 |
| 6 | 4-up upload UI может отсутствовать | Frontend (условный) | UI | P1 |

## Что добавлено этим ходом

- Карточка `plugins/trainer/layout-copy-dual-char.md` + строка в `plugins/trainer/PLUGINS.md`
- `create-carousel-prompts-notes.md` — MUCH WIDER SW · LAYOUT MAP · DUAL CHARACTER
- `carousel-json-contract/SKILL.md` — secondary_copy bar · layoutMap · numbering omit · character_paint
- `ai-bridge/SKILL.md` · `content-pipeline-agents/SKILL.md` · `architect/SKILL.md` — wave locks + chain
- `art-director/html-layout-variant-a.md` + `critique-checklist.md` + `art-director/SKILL.md` smoke note
- `workers/designer-carousel/SKILL.md` — grid deconstruct + layoutMap + dual paint
- `gap-playbook.md` — 9 новых строк симптомов

## Вердикт

Команда готова к волне: **да**

`ticket_limit: full-queue`  
Proposed chain: **Architect → AI Bridge → Backend → Tester → dual smoke** (+ Frontend only if 4-slide upload UI broken)
