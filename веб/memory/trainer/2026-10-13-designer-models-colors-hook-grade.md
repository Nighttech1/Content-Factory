# Trainer grade — 2026-10-13 — Designer models + colors-only + panorama→slice + hook

## План хода

- Запрос: шаг 0 — (1) Designer LLM default `openai/gpt-5.4-image-2`; (2) Scriptwriter Haiku 5.5 **WITH thinking/reasoning**; (3) Settings Design = **ONLY colors** (LLM invents layout); (4) Designer **panorama-first → slice 4:5** (bridges cross cuts; Create = sliced only); (5) strengthen Scriptwriter captivating hook; (6) confirm/amplify designer-carousel craft
- Режим: усиление команды (skills/rules/memory **only** — no prod app code)
- `ticket_limit: default≤3` — предложить ≤3 C-* в первой пачке; полный список ниже для Architect
- Роли по chain: Тренер → Архитектор → AI Bridge → Frontend → Backend (если persist flags) → Тестировщик → Фиксер → Деплоер → Клиент **S45**

## Грейд: **B**

(После усиления skills — команда готова к Архитектору. Runtime defaults/prompts ещё в `lib/` — закрывает chain.)

### Грейд ролей (A–D)

| Роль | Грейд | Комментарий |
|------|-------|-------------|
| **Frontend** | **B** | Colors-only Settings Design + model defaults UI — канон в `content-factory-ui`; код ещё писать |
| **AI Bridge** | **B→A после wire** | prompts panorama→slice + Hook bar + thinking flags + catalog — skills готовы; `create-carousel-prompts.ts` / agent-defaults / llm-models — chain |
| **Designer worker** | **A (skill)** | panorama→slice + golden craft уже сильны; усилены prompts canon |
| **Scriptwriter worker** | **A (skill)** | Hook bar + Haiku thinking notes; wire model defaults в chain |
| **Architect** | **B** | Нужен spec: exact Haiku aggregator id, thinking API shape, colors-only surface paths |
| **Client** | **A** | **S45 HARD** + client.mdc §11 |
| **Backend** | **B** | Только если model/thinking prefs persist server-side — иначе FE localStorage |

## Пробелы (до → после)

| # | Пробел | Роль | Слой | P | Статус |
|---|--------|------|------|---|--------|
| 1 | Draw canon = sliced-only без panorama-first | Designer | worker skill | P0 | **закрыто** (panorama→slice HARD) |
| 2 | Settings Design всё ещё «layout+MD editor» в голове команды | Frontend | content-factory-ui | P0 | **закрыто** (colors-only S45) |
| 3 | Нет Hook bar captivating | Scriptwriter | carousel-json + workers | P0 | **закрыто** |
| 4 | Нет catalog notes Designer/Scriptwriter defaults | AI Bridge/FE | trainer notes | P0 | **закрыто** (`llm-model-catalog-notes.md`) |
| 5 | Нет Client S45 | Client | scenarios + rule | P0 | **закрыто** |
| 6 | Runtime `llm-models.ts` / mesh still old defaults | AI Bridge/FE | code | P0 | **открыто → chain** |
| 7 | `create-carousel-prompts.ts` без panorama→slice verbatim | AI Bridge | code | P0 | **открыто → chain** |

## Что добавлено этим ходом

- `workers/designer-carousel/SKILL.md` + `PLUGINS.md` — panorama→slice HARD; colors-only; prompts canon; model default note
- `.cursor/skills/carousel-json-contract/SKILL.md` — Hook bar; pipeline panorama→slice; Settings colors-only
- `workers/script-writer/SKILL.md` — captivating hook + Haiku thinking
- `.cursor/skills/reels-scriptwriter/SKILL.md` — stronger hook bar + S45 FAIL
- `.cursor/skills/content-factory-ui/SKILL.md` — Settings Design **colors-only (S45)**
- `.cursor/skills/client-scenarios/SKILL.md` — **S45 HARD**
- `.cursor/rules/client.mdc` — Hard REJECT **§11**
- `.cursor/skills/client-review/SKILL.md` — S45 reject bullets
- `.cursor/skills/ai-bridge/SKILL.md` — S45 model/prompts/hook bullets
- `.cursor/skills/content-pipeline-agents/SKILL.md` — hook + panorama + colors + models HARD
- `.cursor/skills/trainer/llm-model-catalog-notes.md` — **new**
- `.cursor/skills/trainer/gap-playbook.md` — S45 rows
- `plugins/trainer/PLUGINS.md` — S45 + catalog notes

**Confirm:** designer-carousel craft (golden refs, bridges, role kits, safe-zone, sliced publish) **already covered** — amplified with explicit panorama-first generation so cross-cut elements are first-class.

## Proposed tickets (Architect may rename)

| Id (suggested) | P | Scope |
|----------------|---|--------|
| `C-designer-gpt-54-image-default` | P0 | Catalog + default Designer = `openai/gpt-5.4-image-2` |
| `C-scriptwriter-haiku-thinking` | P0 | Haiku 5.5 + thinking/reasoning ON |
| `C-settings-design-colors-only` | P0 | Remove layout markup editor; colors/swatches only |
| `C-designer-panorama-slice-prompts` | P0 | create-carousel-prompts + draw path panorama→slice; Create sliced UI |
| `C-scriptwriter-captivating-hook` | P1 | Hook bar in agent prompts; Client S45 |

Default wave pack **≤3 P0**: models Designer + Scriptwriter thinking · colors-only · panorama-slice prompts. Hook P1 может ехать в той же AI Bridge пачке если не overlapping.full-queue не запрошен.

## Recommended chain

```
Тренер (done) → Архитектор (spec+chain.md; locks: Haiku aggregator id, thinking API,
  DEFAULT_CAROUSEL_IMAGE_MODEL, colors-only Settings surface, panorama→slice IO)
  → AI Bridge (llm-models + mesh options + create-carousel-prompts panorama→slice
      + Scriptwriter Hook bar + thinking flag + agent-defaults)
  → Frontend (Settings Design colors-only UI; model default surfaces; Create stays sliced)
  → Backend (only if server persist of model/thinking — else skip)
  → Тестировщик (guards S45 + model default smoke)
  → Фиксер
  → Деплоер (localhost; refresh local API)
  → Клиент S45 HARD @1440 Playwright
```

Не параллелить: Settings Design UI ↔ create-carousel-prompts ↔ model catalog defaults.

## Вердикт

Команда готова к волне: **да** (грейд **B** — skills closed; prod wire = next).
`ticket_limit: default≤3`
