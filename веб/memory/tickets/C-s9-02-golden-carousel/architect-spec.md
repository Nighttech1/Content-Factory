# Architect spec — C-s9-02-golden-carousel (P0)

> DEV_PLAN **9.2** · Wave `W-2026-10-15-sprint9-carousel-reels`

## Goal

**3–5** золотых эталонов клуба: Dramaturgy JSON + ссылка на нарезанные 4:5 (или HTML refs) + словами «что хорошо». Планка QA для Designer / few-shots 9.8.

## Decision locks

| Lock | Decision |
|------|----------|
| **D-s9-02-classes** | Покрыть классы: `dark_notes`, `bento_glass`, `dark_editorial` (если нет PNG — JSON+словами + HTML из wave-visual-deconstructor) |
| **D-s9-02-path** | `memory/fixtures/sprint9/carousel/{id}/handoff.json` + `NOTES.md` |
| **D-s9-02-refs** | Читать `generatedMedia/wave-visual-deconstructor/` — **не** wipe; не раздувать PNG budget без stop-report |
| **D-s9-02-schema** | JSON must pass future STRICT (`carousel-json-contract` keys as-is: slide_number, primary_copy, swipe_trigger…) |
| **D-s9-02-upgrade** | Fixtures = bar; **не** меняют handoff graph |

## In scope

- AI Bridge: author golden JSON + NOTES  
- Backend: optional fixture loader / test helper (no Prisma rewrite)

## Out of scope

- UI redesign; live generate (smoke = 9.9); reels fixtures (C-s9-03)

## Acceptance

- [ ] ≥3 fixtures with valid carousel JSON
- [ ] Each NOTES: hook / swipe meta / CTA / visual craft vs purple slop
- [ ] Linked to visual refs where exist

## Skills

`carousel-json-contract` · `ai-bridge` · `backend` § Sprint 9 fixtures
