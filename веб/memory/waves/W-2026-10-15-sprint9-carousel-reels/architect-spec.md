# Architect Spec — W-2026-10-15-sprint9-carousel-reels

**Дата:** 2026-10-15  
**Роль:** Архитектор  
**Волна:** Sprint 9 — Карусели + рилсы IG/YT (качество как Claude Code)  
**DEV_PLAN:** 9.1 → 9.11  
**ticket_limit:** `full-queue` (пользователь: «погнали спринт 9» как wave 8 — **не** резать на пачки по 3)  
**shell_freeze:** `true`  
**upgrade_only:** `true`  
**no_pipeline_break:** `true`  
**Trainer grade:** `memory/trainer/2026-10-15-sprint9-carousel-reels-grade.md` (**B**)  
**Код продукта в этом ходе:** **нет** — только plan files.

---

## 1. Зачем это нужно (простым языком)

Фабрика уже умеет собирать карусели и рилсы по цепочке «разбор → сценарий → картинки/монтаж → черновик». Сейчас результат часто «почти ок»: слабый заголовок, пустой призыв, «фиолетовый» шаблонный визуал.

**Sprint 9** не ломает эту цепочку и не переделывает экраны. Мы **усиливаем** тексты-инструкции для ИИ, эталонные примеры и жёсткую проверку JSON — чтобы **один сильный запрос** давал острый вирусный результат (планка Client HARD **S44–S46**).

**Не делаем:** выкладку в Instagram / YouTube (это Sprint 22). Другие модули (HeyGen, мульт, статьи…) — **Sprint 23**.

---

## 2. Жёсткие замки (HARD)

| Lock | Значение |
|------|----------|
| **upgrade_only** | Правим промпты / few-shots / critic / contracts / agent-defaults / worker SKILL **на месте**. Запрет «написать пайплайн с нуля». |
| **no_pipeline_break** | Сохранить **Razbor → Scriptwriter → Designer → Draft** (карусель). Create: **Scriptwriter → Designer → шаг Публикация → Draft**. Reels: **Scriptwriter → Монтажёр / existing render**. Не удалять агентов, не схлопывать в один мега-LLM, не auto-skip handoff. |
| **shell_freeze** | 0 правок AppShell / Sidebar / left nav IA / module top chrome / Create-Razbor redesign. |
| **modules** | Только `carousel-engine` + `custom-reels`. Остальное → Sprint 23. |
| **no social publish** | Только Draft / HITL queue. Meta Graph / YT upload **запрещены**. |
| **Frontend** | **Вне** chain по умолчанию. Frontend-minimal только если без debug-chrome нельзя снять метрики scorecard (Architect escalation). |
| **Motion** | Вне chain. |

---

## 3. As-is inventory (research — до кода)

### 3.1 Как грузятся промпты

| Путь | Роль |
|------|------|
| `app/api/studio/agent-chat/route.ts` | Live chat Create/Razbor: modes `chat` / `handoff` / `describe` / `draw`; роли `scriptwriter`/`designer`/`razbor`…; подмешивает mesh seed + Create overlays; parse carousel JSON; draw via renderer |
| `lib/mesh/agent-defaults.ts` | `PIPELINE_COPY["carousel-engine"]` + `["custom-reels"]` — system seeds при `seedAgentsForPipeline` |
| `lib/studio/create-carousel-prompts.ts` | Overlays Scriptwriter/Designer для Create (Dramaturgy / panorama→slice) |
| `lib/studio/agent-start-bundle.ts` | Сборка agent-start (rules/skills/plugins/MCP) |
| `lib/studio/razbor-live-analyze.ts` + `razbor-live-shared.ts` + `razbor-pipeline.ts` | Live Razbor Haiku analyze → insights → Scriptwriter |
| `.cursor/skills/ai-bridge/razbor-live-prompt.md` + `s50-prompt-hardening.md` | Канон текстов Razbor / hardening |

### 3.2 Контракты и рендер (уже есть)

| Файл | Статус as-is |
|------|--------------|
| `lib/studio/carousel-json-contract.ts` | Zod + `parseAndAssertCarouselJson` — ключи wave (slide_number / primary_copy…). **STRICT частично**: Create path no-mock; нужно усилить fail-job везде (9.7) |
| `lib/studio/reels-script-contract.ts` | Soft-parse `parseReelsScriptArtifact` — **ещё не hard-fail job** как carousel; gap 9.7 |
| `lib/studio/carousel-html-renderer.ts` + `generate-carousel-slides-core.ts` | Draw / slice preview |
| `lib/studio/create-carousel-publish.ts` + `carousel-drafts-store.ts` | Draft persist (Postgres wire после Sprint 8) |
| `workers/script-writer/SKILL.md` | Канон Dramaturgy |
| `workers/designer-carousel/SKILL.md` | Panorama→slice |
| Golden visual refs | `generatedMedia/wave-visual-deconstructor/` (`dark_notes`, `bento_glass`) — HTML/PNG; **product golden JSON pack ещё нет** → 9.2/9.3 |

