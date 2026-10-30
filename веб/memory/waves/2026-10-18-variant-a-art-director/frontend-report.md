# Frontend report — 2026-10-18 Variant A Art Director UI

**Role:** Frontend · step 4  
**Spec:** `architect-spec.md` §8 · `chain.md` step 4 · `backend-report.md` API  
**Status:** DONE  
**shell_freeze:** AppShell / Sidebar / left nav — **0** edits

## What shipped

| Surface | Change |
|---------|--------|
| Team flowchart | Node **«Арт-директор»** (`id`/`data-testid=node-art-director`) after Designer, before Publicist |
| Edges | Designer → AD «ревью» → Publisher «медиа»; Trainer dashed feedback → AD (no mid-text) |
| Inspector | Tab **«Ревью»** (only for `art-director`); pin latest verdict on **Логи**; button **«Проверить»** → `POST /api/studio/art-director/review` (**no remake**) |
| Avatar | `packId=art-director` → Eye accessory (pink accent); no designer fallback needed |
| Badge | Mesh chip Принято (green) / Замечания (amber) from `payload.artDirectorReview` |
| RED | Perimeter when remarks include P0/P1 **or** agent log errorFlags |

## Review surface lock

**Choice (B):** dedicated tab **«Ревью»** for `art-director` + pin summary on **Логи**.

## API wire

| Action | Endpoint |
|--------|----------|
| Read last review | `GET /api/studio/drafts?moduleId=carousel-engine` → `payload.artDirectorReview` (newest with field) |
| Manual check | `POST /api/studio/art-director/review` `{ draftId }` → `{ ok, verdict, remakeEnqueued: false }` |
| Refresh mesh badge | `window` event `cf:art-director-review` after successful POST |

Agent seed: consume AI Bridge `agent-defaults` id `art-director` / name «Арт-директор» — FE **did not** rewrite systemPrompt.

## Paths touched

| Path | Change |
|------|--------|
| `lib/mesh/flowchart-graph.ts` | AD edges + `getStaticFlowConnections` + `NO_AD` fallback |
| `lib/mesh/art-director-review-ui.ts` | **NEW** — parse/pick helpers |
| `components/mesh/v2/ReleaseTeamFlowchart.tsx` | AD card, verdict chip, wider canvas, RED |
| `components/mesh/v2/AgentInspectorDrawer.tsx` | tab Ревью + Проверить + logs pin |
| `components/mesh/nodes/AgentProfessionAvatar.tsx` | art-director Eye icon |

## 21st / UI

- Reused existing `NeonBadge` (cobalt/gold) — no new shell chrome.
- `21st`: search for status badge (ids 8902/521…) — **not pasted**; mesh already retokenized; shell_freeze.
- Document: `21st=reuse NeonBadge · element=verdict · motion=no`

## Explicit non-goals (kept)

- AppShell / SidebarNavigation / Create modal
- Remake / «Перерисовать» CTA
- MultiButton / xyflow revival

## How to verify

1. Open Team (carousel-engine) → Lane A shows **Арт-директор** between Дизайнер and Публицист.
2. Click node → inspector opens on **Ревью**; tabs include Инструкция / Skills / Model / Логи / Ревью.
3. With a draft that has PNG slides: enter draftId → **Проверить** → summary + remarks; no second draw.
4. Remarks with P0/P1 → red perimeter on mesh card; approve → green/neutral chip «Принято».

## Next

Tester (step 5) — guards + mesh testid `node-art-director`.

`🎨 **FRONTEND:** mesh node Арт-директор + inspector Ревью/Logs + Проверить (no remake); shell_freeze.`
