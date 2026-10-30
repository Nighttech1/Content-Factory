# Клиент — приёмка волны W-2026-10-13-drafts-design-team

**Дата:** 2026-10-13  
**HARD GATE:** Playwright MCP `project-0-Content factory-playwright` @ **1440×900**  
**Localhost:** http://127.0.0.1:3000 (Deployer READY)  
**Сценарий:** **S43**  

## Вердикт волны

**ПРИНЯТО С ЗАМЕЧАНИЯМИ**

Hard REJECT triggers (Close fail / Embla missing / Team brief / «N» visible) — **не сработали**.  
Полный S43.1 Create→draw→карточка Черновиков без F5 — **не прогонялся** (нужен live LLM); UI path Черновиков + empty copy verified.

## S43 checklist

| Step | Check | Result |
|------|-------|--------|
| a | `/settings` → Дизайн Embla, DESIGN.md chip, «Добавить новый дизайн»; preview → Close (X) | **PASS** |
| b | Team `/admin/mesh` → carousel-engine → «Задание» empty (no combat lorem) | **PASS** |
| c | No bottom-left «N» on `/studio` or `/settings` | **PASS** |
| d | Черновики tab + empty copy (Create+Разбор); cards if LS; full draw needs LLM | **PASS (partial)** — empty path OK; full draw **deferred** |

## Tickets

| Ticket | Client verdict file | Verdict |
|--------|---------------------|---------|
| C-settings-design-md-carousel | `memory/tickets/C-settings-design-md-carousel/client-verdict.md` | ПРИНЯТО |
| C-team-brief-n-indicator | `memory/tickets/C-team-brief-n-indicator/client-verdict.md` | ПРИНЯТО |
| C-drafts-always | `memory/tickets/C-drafts-always/client-verdict.md` | ПРИНЯТО С ЗАМЕЧАНИЯМИ |

## C-* remaining

- **C-drafts-always** — follow-up re-acceptance: один live Create→draw (или publish) → карточка на **Черновики** без F5.
- **C-155 network** (raw user, no brief glue) — не в этом Playwright-ходе; brief UI empty уже PASS.

## Evidence (Playwright)

| Artifact | Path / note |
|----------|-------------|
| Settings Embla | `.playwright-mcp/page-2026-10-13T09-47-18-007Z.png` |
| Preview open | `.playwright-mcp/page-2026-10-13T09-47-46-101Z.png` |
| Team Задание empty | `.playwright-mcp/page-2026-10-13T09-48-22-973Z.png` |
| Studio no N | `.playwright-mcp/page-2026-10-13T09-49-38-287Z.png` |
| Черновики empty | snapshot 09-49 / screenshot after drafts click 09-50 |
| Close assert | snapshot after Close: dialog gone, «Превью design.md» restored |

## Prod

**Не согласовано** на VPS/prod: открыто замечание по полному S43.1 drafts + optional C-155 network.
