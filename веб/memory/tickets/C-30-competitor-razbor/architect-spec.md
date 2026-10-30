# Architect spec — C-30

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

На competitor-карточках **carousel-engine** кнопка **«Разбор»** открывает модал: слева чаты агентов (Analyst → Scriptwriter cascade → Designer/Renderer), справа увеличенная карусель конкурента; финал — **наш** branded carousel в **Черновики** (unpublished), обновляется при правках.

## Depends

- **C-29** done or at least: grid + Drafts CTA stub + ≥21 fixtures with thumbs.

## In scope

### Competitor entry

1. На каждой competitor `FeedPostCard` (carousel-engine): кнопка **«Разбор»** (`data-testid="competitor-razbor-btn"`).
2. Click → открыть **RazborModal** (full-bleed / large dialog), context = selected competitor post id + mock slides.

### Modal layout

| Zone | Content |
|------|---------|
| **Right (≈45–50%)** | Enlarged competitor carousel: mock slides (reuse thumbs + 3–7 synthetic slide URLs from fixture/helper). Swipe/arrows OK. |
| **Left (≈50–55%)** | Stack of **agent chat panes**: Analyst, Scriptwriter, Designer (or Designer + Renderer). Tabs or vertical stack; GenerationDrawer-like step chrome acceptable visually, but **separate** from global Generate drawer. |

### Agent behaviour (mock pipeline)

1. **On open:** Analyst **auto-starts** (no user click):
   - Explains strong metrics (from `FeedPost.metrics` + canned algorithm copy).
   - Proposes a modified scenario for **our** carousel (deterministic template + topic/tags).
2. **User click in Scriptwriter pane** (primary CTA «Написать сценарий» / send):
   - Starts cascade: Scriptwriter → Designer → Renderer (last agent).
   - Timings: mock delays (300–800ms steps) OK; optional live LLM if key present — **not required**.
3. **Last agent** yields **our branded carousel** result:
   - Mock slide set with brand mark / logo placeholder (existing brand assets or `/placeholders` + picsum).
   - Result object persisted into **Drafts store**.

### Drafts store

1. **Primary:** zustand slice in `lib/studio-store.ts` **or** dedicated `lib/studio/carousel-drafts-store.ts` (prefer dedicated if store file already large).
2. Shape (minimum):

```ts
type CarouselDraft = {
  id: string;
  sourceCompetitorId: string;
  title: string;
  slides: { id: string; imageUrl: string; caption?: string }[];
  scenario?: string;
  status: "unpublished";
  updatedAt: string; // ISO
  createdAt: string;
};
```

3. **Черновики** panel (C-29 stub): list drafts; select → preview; edit caption/title → `updatedAt` + list refresh.
4. Optional Backend mock API (if FE needs SSR/smoke):
   - `POST /api/studio/carousel-engine/razbor` — body `{ competitorId }` → starts analysis payload
   - `POST /api/studio/carousel-engine/razbor/cascade` — body `{ competitorId, action: "script" }` → full cascade result + draft
   - `GET /api/studio/carousel-engine/drafts` — list (or client-only zustand for wave)
   - **Decision default:** zustand + in-memory helper module for messages; thin API optional for Tester smoke. Fix in decisions if Backend implements API.

### Backend mock agent pipeline

- `lib/studio/razbor-pipeline.ts` (or under `lib/studio/agents/`): pure functions returning Analyst messages, cascade steps, final slides — **no Prisma**, no Redis wipe.
- Deterministic seeds from `competitorId`.

## Out of scope

- CapCut route / reels competitor open → **C-31**.
- Live multi-agent LLM orchestration / LangGraph (unless key present as optional enhancement — must not block acceptance).
- Social publish / HITL approve to networks.
- Changing C-28 Generate drawer agent steps contract globally.
- DDL / migrate reset.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Mock pipeline + optional API | Backend | Deterministic messages + draft factory |
| Drafts store | Backend or Frontend | Prefer Backend defines types/helpers; FE owns zustand UI state — **one owner in chain: Backend types + FE store wire** |
| Razbor modal UI | Frontend | L chats + R carousel; Drafts panel real list |
| Motion | Motion | Modal enter, cascade step reveal, slide transitions |
| AI Bridge | Optional | Only if wiring real LLM prompts mid-flight |

## Contracts

### Open Razbor

| Input | competitor `FeedPost` id + moduleId=`carousel-engine` |
| Output | Modal open; Analyst messages auto-appended |

### Cascade trigger

| Trigger | User action in Scriptwriter pane |
| Effect | Ordered agent messages; final draft appended to Drafts |

### Drafts

| Rule | Value |
|------|-------|
| Publish | never auto; `status: "unpublished"` only |
| Edit | mutates draft in store; UI list updates |
| CapCut | never opened from Razbor / Drafts on carousel |

### Invariants

- Carousel competitor → **Разбор only** (not CapCut).
- Result always lands in Drafts, not in live «Ours» published feed.
- Mock LLM OK; no secrets in fixtures.

## Acceptance criteria (язык Клиента)

1. На конкуренте carousel-engine есть **«Разбор»**; клик открывает большое окно.
2. Справа — увеличенная карусель конкурента; слева — чаты агентов.
3. Analyst **сам** объясняет метрики и предлагает сценарий после открытия.
4. Клик/действие в Scriptwriter запускает цепочку; в конце появляется **наш** branded carousel.
5. Результат виден в **Черновики**; правки обновляют запись.
6. Guard: pipeline deterministic; drafts persist in session store. Safety: no DB wipe.

## Risks

- **Modal vs CapCut confusion:** copy and route must stay distinct; C-31 hard-gates CapCut.
- **GenerationDrawer collision:** Razbor must not toggle global `drawerOpen` / generate pipeline unless intentionally reused — prefer isolated UI state.
- **Scope creep real LLM:** mock-first; LLM behind feature flag / key check only.
- **Draft persistence:** session zustand OK for wave; localStorage optional — note in decisions if added.
- **C-29 stub rewrite:** replace empty Drafts panel with real list without changing CTA placement.

## Mid-flight escalation

Если Client требует server-persisted drafts (Postgres): стоп → Architect + `safe-db-migrations` (new ticket) — **не** sneak migrate в C-30. Если agent set must include Mesh nodes from `/admin/mesh`: out of scope → new ticket.
