# Guards — 2026-10-18 phase2-vision-prompt

**Role:** Tester  
**Source:** `architect-spec.md` HARD locks §3  
**Date:** 2026-10-18

## Executable asserts (class of defect)

| ID | Lock | How to check | Result |
|----|------|--------------|--------|
| G1 | `image_prompt_canon` | `buildVisionRefBackgroundImagePrompt` body + `sample-image-prompts.md`: **no** `#FF5A1F`, **no** `idx%2` orange/white flip, **no** affirmative Photoreal/CGI / house-object lock. Words `photoreal/CGI` only allowed inside **DO NOT / BAN** lines. | **PASS** |
| G2 | `sanitize_keep` | `buildVisionRefBackgroundImagePrompt` still ends with `sanitizeBackgroundImagePrompt(...)`; STRICT BANS include NO TEXT / NO LOGO. | **PASS** |
| G3 | `logoTextColor` | Zod `html_layout.logo.textColor` `#RGB/#RRGGBB` in `carousel-json-contract.ts`; aliases via `normalizeHtmlLayoutRaw`; composite `.brand-name { color: … }` via `resolveLogoTextColor`. | **PASS** |
| G4 | `logo_path_a` | Smoke HTML: `data-logo-mode="emblem_wordmark"` + `.brand-name` + emblem `<img>`; `BRAND_LOGO_SIZE_PX === 200`. | **PASS** |
| G5 | `stock_fonts_ban` | Smoke `slide_0{1..6}.html`: **0** matches for `Manrope`, `@font-face` Manrope, `family=Manrope`. | **PASS** (0/6) |
| G6 | `review_artifact` | Wave has `CLEAN-IMAGE-PROMPT.md` + `IMAGE-PROMPT-AUDIT.md`. | **PASS** |
| G7 | `phase3_out` | Prompt soft conductor («same drawing language… not 3D Pixar invent») — no Pixar product lock. | **PASS** |
| G8 | `smoke` | `docs/карусель тест/phase2-vision-prompt-smoke/` has **6 PNG** (+ HTML + SMOKE-REPORT). Served at `/phase2-vision-prompt-smoke/`. | **PASS** |

## Repro commands

```powershell
# G1 — prompt function bans
Select-String -Path lib\studio\create-carousel-prompts.ts -Pattern '#FF5A1F|idx\s*%\s*2' |
  Where-Object { $_.Line -match 'buildVisionRefBackgroundImagePrompt' -or $_.LineNumber -ge 739 -and $_.LineNumber -le 776 }
# Expect: no hits inside function body for #FF5A1F / idx%2

# G5 — Manrope scrub on smoke HTML
$smoke = "docs\карусель тест\phase2-vision-prompt-smoke"
1..6 | ForEach-Object {
  $c = (Select-String -Path "$smoke\slide_0$_.html" -Pattern 'Manrope|family=Manrope' | Measure-Object).Count
  "slide_0$_ Manrope=$c"  # expect 0
}

# G8 — six PNGs
(Get-ChildItem "$smoke\slide_0*.png").Count  # expect 6
```

## Permanent regression note

- Affirmative locks like `SOLID bright orange (#FF5A1F)`, `Photoreal/CGI single object`, `idx % 2` plate polarity in **IMAGE** prompt text = **FAIL** this wave class.
- Ban-line mentions of photoreal/CGI/Pixar = **OK**.
- Overlay CSS vars may still show etalon plate colors (`--cf-design-bg:#FF5A1F`) — that is HTML chrome, **not** IMAGE prompt lock.
