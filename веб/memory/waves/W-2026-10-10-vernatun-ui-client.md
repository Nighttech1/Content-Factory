# Client acceptance — W-2026-10-10-vernatun-ui

**Дата:** 2026-10-10  
**Viewport:** Playwright MCP @1440  
**Localhost:** http://localhost:3000

## Вердикт: ПРИНЯТО С ЗАМЕЧАНИЯМИ

Слово **согласовано** — после закрытия P2 ниже (или явного «ок» пользователя на демо-хвосты).

### Доказательства Playwright

| Сценарий | Результат |
|----------|-----------|
| S32 Brand | PASS — `img Vernatun` + VERNATUN / ARMENIAN CLUB справа; Fixer crop seal |
| S32 Studio no register | PASS — нет «Добавить модуль» |
| S33 Mesh static | PASS — нет MiniMap/Controls; overlaps нод = 0 |
| S33 Dual-lane | PASS — User + Razborщик→…; Scout→Analyst→Trainer; dashed Trainer→release |
| S33 Scout panel | PASS — «Собранная информация», не patches |
| S33 Trainer panel | PASS — «Предложения по skills/rules»; barbell badge |
| S34 Analytics menu | PASS — плитки → dashboard → «← К меню» |
| S34 RL HITL | PASS — «Предложение Тренера» + «Согласовано» → status badge |
| S34 Retention 15s | PASS — `62% (31/50)` `retention-at-15` |
| S35 Schedule popup | PASS — pos `140,90` / `220,160` restore из `cf.schedule.popup.pos` |

### P2 (не блокируют демо функций; желательно до «показывать людям» mesh)

1. **Mesh labels** — подписи handoff всё ещё визуально пересекают линии/карточки; FitView publisher у правого края плотно.
2. **Brand** — после crop seal OK; при желании вырезать отдельный emblem-only PNG из `knowledge/logo`.

### Тикеты

C-122…C-128 — функционально закрыты с guards; live Client evidence выше.
