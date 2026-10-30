# Architect spec — C-129 (mesh handoff labels polish)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + `chain.md`.  
> **No product code from Architect.**  
> Skill: `xyflow-agent-mesh` § **C-129 HARD**.  
> Тренер: `memory/trainer/2026-10-10-mesh-labels-gap-grade.md`.

## Goal

На `/admin/mesh` @1440 handoff-подписи читаемы и **не наезжают** на ноды/линии. Произвольный `%along` / `labelY` offset **не** считается закрытием тикета.

## Decision locks

### D1 — Never intersect (HARD)

| Lock | Decision |
|------|----------|
| **D1** | Bounding box **каждого** видимого edge-label **НИКОГДА** не пересекает bounding box **любой** ноды @**1440**. Acceptance = Playwright (или эквивалент Tester): measure label boxes + node boxes → **intersection count = 0**. Snapshot-only / «сдвинул на глаз» → **не закрыто**. Также labels не должны перекрывать друг друга так, что текст нечитаем. |

### D2 — Label strategy (**ЗАФИКСИРОВАНО — gutter + hide dashed**)

| Lock | Decision |
|------|----------|
| **D2** | **Единственная стратегия волны (не выбирать альтернативу без mid-flight Architect):** |

**Канон D2 (рекомендация Архитектора — принята):**

1. **Solid Lane A / Lane B** (User→…, Scout→Аналитик→Тренер и прочие сплошные handoff):  
   - Короткие **RU** labels — **макс 2–3 слова** (см. словарь ниже).  
   - Размещение в **gutter над или под** ребром, **вне** полосы node boxes.  
   - Clearance: **≥8px** от ближайшего node bounding box до label box.  
   - Не через центр ноды; `labelShowBg` не раздувать до overlap.

2. **Dashed Trainer → release (B→A):**  
   - **Скрыть mid-edge labels** полностью (не рисовать текст на веере пунктира).  
   - Handoff meaning: `title` / `aria-label` на edge (или единый невидимый a11y) — например «skill patches / обновления rules».  
   - Tooltip на hover edge — OK. Один общий gutter-label зоны B (не на каждой dashed стрелке) — **допустимо**, если не пересекает nodes; предпочтение — **без** mid-clutter на dashed.

**Альтернатива (легенда под схемой):** **запрещена** в этой волне, пока D2 gutter+hide не доказан красным Playwright. Если FE упрётся в невозможность gutter @1440 — **стоп → Архитектор** (не самовольно легенда).

#### Словарь short RU (пример → канон ≤3 слова)

| Ребро | Было / смысл C-107 | Short RU (D2) |
|-------|--------------------|---------------|
| Scout → Аналитик | отфильтрованные посты | `посты` / `фильтр постов` |
| Аналитик → Тренер | выводы / conclusions | `выводы` |
| Тренер → *(dashed)* | skill patches / rules | **нет mid-label**; title: `skill patches` |
| User → Сценарист / Разборщик | запрос | `запрос` |
| Разборщик → Сценарист | разбор | `разбор` |
| Script → Designer | brief / script | `brief` / `сценарий` |
| Designer → Publisher | готовые слайды / медиа | `слайды` / `медиа` |

Frontend может уточнить формулировку, но **длина ≤3 слова** и смысл C-107 обязательны.

### D3 — Не ломать Vernatun mesh

| Lock | Decision |
|------|----------|
| **D3** | Сохранить без регрессии: **dual-lane** C-124/C-125 (User lane A + Scout→Analyst→Trainer B + dashed B→A); **panel click** → `AgentPropertiesPanel`; **barbell** на Тренере; **no MiniMap** / no free-canvas chrome; static pipeline picture; nodesDraggable=false; 0 **node↔node** overlap. C-129 трогает **только** label placement / visibility / short copy — не пересобирать layout lanes «с нуля» без Architect. |

### D4 — Handoff meaning (C-107)

| Lock | Decision |
|------|----------|
| **D4** | Смысл передачи артефакта **сохраняется** для каждого ребра: либо **видимый короткий label** (solid), либо **`title` / `aria-label`** (обязательно для dashed без mid-label). Запрет: пустые рёбра без смысла; labels «json» / «JSON» / «payload» / «data». |

## In scope

- `components/mesh/edges/PulseEdge.tsx` — gutter offsets, hide label on dashed, title/aria
- `lib/mesh-seed.ts` — short RU label strings; dashed edges без label text (или `label: null` + `ariaLabel`)
- `components/mesh/AgentMeshCanvas.tsx` — только если нужно для label render / data attrs Playwright
- Tester guard: Playwright bbox labels↔nodes @1440
- Motion: calm label appear; reduced-motion = static; **не** считать offset-анимацию закрытием

## Out of scope

- Переделка dual-lane topology / seed positions lanes (кроме минимального gutter space если D1 красный → mid-flight Architect)
- Legend-under-diagram (альтернатива D2 — только после эскалации)
- MiniMap / Controls / free canvas
- Backend / AI Bridge
- Analytics / Schedule / Studio

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Short RU + gutter / hide dashed | **Frontend** | `xyflow-agent-mesh` C-129 HARD |
| Label motion / edge title hover | **Motion** | после FE; offset ≠ done |
| Bbox assert @1440 | **Tester** | guard + S33 step |
| Localhost | **Deployer** | после зелёного |
| Приёмка | **Client** | S33 + C-129 bbox HARD |

## Acceptance (язык Клиента)

1. Playwright @1440: navigate `/admin/mesh` → measure → **0** label∩node intersections.
2. Solid edges: короткие RU в gutter, clear ≥8px от node box.
3. Dashed Trainer→release: **нет** mid-edge text-каши; meaning через title/aria.
4. S33: dual-lane / Scout / Trainer barbell / panel / no MiniMap — без регрессии.
5. Произвольный %/px без bbox assert → **НЕ ПРИНЯТО**.

## Risks

- Слишком длинные legacy labels в seed — обрезать до 2–3 слов, не сжимать font до нечитаемости.
- Gutter может требовать +Y gap между lanes — если трогает node positions → **mid-flight Architect** (D3).
- Не вернуть mid-labels на все dashed «для полноты C-107» — C-107 + D4 = title/aria OK.

## Mid-flight escalation

Стоп → Архитектор → правка D2 (легенда) или минимальный lane gap; обновить этот файл + `chain.md` до кода.
