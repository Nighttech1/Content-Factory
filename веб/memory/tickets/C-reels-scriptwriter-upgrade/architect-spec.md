# Architect spec — C-reels-scriptwriter-upgrade (P1)

> **Архитектор** до кода. Mid-flight → стоп → обновить этот файл + wave `chain.md`.  
> **No product code from Architect.**  
> Wave: `W-2026-10-13-visual-deconstructor`.  
> Shared chain: `memory/waves/W-2026-10-13-visual-deconstructor/chain.md`.  
> Canon: `.cursor/skills/reels-scriptwriter/SKILL.md`, `content-pipeline-agents`, `ai-bridge`, Client **S44.C**.  
> **Separate** from carousel Dramaturgy JSON (`carousel-json-contract`).

## Goal

Upgrade **custom-reels** mesh **Сценарист** so live / defaults produce a **reels script** with **hook in 0–2s**, ≥2 value beats, explicit **CTA** (on-screen and/or caption), and **`promptForMontage`** handoff — **not** carousel `slides[]` 4:5 JSON.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-rs-1 Separation** | Reels deliverable ≠ carousel Scriptwriter JSON. **Forbidden** as primary output: Dramaturgy `slides[]` with 4:5 roles / `promptForDesigner`. |
| **D-rs-2 Artifact shape** | Canon JSON from `reels-scriptwriter` skill: `contentType: "reels"`, `durationSec`, `hook{t0,t1,onScreen,vo}`, `beats[]`, `cta{…,captionLine}`, `promptForMontage`, caption/hashtags/roles/location. Aliases OK if hook/beats/cta preserved. |
| **D-rs-3 Hook HARD** | Hook **must** land in **0–2 seconds**. Mute-proof on-screen text. |
| **D-rs-4 agent-defaults** | AI Bridge updates `PIPELINE_COPY["custom-reels"]` (+ rules/skills list) with **verbatim** intent from `reels-scriptwriter` § agent-defaults canon. |
| **D-rs-5 Label** | UI/chat agent = **Сценарист** (not Copywriter / not carousel Scriptwriter confusion). |
| **D-rs-6 Handoff** | Next agent = **Монтажёр рилсов** via `promptForMontage` — not Designer carousel paint. |
| **D-rs-7 Team brief** | Keep Team «Задание» empty-default policy (prior wave); **C-155**: do not glue brief into `user` role. |
| **D-rs-8 Razbor freeze** | No RazborModal changes. |
| **D-rs-9 Priority** | P1 — same wave chain after carousel P0 types/prompts in AI Bridge pass (sequential OK in step 1). |

## In scope

| Path | Owner |
|------|--------|
| `lib/mesh/agent-defaults.ts` (`PIPELINE_COPY["custom-reels"]`, related prompts) | AI Bridge |
| Optional Zod/parse helper for reels script shape | AI Bridge |
| Studio `/studio/custom-reels` or Team mesh chat surface (label/smoke) | Frontend 3c light |
| Guards / S44.C asserts | Tester / Client |

## Out of scope

- Carousel HTML builder / DesignPresetFile
- HeyGen / Remotion montage implementation
- Publishing reels to social (HITL unchanged)
- Changing carousel Scriptwriter
- Prod/VPS

## Layers / owners

| Layer | Role | Wave step |
|-------|------|-----------|
| Prompts + agent-defaults + optional schema | **AI Bridge** | **1** (same pass as deconstruct prompts OK) |
| FE label / route smoke if needed | Frontend | 3c |
| QA | Tester → Client **S44.C** | 4–7 |

## Contracts

```ts
type ReelsScriptArtifact = {
  contentType: "reels";
  durationSec: number; // typically 15–30
  hook: { t0: number; t1: number; onScreen: string; vo: string };
  beats: Array<{
    t0: number;
    t1: number;
    label: string;
    onScreen: string;
    vo: string;
  }>;
  cta: {
    t0: number;
    t1: number;
    onScreen: string;
    vo: string;
    captionLine: string;
  };
  roles?: string[];
  location?: string;
  caption?: string;
  hashtags?: string[];
  promptForMontage: string;
};
```

### agent-defaults must include (verbatim intent)

1. Hook **обязан** попадать в **0–2 секунды**; иначе FAIL.  
2. Структура: hook → 2–4 value beats → CTA on-screen + caption.  
3. Тайминг субтитров / VO на каждый beat; формат 9:16 15–30с.  
4. Запрет: плоский VO без хука; тихие первые 2с; carousel slide JSON; `promptForDesigner`.  
5. Handoff = `promptForMontage` + hook/beats/cta fields.

## Acceptance criteria (язык Клиента / S44.C)

1. Open custom-reels **Сценарист** chat → request 15–30s reel script.
2. Response/artifact shows **hook 0–2s**, ≥2 beats, **CTA**, `promptForMontage`.
3. **No** carousel `slides[]` 4:5 as main deliverable.
4. Snapshot @1440 for Client report.

## Risks

- Shared “copywriter” prompt reused across pipelines → bleed carousel JSON into reels (mitigate: pipeline-specific `PIPELINE_COPY["custom-reels"]` only).
- Mock fixtures without hook/CTA → Client REJECT (update fixtures in Tester).

## Mid-flight escalation

If reels need new Prisma content type columns — стоп → Архитектор + Backend `safe-db-migrations`. Default: prompt/defaults only, no DDL.
