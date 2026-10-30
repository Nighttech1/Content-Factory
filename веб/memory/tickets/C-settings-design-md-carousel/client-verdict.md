# Клиент — C-settings-design-md-carousel

**Дата:** 2026-10-13  
**Сценарий:** S43.2 / S43.3 / S43.4  
**Playwright MCP:** `project-0-Content factory-playwright` @ **1440×900**  
**URL:** http://127.0.0.1:3000/settings  

## Вердикт

**ПРИНЯТО** (в составе волны — см. замечание по drafts в wave acceptance)

## Шаги (клики, не скрин-only)

1. `browser_resize` 1440×900 → `navigate` `/settings`
2. Snapshot: блок **Дизайн**, Embla region (стрелки «Предыдущий/Следующий дизайн»), слот **1/10**, chip **DESIGN.md**, бейдж **Активный**
3. Видны **«Добавить новый дизайн»** и **«Загрузить DESIGN.md»**
4. Click **«Превью design.md»** → dialog «Превью design.md» открыт
5. Click **«Закрыть превью»** (X / `settings-design-preview-close`) → dialog **gone**; снова кнопка «Превью design.md»

## Assert

| Check | Result |
|-------|--------|
| Embla carousel library ≤10 | PASS (`Слотов: 1/10`) |
| DESIGN.md chip top-right on slide | PASS |
| «Добавить новый дизайн» visible | PASS |
| Preview open → Close works | PASS |
| Bottom-left «N» on /settings | PASS (нет) |

## Evidence

- Snapshot Settings Design: `.playwright-mcp/page-2026-10-13T09-47-*.yml`
- Screenshot Design Embla: `.playwright-mcp/page-2026-10-13T09-47-18-007Z.png`
- Screenshot preview open: `.playwright-mcp/page-2026-10-13T09-47-46-101Z.png`

## Остаток

Полный parse MD+HTML после upload image — smoke path (кнопка/file input) виден; полный Backend/AI Bridge re-check вне этого UI-гейта.
