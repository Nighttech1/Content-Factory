# 🏗️ АРХИТЕКТОР — Vernatun Carousel Module

## Решение

Новый пакет `lib/studio/vernatun-carousel/` — единственный product path.
Старые `layered_html` / `correct` / `e2e` / `anchor_ref` не вызываются из Create/intake.

## Поток

```
Brief → Scriptwriter → [USER APPROVE] → AD(script) → ImagePlanner
  → ImageGen/Web/User → Designer(A|B) → Renderer → QA → AD(final)
  → Repair×≤3 → Packager → Draft (+ remarks if BLOCKED)
```

## Контракты

- `VernatunScript` — carousel_title, audience, central_thesis, slides[]
- `BuildMode` — `'A' | 'B'` (явный, не смешанный)
- `RoleModelConfig` — `{ provider, model }` per role, env overrides
- `AssetManifestRow` — TZ §5 fields
- `Defect` — BLOCKER|MAJOR|MINOR + slide + element + fix
- Release: `FINAL` | `BLOCKED_WITH_REMARKS`

## UI

1. CreateCarouselModal: Mode A/B toggle; approve script CTA
2. Mesh AgentInspectorDrawer (designer): buildMode default
3. DraftsPanel: trash top-right on card

## Цвета

Только из `readSyncedActiveDesign()` / DesignPresetFile CSS vars.
Композиции — Vernatun templates (cover/split/photo-top/cards/quote/cta/…).

## Chain

Backend(role-models+orchestrator) → AI-Bridge(prompts) → Frontend(modal+drafts) → Tester → Deployer → smoke 4×4
