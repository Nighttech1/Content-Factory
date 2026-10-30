---
name: backend
description: >-
  Backend and data reliability: API, SQLite/Postgres, isolation, zero-data-loss,
  read-only MCP. Use when acting as Backend or fixing API/data tickets, schema,
  sync, or storage.
---

# Backend (Data Reliability)

## Skill-first

1. Этот файл + [zero-data-loss.md](zero-data-loss.md)
2. Схема/DDL: `.cursor/skills/safe-db-migrations/SKILL.md`
3. Правило: `.cursor/rules/backend.mdc`
4. Схемы Python: `.cursor/skills/pydantic-v2/SKILL.md` при FastAPI/Pydantic
5. Запрос/ответ LLM (клиент API, премодерация, parse JSON) → `.cursor/skills/prompt-engineering/SKILL.md` (текст промпта правит AI Bridge)
6. Vector / ingest: `.cursor/skills/rag-stack/SKILL.md` → `pgvector-semantic-search` / `chroma-*` / `pinecone-*` / `llamaparse` + `plugins/backend/PLUGINS.md`
7. **Cortana entity index:** при тикетах Шага 8 ТЗ — hook upsert чанков сущностей на sync/save dump (AI Bridge пишет indexer; Backend — триггер/API безопасности). Читать `cortana-retrieval`. Не смешивать с dialog Chroma.

## Zero Data Loss

1. **Изоляция:** записи сущности — scoped id (workspace/tenant/project). Никаких глобальных перезаписей чужих данных.
2. **Премодерация:** прямая запись от LLM запрещена. Мутации ИИ — через подтверждённый executor + audit log (Undo).
3. **SQLite:** один пишущий процесс, WAL. MCP sqlite — только read-only.
4. **Миграции:** additive; DROP только после двухэтапного депрекейта — `safe-db-migrations`.
5. **Идемпотентность:** `actionId` (или эквивалент) на mutating-запросах.

Не трогай живые файлы БД пользователя без явной команды.

## MCP

- **sqlite:** `scripts/mcp/sqlite-readonly.mjs` — SELECT / PRAGMA / `integrity_check`. Писать через MCP запрещено.
- **postgres:** `scripts/mcp/postgres-gate.mjs` — read-only после URI в `.cursor/postgres.env`.

## Content Factory — UX wave 4 / 4b (данные C-79…C-81)

Когда chain включает Backend для Settings / Analytics / Platforms:

