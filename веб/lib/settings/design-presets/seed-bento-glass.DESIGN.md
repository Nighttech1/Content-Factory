---
name: Bento Glass
preset: bento_glass
version: 1
colors:
  bg: '#0C0C0C'
  surface: 'rgba(28, 28, 30, 0.72)'
  text: '#FFFFFF'
  muted: '#A3A3A3'
  accent: '#F59E0B'
  accentSoft: 'rgba(245, 158, 11, 0.32)'
---

# Bento Glass — dark glass + telemetry carousel system

Vernatun golden ref: matte black / charcoal with **glass** cards, bento modules, **amber/gold** glow, optional timers/gauges, cinematic photo cover, solid gold CTA.

## Canvas & safe-zone

- Frame: **1080×1350** (4:5) — **sliced** product preview only.
- Safe padding: top ≥120, bottom ≥160, sides ≥80.
- Glass cards stay inside safe-zone; photo cover may bleed at edges.

## Colors

| Token | Hex / value | Use |
|-------|-------------|-----|
| bg | `#0C0C0C` | Matte black stage |
| surface | `rgba(28,28,30,0.72)` | Glass card fill |
| text | `#FFFFFF` | Headlines |
| muted | `#A3A3A3` | Labels / meta |
| accent | `#F59E0B` | Borders, chart line, CTA fill |
| accentSoft | `rgba(245,158,11,0.32)` | Outer glow |

## Typography

- **Display:** large bold geometric sans (Armenian + Latin/RU OK).
- **Body:** medium sans, generous line-height.
- **Mono:** timer / metric numerals (`00:45:00`).
- **Armenian-safe:** Noto Sans Armenian.
- Slide chips: small uppercase labels (`01 / HOOK`).

## Component primitives

- **card.glass:** `backdrop-blur` + 1px luminous border + ~12–16px radius (bento modules).
- **gauge:** optional telemetry / line chart with amber stroke + glow.
- **buttonCta:** large amber→gold gradient button with glow («СОХРАНИТЬ РИТУАЛ»).
- **seamlessConnector:** soft amber glow bleed across adjacent cuts (not yellow marker arrows).
- **logoMark:** Vernatun pomegranate on final CTA.

## Role kits

| Role | Duty |
|------|------|
| cover | Photo or bold type hook; minimal glass chrome |
| body_slide | Bento glass cards / timers / comparison / chart |
| cta_slide | Manifest line + glowing gold CTA button + mark |

## Do

- Real glass (blur + thin border), not flat gray rectangles.
- Gold/amber CTA readable and glowing.
- CSS vars from active preset (`--cf-design-*`).

## Don't

- Yellow marker chalkboard language (that's `dark_notes`).
- Purple AI-slop gradients.
- Panorama-only Settings/Create preview.
- Missing cover→body→cta rhythm.
