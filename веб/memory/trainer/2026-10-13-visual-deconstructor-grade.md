# Trainer grade — 2026-10-13 — Visual Style Deconstructor

## План хода

- Запрос: шаг 0 волны **Visual Style Deconstructor + DESIGN.md + reels scriptwriter + Client S44**
- Режим: усиление команды (skills/rules/memory); UI+AI Bridge+Backend follow in chain
- Тикеты: `C-visual-style-deconstructor` P0 · `C-design-slot-sliced-preview` P0 · `C-carousel-css-vars-builder` P0/P1 · `C-reels-scriptwriter-upgrade` P1
- Рефы (глазами): dark_notes (3-panel marker chalkboard) · bento_glass/dark_editorial (6-panel glass+telemetry+gold CTA)
- `ticket_limit: default≤3` — три P0 карусели в фокусе; reels P1 в той же волне по плану (не резать full-queue — пользователь не снимал лимит, но план явно держит reels в chain)
- Роли по chain: Тренер → Архитектор → AI Bridge → Backend → Frontend → Тестировщик → Фиксер → Деплоер → Клиент S44

## Грейд ролей (A–D)

| Роль | Грейд | Комментарий |
|------|-------|-------------|
| **Frontend** | **B** | Embla library / Create sliced preview уже были; не хватало канона **3×4:5 + Tuner + Create-from-ref** в skills — закрыто в `content-factory-ui` |
| **AI Bridge / Designer** | **B→A после апгрейда** | Worker `designer-carousel` усилен top-tier + prompts canon; Deconstructor/DESIGN.md path в create-design-md + ai-bridge. Runtime `deconstructStyle` / prompts.ts — ещё писать в chain |
| **Backend** | **B** | Persist library/active sync известны; typed DesignPresetFile + deconstruct POST — Architect+Backend в chain; data-safety OK |
| **Architect** | **B** | Типы/locks в skills есть как semantic sketch; нужен spec+chain.md по 4 тикетам до кода |
| **Client** | **A** | **S44 HARD** в `client-scenarios` + `client.mdc` §9–10; артефакт-папка зафиксирована |
| **Reels Scriptwriter** | **B→A после AI Bridge** | Новый skill `reels-scriptwriter`; pipeline agents усилены; `agent-defaults` ещё правит AI Bridge (Trainer prod `lib/` не трогал) |

**Итоговый грейд волны (команда):** **B** — можно идти к Архитектору; критичные пробелы знания закрыты в skills/rules. Runtime код = следующие шаги chain.

## Пробелы (до усиления → статус)

| # | Пробел | Роль | Слой | P | Статус |
|---|--------|------|------|---|--------|
| 1 | Нет S44 Hard REJECT / сценария | Client | skill+rule | P0 | **закрыто** |
| 2 | Designer без top-tier vs refs / prompts canon | AI Bridge/Designer | worker skill | P0 | **закрыто** (skill); wire prompts.ts → AI Bridge |
| 3 | Слабый канон Сценариста рилсов | Reels / AI Bridge | new skill + pipeline | P1 | **закрыто** (skill); agent-defaults → AI Bridge |
| 4 | Settings Design = panorama / одна плитка | Frontend | content-factory-ui | P0 | **закрыто** (skill) |
| 5 | DesignPresetFile / CSS vars не в design-system | Architect/BE | design-system | P0 | **закрыто** (skill sketch) |
| 6 | Папка артефактов волны | Deployer/Client | ops | P1 | **закрыто** path+README |
| 7 | Budget 40 PNG | All | trainer grade | P0 | **зафиксировано** |

## Что добавлено этим ходом

- `workers/designer-carousel/SKILL.md` — top-tier golden refs FAIL table + create-carousel prompts canon + budget
- `.cursor/skills/reels-scriptwriter/SKILL.md` — **new** hook 0–2s · beats · CTA · agent-defaults canon
- `.cursor/skills/client-scenarios/SKILL.md` — **S44 HARD** (Settings / Create / Reels)
- `.cursor/rules/client.mdc` — Hard REJECT **§9 carousels** · **§10 reels**
- `.cursor/skills/content-factory-ui/SKILL.md` — Design block S44 sliced + Tuner + Create-from-ref
- `.cursor/skills/create-design-md/SKILL.md` — Deconstructor / carousel mode
- `.cursor/skills/design-system/SKILL.md` — DesignPresetFile + `--cf-design-*`
- `.cursor/skills/carousel-json-contract/SKILL.md` — marketing-save + ticket ids aligned to plan
- `.cursor/skills/content-pipeline-agents/SKILL.md` — reels HARD + link to reels-scriptwriter
- `.cursor/skills/ai-bridge/SKILL.md` — Deconstructor + reels upgrade bullets
- `.cursor/skills/trainer/gap-playbook.md` — S44 / panorama / weak reels / budget rows
- `plugins/trainer/PLUGINS.md` — S44 + reels-scriptwriter + designer-carousel
- `generatedMedia/wave-visual-deconstructor/README.md` — artifact path for Deployer/Client

## Artifact folder (обязательно для Deployer / Client)

**Canon path:** `generatedMedia/wave-visual-deconstructor/`

- Класть **нарезанные** PNG Create draw (по пресетам subfolders — см. README)
- В финальном отчёте Клиента — **ссылки на файлы** + Playwright snapshots S44
- Panorama refs = только вход Deconstructor, не deliverable

## Budget

`png_budget_max: 40`  
Prefer Settings mock = CSS 0-LLM. If need more than 40 for «топ как реф» → **STOP** + report (agent improvements + whatever sliced carousels exist).

## Recommended chain

```
Тренер (done) → Архитектор (spec+chain для 4 тикетов; locks DesignPresetFile / RazborModal freeze / reels≠carousel)
  → AI Bridge (deconstructStyle + create-carousel-prompts + seed golden + agent-defaults custom-reels)
  → Backend (POST deconstruct; active sync preset fields; carouselHtmlBuilder CSS vars)
  → Frontend (DesignSlotManager 3×4:5 + Tuner + Create from ref; Create preview stays sliced)
  → Тестировщик (guards S44 + budget counter)
  → Фиксер
  → Деплоер (localhost; copy PNGs → generatedMedia/wave-visual-deconstructor/)
  → Клиент S44 HARD @1440 Playwright
```

Не параллелить overlapping paths (Design library UI ↔ builder ↔ deconstruct API).

## Вердикт

Команда готова к волне: **да** (грейд **B**, пробелы skills закрыты; код — по chain).
