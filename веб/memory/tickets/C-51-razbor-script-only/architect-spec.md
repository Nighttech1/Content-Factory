# Architect spec — C-51

> Заполняет **Архитектор** до любого кода. Mid-flight смена архитектуры → стоп инженеров → обновить этот файл + `chain.md`.

## Goal

Переписать Razbor: **welcome + «Начать разбор»** (без auto-start); cascade **Analyst → Scriptwriter only** (полный сценарий); убрать Designer и UI «Готовая карусель»; справа competitor media с Play + CapCut-lite timeline scrubber.

## Depends

- C-49 / C-50 не блокируют Razbor paths, но волна: C-49 → C-50 → **C-51**.
- Trainer + skills: `content-pipeline-agents` § Razbor C-51; `content-factory-ui` § Razbor modal chrome.
- C-30 designer leg / auto-start **superseded** (см. `client-review/regression-guards.md`).
- CapCut reference: `components/studio/editor/CapCutEditorShell.tsx` (playhead / scrub patterns — **lite reuse**, не полный NLE).

## In scope

### 1. Start UX (RazborModal)

| On open | Analyst **welcome** only (idle greeting) + CTA **«Начать разбор»** |
|---------|---------------------------------------------------------------------|
| Forbidden | `useEffect` auto-run Analyst / Scriptwriter / Designer on mount |
| After CTA | Analyst analysis messages → user can trigger Scriptwriter (existing «Написать сценарий» / chat) |

`data-testid`: `razbor-welcome`, `razbor-start-btn`.

### 2. Pipeline (AI Bridge)

Файл: `lib/studio/razbor-pipeline.ts` (+ типы сообщений).

| Keep | Analyst welcome + analysis; Scriptwriter **full script** |
|------|----------------------------------------------------------|
| Remove from razbor path | `buildDesignerMessages`, designer pane data, handoff copy «Передаю Designer…» |
| Remove | Upsert carousel draft as end of razbor cascade; UI preview «Готовая карусель» |

**Scriptwriter JSON contract (messages must cover):**

```json
{
  "roles": ["…"],
  "plot": "…",
  "text": "…",
  "location": "…"
}
```

Mock deterministic OK. Live LLM optional — не блокер. Chat-правки сценаристу — оставить (C-32 style) без Designer.

`runRazborCascade` / payload: **не** возвращать `designerMessages` / `draft` для modal path (или draft = unused; FE не вызывает `upsertDraft` из razbor). Store `carousel-drafts-store` не удалять — другие входы могут жить; **razbor path не пишет туда**.

### 3. Modal chrome (Frontend)

- Tabs/panes: **Analyst**, **Scriptwriter** only — убрать Designer tab.
- Убрать блок «Готовая карусель» / ours draft preview footer.
- Left: chats; Right: competitor reel panel.

### 4. Right panel — Play + CapCut-lite scrubber (Frontend + Motion)

| Control | Behaviour |
|---------|-----------|
| Play | Toggle play/pause; **no autoplay on modal open** |
| Media | `mediaUrl` → video; else poster (`thumbUrl` / first slide) + scrubber tied to **mock duration** (e.g. 15–30s or `durationSec`) |
| Timeline | Bottom scrubber: click/drag seek + playhead; time `current / total`; spring Motion; `prefers-reduced-motion` |
| Reference | CapCutEditorShell timeline **lite** (one track / playhead) — не открывать `/editor` route |

Optional extract: `components/studio/workspace/RazborReelPlayer.tsx` (ReelsPlayer-like) — FE/Motion decision; keep paths in chain.

## Out of scope

- Full CapCut NLE / Remotion render from Razbor
- Designer / Brand Kit carousel generation (отдельный generate path / drafts elsewhere)
- Social publish / HITL networks
- Launchpad, mesh, Prisma reset
- Возврат C-30 auto-start + Designer cascade

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Modal shell: welcome CTA, remove designer/carousel UI | **Frontend** | `RazborModal.tsx` |
| Pipeline messages / cascade contract | **AI Bridge** | `razbor-pipeline.ts` + packs if touched; `prompt-engineering` |
| Play + scrubber motion | **Motion** | after FE shell hooks; `web-motion-engine` |
| Backend | **Не звать** | |

## Contracts

### Cascade

```
Open → welcome (idle)
User «Начать разбор» → Analyst messages
User script CTA / chat → Scriptwriter full script (roles/plot/text/location)
STOP — no Designer, no draft upsert from this modal
```

### Regression

- Tester **не** FAIL за отсутствие Designer в Razbor (C-30 superseded).
- FAIL если auto-start на open или видна «Готовая карусель».

## Acceptance criteria (язык Клиента)

1. Клик «Разбор» → приветствие аналитика + «Начать разбор»; анализ **не** бежит сам.
2. После старта — аналитик, затем сценарист с полным сценарием (роли/сюжет/текст/место); дизайнера в модалке нет.
3. Нет блока «Готовая карусель».
4. Справа: Play + посекундная/scrub шкала; без autoplay при открытии.
5. Guard + Playwright: open → welcome → start → script fields visible.

## Risks

- Старые smoke C-30 ожидают Designer/draft — обновить guards (Tester).
- FE оставит `upsertDraft` по инерции — явно вырезать из razbor handlers.
- Scrubber без video — fake clock OK; не подменять autoplay.
- Overlap `RazborModal` у FE/Motion/AI Bridge — порядок chain: FE shell → AI Bridge messages → Motion polish.

## Mid-flight escalation

- Вернуть Designer в Razbor → новый тикет (не patch C-51).
- Нужен real video CDN URL mapping из Graph → Backend ticket; mock/fake play допустим.