| Контур | Контракт |
|--------|----------|
| **Площадки (C-79)** | CRUD: `list/create/update/delete`. Entity: `id`, `label`, `kind` (`instagram`/`telegram`/`site`/…), `secretRef` или encrypted blob. List/GET **никогда** не возвращают raw key — только `secretMasked`. Wire `platformId` на schedule slot + publisher. Local repository OK если Prisma ещё нет |
| **LLM aggregator (C-81)** | Persist `baseUrl` + key (encrypted/local). Endpoint **models catalog**: proxy `GET {baseUrl}/v1/models` (Bearer key) → нормализовать `{ id, label }[]`; fallback = expandable local list. **Запрет:** `LlmModelId` union только из 4 стоков как единственный источник |
| **Polza AI audit (C-145)** | Канон env: `AGGREGATOR_BASE_URL=https://polza.ai/api/v1` + `AGGREGATOR_API_KEY` (см. `docs/ENV_AGGREGATOR.md`, smoke `scripts/smoke-polza-connection.ts`). **Аудит:** все пути content generation (Razbor / Create / agent chat / drafts) используют `lib/llm/aggregator` (или единый server proxy) — не параллельный mock LLM. Settings UI LLM **снят** (C-145) → Team model pick + env. Вердикт: connected / partial / not wired + file evidence |
| **Live agent chat (C-155)** | Server proxy для Scriptwriter / Designer / Publisher: body → Polza chat. **Wire:** `system` = mesh agent `systemPrompt` only; last `user` = raw client message only. **Не** серверно дописывать User brief / topic в user role. Model params из agent `modelConfig`. Soft-fail без key → явная ошибка UI, не silent mock «успех» |
| **S49 no User brief** | Team User basic brief **удалён**. Proxy / generate / agent-start **игнорируют** legacy persist keys brief — **никогда** не inject как task. Followers на competitors: map `account.followers` / scraper field → FE plaque `name \| Nк` |
| **S50 live competitors** | Feed **Конкуренты** при ожидаемом live — **реальные** scraper posts (`sourceMode: "live"`), не silent mock merge as success. Boards CRUD (list/create/rename) if FE dropdown needs API — Architect lock. Generation proxies stay live (no fake Scriptwriter/Designer/Razbor success) |
| **S51→S52 Scout-only Apify** | См. § **Apify cost / Scout-only** + `apify-scraper-cost-discipline.md`. Apify **только** Scout: manual **«Разведать»** или **auto-scout schedule**. `GET` feed / Competitors open = **last Scout snapshot**, **0** Apify. Запрет scrape на bootstrap/remount/focus/SWR. Estimate monthly in ticket notes (**no secrets**) |
| **Create carousel handoff (C-carousel-*)** | Create path: Scriptwriter + Designer live (no Publisher agent). **Agent-start** endpoint/body: request+context+rules+skills+plugins+MCP summary (no secrets). Designer **draw** uses last agreed description + `CAROUSEL_API_KEY` / aggregator per Architect. **Publish step:** API создаёт/обновляет draft Ours + schedule slot — без LLM Publisher. Soft-fail → явная ошибка, не mock success |
| **Schedule** | Slot update day↔day (уже 4a); optional `platformId` on slot (C-79) |
| **Analytics types (C-80)** | Создать/зеркалить `types/analytics.ts`: Scout / Outliers / Retention / RL / Telemetry + RU `title`/`description`. Mock aggregates OK; RL proposals — audit, не silent prompt overwrite |
| **DESIGN.md upload (C-81)** | Accept markdown body from client (`writeDesignMdOverride` / API); не логировать весь файл в tickets |
| **Agent skill/plugin files (C-148)** | Accept upload `.md` / `.plugin` for Team inspector; store server-side path/ref; list returns **filename** only; never echo file secrets |
| **Carousel generate API prep (C-153)** | Первый ключ генерации каруселей: env **имя** `CAROUSEL_API_KEY` (+ опц. `CAROUSEL_API_BASE_URL`). Значение **только** в `.env` / ОС. Soft-fail без ключа → mock generate. Документ prep: `docs/ENV_CAROUSEL.md` (имена + куда вставить; **без** реальных ключей). Не путать с `IG_SCRAPER_API_KEY` / `AGGREGATOR_API_KEY` |
| **Sprint 9 fixtures / contracts ONLY** | Backend scope = **golden fixtures** (9.2 carousel, 9.3 reels) + **STRICT zod/JSON validation** (9.7: parse fail = fail job, не soft-mock). **Не** rewrite pipeline workers as new architecture. **Не** social publish. **Не** UI shell. Other modules → Sprint 23. See § Sprint 9 below |

Data-safety: не `migrate reset`; не писать LLM/platform secrets в skills/memory.

## Sprint 9 — fixtures + STRICT contracts (fixtures/contracts only)

`DEV_PLAN` **9.2 / 9.3 / 9.7**. AI Bridge owns prompts; Backend owns **fixtures + validation**.

| Lock | Правило |
|------|---------|
| **UPGRADE ONLY** | Extend existing validators / fixture folders — no new parallel generate stack |
| **NO PIPELINE BREAK** | Keep job paths feeding Razbor→Scriptwriter→Designer→Draft / reels render |
| **Golden carousel (9.2)** | 3–5 club fixtures: Dramaturgy JSON + sliced 4:5 refs + «что хорошо» notes (dark_notes / bento_glass / dark_editorial class) |
| **Golden reels (9.3)** | 2–3 viral scripts (IG + YT Shorts): hook 0–2s, beats, CTA, VO — **not** carousel JSON |
| **STRICT (9.7)** | Invalid parse → **fail job** (HTTP/job error). Soft-mock success on bad JSON = **FAIL** for this sprint |
| **Out** | Apify volume work (Sprint 10); Postgres SoT (Sprint 8 done); publish workers (Sprint 22) |

## Live Instagram scraper (Apify) → Studio «Конкуренты»

Волна **W-2026-10-09-ig-scraper-live** (тикеты волны в `memory/waves/…`; **не путать** с UX-8 C-107…C-110 mesh/schedule — Архитектор назначает **новые** id, напр. C-114+).

**Цель:** колонка **Конкуренты** для `carousel-engine` + `custom-reels` = ~50 **публичных** постов ниши (hashtag), не демо-фикстуры, когда scraper env задан.

### Env (только имена; значения в `.env`)

| Key | Role |
|-----|------|
| `IG_SCRAPER_API_KEY` | Bearer к Apify (или совместимому scraper API). **Не** Meta Graph token. Никогда в skills/logs/memory |
| `IG_SCRAPER_BASE_URL` | Опционально; иначе default Apify actor URL из кода |
| Graph keys (`IG_USER_ID`, `INSTAGRAM_ACCESS_TOKEN` / aliases) | По-прежнему для **Ours** / legacy Graph path; scraper = **competitors** path |

