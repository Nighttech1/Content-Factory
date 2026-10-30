# Architect spec — C-team-brief-n-indicator (P1)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-13-drafts-design-team`.  
> Shared chain: `memory/waves/W-2026-10-13-drafts-design-team/chain.md`.  
> Canon: `xyflow-agent-mesh` («Задание» empty), `content-pipeline-agents`, `ai-bridge` / **C-155**, `content-factory-ui` (Dev chrome «N»).  
> Supersedes C-140 **default seeded body** for Team User field (label+empty). **Does not** reopen combat-brief glue in chat.

## Goal

1. Team User block: label **«Задание»**, поле **пустое** по умолчанию (нет baseline lorem / `defaultCombatBrief` body).  
2. Verify **C-155**: live chat `user` = raw only — **no** brief glue.  
3. Identify + **disable** bottom-left mystery **«N»** (Next.js Dev Indicator) via `next.config` `devIndicators: false`.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-tb-1 Label** | UI label = **«Задание»** (not «combat brief» / «ТЗ» chrome). Visible near User accordion textarea. |
| **D-tb-2 Empty default** | New / missing `localStorage` → `userBrief = ""`. **Stop** seeding `defaultCombatBrief(pipelineId)` into UI default and into `loadUserBrief` fallback. |
| **D-tb-3 Persist empty** | Saving empty string OK; do not auto-refill baseline on blur/reset. Remove or neutralize reset-to-baseline that writes combat lorem. |
| **D-tb-4 C-155 no glue** | Agent-chat client + server: **no** `composeTopicWithBrief` / `---\nБриф:` / Team «Задание» append into `messages[].role=user`. System = mesh agent `systemPrompt` only. AI Bridge audit in wave step 2; FE verify no client-side reintroduction. |
| **D-tb-5 Legacy storage** | Existing non-empty `cf.mesh.userBrief.v1:*` may remain until user clears — **do not** force wipe user data. Only change **default when key missing**. Optional: if value equals known `defaultCombatBrief` constant, treat as empty on hydrate — **allowed** (prefer yes for carousel-engine known seed). |
| **D-tb-6 Mystery N** | Bottom-left **N** = Next Dev Indicator / related overlay — **not** Create slide-count chip. Fix: `next.config.ts` → `devIndicators: false` (Next 15 API as applicable). Do not mount custom FAB «N». |
| **D-tb-7 Prod** | Production build must not show indicator. Localhost after Deployer: S43 assert absence @1440 on `/studio` and `/settings`. |

## In scope

| Path | Owner |
|------|--------|
| `components/mesh/v2/ReleaseTeamFlowchart.tsx` | Frontend (label «Задание», empty placeholder) |
| `lib/mesh/agent-store.ts` | Frontend (load/persist empty default; no baseline seed) |
| `lib/mesh/agent-defaults.ts` | Frontend — `defaultCombatBrief` **not** used as UI default; may remain for docs/tests only if unused in hydrate |
| Agent-chat client sanitize (if any FE glue left) | Frontend / verified by AI Bridge |
| `next.config.ts` | Frontend step 4b (+ Deployer verify) |
| C-155 payload audit | AI Bridge (wave step 2) |

## Out of scope

- Rewriting static mesh diagram geometry (C-139…)
- Re-adding Settings Agents/LLM
- RazborModal edits
- Force-deleting all user briefs in localStorage without migration rule above

## Layers / owners

| Layer | Role | Notes |
|-------|------|-------|
| Team UI + store empty default + next.config | **Frontend** | Wave step **4b** |
| Chat no-glue audit | **AI Bridge** | Step 2; report paths cleaned |
| Indicator off on localhost | **Deployer** | After FE config |
| QA | Tester → Client **S43.5–7** | Empty «Задание»; network raw user; no **N** |

## Contracts

```ts
// Hydrate
function loadUserBrief(pipelineId): string {
  const raw = localStorage.getItem(`cf.mesh.userBrief.v1:${pipelineId}`);
  if (raw == null) return ""; // LOCK: was defaultCombatBrief
  if (raw === defaultCombatBrief(pipelineId)) return ""; // optional migrate
  return raw;
}

// next.config.ts
const nextConfig = {
  devIndicators: false, // or Next 15 equivalent disabling build activity indicator
};
```

### C-155 verify (Client network)

Send unique raw string from Create Scriptwriter/Designer chat → request body `messages` last user content **equals** raw; must **not** contain Team brief text / `Бриф:`.

## Acceptance criteria (язык Клиента / S43)

1. OWNER `/admin/mesh` → User: label **«Задание»**, поле **пустое** (нет baseline). Snapshot.
2. Live chat: `user` payload = raw only (C-155).
3. `/studio` and `/settings` @1440: **нет** bottom-left **«N»**.

## Risks

- Clearing brief while mesh still syncs `userRequest` on user agent card — keep sync but empty string.
- Disabling wrong indicator API on Next 15 — Deployer verifies DOM.
- Confusing Create **N=** slide chip with shell **N**.

## Mid-flight escalation

Если «N» is custom product FAB (not Next) — стоп → Архитектор names component path → FE unmount; update this spec.
