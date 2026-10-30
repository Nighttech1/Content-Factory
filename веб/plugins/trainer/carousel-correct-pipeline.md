# Correct carousel pipeline — `docs/карусель тест/correct/`

**When:** user drops / updates the **исправленный** пайплайн в `docs/карусель тест/correct/` и просит выровнять агентов **до** правки prod-кода.

## Source of truth (answers locked 2026-10-17)

| File | Status | Role |
|------|--------|------|
| `# 00_README.md.txt` | **filled** | flow + placeholders |
| `01_sheet_schema.md.txt` … `06_brand_and_palette.md.txt` | **EMPTY (0 bytes)** | **P1 fill** — Оркестратор объясняет список содержимого (см. § Clarification 01–06) и заполняет из Sheet + user answers; **не** копировать пустые файлы в app/ |
| Live Google Sheet | **SoT для тем/флагов/колонок** | `https://docs.google.com/spreadsheets/d/1kOJ1CjMK5rNldM1IGNLdiVXqHTMeCuG35yP6_w6Y5Ls` — Backend/Architect **сначала подтвердить видимость** (read), потом localhost fill-тесты |

## User answers (10/10) — LOCKS

| Q | Answer → lock |
|---|----------------|
| **1 SoT** | Sheet = **ДОПОЛНЕНИЕ** к Create-чату (не замена). Автоген по **расписанию** → **черновики**. Юзер задаёт **время публикации**. |
| **2 Docs 01–06** | Пользователь не понял какие тексты нужны → **Оркестратор уточняет** списком из README (ниже). **НОВОЕ UI:** Settings → блок **«Бренд»** **ПОСЛЕ** «Дизайн» (логотип клуба). |
| **3 Modes / Sheet** | Live sheet URL выше = темы + флаги; смотреть **откуда что берётся** (колонки → агенты). |
| **4 Critic** | Code critic **ДОПОЛНЯЕТ** текущий zod **STRICT** (не заменяет). |
| **5 Vision** | **Лучшая** vision-модель. Max **2** генерации слайда (1 retry). Потом **отдать** с кривым текстом + `needs_review` / signal. |
| **6 Designer** | **ПОЛНОСТЬЮ** заменить текущий draw-пайплайн на **correct/** — **STRICT follow**. Supersede old Designer inventiveness / rich invent overlays. |
| **7 Characters** | Settings **ниже Бренд**: блок **«Персонажи»** (rename from Пейзажи; API `landscapes` OK) — ячейки: **имя + фото с разных сторон** (consistency). Sheet column **`hero`**: empty = no character; else = character **number**. Half-width fields (~50vw). |
| **8 Status / Publicist** | Agent settings: вкладка **«Логи»**. Agent на workflow = **RED perimeter** when error. **Publicist** публикует черновики по **auto schedule из настроек** **ИЛИ** **manual time**. |
| **9 S53/S54** | **ВСЁ** строго по новому пайплайну. **S53/S54 bake-off acceptance rules SUPERSEDED** by correct pipeline (document in skills/Client). |
| **10 Brand + CTA** | Brand fields → Settings **Brand** block. **CTA catalog 1–4 KEEP**. **`swipe_trigger` KEEP** (meta). |

> **Paint SUPERSEDE 2026-10-17 (S57):** product render = **LAYERED HTML** (`plugins/trainer/carousel-layered-html-pipeline.md`). Type-on-PNG / vision text-check / `correct_pipeline` paint as ship path → **OFF**. Keep sheet⊕Create, Brand, Персонажи, Logs, RED, Publicist, CTA 1–4, swipe meta. Client → **S57**.

## Flow (target — STRICT)

```text
useful sheet row ONLY (gid=902078005 «Полезные карусели», status=new)  ⊕  Create-chat (parallel entry)
  → Scriptwriter (02) → full carousel JSON | needs_input
  → zod STRICT + Code critic (05) → fail → retry Scriptwriter ≤2
  → Designer (03) → per-slide image_prompt ONLY (no invention; supersede old invent)
  → Image model → PNG
  → Vision text-check (04+05) → mismatch → regen slide ≤2 total gens
      → still bad → deliver PNG + needs_review / signal (do NOT block forever)
  → ready: PNG + caption + hashtags → Drafts
  → Publicist: auto schedule from settings OR user manual publish time
  → social publish only per Publicist path + existing HITL product rules
```

**Useful-only lock (mini-wave):** ignore meetings tab; user inserts meeting topics **into useful** with СТА=3 later. Smoke card: `plugins/trainer/useful-smoke-51-1-17.md`.

Placeholders: `{{BRAND_NAME}}` · `{{LOGO_REF}}` · `{{DESIGN_PALETTE_JSON}}` · `{{CHARACTER_CATALOG}}` (from **Персонажи**) · `{{MODE}}`=`useful`.

## Clarification for Orchestrator → user (Q2: что писать в 01–06)

Пользователю простым языком: «в папке `correct/` сейчас есть только инструкция (00). Файлы 01–06 — это **готовые тексты для кода и ИИ**, которые команда скопирует. Нужно заполнить **каждый** файл таким содержимым:»

| Файл | Кто читает | Что должно быть внутри (из README) |
|------|------------|-------------------------------------|
| **01_sheet_schema** | Backend + Cursor | Колонки Google Sheet; product intake **useful-only** gid=`902078005` (meetings tab document for schema history OK, **do not poll**); значения `status`, поля `slides`, `cta_type`, колонка **`hero`**, темы и флаги — **снять со живой useful-вкладки** |
| **02_scriptwriter_prompt** | LLM Сценарист | **Системный промпт** + два режима (`meetings` \| `useful`) |
| **03_designer_prompt** | LLM Дизайнер | **Системный промпт** + формат выхода `image_prompt` для image-модели; правило «ничего не добавляет» |
| **04_text_check_prompt** | Vision-модель | Промпт **проверки текста на картинке** (OCR/match vs JSON) |
| **05_critic_rules** | Код (не LLM) | Правила проверки **до и после** генерации — **дополняют** zod STRICT |
| **06_brand_and_palette** | App + оба агента | Цвета из DESIGN.md (`bg`/`text`/`accent`/`muted`), **название бренда**, путь/файл **логотипа** |

Если пользователь не пишет промпты сам — Оркестратор/AI Bridge **черновит** 02–04/06 из Sheet + Brand/**Персонажи** locks и кладёт в `correct/` на ревью; 01+05 — Architect/Backend из Sheet schema.

## Pre-flight before localhost fill tests

1. **Confirm sheet visibility** (Backend or Architect read of live Sheet) — headers + sample row.  
2. Only then: sync/fill tests against localhost.  
3. Do **not** invent columns if Sheet differs from README — Sheet wins for themes/flags/`hero`.

## Locks (post-answers)

| Lock | Value |
|------|-------|
| `code_before_10_answers` | **true unlocked** — answers received; Architect may spec |
| `docs_01_06_empty` | Still empty → fill before pasting prompts into prod; Settings/Brand/Персонажи/Logs UI + sheet sync **may** start after Architect |
| `plan_then_act` | каждый шаг: роль → план → действие |
| `shell_freeze` | AppShell/nav — freeze; **in scope UI:** Settings Brand + **Персонажи** (half-width), agent Logs tab, red error perimeter, Publicist schedule chrome |
| `useful_only` | gid `902078005` only — meetings ignore |
| `full_pipeline_replace` | correct/ **STRICT** supersedes old Designer inventiveness + S53/S54 **bake-off** Client rules |
| `cta_swipe_keep` | CTA **1–4** + `swipe_trigger` meta **KEEP** |
| `critic_supplements_zod` | critic **adds** to zod STRICT |
| `vision_max_2_then_deliver` | ≤2 gens/slide then deliver + `needs_review` |
| `create_plus_sheet` | Sheet **supplements** Create-chat; schedule → drafts |

## Skills / roles

- `carousel-json-contract` § **Phase 6 Correct-doc (answers locked)**
- `create-carousel-prompts-notes` · `carousel-prompt-trace`
- `content-factory-ui` § Settings Brand + **Персонажи** (half-width)
- `xyflow-agent-mesh` § Logs tab + RED perimeter
- `ai-bridge` · `content-pipeline-agents` · `backend` (useful-only sheet sync/schedule/status)
- Client: accept against **correct** flow; bake-off S54 folder compare **not** required for this wave; useful-smoke → **S56**

## Chain (answers locked)

```text
Trainer (this re-grade) → Architect (spec: full replace + Brand/Персонажи/Logs/Publicist/useful sheet; chain.md)
  → Frontend (Settings Brand after Design; Персонажи rename+half-width; Team agent Logs tab; RED perimeter on error)
  → AI Bridge (02/03/04 overlays STRICT correct; critic zod+05; vision≤2→needs_review; CTA/swipe keep)
  → Backend (useful gid sync; schedule→drafts; status machine; Publicist auto|manual; confirm useful tab visible first)
  → Tester → Fixer → Deployer (localhost) → Client (Playwright; correct pipeline acceptance)
```

## Gap → skill

Симптом «ответы есть, а 01–06 пустые / непонятно что писать» → этот card § Clarification + `gap-playbook` + Phase 6 answers-locked.
