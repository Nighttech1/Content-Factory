---
name: 21st-ui-catalog
description: >-
  PRIMARY UI source for Content Factory Frontend: autonomously search/pick/adapt
  prettier animated React components from 21st.dev instead of stock divs/shadcn
  defaults. Use on every visual Frontend task when MCP 21st is available.
---

# 21st.dev — главный источник UI (не сток)

## When

**Всегда**, когда роль Frontend строит или улучшает визуал Studio / Mesh / Inspector / Analytics / **Schedule** / Shell и MCP **`21st`** доступен.

Сток (голый Tailwind-блок, дефолтный shadcn, плоская карточка без motion) — **запрещён как первый выбор**.

## Policy: 21st-first

Порядок на **каждый** UI-элемент:

1. Уже есть **наш** адаптированный компонент в `components/`? → reuse.
2. Иначе MCP `21st` → `search` (запрос = роль элемента + `dark glass react framer-motion` / `animated`) → ранжируй → `get_component`.
3. Адаптируй под токены Content Factory (`content-factory-ui`).
4. Сохрани motion; при необходимости подгони spring `{ damping: 25, stiffness: 300 }`.
5. `decisions.md`: `21st id=… · element=… · motion=yes`.

**Не** спрашивать пользователя. **Не** звать `search_picker`.

## Prefer prettier + animated

При ранжировании **повышай** кандидатов с:

- framer-motion / motion / spring / stagger / hover lift / shared layout
- glassmorphism, soft border, depth (не flat gray box)
- micro-interactions на CTA, drawer slide, modal enter/exit
- polished empty/loading states (animated skeleton **только на первой пустой загрузке**; на refetch — stale-while-revalidate, см. `content-factory-ui` C-52)

**Понижай / отклоняй:**

- статичный «bootstrap» вид без анимации, если в выдаче есть animated аналог
- purple-gradient / cream-serif AI-slop
- Vue / Svelte / Angular
- тяжёлые зависимости без нужды

## Search query tips

Примеры запросов к `search`:

