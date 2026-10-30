# S50 — Prompt hardening (Scriptwriter · Designer · Razbor)

**Wave:** Client must not accept weak generation. Trainer → AI Bridge audits live pipelines; patch system/agent-defaults / create-carousel prompts **before** Client ПРИНЯТО.

## Smoke order (localhost, НЕ prod)

1. **Competitors feed** — `sourceMode: live` cards with real usernames + metrics (FE/BE). Mock-as-live = stop; open Backend ticket.
2. **Razbor** — «Начать разбор» → live Haiku → insights (hook/mid/CTA + virality + **concrete** trainer tasks) → Scriptwriter handoff.
3. **Create** — start Scriptwriter → Dramaturgy JSON → handoff → Designer describe→«Нарисовать» → sliced 4:5 preview URLs.
4. Log weak outputs → patch prompts → rerun same smoke.

## Weak → strengthen

| Agent | Weak symptom | Harden |
|-------|--------------|--------|
| **Разборщик** | Mock bubbles; empty «ок» handoff; vague «make better» tasks | `razbor-live-prompt.md`: force structured hook/mid/CTA + virality + **numbered trainer tasks** for Scriptwriter+Designer |
| **Сценарист** | Flat cover; water infobiz; swipe_trigger painted on slide; wrong CTA #; ignore Razbor insights | Dramaturgy lock + Hook bar + swipe **meta** + CTA **1–4** + must-consume insights when present (`carousel-json-contract` + worker script-writer) |
| **Дизайнер** | Black preview; purple slop; ignore brandbook; panorama as product; generic visual_prompt | Brandbook tokens required; panorama→slice; specific materials/light/type; length-matched image URLs (`designer-carousel` + create-carousel-prompts) |

## Fail / pass

- **FAIL:** silent mock success; text-only Designer «готово»; flat hook; empty trainer tasks; competitors fixtures labeled live.
- **PASS:** live network completion (or explicit aggregator error); captivating hook; actionable trainer tasks; sliced preview with real paths; brandbook tokens visible in draw.

Secrets never in prompts/logs. Client **S50.D** asserts smoke evidence.