### 3.3 Live vs chrome (черновик для C-s9-01)

| Агент / путь | Ожидание C-s9-01 |
|--------------|------------------|
| Razbor (`carousel-engine`) | Live Haiku analyze (S48) — подтвердить vs soft-ack |
| Scriptwriter carousel | Live Polza + overlays — подтвердить hook/CTA/JSON |
| Designer carousel | Describe→draw + sliced preview — подтвердить vs text-only «готово» |
| Draft carousel | Create → Черновики — подтвердить persist |
| Scriptwriter `custom-reels` | Live generate JSON hook/beats/CTA — gaps vs soft-parse |
| Монтажёр / render reels | Existing path / placeholder — **не** HeyGen; статус chrome vs live |
| Other moduleId | Колонка «→ Sprint 23» — не раздувать таблицу |

---

## 4. Что AI Bridge / Backend **МОГУТ** править

### 4.1 AI Bridge — разрешённые paths (prompts / contracts / workers / lib studio)

| Path | Тикеты |
|------|--------|
| `lib/mesh/agent-defaults.ts` — **только** ключи `carousel-engine` и `custom-reels` | 9.4–9.6, 9.8 |
| `lib/studio/create-carousel-prompts.ts` | 9.4, 9.5, 9.8 |
| `lib/studio/carousel-json-contract.ts` | 9.4, 9.7 (усиление schema/assert, **без** ломки keys без миграции) |
| `lib/studio/reels-script-contract.ts` | 9.6, 9.7 |
| `lib/studio/agent-start-bundle.ts` | 9.4–9.8 (inject few-shot / critic instructions) |
| `lib/studio/razbor-live-*.ts` / `razbor-pipeline.ts` | 9.4 handoff quality only; **не** менять порядок шагов UI |
| `app/api/studio/agent-chat/route.ts` | 9.7 STRICT fail + 9.8 critic **plug-in** (см. §6); **не** удалять роли / modes |
| `workers/script-writer/SKILL.md` | 9.4, 9.8 |
| `workers/designer-carousel/SKILL.md` | 9.5, 9.8 |
| `.cursor/skills/ai-bridge/s50-prompt-hardening.md` (+ optional new `sprint9-*-pack.md` рядом) | 9.8 |
| `memory/fixtures/sprint9/**` (новые golden JSON + readme) | 9.2, 9.3 |
| `memory/waves/.../inventory-live-vs-chrome.md` | 9.1 |
| `memory/waves/.../scorecard-9.10.md` | 9.10 |

### 4.2 Backend — узкий scope

| Path | Тикеты |
|------|--------|
| Golden fixture loaders / test helpers под `memory/fixtures` или `lib/studio/__fixtures__` | 9.2, 9.3 |
| Усиление zod assert + HTTP/job error mapping (fail, не soft-mock) в route / job wrappers | 9.7 |
| **Не** новые таблицы Prisma ради Sprint 9 | — |

---

## 5. Что **MUST NOT** трогать

| Запрет | Почему |
|--------|--------|
| `AppShell`, `SidebarNavigation`, `MenuVertical`, left nav IA, module top-nav chrome | shell_freeze |
| Удаление / rename агентов Razbor / Scriptwriter / Designer / Монтажёр | no_pipeline_break |
| Смена handoff graph (кнопки, segment Create, auto-handoff Scriptwriter) | no_pipeline_break + carousel-studio-handoff already done |
| Rewrite `CreateCarouselModal` / Razbor modal layout | shell_freeze / UI out |
| `PIPELINE_COPY` для heygen / cartoon / aesthetic / articles / clips | Sprint 23 |
| Social publish workers / Meta / YT clients | Sprint 22 blocked |
| Wipe Postgres / Redis / `generatedMedia` | data-safety |
| Возврат User basic brief | S49 deleted forever |
| Soft-mock success на bad JSON / weak hook | STRICT + critic |

---

## 6. Critic loop — как вставить **без** удаления агентов

**Решение D-s9-critic:** critic = **дополнительный слой** перед записью в Draft / перед «готово к публикации-step», **не** новый mesh-агент вместо Scriptwriter/Designer.

```
Razbor ──► Scriptwriter ──► [optional structure critic] ──► Designer ──► [visual/quality critic] ──► Draft
custom-reels: Scriptwriter ──► [reels critic] ──► Монтажёр/render path ──► Draft
```