Probe без печати секрета: `scripts/probe-ig-scraper.ts` (логирует только `KEY_OK len/prefix`, status, sample field names).

### Контракт Backend

1. **Client:** server-only fetch к Instagram Scraper actor (Apify `run-sync-get-dataset-items` или эквивалент через `IG_SCRAPER_BASE_URL`). `resultsLimit` ≈ **50**; `searchType: hashtag`; topic → hashtag как в C-38 mapper / `IG_DEFAULT_HASHTAGS`.
2. **Map → `FeedPost`:** `source: "competitor"`, `sourceMode: "live"`, metrics из `likesCount` / `commentsCount` / `videoViewCount|videoPlayCount`, `username`, **`account.followers` / followersCount** (для S49 plaque `name | Nк`), `permalink`/`url`, `thumbUrl`/`displayUrl`, `slideUrls` из `childPosts`/`images` когда есть.
3. **Split by module media:**
   - `carousel-engine` → оставлять **CAROUSEL** / Sidecar / multi-image (`type`/`productType` / `childPosts.length > 1`); map `mediaType: "CAROUSEL_ALBUM"`.
   - `custom-reels` → оставлять **REEL** / VIDEO / Clips; map `mediaType: "VIDEO"` (или reel alias).
   - IMAGE-only без carousel children — не в carousel competitors; не в reels.
4. **Sort:** popularity desc = `likes + comments + (views|plays || 0)`.
5. **Wire — Scout snapshot (S52 HARD, supersedes scrape-on-feed-GET):**
   - `GET /api/studio/[moduleId]/feed` (competitors) → **last Scout snapshot only**. **Never** call Apify on feed GET / Competitors open / focus / remount / SWR.
   - Paid Apify **only** via Scout run entrypoint: manual **«Разведать»** **or** scheduled auto-scout (same path). Run applies **filters** (virality / likes / views / …) → persist snapshot → feed reads it.
   - Successful Scout run → competitors list with `sourceMode: "live"` (or equivalent snapshot flag). Soft-fail (нет ключа / 4xx/5xx / empty) → keep prior snapshot or fixtures `sourceMode: "mock"`, **без 500**.
6. **Запрет:** логировать/возвращать raw `IG_SCRAPER_API_KEY`; HTML scrape Instagram в браузере; писать ключ в tickets/skills; Apify as side-effect of opening Competitors.

### Soft-fail

Нет `IG_SCRAPER_API_KEY` или пустой dataset → прежнее поведение mock / empty competitors; **не** ретраить Apify из feed. UI читает `FeedResponse.sourceMode`.

### Apify cost / Scout-only (**S51 → S52 HARD**)

Симптом: Apify burned $ при «открыл Конкуренты» / remount → feed path всё ещё платил CU.

| Правило | Деталь |
|---------|--------|
| **Scout-only paid path** | Apify **только** Scout manual «Разведать» **или** auto-scout schedule |
| **Feed = snapshot** | Competitors GET = last snapshot; **0** Apify CU |
| **Filters + schedule** | Scout settings: min likes/views/virality/… + frequency → Backend Scout job |
| **Dedup in-flight** | Concurrent identical Scout runs share one promise |
| **resultsLimit** | Keep **≤50**; carousel vs reels from **same** raw when topic identical |
| **Daily budget intent** | **≤1–2** paid Scout runs/day/module when schedule disciplined — **not** per navigation |
| **Estimate (ticket)** | Monthly $ range in guards notes — **no API keys** |
| **Запрет** | Scrape on feed GET; bootstrap/remount/focus spam; AI Bridge scraper; logging keys |

Полный чеклист: `.cursor/skills/backend/apify-scraper-cost-discipline.md`.

## Sprint 8 — Postgres SoT (Draft / Board / ScheduleSlot / DesignSlot)

`DEV_PLAN` **8.1–8.5** (+ поддержка **8.6** import). Skills: `prisma-content-schema` + `safe-db-migrations`. **UI shell freeze** — Backend не трогает AppShell/nav.

| Step | Deliverable |
|------|-------------|
| **8.1** | Additive Prisma models + migration (no wipe / no reset). См. `prisma-content-schema` § Sprint 8 |
| **8.2** | API CRUD **Drafts** — Create/Razbor пишут сервер; GET list/by id scoped `userId`. Zustand на клиенте = **кэш**, не SoT |
| **8.3** | API **Boards** + upload media → storage paths/URLs; refresh/other browser = same data |
| **8.4** | API **ScheduleSlot** ↔ `ContentJob`/`Draft`. HITL approve → **`draft` / `scheduled` queue only**. **Запрет** social publish / Meta push в этой волне |
| **8.5** | API **DesignSlot** library ≤10; active slot → server `design-active` / draw path (довести CRUD; уйти от sole `data/local/design-active.json` + browser library as SoT) |
| **8.6** | `POST` (или one-shot) **import** body from legacy localStorage keys → upsert; idempotent; after success FE clears/migrates flag |

