# Architect Spec — W-2026-10-15-dev-plan-research

**Дата:** 2026-10-15  
**Роль:** Архитектор  
**Тип волны:** docs-only  
**shell_freeze:** `true`

---

## Цель

Переписать живой roadmap `DEV_PLAN.md` по факту аудита приложения (не по памяти UI-волн).  
**Код продукта / UI не трогаем.**

---

## Входы (sources of truth)

| Файл | Использование |
|------|----------------|
| `docs/AUDIT_FUNCTIONALITY.md` | Функционал as-is + пробелы |
| `docs/AUDIT_ARCHITECTURE_STACK.md` | Стек, данные, техдолг |
| `DEV_PLAN.md` (старый) | Спринты 1–7 → архив `[x]` |
| `ARCHITECTURE.md` | Aspirational vs real (не принимать за done) |
| Inventory summary (пользователь / explore) | DONE / PARTIAL / TOP gaps |

---

## Deliverables

1. **`DEV_PLAN.md`** (корень репо) — living roadmap:
   - header: обновление 2026-10-15, UI shell freeze, ссылки на AUDIT + ARCHITECTURE;
   - таблица «Что уже работает» (все `[x]`);
   - архив Sprint 1–7 (все `[x]`);
   - новые Sprint 8–21 с гранулярными `- [ ]`, ориентиром времени, chain hint;
   - порядок: publish → persist → autonomy → competitors/ops → trainer → analytics → modules → queue/SSE → auth → parity;
   - секция «НЕ делаем».
2. **Этот `architect-spec.md`**
3. **`chain.md`** — docs-only chain

---

## Hard constraints

| Lock | Правило |
|------|---------|
| **No product code** | Запрет правок `app/`, `components/`, `lib/` (кроме если когда-то отдельно тикет — не эта волна) |
| **UI shell freeze** | Не планировать redesign shell/nav/glass/S47–S50 chrome wars |
| **Frontend in future sprints** | Только `Frontend-minimal` + tiny affordance; предпочтение Backend / AI Bridge |
| **HITL** | Публикация только после апрува (data-safety) |
| **Secrets** | Не писать ключи в memory/plan |

---

## Порядок ценности (зафиксировано в DEV_PLAN)

1. Sprint 8 — real social publish  
2. Sprint 9 — Postgres SoT  
3. Sprint 10 — autonomous carousel loop  
4. Sprint 11 — Apify / competitors ops  
5. Sprint 12 — Trainer approve (minimal UI)  
6. Sprint 13 — live analytics cron  
7. Sprint 14 — HeyGen E2E  
8. Sprint 15 — Remotion/cartoon  
9. Sprint 16 — aesthetic-graphics  
10. Sprint 17 — custom-reels script  
11. Sprint 18 — BullMQ + true SSE  
12. Sprint 19 — site/tg articles  
13. Sprint 20 — real auth/RBAC  
14. Sprint 21 — other mesh pipelines parity  

---

## Acceptance этой волны (docs)

- [x] `DEV_PLAN.md` отражает audit + freeze  
- [ ] Tester: diff = только markdown / memory docs; **0** churn shell UI files  
- [ ] (опц.) Клиент: точность плана словами — без Playwright (это не UI-приёмка)

---

## Out of scope

- Закрытие S51 Client verdict / Apify 403 ops (отдельные тикеты при необходимости)  
- Любой Frontend redesign  
- Prod deploy  

---

`🏗️ **АРХИТЕКТОР:** DEV_PLAN переписан; волна docs-only; chain → Tester docs check.`

---

## Addendum 2026-10-15 (plan reorder)

По запросу пользователя порядок ценности **заменён** (см. `plan-reorder-2026-10-15.md` и актуальный `DEV_PLAN.md`):

1. **8** Postgres SoT  
2. **9** Agent quality & verification (**NEW**)  
3. **10** Apify / competitors  
4. **11** Autonomy (после green агентов)  
5. **12** Trainer · **13** Analytics  
6. **14–21** Module depth (HeyGen…Auth); HITL → draft/schedule only  
7. **22** Real social publishing (**LAST**)

Список «Порядок ценности» выше в этом файле — **исторический** (первая редакция волны); канон = `DEV_PLAN.md` спринты 8–22.