| Правило | Деталь |
|---------|--------|
| **Где код** | Функция(и) в `lib/studio/` (напр. `carousel-quality-critic.ts` / `reels-quality-critic.ts`) + вызов из `agent-chat` handoff/draw success path и/или `create-carousel-publish` **до** persist Draft |
| **Что проверяет** | Carousel: weak/flat hook; missing CTA 1–4; empty `swipe_trigger`; `requested_slide_count !== slides.length`; purple-slop markers in visual_prompt. Reels: hook not in 0–2s; missing beats; missing CTA on-screen/caption |
| **Fail** | Вернуть ошибку агенту / UI (как STRICT fail) — **не** soft-ack «успех» |
| **Pass** | Существующий handoff продолжает как сейчас |
| **Модель** | Тот же aggregator; короткий pass/fail JSON — **не** переписывает slides сам (опционально 1 retry prompt — Architect: max 1 retry, затем fail) |
| **Запрет** | Заменить Designer critic’ом; убрать Razbor; auto-publish |

---

## 7. Пороги scorecard (9.10) — числа для «можно в Sprint 22 / автономию»

Зафиксировать в `memory/waves/W-2026-10-15-sprint9-carousel-reels/scorecard-9.10.md` после C-s9-09 smoke:

| Метрика | Порог green (Architect lock) |
|---------|------------------------------|
| **STRICT JSON pass** (carousel handoff/draw) | ≥ **90%** на smoke-выборке ≥10 прогонов |
| **Reels schema pass** (hook+beats+CTA present) | ≥ **90%** на ≥5 прогонах |
| **HITL reject rate** (ручная «слабо / не Vernatun») | ≤ **30%** на той же выборке |
| **Golden likeness** (ручная отметка «похоже на golden») | ≥ **70%** carousel; ≥ **70%** reels scripts |
| **S44–S46 HARD** Client | Все релевантные сценарии **PASS** (иначе Sprint 22 blocked) |
| **No soft-mock** | 0 случаев «успех» при parse fail в smoke |

Ниже порога → **9.11** Fixer loop: новый/открытый `C-*` с входом/выходом + guard; не «починили на словах».

---

## 8. Тикеты ↔ DEV_PLAN

| DEV_PLAN | Тикет | Primary |
|----------|-------|---------|
| **9.1** | **C-s9-01** inventory | AI Bridge (+ Architect table) |
| **9.2** | **C-s9-02** golden carousel | AI Bridge + Backend fixtures |
| **9.3** | **C-s9-03** golden reels | AI Bridge |
| **9.4** | **C-s9-04** Scriptwriter carousel upgrade | AI Bridge |
| **9.5** | **C-s9-05** Designer upgrade | AI Bridge |
| **9.6** | **C-s9-06** Reels scriptwriter | AI Bridge |
| **9.7** | **C-s9-07** STRICT contracts | AI Bridge + Backend |
| **9.8** | **C-s9-08** prompt packs + few-shots + critic | AI Bridge |
| **9.9** | **C-s9-09** smoke | Tester (+ AI Bridge) |
| **9.10** | **C-s9-10** scorecard | Tester + AI Bridge |
| **9.11** | ongoing (не отдельный ID) | AI Bridge → Tester → Fixer на fail |

---

## 9. Acceptance волны (язык Клиента)

На localhost @1440 Клиент видит **заметный рост качества**:

1. **Create карусель:** один сильный запрос → цепляющий cover, CTA 1–4, мета swipe, нарезанный 4:5 preview не «чёрный/фиолетовый slop», черновик в Ours.  
2. **Razbor → Scriptwriter → Designer → Draft** жив и не сломан.  
3. **custom-reels:** сценарий с hook 0–2с, beats, CTA — не карусельный JSON.  
4. **Нет** реальной публикации в соцсеть.  
5. Scorecard 9.10 ≥ порогов §7 **или** честный fail + открытый 9.11.

Доказательство: Playwright MCP + smoke C-s9-09 + слова качества (не «в API есть»).

---

## 10. Skills канона

`prompt-engineering` § Sprint 9 · `carousel-json-contract` · `reels-scriptwriter` · `content-pipeline-agents` § Sprint 9 · `ai-bridge` · `s50-prompt-hardening` · `tester` § 9.9–9.10 · `backend` § Sprint 9 fixtures/STRICT · Client S44–S46.

---

## 11. Out of scope (явно)

HeyGen / cartoon / aesthetic / articles / clips-to-reels · Marketing Director deep · Analyst product · mesh parity других модулей · Apify cost ops (Sprint 10) · social publish (22) · UI redesign.

---

`🏗️ **АРХИТЕКТОР:** Sprint 9 locked — upgrade_only + no_pipeline_break + shell_freeze; full-queue C-s9-01…10; next = AI Bridge C-s9-01.`
