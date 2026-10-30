# Architect spec — C-scriptwriter-cta-hint-ui (P1)

> **Архитектор** — memory only. Wave: `W-2026-10-13-scriptwriter-swipe-cta`.  
> Canon: `content-factory-ui` § Scriptwriter CTA cheat sheet.

## Goal

На шаге **Сценарист** Create: кнопка **«?»** top-right панели чата → popover/dialog со шпаргалкой CTA 1–4 (RU plain language).

## UX lock

| Need | Forbid |
|------|--------|
| `data-testid="create-scriptwriter-cta-hint"` | Hint as primary on Designer / Publication |
| Panel `data-testid="create-scriptwriter-cta-hint-panel"` | Settings/Team drawer dump |
| Only `activeStep === "scriptwriter"` | Purple tooltip slop; EN-only |
| Accessible (aria-label / focus) | Auto-inject CTA into chat |

Cheat sheet rows (exact sense):

1. Вопрос зрителю → напишите в комментариях  
2. Хочешь ещё подобного? → подписывайся  
3. Живые встречи армянского разговорного клуба → приглашение через TG канал в шапке профиля  
4. Понравился контент? → лайк+сохранить  

FE **не** пишет JSON — только шпаргалка. User печатает номер в чат.

## Paths

| Path | Owner |
|------|-------|
| `components/studio/workspace/CreateCarouselModal.tsx` | Frontend |
| Optional: `ScriptwriterCtaHint.tsx` рядом | Frontend |

Place near chat pane / AgentChatComposer area (chat chrome top-right), **not** modal «Передать задание».

## Acceptance (Client S46 B/C)

1. Scriptwriter: «?» visible @1440; opens panel with 1–4.  
2. Designer/Publication: no primary «?» cheat sheet.  
3. Vernatun glass / Dark Luxury tokens.
