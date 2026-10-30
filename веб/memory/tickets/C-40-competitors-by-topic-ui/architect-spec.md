# Architect spec — C-40

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Правая колонка конкурентов в Studio `carousel-engine` сразу показывает контент по **пустой теме** (= вся ниша через дефолтные хэштеги на Backend). Смена/commit темы обновляет конкурентов. UI **не** просит вставлять ссылки/ники конкурентов. Mock без токена не ломает UX.

## Depends

- **C-39** Backend: empty `topic` → niche hashtag competitors; `?topic=` refreshes hashtag set.
- C-38 pack (copy alignment optional for agent drawer; not blocking UI).

## In scope

### 1. Initial load

Current (`StudioModuleWorkspace`): `fetchFeed(undefined, "full")` on mount — **keep**.  
Backend C-39 must return niche competitors when topic omitted/empty so right column is populated without user typing a topic.

Acceptance: on first paint of `/studio/carousel-engine`, competitors column shows posts (live or mock), not an empty «paste competitor» CTA.

### 2. Topic commit → refresh competitors

- On topic commit: `fetchFeed(next, "competitors")` (already partially there).
- **Also:** clearing topic / committing empty should refetch niche-wide competitors (today `handleTopicCommit` returns early if `!next` — **fix**: allow empty commit or explicit clear to call `fetchFeed("", "competitors")` / `fetchFeed(undefined, "competitors")` and set `committedTopic` to `""`).
- Loading: `competitorsLoading` without blanking ours unnecessarily.

### 3. Copy / empty states

- Remove or avoid any copy that asks for competitor Instagram URLs / usernames.
- Empty competitors: friendly niche/mock message (e.g. нет постов по теме / показаны примеры) — not «добавьте конкурентов».
- Optional subtle hint: «Конкуренты подбираются по теме автоматически» near topic field or column header — short, non-blocking.

### 4. Source mode UX

- Honor existing `feedSourceMode` live/mock badge/behaviour from C-37 if present.
- Errors: network/module_not_found — existing patterns; no token setup instructions that demand competitor list.

### 5. Non-goals for other modules

Only **carousel-engine** competitor column behaviour in this ticket. Other modules unchanged unless they share the same workspace paths harmlessly.

## Out of scope

- Graph / mapper implementation → **C-39**.
- Researcher prompts → **C-38**.
- Razbor / Drafts / CapCut behaviour changes.
- Motion polish beyond existing loading states (Motion only if Architect adds mid-flight — **default: skip Motion** unless Tester flags jank).

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Workspace fetch + copy | **Frontend** | `StudioModuleWorkspace` + related feed/empty UI |
| API | Backend C-39 | Must be green first |
| Motion | Optional | Not in default chain |

## Contracts

### Client → API

| Event | Request |
|-------|---------|
| Mount | `GET .../feed` (no topic) → full ours + niche competitors |
| Topic commit (non-empty) | `GET .../feed?topic=...` mode competitors |
| Topic clear / empty commit | `GET .../feed` or `?topic=` empty → niche competitors |

### UI invariants

1. Never require manual competitor links/usernames.
2. Empty topic ≠ empty competitors column (Backend defaults).
3. Soft-fail mock still usable for Razbor / browsing.

## Acceptance criteria (язык Клиента)

1. Открыл Studio carousel-engine — справа уже есть карусели конкурентов **без** ввода темы.
2. Ввёл тему и применил — правая колонка обновилась под тему.
3. Очистил тему — снова «вся ниша» (дефолтные хэштеги).
4. Нигде не просят вставить ссылку/ник конкурента.
5. Без IG-токена — mock/fixtures, экран не падает.
6. Guard: UI source + Playwright/scenario smoke on localhost after Deployer.

## Risks

- **Early return on empty topic** in `handleTopicCommit` — must fix or niche clear broken.
- **Stale competitors** if commit doesn't await/error-handle — keep existing error flags.
- **Double fetch** on mount + topic — acceptable; avoid redundant full ours refetch on topic-only.
- Shipping FE before C-39 → empty still possible; chain order Backend → Frontend.

## Mid-flight escalation

If product wants live typeahead refetch per keystroke: new ticket (debounce + rate). Do not spam Graph from FE directly — always via feed API.
