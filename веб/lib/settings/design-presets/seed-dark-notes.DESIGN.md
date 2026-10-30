---
name: Dark Notes
preset: dark_notes
version: 1
colors:
  bg: '#121212'
  surface: '#1A1A1A'
  text: '#FFFFFF'
  muted: '#A0A0A0'
  accent: '#F5D742'
  accentSoft: 'rgba(245, 215, 66, 0.35)'
---

# Dark Notes — chalkboard carousel system

Vernatun golden ref: charcoal notebook / chalkboard with **yellow marker** highlights, hand doodles, checklist boxes, and **seamless bridge arrows** across sliced 4:5 frames.

## Canvas & safe-zone

- Frame: **1080×1350** (4:5) — product preview = **sliced** slides, never panorama-only.
- Safe padding: top ≥120, bottom ≥160, sides ≥80.
- Background: continuous charcoal grid across the row; each PNG is still a separate cut.

## Colors

| Token | Hex / value | Use |
|-------|-------------|-----|
| bg | `#121212` | Chalkboard / graph-paper field |
| surface | `#1A1A1A` | Slight lift panels |
| text | `#FFFFFF` | Body + questions |
| muted | `#A0A0A0` | Meta, pagination `01` |
| accent | `#F5D742` | Marker tape blocks, arrows, underlines |
| accentSoft | `rgba(245,215,66,0.35)` | Soft glow under marker |

Text on yellow marker blocks = **inverse** (near-black).

## Typography

- **Display:** bold geometric sans, often UPPERCASE inside ragged yellow tape.
- **Body:** clean grotesque or light mono/typewriter feel for RU notes.
- **Armenian-safe:** Noto Sans Armenian (or equivalent) — never Inter-only.
- Cover hook ≤6–8 words; marker title may wrap 1–2 lines.

## Component primitives

- **markerHighlight:** solid yellow tape, slightly irregular / ragged edges (`clip-path` or uneven radius).
- **doodle:** white chalk line-art (coffee steam, stars, swirls).
- **checkbox:** hand-drawn squares; empty or bold `X`.
- **seamlessConnector:** chunky yellow hand arrows + white swirls that **exit** one slide and **enter** the next (split across PNGs).
- **logoMark:** Vernatun pomegranate on CTA slide.

## Role kits

| Role | Duty |
|------|------|
| cover | Yellow marker hook + 1 doodle + optional empty checkboxes |
| body_slide | Numbered insight, underline accent, one checked box |
| cta_slide | Question / save instruction + pomegranate + checkbox «сохрани» |

## Do

- Keep grid faint (`rgba(255,255,255,0.05)`).
- Preserve cross-cut arrow continuity when frames sit in a row.
- CSS vars: `--cf-design-bg`, `--cf-design-accent`, `--cf-design-text`, …

## Don't

- Flat gray boxes without marker/doodle language.
- Purple glow / Inter-default stock AI look.
- Ship uncut panorama as Create preview.
- Drop Armenian glyphs or crop copy outside safe-zone.