- `dark glass modal dialog framer-motion react`
- `animated command palette dark tailwind`
- `slide-over drawer glass dark react`
- `kpi stat card hover animation dark`
- `module card grid glassmorphism animated`
- `video player chrome dark minimal`
- `sidebar navigation dark luxury`
- `vertical menu accordion hover arrow dark react` — **C-57 MenuVertical** (user paste → `components/ui/menu-vertical.tsx`); **C-60:** без children-модулей Студии
- `resizable sidebar drag handle dark react` — **C-60** ширина aside
- `glow button dark react framer-motion` — **C-61 «Создать»** (ретокены Cobalt/Gold, не purple)
- `claude hide scrollbar chat transcript react` — **C-62** Razbor chat
- `carousel card left right image buttons dark` — **C-62** drafts cards
- `dark glass calendar schedule agenda framer-motion react` — **C-54 `/schedule`**
- `datetime day time picker dark glass react` — **публицист** (wave2: + чат рядом)
- `animated file tree dark react` — **C-59** `components/ui` + `ScheduleModuleRail`
- `vertical timeline slot picker dark react`
- `smooth carousel slide transition framer-motion dark react` — **устарело для slide switch** (wave3 = instant cut, без fade)
- `compact vertical reel card 9:16 dark glass` — **wave 2** карточки ×0.5
- `drag and drop calendar event dark react` — **wave 2** DnD модуль → ячейка `/schedule`
- `hover popup tooltip card dark glass react` — **wave 2** schedule hover
- `settings design tokens editor dark react` — **wave 2** Settings ← `DESIGN.md`
- `agent prompt rules editor textarea dark react` — **wave 2** Settings агенты / AgentPropertiesPanel
- `multi button send mic handoff expandable dark react` — **UX wave 3** → `components/ui/multi-button.tsx` (Razbor/Create chat footer: send / mic / «передать задание»)
- `dual column carousel feed side by side dark react` — **wave 3** Ours+Competitors один ряд desktop
- `compact multi button segmented control dark luxury react` — **UX wave 4** Mission Control / команда запуска (`CompactMultiButton`, не ряд workflow pills)
- `drag drop calendar event between days react` — **UX wave 4** schedule date↔date
- `hover card sticky tooltip portal dark react` — **UX wave 4** schedule popup stays on hover
- `premium analytics dashboard dark glass charts react` — **UX wave 4** `/analytics` Self-learning
- `file upload markdown button dark react` — **UX wave 4** Settings DESIGN.md upload
- `api key settings form masked input dark react` — **UX wave 4** LLM aggregator + Platforms CRUD
- `chatgpt-prompt-input` / `prompt box chat input dark react framer-motion` — **C-157** Razbor/Create agent composer → adapt as `PromptBox` (Dark Luxury; mic+send; replace `AgentChatComposer`)
- `ai input` / `AIInput shadcn chat composer dark` — **S47** Marketing Director → adapt user-provided / 21st **AIInput** → `components/ui/ai-input.tsx` (Century Gothic + Dark Luxury); ChatGPT-like projects + sink
- `thinking loading shimmer text dark react` + `9 cube grid assemble animation framer-motion` — **C-158** status рядом с PromptBox
- `button variants` / `shadcn button` / `segmented control button group dark react` — **C-carousel-*** Create top agent segment + «Передать задание» / «Нарисовать» (adapt `button.tsx`; map to Vernatun tokens, **не** dump `--hu-*` raw)
- `markdown chat message renderer dark react` — **C-carousel-*** transcript абзацы сценариста/дизайнера
- `carousel.tsx` / `embla carousel` / `embla-carousel-react dark glass` — **`C-settings-design-md-carousel`** Settings → Design: до 10 DESIGN.md слотов; slide = preview frame + DESIGN.md chip top-right; adapt Embla, не сток scroll-snap alone
- `image upload dropzone dark react` — Settings Design CTA **«Добавить новый дизайн»** (liked carousel image → Разборщик)

### Adapt пасты 21st (обязательно)

Много сниппетов 21st импортят `motion/react`. В Content Factory **переписать на `framer-motion`** (стек проекта). Не добавлять пакет `motion` ради paste. Кегль демо (`text-4xl`) подогнать под экран: сайдбар ≈ `text-sm`. Токены → Dark Luxury, не цвета демо.

Бери 3–5 результатов, выбери **одного** победителя сам. `/schedule` без 21st-календаря = сток, запрещён пока MCP жив.

## MCP tools

| Tool | Использовать? |
|------|----------------|
| `search` | **да** — основной |
| `get_component` | **да** — после выбора |
| `get_theme` / `get_inspiration` / `search_logo` | по необходимости |
| `search_picker` | **нет** |
| `generate` / `iterate_generation` | только если credits + Architect в chain; иначе хватит catalog |

## Adapt (обязательно)

1. Файлы → `components/` (или рядом с экраном).
2. Цвета → CSS vars (`--bg-canvas`, `--bg-card`, `--accent-blue`, `--accent-gold`, `--accent-terracotta`, borders glass).
3. Шрифты проекта + Noto Sans Armenian для hy.
4. Layout/композиция экрана — Stitch / DEV_PLAN, не чужой marketing layout целиком.
5. Не ломать RBAC, Generate Draft, Mesh OWNER-only.
6. `taste-skill`: без **purple** glow-slop и pill-clusters. **C-61:** 21st glow-button «Создать» — один акцентный glow Cobalt/Gold.

## Fallback

Если MCP недоступен (401, квота, timeout) → `luxury-web-craft` + `GlassCard` / `NeonBadge` / `ReactiveButton`. Отчёт: `21st=unavailable`. Не блокировать волну.

## Report

`🎨 **FRONTEND (+21st):** elements=[…] · picked=[ids] · motion kept · tokens adapted`
