---
name: reels-scriptwriter
description: >-
  Сценарист рилсов (custom-reels): hook 0–2s, beats, VO, on-screen CTA, 9:16 timing.
  Not carousel Dramaturgy JSON. Use for C-reels-scriptwriter-upgrade / custom-reels mesh.
---

# Reels Scriptwriter — Vernatun (9:16)

## When

Module **`custom-reels`**: mesh agent **Сценарист** → handoff **Монтажёр рилсов**.  
Wave ticket: **`C-reels-scriptwriter-upgrade`**.  
Wire: `lib/mesh/agent-defaults.ts` (`PIPELINE_COPY["custom-reels"]`) + Team systemPrompt.  
**Не** путать с карусельным Scriptwriter (`carousel-json-contract`).

## Sprint 9 — upgrade-only / no-pipeline-break (HARD)

`DEV_PLAN` **9.3 / 9.6 / 9.7 / 9.8** — viral reels (IG + YouTube Shorts). Апгрейд контракта и live generate **без** нового video stack.

| Lock | Правило |
|------|---------|
| **UPGRADE ONLY** | Патчить `PIPELINE_COPY["custom-reels"]` / systemPrompt / rules **in place**; усилить hook 0–2s · beats · CTA · VO |
| **NO PIPELINE BREAK** | Сохранить mesh **Сценарист → Монтажёр / existing render path**. **Запрет** подменять path на HeyGen / cartoon / Remotion cartoon (→ Sprint 23) |
| **Not carousel** | Deliverable = reels schema (`contentType: "reels"`). **FAIL** if Dramaturgy carousel JSON used as reels output |
| **STRICT (9.7)** | Missing hook / beats / CTA = fail job or critic reject — не soft-mock «успех» |
| **Golden (9.3)** | 2–3 viral script fixtures (IG + YT Shorts) = bar; few-shot from them in 9.8 |
| **No UI / publish** | No Create shell redesign; no social publish; smoke → Draft only (9.9) |

## Role

| Агент | Делает | Не делает |
|-------|--------|-----------|
| **Сценарист** | Hook → value beats → CTA; VO/реплики; captions timing; `promptForMontage` | Slide JSON 4:5, `promptForDesigner`, DESIGN.md paint |
| **Монтажёр** | Cut/join raw clips, burn-in subs, inserts | Carousel HTML/PNG |

## HARD dramaturgy (15–30s vertical)

| Beat | Time | Duty |
|------|------|------|
| **Hook** | **0–2s** | **Captivating** pattern interrupt: question / paradox / visual shock / bold claim / taboo club truth. Mute-proof: on-screen text readable without audio. Must create **immediate** curiosity — not soft intro |
| **Value beats** | ~2–20s | 2–4 beats: insight → proof → emotional turn. Each beat ≤1 idea |
| **CTA** | last 3–5s + caption | Explicit action: save / comment / follow / link-in-bio. On-screen **and** caption line |

Tone: Vernatun — cultural, ritual, coffee/city, Armenian+RU OK; **no** infobusiness water, no «в этом видео я расскажу».

### Hook bar (strengthen)

| PASS | FAIL |
|------|------|
| First 2s would stop a scroll in mute | Soft open: «Привет, сегодня…», «В этом рилсе…» |
| On-screen ≤6–8 punchy words + matching VO | VO lecture with blank screen first 2s |
| Paradox / question / shock aligned to Vernatun | Generic «5 tips» / empty clickbait |
| Hand-off keeps hook fields intact | Hook dropped when wrapping legacy `plot`/`text` |

**Model note:** Scriptwriter defaults → Haiku 5.5 + **thinking/reasoning** (carousel + reels). See `llm-model-catalog-notes`.

## Artifact shape (canonical)

```json
{
  "contentType": "reels",
  "durationSec": 22,
  "hook": { "t0": 0, "t1": 2, "onScreen": "…", "vo": "…" },
  "beats": [
    { "t0": 2, "t1": 8, "label": "paradox", "onScreen": "…", "vo": "…" },
    { "t0": 8, "t1": 16, "label": "insight", "onScreen": "…", "vo": "…" }
  ],
  "cta": { "t0": 16, "t1": 22, "onScreen": "СОХРАНИ РИТУАЛ", "vo": "…", "captionLine": "…" },
  "roles": ["host"],
  "location": "…",
  "caption": "…",
  "hashtags": ["#…"],
  "promptForMontage": "cut points, B-roll inserts, subtitle style, end-card CTA"
}
```

Aliases OK: `plot`/`text` legacy fields may wrap the same structure — AI Bridge must not drop hook/beats/cta.

## agent-defaults canon (AI Bridge must write)

Upgrade `PIPELINE_COPY["custom-reels"].copywriterPrompt` (+ rules/skills) to include **verbatim intent**:

1. «Hook **обязан** попадать в **0–2 секунды**; иначе FAIL.»
2. «Структура: hook → 2–4 value beats → CTA on-screen + caption.»
3. «Тайминг субтитров / VO на каждый beat; формат 9:16 15–30с.»
4. «Запрет: плоский VO без хука; тихие первые 2с; carousel slide JSON; `promptForDesigner`.»
5. «Handoff = `promptForMontage` + hook/beats/cta fields.»

`COMBAT_USER_BRIEFS["custom-reels"]` keep short mission line; combat brief UI may stay empty (Team «Задание»).

## FAIL criteria (Client S44 / **S45** reels half)

| FAIL | |
|------|--|
| No identifiable **captivating** hook in first **2s** of script | |
| Soft intro / lecture open without pattern interrupt | |
| Flat VO / lecture without beats | |
| No explicit CTA (on-screen or caption) | |
| Carousel Dramaturgy JSON used as reels deliverable | |
| Duration vague («примерно минута») without beat times | |
| Thinking/reasoning disabled when model supports it (wave default Haiku 5.5) | |

## Related

- `content-pipeline-agents` § custom-reels / Reels Scriptwriter
- `ai-bridge` — apply prompts to agent-defaults
- Client **S44** (reels branch)
- Carousel path stays `carousel-json-contract` + `workers/designer-carousel`
