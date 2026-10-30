# Trainer grade — 2026-10-18-design-inject-logo-br

## План хода

- Запрос: 8+ user locks — FULL DESIGN.md inject (fonts/sizes/colors per role, positive scale, bg mood); optional Armenian motifs (no laundry list); logo chrome enlarged bottom-RIGHT + name beside; slide number own HTML slot (body tokens); Scriptwriter `secondary_copy` 2–3× richer; fontFit reduce-only; verify Settings upload→deconstruct→DESIGN.md; `html_layout` variety (not always top-left); smoke ONE × 6 + pretty numbering.
- Режим: усиление команды (skills/rules/plugins) → затем код по chain
- Роли по chain: **Architect → AI Bridge → Backend → Tester → smoke**; Frontend **only if** Brand/deconstruct UI broken
- ticket_limit: **full-queue** (весь список locks одним проходом; лимит ≤3 не режет)

## Грейд: B → A (после апгрейда skills)

До хода: **C** (критичные пробелы: FULL DESIGN vs scale-only; forced motif checklist; logo chrome position/name stack; slide-num fused; thin secondary_copy; enlarge-ok; layout always top-left; deconstruct→inject verify path undocumented).  
После дописи skills: **A** — команда готова к Архитектору.

## Пробелы (закрыты в skills)

| # | Пробел | Роль | Слой | P0/P1/P2 |
|---|--------|------|------|----------|
| 1 | Designer got scale-ish / negatives («не 64px»), not FULL colors+fonts+sizes; bg mood ignored | AI Bridge + Backend | skill | P0 |
| 2 | visual_prompt HARD forced Armenian motif laundry list → same khachkar/apricot every post | AI Bridge | skill | P0 |
| 3 | Logo chrome: tiny / wrong corner / name under icon | Backend (+ FE if UI) | skill | P0 |
| 4 | Slide number not own slot / wrong tokens | Backend | skill | P1 |
| 5 | secondary_copy thin / undocumented richness | AI Bridge | skill | P0 |
| 6 | Font enlarge allowed / no reduce-only + overlay note | AI Bridge + Backend | skill | P1 |
| 7 | Deconstruct→DESIGN→inject path not in Architect chain | Architect | skill | P1 |
| 8 | html_layout always top-left | AI Bridge + Backend | skill | P0 |
| 9 | Smoke bar already 6 — keep; pretty N/M | Tester | skill (keep) | P1 |

## Что добавлено этим ходом

- `plugins/trainer/design-inject-logo-br.md` — wave card + chain
- `plugins/trainer/PLUGINS.md` — registry row
- `.cursor/skills/carousel-json-contract/create-carousel-prompts-notes.md` — FULL DESIGN inject; fontFit; logo chrome BR; slide-num slot; layout variety; motifs optional; secondary_copy; deconstruct verify
- `.cursor/skills/carousel-json-contract/SKILL.md` — Phase 7 locks + pipeline + logo chrome
- `.cursor/skills/art-director/html-layout-variant-a.md` — brandChrome bottom-right; slideNumber; fontFit; variety; FULL DESIGN
- `.cursor/skills/art-director/critique-checklist.md` — logo BR; variety; secondary_copy; FULL colors
- `.cursor/skills/content-pipeline-agents/SKILL.md` — wave locks + Designer IO / Logo P0 / schema fields
- `.cursor/skills/ai-bridge/SKILL.md` — wave bullet + deconstruct→FULL inject
- `.cursor/skills/architect/SKILL.md` — wave section + deconstruct_verify + full-queue chain
- `.cursor/skills/trainer/gap-playbook.md` — 10+ symptom rows for this wave

## Backend / AI Bridge fix paths (для chain — не код Тренера)

1. **FULL DESIGN:** `buildDesignTokensPayload` prints full role table (family+size+color); Designer overlay paste; remove negative «64px» phrasing.
2. **Motifs:** Scriptwriter overlay — optional cultural taste; ban laundry-list force.
3. **Logo chrome:** composite CSS bottom-right; enlarged icon; transparent; flex row icon→name; raw `logoRef`.
4. **Slide number:** own `.slide-num` block; body paragraph CSS vars; pretty `N / M`.
5. **secondary_copy:** zod + Scriptwriter prompt richness; AD flags thin.
6. **fontFit:** composite may shrink; never grow above DESIGN; note in overlay meta.
7. **Variety:** validate adjacent anchors differ (or AD remarks); Designer prompt HARD.
8. **Deconstruct:** Architect documents Settings upload → `deconstructStyle` → DESIGN.md → Embla active → payload; Tester guard.
9. **Smoke:** ONE 6-slide + pretty numbering under Architect path / `docs/карусель тест/`.

## Proposed chain

```text
Architect (spec + chain.md: FULL DESIGN, logo BR, slide-num, secondary_copy, fontFit, variety, deconstruct verify, smoke 6)
  → AI Bridge (overlays + Scriptwriter secondary_copy + optional motifs + Designer FULL tokens)
  → Backend (composite chrome + tokens + reduce-only + variety)
  → Frontend (ONLY if Brand/deconstruct UI broken — else skip)
  → Tester (guards + smoke ONE×6 pretty N/M)
  → (Fixer if red) → Deployer localhost → Client optional
```

## Вердикт

Команда готова к волне: **да**  
Грейд: **A** (skills closed; implementation = chain)  
MCP: Playwright / chrome-devtools — без платных ключей  
Secrets: не трогать  
shell_freeze: AppShell  
ticket_limit: **full-queue**
