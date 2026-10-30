# Trainer grade — 2026-10-18-gemini-ad-visual-logo

## План хода

- Запрос: закрыть противоречие LLM `html_layout` vs DESIGN type scale; Art Director на Gemini vision (virality+design+completeness, thin 2-sentence slides); logo из Settings Brand на карусели; документ club name font; rich Armenian `visual_prompt`; smoke ONE × 6 + pretty HTML `N/M`.
- Режим: усиление команды (skills/rules) → затем код по chain
- Роли по chain: **Architect → AI Bridge → Backend → Frontend (if logo UI) → Tester → smoke**
- ticket_limit: **full-queue** (user wave = весь список пунктов 1–6 одним проходом; лимит ≤3 не режет)

## Грейд: B → A (после апгрейда skills)

До хода: **C** (критичные пробелы знания: dual-path logo, type-scale SoT, Gemini AD bar, visual_prompt density).  
После дописи skills: **A** — команда готова к Архитектору.

## Пробелы (закрыты в skills)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | LLM invents large type; DESIGN `typography.scale` small / ignored by composite hardcoded px | AI Bridge + Backend | skill | P0 |
| 2 | AD defaulted toward gpt-4o / script-ish; no Gemini completeness + thin-slide bar | AI Bridge + Backend | skill | P0 |
| 3 | `sanitizeLogoRefForLlm` can starve Puppeteer → name-only chrome | Backend | skill fix-path | P0 |
| 4 | Club name font location undocumented | Architect / AI Bridge | skill | P1 |
| 5 | `visual_prompt` one-liner OK in prompts | AI Bridge | skill | P1 |
| 6 | Smoke still «4-slide»; slide-num bare `01` | Backend + Tester | skill | P1 |

## Что добавлено этим ходом

- `.cursor/skills/art-director/SKILL.md` — Gemini vision lock; thin slides; smoke 6
- `.cursor/skills/art-director/critique-checklist.md` — type scale; content completeness; logo+name; `N/M`
- `.cursor/skills/art-director/html-layout-variant-a.md` — TYPE SCALE HARD; composite duties
- `.cursor/skills/carousel-json-contract/SKILL.md` — type/logo/club font/`visual_prompt` rich/smoke 6
- `.cursor/skills/carousel-json-contract/create-carousel-prompts-notes.md` — inject blocks TYPE SCALE / LOGO / RICHNESS / AD Gemini
- `.cursor/skills/content-pipeline-agents/SKILL.md` — wave locks + Designer IO / Logo P0
- `.cursor/skills/trainer/gap-playbook.md` — 8 новых строк симптомов
- `workers/art-director/SKILL.md` + `plugins/trainer/variant-a-art-director.md` — sync chain/smoke

## Backend fix paths (для chain — не код Тренера)

1. **Type scale:** `carousel-layered-composite` `templatePrimarySize` → yield to `preset.typography.scale`; Designer overlay prints scale numbers via `buildDesignTokensPayload`.
2. **Logo:** composite/draw call uses **raw** `getBrandSettings().logoRef`; keep sanitize only for LLM text (`placeholders.ts` split).
3. **AD:** `ART_DIRECTOR_VISION_MODEL` default → Gemini aggregator id; sync `ART_DIRECTOR_CHECKLIST_COMPRESSED` in `art-director-review.ts` with skill checklist (AI Bridge).
4. **Slide num:** `.slide-num` → `N / M` pretty.
5. **Smoke:** ONE 6-slide + AD Gemini artifact under `docs/карусель тест/` or Architect path.

## Club name font (карта)

| Layer | Location |
|-------|----------|
| Text | Settings Brand `brandName` |
| Family/size | DESIGN.md / DesignPreset `typography` (+ scale) → `--cf-font-content` / body |
| Render | `carousel-layered-composite` `.brand-name` |

## Proposed chain

```text
Architect (spec + chain.md: scale, logo dual-path, Gemini AD, rich VP, N/M, smoke 6)
  → AI Bridge (create-carousel-prompts + AD checklist sync + Scriptwriter richness)
  → Backend (composite scale+logo+num; AD Gemini wire; placeholders split)
  → Frontend (only if BrandPanel upload/preview broken — else skip)
  → Tester (guards + smoke ONE×6)
  → (Fixer if red) → Deployer localhost → Client optional
```

## Вердикт

Команда готова к волне: **да**  
Грейд: **A** (skills closed; implementation = chain)  
MCP: Playwright / chrome-devtools — без платных ключей  
Secrets: не трогать
