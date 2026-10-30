# Razbor LIVE — Разборщик prompt / handoff (S48 → **S50 harden**)

**Wave:** live Haiku after «Начать разбор»; Boards uploads; insights → Scriptwriter.  
**S50:** trainer tasks must be **concrete** (numbered patches for Scriptwriter + Designer). Vague «улучши» / empty ack = **FAIL**. See `s50-prompt-hardening.md`.

## Models

| Agent | Default |
|-------|---------|
| Разборщик (Razbor step 1) | **Haiku 5.5** + thinking/reasoning ON |
| Scriptwriter (after handoff) | **Haiku 5.5** + thinking (same catalog as Create) |
| Designer | **`openai/gpt-5.4-image-2`** (gpt image 2.0) |

See `.cursor/skills/trainer/llm-model-catalog-notes.md`. Trainer does not edit `lib/`.

## System intent (Разборщик)

Ты — **Разборщик** чужого контента (конкурент **или** user Boards upload). После старта разбора:

1. **Hook (cover / 0–2с смысл)** — что цепляет; сила pattern-interrupt; слабости.
2. **Mid** — value beats / структура середины карусели или mid-video; что удерживает swipe.
3. **CTA** — явный/скрытый призыв; соответствие каталогу Vernatun CTA 1–4 где уместно.
4. **Virality brief** — 5–10 коротких bullets: почему может залететь / почему нет; метрики если даны.
5. **Trainer tasks (module-wide, S50 HARD)** — конкретные **numbered** задачи для:
   - **Scriptwriter** — минимум **2** (hooks wording, swipe meta, CTA 1–4, N slides, Vernatun tone);
   - **Designer** — минимум **2** (visual motifs, contrast, safe-zone, materials, steal/avoid).
   Каждая task = глагол + объект + критерий. Vague «улучши» / «сделай красивее» = **FAIL**.
   Задачи = actionable checklist для **модуля** (не только «скопируй этот пост»).

**Запрет:** silent mock; пустой «готово»; vague trainer tasks; reels-only script для carousel; секреты; выдуманные метрики как факт без данных.

## Handoff → Scriptwriter

Agent-start / handoff context **обязан** содержать:

| Field | Content |
|-------|---------|
| `source` | `competitor` \| `boards` (+ ids/urls) |
| `hook_mid_cta` | structured notes |
| `virality_brief` | bullets |
| `trainer_tasks_scriptwriter` | checklist |
| `trainer_tasks_designer` | checklist |
| `moduleId` | current studio module |

C-155: последующие **user** turns = raw composer only. Insights живут в handoff/system bundle, не в каждом user message.

## Boards

User uploads images in Razbor **Доски** MultiButton → same analyze. No competitor scrape required. Frontend preload still applies to preview slides.

## UI / Client

- Frontend: `content-factory-ui` § Razbor S48; no post title; white labels; handoff in input chrome.
- Client: **S48.D**.
- Pipeline: `content-pipeline-agents` § Razbor S48.
