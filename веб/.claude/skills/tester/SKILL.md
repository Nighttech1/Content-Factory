---
name: tester
description: >-
  Tester: product-contract tests, C-* guards, data retention, isolation,
  anti-slop and Lighthouse for sites. Use when acting as Тестировщик or
  closing Client tickets with a permanent guard.
---

# Тестировщик

## Skill-first

1. Этот файл (+ guards playbook, если есть в тикете)
2. Сайты: `web-perf-motion`, `plugins/frontend/anti_slop_scan.py`
3. MCP sqlite — только SELECT/PRAGMA, если в проекте есть БД
4. Контракт ИИ (промпт → ответ → parse) → `.claude/skills/prompt-engineering/SKILL.md`
5. **Cortana retrieval** → [cortana-retrieval-guards.md](cortana-retrieval-guards.md) + `cortana-retrieval` skill

## Guard на каждый `C-*`

Закрытие только если есть все три:

1. исполняемый тест/проверка (класс дефекта, не один пример);
2. `memory/tickets/C-…/guards.md`;
3. строка в `.claude/skills/client-review/regression-guards.md`.

Без трёх — **не done**. Не ослабляй assertions.

## Что проверять

- Сценарий продукта, не хрупкий полный snapshot.
- Данные не теряются и не смешиваются между сущностями.
- Контракт ИИ/API валиден, если зона затронута: формат вывода, «unknown»/отказ, injection-границы — по `prompt-engineering`.
- **Retrieval Cortana:** R1–R8 из `cortana-retrieval-guards.md` (multi-entity, sufficiency, один vector-раунд, anti-hallucination, HITL).
- Соседние регрессии затронутых модулей, не только новый файл.
- UI-волна: anti-slop + Lighthouse LCP/CLS.
- **C-57:** Launchpad без «Ничего не выбрано» / «1 выбран»; сайдбар MenuVertical `text-sm`, не `text-4xl`.
- **C-60:** нет dropdown модулей Студии; drag-resize aside; persist `cf.sidebar.width`.
- **C-58 mesh:** нет `mesh-add-module`; ReactFlow `nodesDraggable={false}`; нет пользовательского `onConnect`.
- **C-58/C-61 feed:** шапка не `"…"` при refetch; title/count **без** opacity pulse; search handler `useCallback`.
- **C-59 / C-157:** mic только через PromptBox / MultiButton (не второй SpeechRecognition); Designer Razbor gated `carousel-engine`.
- **C-155 / S49:** live chat payload — user raw only; system = mesh systemPrompt; guard: **нет** brief substring в user / agent-start / generate (поле brief удалено; ghost persist тоже).
- **S49 feed/Boards/Design:** Competitors plaque contains `|` + followers; Ours no plaque; Published/Drafts toggle+search same row; labels white; Boards «Загрузить» + no helper + no board metrics; Settings brandbook visual cards; Client **S49** HARD в guards.
- **S50 CRITICAL:** guards assert — no thick bottom clipping cards; Design cards aspect **3:5**; no DESIGN.md crumbs / slots counter / colors helper; Design toolbar one row; no card context menu; no «(4:5)» in title; no orange dots; Boards dropdown + no «1»; sort+filter left of search both columns; Create start Scriptwriter + preview ≈1.5×; live competitors not mock; Client **S50** HARD в guards.
- **S51 HARD:** Design actions top-right; **no** preview DESIGN.md btn; eye label «код дизайн мд»; card empty-bottom shrunk; active blue neon perimeter; no edit/context popup; Boards dropdown from «Доски» segment only; dblclick rename; segment label = selected board; Upload icon always (disabled in Competitors); no toolbar jump; Apify: cache HIT path + no scraper on bootstrap (Backend guards / smoke counters).
- **S52.D Scout-only Apify:** feed GET / Competitors open → **0** Apify POSTs (smoke counter); Apify only after Scout «Разведать» or schedule job; snapshot SoT; AI Bridge no-scraper; guards for C-scout-* tickets.
- **C-156:** carousel drafts persist after reload (legacy zustand key **или** API SoT after Sprint 8).
- **Sprint 8.7 Postgres SoT guards (HARD):**
  1. Create draft / board item / schedule slot / design slot via UI or API → **hard refresh (F5)** → data still present (from server, not only localStorage).
  2. **Cross-profile isolation:** user A data **not** visible to user B (second session / scoped `userId`); list empty or 403 — no leak.
  3. After one-shot import (8.6): legacy keys migrated; second import idempotent (no dup storms).
  4. Schedule HITL path ends in **draft/scheduled** — **no** social publish side-effect.
  5. Design library ≤10 enforced; active slot survives refresh and feeds draw/`design-active`.
  6. Guards in `memory/tickets/…/guards.md` + smoke script; **не** принимать «в API есть» без refresh proof.
  7. Shell freeze: no AppShell/nav chrome churn in the wave diff.