### Legacy localStorage keys (import map — Architect locks exact shapes)

| Key / store | → Model |
|-------------|---------|
| `cf.carousel.drafts.v1` | Draft |
| `cf.studio.boards.v1` | Board |
| `cf.schedule.v1` (slot data, не popup UI chrome) | ScheduleSlot |
| `cf.settings.design.library.v1` + `cf.settings.design.activeId` | DesignSlot |

**Не** импортировать в Sprint 8 как SoT: `cf.sidebar.width`, `cf.schedule.popup.pos`, `cf.schedule.rail.width`, mesh agents, marketing projects, feed TTL cache.

### Hard bans

- `prisma migrate reset` / DROP shared data / wipe Redis / wipe `generatedMedia`
- Social network publish endpoints
- Returning other user's drafts/boards/slots
- Logging secrets / dumping full DESIGN.md into tickets

## Phase 6 Correct — sheet sync / schedule / status (HARD · answers locked)

Canon: `plugins/trainer/carousel-correct-pipeline.md` + `carousel-json-contract` Phase 6.

| Contour | Contract |
|---------|----------|
| **Preflight** | **Confirm Google Sheet visibility** (read headers + sample row) **before** any localhost fill / sync tests. Sheet: `https://docs.google.com/spreadsheets/d/1kOJ1CjMK5rNldM1IGNLdiVXqHTMeCuG35yP6_w6Y5Ls` — themes + flags + `hero`. Secrets only in `.env` |
| **Useful-only (HARD)** | Product intake reads **only** tab **«Полезные карусели»** gid=`902078005`. **Do not** poll / sync meetings tab. Meeting topics → user inserts into useful (СТА=3) later |
| **Entry** | Useful sheet row (`status=new`) **supplements** Create-chat — not a silent replacement |
| **Smoke rows** | **LEGACY** 51/1/17 — **S57:** DELETE `docs/карусель тест/smoke-useful-51-1-17/` → **ONE** new 4-slide layered set |
| **Schedule → drafts** | Auto-gen on schedule writes **Drafts**; user sets **publish time** (Publicist auto\|manual) |
| **Status machine** | `new` → (`needs_input` \| critic) → `ready`; map to Drafts vocabulary |
| **Critic** | Deterministic **code critic** rules (**05**) **supplement** existing zod **STRICT** — fail → Scriptwriter retry ≤2 |
| **Vision gate** | **OFF under S57** (was ≤2 then `needs_review`) |
| **hero** | empty ⇒ no character; else character **number** → Settings **Персонажи** cut-outs **OVER** bg |
| **Publicist** | Auto schedule from settings **OR** manual time — wire slots; no silent social publish |
| **Out of Backend** | Prompt text = AI Bridge; Settings Brand/Персонажи/Logs UI = Frontend |

## Phase 7 LAYERED HTML — Puppeteer composite (HARD · S57 · product)

Canon: `plugins/trainer/carousel-layered-html-pipeline.md` + `carousel-json-contract` Phase 7.

| Contour | Contract |
|---------|----------|
| **Single renderMode** | `layered_html` only — **deprecate** product success via `correct_pipeline` / type-on-PNG |
| **Image path** | Scene/bg only; **code + prompt** reject/strip letters, logos, watermarks on bg |
| **Composite** | Localhost **Puppeteer** HTML/CSS overlay → final PNG **1080×1350** |
| **HTML layer** | Typography; Brand name+logo; CTA catalog **1–4** button on `cta_slide`; 3 fonts from DESIGN.md (download if missing — FE may help) |
| **Characters** | Cut-out conductors **over** bg; split-across-slides optional rare |
| **Vision** | Disabled |
| **Smoke** | User DELETE old useful-smoke folder; write ONE 4-slide + MD traces |
| **Out of Backend** | Prompt overlays = AI Bridge; chrome = Frontend only if fonts wire needed |

## Порядок

1. `chain.md` — только свои paths.
2. Инспекция MCP sqlite/postgres read-only (если есть).
3. Код API / store / миграции.
4. Не переписывай UI. Текст промптов — AI Bridge + `prompt-engineering`; ты только транспорт/схема/хранилище.

`🔌 **BACKEND:** [эндпоинты/хранилище; риски для данных]`
