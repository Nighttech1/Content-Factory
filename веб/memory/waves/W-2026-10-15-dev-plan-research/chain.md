# Chain — W-2026-10-15-dev-plan-research

**ticket_limit:** n/a (docs wave)  
**shell_freeze:** true  
**product_code:** forbidden

---

## Порядок ролей

```text
Trainer (optional / skip if already graded research wave)
  → Architect ✅ (DEV_PLAN.md + this wave folder)
  → Tester (docs-only check)
  → Deployer N/A
  → Client (optional plan-accuracy review — НЕ UI-приёмка, Playwright не обязателен)
```

---

## Что делает каждая роль

| Роль | Действие | Запрещено |
|------|----------|-----------|
| **Architect** | Переписать `DEV_PLAN.md`; `architect-spec.md` + `chain.md` | Писать UI/API код |
| **Tester** | `git diff` / список изменённых файлов = только docs (`DEV_PLAN.md`, `memory/waves/W-2026-10-15-dev-plan-research/**`, опц. AUDIT если не трогали). Проверить: спринты 1–7 все `[x]`; 8+ есть `[ ]`; есть UI shell freeze + «НЕ делаем»; ссылки на AUDIT. Записать короткий `tester-report.md`. | Запускать Frontend, править компоненты |
| **Frontend / Motion** | **Не в chain** | — |
| **Backend / AI Bridge** | **Не в chain** этой волны | — |
| **Deployer** | N/A | — |
| **Client** | Опционально: «план понятен / порядок ценности ок» | Вердикт ПРИНЯТО по UI без Playwright — не применять к этой волне |

---

## Path lock

Только:

- `DEV_PLAN.md`
- `memory/waves/W-2026-10-15-dev-plan-research/architect-spec.md`
- `memory/waves/W-2026-10-15-dev-plan-research/chain.md`
- (после Tester) `memory/waves/W-2026-10-15-dev-plan-research/tester-report.md`

Overlap с UI-файлами = **FAIL волны**.

---

## Следующая продуктовая волна (после закрытия docs)

Не стартует автоматически. Когда пользователь скажет «делаем спринт 8» (или full-queue 8…):

1. Trainer grade  
2. Architect: `memory/tickets/C-*/architect-spec.md` + `chain.md` **под publish**  
3. Backend → Tester → Fixer → Deployer → Client Playwright  

По умолчанию ≤3 `C-*`; при «до конца» — весь спринт 8 без нарезки.
