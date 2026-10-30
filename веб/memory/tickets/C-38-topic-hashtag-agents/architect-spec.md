# Architect spec — C-38

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Researcher-пакет (agents + workers + skill) умеет из **темы** (RU/EN, в т.ч. пустой) выдавать **детерминированный** JSON-контракт Instagram hashtags для поиска топовых каруселей. Ручной список конкурентов больше не primary. Без HTML scrape. Fetch Graph API — **C-39**.

## Depends

- Wave W-2026-09-20-live-ig-carousels (C-35/C-36 live/mock rules) — принято с замечаниями.
- Downstream: **C-39** (Backend hashtag feed), **C-40** (UI).

## In scope

### 1. Topic → hashtags contract (shared)

Документировать и закрепить в Researcher-пакете единый контракт, который Backend (C-39) реализует **детерминированным** util без LLM-ключа:

```json
{
  "topic": "гостевой вечер",
  "hashtags": ["guestnight", "armenianclub", "yerevan"],
  "source": "deterministic_mapper",
  "emptyTopic": false
}
```

| Field | Rule |
|-------|------|
| `topic` | Строка как на входе (trim); пустая → `""` |
| `hashtags` | 1–5 lowercase, без `#`, без пробелов; **max 3** используются в Graph-запросе (C-39 rate limit) — mapper может вернуть до 5, Backend берёт первые 3 |
| `source` | Для C-38/C-39: всегда `"deterministic_mapper"` (LLM `"llm_mapper"` — future, out of scope) |
| `emptyTopic` | `true` если topic после trim пустой |

### 2. Empty topic → niche defaults

Если тема пустая:

1. Prefer env `IG_DEFAULT_HASHTAGS` (comma-separated, bare names).
2. Else hardcoded niche defaults (document identically in agent pack + Backend):

   `armenianclub`, `yerevan`, `armenianfood`, `guestnight`

Researcher **не** просит пользователя вводить competitor usernames/URLs.

### 3. Deprecate manual competitor list as primary

| Env | New role |
|-----|----------|
| `IG_COMPETITOR_USERNAMES` | **Optional fallback only** (Business Discovery). Не primary discovery. |
| Competitor discovery primary | Hashtag `top_media` by topic-derived hashtags (C-39) |

Обновить тексты:

- `agents/researcher.md` — Base prompt + Handle config table + Output
- `workers/researcher/SKILL.md` (+ VERSION bump note if pack uses versions)
- `.cursor/skills/content-pipeline-agents/SKILL.md` — заменить «Business Discovery only» на Hashtag Search + top_media primary; BD = fallback

### 4. Live / mock rules (inherit C-35)

- Live posts: факты из входа; не выдумывать permalink/metrics.
- **Запрещён** HTML scrape / unofficial IG parsers.
- Tokens never in prompts / feedbackLogs.
- Soft-fail → mock — нормально; Researcher не «добывает» посты сам.

### 5. Deterministic mapper semantics (document for Backend parity)

Mapper rules (must match C-39 util 1:1):

1. Normalize topic: trim, lowercase, collapse spaces.
2. Empty → defaults (§2).
3. Non-empty: keyword/alias table (RU/EN → hashtag tokens), e.g. «гостевой» / `guest night` → `guestnight`; «еда» / `food` → `armenianfood`; unknown topic → slugify alphanumeric + always append 1–2 niche anchors (`armenianclub`, `yerevan`) so results stay on-niche.
4. Deduplicate; stable order; cap list length.

Exact alias table lives in Backend util (C-39); C-38 documents the **contract + empty defaults + deprecation** so AI Bridge can ship without implementing Graph fetch.

## Out of scope

- Graph API calls / `ig-live-feed` changes → **C-39**.
- Studio UI topic refetch / copy → **C-40**.
- LLM-based hashtag expansion (optional later).
- Changing Analyst / Hook Writer / other agents beyond cross-refs.
- DDL, Redis wipe, social publish.

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Researcher pack + skill | **AI Bridge** | Contract, prompts, deprecation docs |
| Deterministic util + Graph | Backend (C-39) | Same contract; AI Bridge does not ship TS util in C-38 unless shared doc-only |
| UI | Frontend (C-40) | — |

## Contracts

### Input (Researcher / mapper)

| Field | Type | Notes |
|-------|------|-------|
| `topic` | string | May be empty |
| Optional live feed context | as C-35 | unchanged |

### Output (additive to existing Researcher JSON)

Existing fields (`trends`, `audience`, `sources`, `briefForHookWriter`, optional live) **remain**.

**New required field for carousel researcher path:**

```json
{
  "instagramHashtags": {
    "topic": "",
    "hashtags": ["armenianclub", "yerevan", "armenianfood", "guestnight"],
    "source": "deterministic_mapper",
    "emptyTopic": true
  }
}
```

### Invariants

1. Primary competitor discovery = hashtags, not `IG_COMPETITOR_USERNAMES`.
2. No scrape language anywhere in pack.
3. Empty topic always yields documented niche defaults (env override allowed).
4. Secrets never interpolated.

## Acceptance criteria (язык Клиента)

1. Researcher / skill явно говорит: конкуренты ищутся по **хэштегам темы**, а не по ручному списку ников.
2. Пустая тема → список дефолтных нишевых хэштегов (как в §2).
3. В Output есть `instagramHashtags` с полями контракта.
4. `IG_COMPETITOR_USERNAMES` описан только как optional fallback.
5. Нет инструкций scrape HTML Instagram.
6. Guard (Tester): diff pack + skill; smoke doc/contract check — без Graph call.

## Risks

- **Contract drift C-38 vs C-39:** Backend must copy documented defaults/alias intent; lock shared field names in decisions.
- **LLM temptation:** C-38 must ship deterministic docs first; do not block on API key.
- **Hashtag quality:** weak mapper → off-niche posts; mitigated by niche anchors + C-39 CAROUSEL prefer + like_count rank.
- **Max 3 hashtags queried:** document that Backend truncates; pack may return ≤5.

## Mid-flight escalation

Если Product требует LLM mapper as default: стоп → Architect + new decision; C-39 must still soft-fail without LLM key. Если Graph fields differ from Media Discovery: C-39 only.