- **Sprint 9.9–9.10 Carousel+Reels quality guards (HARD):**
  1. **Smoke 9.9 carousel:** competitor/Razbor → Scriptwriter → Designer → Draft on localhost (Playwright @1440 + clicks). Pipeline steps still present — **no** skipped agent / broken handoff.
  2. **Smoke 9.9 reels:** `custom-reels` Scriptwriter → draft/render path; artifact has hook 0–2s + beats + CTA; **not** carousel Dramaturgy JSON.
  3. **STRICT JSON:** invalid carousel/reels parse → job **fails** (not soft-mock success).
  4. **Scorecard 9.10:** document in `memory/` — % STRICT pass; HITL reject rate; golden likeness (manual); reels hook/beats/CTA presence; threshold for autonomy/Sprint 22.
  5. **S44–S46 HARD** still green (sliced preview, captivating hook, swipe meta, CTA 1–4).
  6. **No social publish** side-effect in wave diff.
  7. **upgrade_only / no_pipeline_break:** diff must not remove Razbor→Scriptwriter→Designer→Draft flow or Create handoff chrome.
- **S57 LAYERED HTML guards (HARD):**
  1. Product `renderMode` = layered HTML (bg + Puppeteer) — **not** type-on-PNG / `correct_pipeline` as ship.
  2. Bg assets: no letters/logos (sample assert or trace ban present); logo only HTML Brand.
  3. Vision text-check disabled; CTA 1–4 is HTML on cta slide; swipe meta not painted.
  4. Canvas finals **1080×1350**; smoke folder = ONE 4-slide (old 51/1/17 set gone).
  5. Guards in `memory/tickets/…/guards.md`; Client **S57** Playwright — «в API есть» ≠ PASS.
- **HIGVEN-3 practice guards (wave 2026-10-18-pipeline-practice-higven-3):**
  1. **N=3** finals (`slide_01…03`) under `docs/карусель тест/pipeline-practice-higven-3/`.
  2. Active Design pack = **01 HIGVEN**; other etalon presets cleared (02 inactive library OK).
  3. Job/meta: `characterPaint=none` (no girl / cutout).
  4. Brand logo = **full** Vernatun PNG path (not emblem-only + HTML wordmark invent).
  5. Designer artifact has **parallel** fields: `image_prompt`×3 + `html_layout`×3 present.
  6. Art Director = remarks\|approve only — **0** auto-remake jobs.
  7. Attempt counter ≤**3**; STOP documented if visual FAIL after 3rd.
- **C-158:** thinking UI exposes 9-cube + Thinking shimmer testids / a11y text while pending.
- **C-62:** сценарист CTA → дизайнер (не публицист); нижний CTA дизайнера → publisher; scrollbar чата скрыт; Наши disabled до draft; drafts cards = published size + L/R + дата.

Моки сети/LLM в unit-тестах. Live — только явный маркер.

`🧪 **ТЕСТИРОВЩИК:** [тесты; anti-slop; LCP/CLS; guards: путь]`
