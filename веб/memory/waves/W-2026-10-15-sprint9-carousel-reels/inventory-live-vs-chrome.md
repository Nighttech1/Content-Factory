# Inventory — live vs chrome (Sprint 9 / C-s9-01)

**Wave:** `W-2026-10-15-sprint9-carousel-reels`  
**Scope:** `carousel-engine` + `custom-reels` only  
**Date:** 2026-10-15 · AI Bridge audit (code evidence, not memory)

## Pipeline graph (MUST keep — no_pipeline_break)

```
carousel-engine Create:  Scriptwriter → Designer (describe→draw) → Публикация-step → Draft
carousel-engine Razbor:  Razbor (live Haiku) → Scriptwriter → Designer → Draft
custom-reels:            Scriptwriter → Монтажёр / existing render → Draft
```

Critic (C-s9-08) = **gate before Draft**, not a replacement agent.

---

## Table

| Role / path | Status | Evidence (files) | Notes / gaps → 9.4–9.8 |
|-------------|--------|------------------|------------------------|
| **Razbor** (`carousel-engine`) | **LIVE** | `lib/studio/razbor-live-analyze.ts`, `app/api/studio/razbor/analyze/route.ts`, `.cursor/skills/ai-bridge/razbor-live-prompt.md` | Live Haiku analyze + trainer tasks → Scriptwriter. Soft-mock only when key missing on non-Create paths. Gap: trainer-task quality still needs scorecard 9.10. |
| **Scriptwriter carousel** | **LIVE** (quality partial) | `lib/studio/create-carousel-prompts.ts` (`CREATE_CAROUSEL_SCRIPTWRITER_OVERLAY`), `lib/mesh/agent-defaults.ts` `PIPELINE_COPY["carousel-engine"].copywriter*`, `app/api/studio/agent-chat/route.ts`, `workers/script-writer/SKILL.md` | Polza + overlays: hook/CTA 1–4/swipe meta already present. Gap **9.4/9.8**: Claude-Code few-shots + critic reject flat hook before Draft. Chat reply not always parse-gated. |
| **Designer carousel** | **LIVE** (quality partial) | `create-carousel-prompts.ts` describe/draw overlays, `agent-defaults` designer*, `carousel-html-renderer.ts`, `generate-carousel-slides-core.ts` (`noMock` on Create), `workers/designer-carousel/SKILL.md` | Describe→«Нарисовать»→sliced 4:5; `CREATE_CAROUSEL_NO_MOCK=true`. Gap **9.5/9.8**: anti-slop critic + golden likeness bar. |
| **Draft carousel** | **LIVE** | `lib/studio/create-carousel-publish.ts`, `carousel-drafts-store.ts`, `app/api/studio/drafts/*` | Persist Draft + schedule HITL only — **no** social publish. Gap: gate critic before persist (**9.8**). |
| **Scriptwriter `custom-reels`** | **PARTIAL** | `agent-defaults` `PIPELINE_COPY["custom-reels"].copywriter*`, `lib/studio/reels-script-contract.ts` (`parseReelsScriptArtifact` soft), `workers/script-writer/SKILL.md` reels notes | Prompts encode hook 0–2s / beats / CTA. Gap **9.6/9.7**: soft-parse ≠ fail-job; agent-chat not hard-asserting reels JSON; no golden few-shots yet. |
| **Монтажёр / reels render** | **CHROME / existing path** | `PIPELINE_COPY["custom-reels"].designer*` (Монтажёр), mesh seed only | Cut/join + burn-in described in prompts; **not** HeyGen. Full Remotion/live montage polish → later; Sprint 9 keeps Scriptwriter→Монтажёр graph. |
| **Other moduleId** (heygen / cartoon / aesthetic / articles / clips / tg / site) | **→ Sprint 23** | `PIPELINE_COPY` keys outside carousel-engine + custom-reels | Do **not** expand this inventory; do **not** edit those prompts in Sprint 9. |

---

## Status legend

| Tag | Meaning |
|-----|---------|
| **LIVE** | Real aggregator / renderer path; Create no-mock on fail |
| **PARTIAL** | Live prompts wired; contract or quality gate incomplete |
| **CHROME** | Mesh role / copy exists; render product incomplete or placeholder |

---

## Gaps short list (feeds 9.4–9.8)

1. **9.2/9.3** — Product golden JSON packs missing (`memory/fixtures/sprint9/**`).
2. **9.4** — Strengthen Scriptwriter overlays/defaults to Claude-Code bar + few-shot readiness.
3. **9.5** — Designer anti-slop + brandbook/panorama language vs golden visual refs.
4. **9.6** — Wire reels assert + stronger `custom-reels` generate path (keep carousel intact).
5. **9.7** — `parseReelsScript` soft → assert; carousel handoff chat reply gate; thresholds doc.
6. **9.8** — Prompt packs + few-shots from goldens + critic before Draft.

---

## Confirmation

- Handoff **Razbor → Scriptwriter → Designer → Draft** exists and must stay.
- Create **Scriptwriter → Designer → Публикация → Draft** exists and must stay.
- Reels **Scriptwriter → Монтажёр** exists; not HeyGen.
- Social publish **out of scope** (Sprint 22).

`🤖 **AI BRIDGE:** C-s9-01 inventory complete — see table above.`
