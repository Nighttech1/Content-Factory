# Trainer grade — 2026-10-18-vision-style-copy

## План хода

- Запрос: эксперимент эталон → **vision style-copy** (Variant A); `characterPaint=in_image` product default; не чинить layoutMap как единственный путь; запрет FULL DESIGN TOKEN CARD inject; partial bg; smoke A×6.
- Режим: усиление команды (AI Bridge / Backend / Designer prompts) · shell_freeze UI
- Роли по chain: Trainer → Architect → AI Bridge → Backend → (Settings FE if needed) → Tester → smoke
- `ticket_limit: full-queue` (весь эксперимент до smoke; лимит ≤3 **снят**)

## Грейд: C → B (после апгрейда этим ходом)

Исходный аудит был **C** (критичный пробел знания). После дописки skills/plugins — команда **B / готова**.

## Пробелы (до апгрейда)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Нет `styleCopyMode=vision_ref` — канон = layoutMap grammar | AI Bridge / Architect | skill | P0 |
| 2 | FULL DESIGN TOKEN CARD / typography.scale HARD на каждый draw → LLM «применяет таблицу» | AI Bridge | skill | P0 |
| 3 | Product default character = dual / overlay_cutout на primary RE | Pipeline | skill | P0 |
| 4 | Нет lock на partial/inset photo vs always full-bleed cover | Designer | skill | P1 |
| 5 | Нет trainer card / gap-playbook строк под vision style-copy | Trainer | plugin | P0 |

## Что добавлено этим ходом

- `plugins/trainer/vision-style-copy.md` — карта волны
- `plugins/trainer/PLUGINS.md` — строка vision-style-copy
- `plugins/trainer/layout-copy-dual-char.md` — supersede pointer → vision_ref
- `.cursor/skills/trainer/gap-playbook.md` — 4 симптома
- `.cursor/skills/ai-bridge/SKILL.md` — bullet Vision style-copy
- `.cursor/skills/content-pipeline-agents/SKILL.md` — rows vision_ref / default in_image
- `.cursor/skills/carousel-json-contract/SKILL.md` — Phase7 vision_ref exception
- `.cursor/skills/carousel-json-contract/create-carousel-prompts-notes.md` — § VISION STYLE-COPY + dual-char default flip
- `.cursor/skills/art-director/html-layout-variant-a.md` — styleCopyMode + in_image default
- `.cursor/skills/carousel-prompt-trace/SKILL.md` — trace checks for vision_ref
- `workers/designer-carousel/SKILL.md` — § Vision style-copy + default in_image
- `.cursor/skills/architect/SKILL.md` — wave lock table
- Wave folder: `memory/waves/2026-10-18-vision-style-copy/brief.md`

## Вердикт

Команда готова к волне: **да** (грейд **B** после закрытия P0 в skills)

## Proposed chain (для Архитектора)

```text
Architect (spec + chain.md)
  → AI Bridge (vision_ref prompts + ban FULL TOKEN inject + image-ref wire)
  → Backend (draw reference image; characterPaint default in_image; partial bg)
  → Settings FE only if mode / ref-upload UI missing
  → Tester (guards + smoke 6-slide path A)
```

## НЕ делать

- `overlay_cutout` как product default
- «Починить layoutMap parser» как единственный путь успеха
- FULL DESIGN TOKEN CARD / stock Manrope·Cormorant / typography.scale inject на vision_ref
- Always full-bleed cover bg вопреки эталону
- Прод-код AppShell redesign / paid MCP
