# Guards — C-s50-create-prompts (S50.C + prompt bar)

## Class of defect

Create modal ≠ Razbor chrome; wrong start agent; shrunk preview; weak Scriptwriter/Designer/Razbor prompts; silent mock generation success.

## Permanent checks

1. Playwright @1440: open **Создать карусель**:
   - Initial selected step = **Сценарист** (`data-testid=create-step-scriptwriter`).
   - People-tabs chrome + handoff control inside input (`Передать задание…`); CTA «?» cheat sheet present.
   - No Tools / «Карусель конкурента» chrome.
   - Preview uses ≈1.5× scale (`w-[min(100%,29rem)]` / S48 19.5rem → ~29rem).
   - Competitors/Ours source toggle in upper preview chrome.
2. Prompts (static / AI Bridge): S50 bars from `s50-prompt-hardening` — captivating hook; swipe meta; CTA 1–4; Designer visual_prompt; Razbor concrete numbered trainer tasks.
3. Competitors: empty OK when Apify 403; **mock competitor cards** when live path expected = FAIL.

## Evidence (2026-10-14)

- `memory/waves/W-2026-10-14-s50-client-ui-live/s50-create-1440.png`
- Parallel wave: `memory/waves/W-2026-10-14-s50-live-competitors-prompt-hardening.md`
