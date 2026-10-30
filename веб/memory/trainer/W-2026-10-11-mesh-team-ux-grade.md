# Trainer grade — W-2026-10-11-mesh-team-ux

## План хода

- Запрос: Team UX trim (reset/hint, title ModuleName), inspector file upload + Trainer plugin search, MCP website props, Scout без MultiButton типов, custom-reels Монтажёр/Сценарист + raw video IO, audit pipelines no copy-paste, ENV prep carousel key.
- Режим: Mesh + UI + pipeline contracts + Backend ENV (без секретов)
- Роли по chain: Архитектор → Frontend → Backend → AI Bridge → Тестировщик → Фиксер → Деплоер → Клиент
- Отвергнуто ранее: MultiButton на Team (C-138), xyflow infinite (C-139), copy-TZ (C-143), Settings Разведка/Агенты/LLM (C-145)
- `ticket_limit: default≤3` (P0 pack ниже); full backlog C-146…C-153 готов — снять лимит по явной фразе пользователя

## Грейд: B

До патчей skills: **C** (нет контрактов C-146…C-153).  
После патчей этого хода: **B** — команда может идти в Архитектора; остаются lock ModuleName source + vendor carousel URL в spec.

| Роль / skill | Грейд | Комментарий |
|--------------|-------|-------------|
| Frontend + `content-factory-ui` | B | Канон title/reset/upload добавлен |
| Mesh + `xyflow-agent-mesh` | B | C-146…C-152 checklist |
| Pipeline + `content-pipeline-agents` | B | C-151/C-152 + montage IO |
| Backend | B | C-148 upload store + C-153 env names; `docs/ENV_CAROUSEL.md` |
| MCP Playwright / free stack | A | без платных MCP |
| Env carousel | B | имена готовы; значение — только `.env` у человека |

## Пробелы (закрыты этим ходом в skills)

| # | Пробел | Роль | Слой | P |
|---|--------|------|------|---|
| 1 | Reset-to-template + brief hint | Frontend | skill | P0 |
| 2 | Title без `{ModuleName}` | Frontend | skill | P0 |
| 3 | Skills/Plugins text-only; нет Trainer search/add | Frontend / AI Bridge | skill | P0 |
| 4 | MCP без website/props | Frontend / Backend | skill | P1 |
| 5 | Scout MultiButton content-types в inspector | Frontend | skill | P0 |
| 6 | custom-reels = carousel Designer/Copywriter | AI Bridge / Frontend | skill | P0 |
| 7 | Shared pipeline copy-paste всех moduleId | Architect | skill | P1 |
| 8 | Нет ENV-слота первого carousel API key | Backend | skill + docs | P1 |

## Что добавлено этим ходом

- `.cursor/skills/xyflow-agent-mesh/SKILL.md` — C-146…C-152
- `.cursor/skills/content-factory-ui/SKILL.md` — зеркало Team UX
- `.cursor/skills/content-pipeline-agents/SKILL.md` — C-148/149, C-151 montage, C-152 audit
- `.cursor/skills/backend/SKILL.md` — C-148 files + C-153 `CAROUSEL_API_KEY`
- `docs/ENV_CAROUSEL.md` — prep без секретов
- `gap-playbook.md` + `plugins/trainer/PLUGINS.md` строки волны

## Proposed tickets (C-122+ заняты → **C-146+**)

| ID | Scope |
|----|--------|
| **C-146** | DELETE reset-to-template + User brief hints |
| **C-147** | Title always `Команда выпуска: {ModuleName}` |
| **C-148** | File upload skills/plugins; Trainer-test search/add plugins |
| **C-149** | MCP properties: website + transport/tools/authEnvKeys names |
| **C-150** | Scout inspector: no content-type MultiButton (per-pipeline window) |
| **C-151** | custom-reels: Монтажёр рилсов / Сценарист; montage inputs = raw videos |
| **C-152** | Audit all module pipelines — logic, no copy-paste graphs |
| **C-153** | ENV prep first carousel API key (`CAROUSEL_API_KEY`) |

**Default pack (≤3):** C-146 → C-147 → C-148 (P0 chrome + upload).  
**Next:** C-149 → C-150 → C-151; then C-152 → C-153.

## Chain (one-liner)

`Архитектор → Frontend (mesh+ui) → Backend (upload store + ENV) → AI Bridge (reels montage + per-module contracts) → Тестировщик → Фиксер → Деплоер → Клиент`

## Вердикт

Команда готова к волне: **да** (грейд B; сначала Архитектор spec + `chain.md`)
